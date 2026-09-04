# DEVLOG — Webcor Jeopardy

## Where everything is
- Repo `~/webcor-jeopardy` → github.com/dyap123/webcor-jeopardy → https://dyap123.github.io/webcor-jeopardy/
- Player link: `https://dyap123.github.io/webcor-jeopardy/?g=CODE` · Host: `/host.html` · Bank editor: `/host.html#editor`
- Backend: shared open RTDB `gen-lang-client-0119642855`, namespace `jeopardy/` (`bank`, `games/<CODE>/{meta,bank,players,board,round,answers}`)
- Local: `python3 -m http.server 8480` in the repo. Two player tabs on one machine need two origins (`127.0.0.1` and `localhost`) or they share the same `localStorage` pid and become one player.

## 2026-09-04 — built from `~/Documents/500 Review Jeopardy.ppt`
- Text pulled from the 2003 binary PPT by scanning for `TextCharsAtom`/`TextBytesAtom` records (no LibreOffice on this Mac). 5 categories × $100–$500, 25 clues → `bank.js`.
- Mode chosen by Danzel: everyone answers on their phone within a timer (Kahoot style), individuals, no auth.
- Host tab is the authority for closing the answer window (timer expiry or everyone answered). Marks are auto-suggested by `J.suggestMark` (normaliser: strips "what is", articles, punctuation; number words → digits; unit synonyms; typo tolerance only on keys ≥ 12 chars; numbers must match exactly). Host flips any mark; scores are derived from marks so flipping never double counts.
- End-to-end pass in Chrome (host + 2 players): lobby → board → clue → auto review → reveal → back to board (tile dimmed) → timer expiry with a non-answer → leaderboard + manual +100 → end podium → delete. Bank editor: edit, save, reset to original — verified in the DB.
- Bug found and fixed during the pass: after the host deleted a game, the player's leave path wrote `players/<pid>/online=false` and recreated a stub game node. `leave(msg, gone)` now skips the presence write when the game (or the player) is already gone.
- Not verified: a real phone (layout is fluid, max-width 560), CSV export click, more than 2 players.
