GOODBYE GOTH - V9.20 (one zip, about 1.5MB)
Unzip. Inside you'll find index.html plus folders css, js and assets. If your computer names the unzipped folder something odd, that's fine - drag index.html, css, js and assets into Testing5 so every path matches this list exactly:

  index.html
  css/screen-polish.css
  js/game.js  js/levels/level1.js  js/audio.js  js/settings.js  js/controls.js  js/story.js
  assets/arenas/patricia-arena.webp              (NEW - Patricia's arena)
  assets/characters/patricia/idle.webp           (NEW - Patricia's idle pose)

WHAT CHANGED
1. Edge-to-edge: no gap or frame around the game on any screen.
2. New Game now resets the ring tutorials, so they play again on a fresh start (Load Game does not reset them).
3. Ring tiers (wording and behaviour):
   PINK   - avoid it however you like: dodge, jump over the enemy, or hit them out of it (they CAN be interrupted).
   RED    - can't be interrupted by hitting; you can still avoid it by dodging OR jumping. (Zombie bite and Chain Goth swipe: a jump timed like a dodge now beats the bite; jumping over the swipe now works.)
   YELLOW - enemies can't be stunned during it, you can't dodge it - the only way out is to jump over the enemy (Chain Goth spin).
4. Chain Goth spin glitch: best guess - Safari throwing away and re-decoding her big animation sheets mid-fight. Her sheets are now kept decoded in memory. I could not reproduce the glitch here, so please tell me if it still happens.
5. Patricia screen is no longer full screen: same layout as the other encounter screens (picture, text, buttons).
6. WOULD YOU picture is bigger (try it and tell me).

TESTING CHECKLIST (Safari, hard refresh Cmd+Shift+R)
[ ] No gap around the edges on the title, intro, map and fights.
[ ] Start a New Game (not Load): the pink, red and yellow ring tutorials show again, with the new wording.
[ ] Pink ring: hitting the zombie mid-claw interrupts her. Red ring (zombie bite): hitting her does NOT interrupt; dodging or jumping as the ring flashes white avoids it.
[ ] Chain Goth swipe (red): dodge OR jump avoids it. Spin (yellow): only jumping over her works; hits don't stun her mid-spin.
[ ] Chain Goth spin: does she still freeze or glitch? Note how often.
[ ] Patricia screen looks like the other art screens.
[ ] WOULD YOU picture: bigger and still fits.
