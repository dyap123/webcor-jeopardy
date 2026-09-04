# Webcor Jeopardy

OSHA 500 review Jeopardy as a live classroom game. Static site, no build step, no sign-in.

- `index.html` — players open this on a phone, enter the game code and their name, and answer every clue on their own screen within the timer.
- `host.html` — the host projects this: create a game, show the join link and QR code, run the board, review and mark answers, reveal, leaderboard, final podium.
- `host.html#editor` — edit categories, clues, answers, "also accept" alternates and values. `bank.js` is the original PowerPoint content and can always be restored.

State lives in the shared Firebase Realtime Database under `jeopardy/` (open rules). Scores are derived from marks, so the host can flip a mark at any time without double counting.

Local preview: `python3 -m http.server 8480` in this folder, then open `http://localhost:8480/host.html`.
