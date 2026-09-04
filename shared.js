// Shared runtime for the host and player apps.
// Firebase RTDB (open rules, same shared project as the other field apps), namespace `jeopardy/`.
(function () {
  'use strict';

  const FIREBASE_CONFIG = {
    databaseURL: 'https://gen-lang-client-0119642855-default-rtdb.firebaseio.com'
  };
  const ROOT = 'jeopardy';
  const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  let db = null;
  let serverOffset = 0;

  function init() {
    if (db) return db;
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.database();
    db.ref('.info/serverTimeOffset').on('value', function (s) { serverOffset = s.val() || 0; });
    return db;
  }

  function ref(path) { return db.ref(ROOT + (path ? '/' + path : '')); }
  function gameRef(code, path) { return ref('games/' + code + (path ? '/' + path : '')); }
  function serverNow() { return Date.now() + serverOffset; }
  function TS() { return firebase.database.ServerValue.TIMESTAMP; }

  function newCode() {
    let s = '';
    const buf = new Uint32Array(4);
    (window.crypto || window.msCrypto).getRandomValues(buf);
    for (let i = 0; i < 4; i++) s += CODE_CHARS[buf[i] % CODE_CHARS.length];
    return s;
  }
  function cleanCode(s) {
    return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/[IO01]/g, function (c) {
      return { I: '1', O: '0', '0': '0', '1': '1' }[c];
    }).slice(0, 4);
  }

  function randomId(n) {
    const buf = new Uint8Array(n || 12);
    (window.crypto || window.msCrypto).getRandomValues(buf);
    let s = '';
    for (let i = 0; i < buf.length; i++) s += CODE_CHARS[buf[i] % CODE_CHARS.length];
    return s.toLowerCase();
  }
  function getPid() {
    let pid = null;
    try { pid = localStorage.getItem('jeopardy.pid'); } catch (e) {}
    if (!pid) {
      pid = 'p' + randomId(10);
      try { localStorage.setItem('jeopardy.pid', pid); } catch (e) {}
    }
    return pid;
  }
  function lsGet(key, fallback) {
    try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
  }
  function lsSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  // ── answer normalisation ────────────────────────────────────────────────
  const NUMBER_WORDS = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
    eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
    eighty: 80, ninety: 90, hundred: 100
  };
  const UNIT_WORDS = {
    ft: 'feet', foot: 'feet', feet: 'feet',
    hr: 'hours', hrs: 'hours', hour: 'hours', hours: 'hours',
    yr: 'years', yrs: 'years', year: 'years', years: 'years',
    mo: 'months', mos: 'months', month: 'months', months: 'months',
    min: 'minutes', mins: 'minutes', minute: 'minutes', minutes: 'minutes',
    in: 'inches', inch: 'inches', inches: 'inches',
    '%': 'percent', pct: 'percent'
  };
  function normalise(s) {
    let t = String(s == null ? '' : s).toLowerCase();
    t = t.replace(/[‘’“”]/g, '"').replace(/&/g, ' and ');
    t = t.replace(/[^a-z0-9%\s]/g, ' ');
    t = t.replace(/\s+/g, ' ').trim();
    t = t.replace(/^(what|who|where|when|which|how)\s+(is|are|was|were|many|much)\s+/, '');
    t = t.replace(/^(a|an|the)\s+/, '');
    const words = t.split(' ').filter(Boolean).map(function (w) {
      if (Object.prototype.hasOwnProperty.call(NUMBER_WORDS, w)) return String(NUMBER_WORDS[w]);
      if (Object.prototype.hasOwnProperty.call(UNIT_WORDS, w)) return UNIT_WORDS[w];
      return w;
    }).filter(function (w) { return w !== 'and'; });
    return words.join(' ');
  }
  function lev(a, b) {
    if (a === b) return 0;
    const m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    let prev = new Array(n + 1), cur = new Array(n + 1);
    for (let j = 0; j <= n; j++) prev[j] = j;
    for (let i = 1; i <= m; i++) {
      cur[0] = i;
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      }
      const tmp = prev; prev = cur; cur = tmp;
    }
    return prev[n];
  }
  function keysFor(clue) {
    const keys = [clue && clue.answer];
    String((clue && clue.accept) || '').split(',').forEach(function (k) { keys.push(k); });
    return keys.map(normalise).filter(Boolean);
  }
  // 'correct' | 'wrong' for a submitted text; null when nothing was submitted.
  function digitsOf(s) { return (String(s).match(/\d+/g) || []).join(' '); }
  function suggestMark(text, clue) {
    const t = normalise(text);
    if (!t) return null;
    const tc = t.replace(/\s/g, '');
    const tTok = t.split(' ');
    const keys = keysFor(clue);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const kc = k.replace(/\s/g, '');
      if (t === k || tc === kc) return 'correct';
      // Numbers must agree exactly before any fuzzy path ("25 feet" is not "20 feet").
      if (digitsOf(t) && digitsOf(k) && digitsOf(t) !== digitsOf(k)) continue;
      const kTok = k.split(' ');
      const kInT = kTok.every(function (w) { return tTok.indexOf(w) !== -1; });
      if (kInT) return 'correct';
      const tInK = tTok.every(function (w) { return kTok.indexOf(w) !== -1; });
      if (tInK && tc.length >= 3 && (kc.length <= 3 || tc.length >= Math.ceil(kc.length * 0.5))) return 'correct';
      // Typo tolerance only on long keys, so "employee" never passes for "employer".
      const tol = kc.length >= 20 ? 2 : (kc.length >= 12 ? 1 : 0);
      if (tol && lev(tc, kc) <= tol) return 'correct';
    }
    return 'wrong';
  }

  // ── scoring ─────────────────────────────────────────────────────────────
  // game = { meta, bank, players, board, answers }. Returns [{pid, name, score, rank, online, correct, wrong, answered}] sorted.
  function deriveScores(game) {
    game = game || {};
    const players = game.players || {};
    const answers = game.answers || {};
    const penalty = !!(game.meta && game.meta.penalty);
    const cats = (game.bank && game.bank.categories) || [];
    const rows = {};
    Object.keys(players).forEach(function (pid) {
      const p = players[pid] || {};
      rows[pid] = { pid: pid, name: p.name || 'Player', score: Number(p.adjust) || 0, online: p.online !== false, correct: 0, wrong: 0, answered: 0 };
    });
    Object.keys(answers).forEach(function (key) {
      const parts = key.split('_');
      const c = Number(parts[0]), r = Number(parts[1]);
      const clue = cats[c] && cats[c].clues && cats[c].clues[r];
      const value = clue ? Number(clue.value) || 0 : 0;
      const byPid = answers[key] || {};
      Object.keys(byPid).forEach(function (pid) {
        const a = byPid[pid] || {};
        const row = rows[pid];
        if (!row) return;
        if (a.text) row.answered++;
        if (a.mark === 'correct') { row.score += value; row.correct++; }
        else if (a.mark === 'wrong') { row.wrong++; if (penalty) row.score -= value; }
      });
    });
    const list = Object.keys(rows).map(function (k) { return rows[k]; });
    list.sort(function (a, b) { return b.score - a.score || a.name.localeCompare(b.name); });
    let rank = 0, last = null;
    list.forEach(function (row, i) {
      if (row.score !== last) { rank = i + 1; last = row.score; }
      row.rank = rank;
    });
    return list;
  }

  // ── misc ────────────────────────────────────────────────────────────────
  function money(v) {
    v = Number(v) || 0;
    return (v < 0 ? '-$' : '$') + Math.abs(v).toLocaleString('en-US');
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function defaultBank() { return clone(window.DEFAULT_BANK); }
  function joinUrl(code) {
    const base = location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '');
    return base + '?g=' + code;
  }
  // Ensures every clue has value/clue/answer; drops empties RTDB may have stripped.
  function sanitiseBank(bank) {
    const b = { title: String((bank && bank.title) || 'Jeopardy'), categories: [] };
    const cats = (bank && bank.categories) || [];
    (Array.isArray(cats) ? cats : Object.keys(cats).map(function (k) { return cats[k]; })).forEach(function (c) {
      if (!c) return;
      const clues = c.clues || [];
      const list = (Array.isArray(clues) ? clues : Object.keys(clues).map(function (k) { return clues[k]; })).filter(Boolean).map(function (q, i) {
        return { value: Number(q.value) || (i + 1) * 100, clue: String(q.clue || ''), answer: String(q.answer || ''), accept: String(q.accept || '') };
      });
      b.categories.push({ name: String(c.name || 'Category'), clues: list });
    });
    return b;
  }

  window.J = {
    ROOT: ROOT, init: init, ref: ref, gameRef: gameRef, serverNow: serverNow, TS: TS,
    newCode: newCode, cleanCode: cleanCode, getPid: getPid, randomId: randomId, lsGet: lsGet, lsSet: lsSet,
    normalise: normalise, suggestMark: suggestMark, deriveScores: deriveScores,
    money: money, esc: esc, clone: clone, defaultBank: defaultBank, joinUrl: joinUrl, sanitiseBank: sanitiseBank
  };
})();
