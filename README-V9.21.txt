GOODBYE GOTH V9.21 - key in the backpack (6 files, no new art needed)

Upload to branch Testing5, replacing the existing files. Paths must start with
index.html, css/ or js/ (NOT a wrapper folder):
  index.html
  css/screen-polish.css
  js/game.js
  js/settings.js
  js/story.js
  js/levels/level1.js

What changed
- The key in the backpack is now the real heart key art (assets/items/golden-key.webp, already in the repo), not an emoji.
- Hovering the key shows: "A mysterious key. Seems important."
- Click the key in the backpack and a small panel appears with a USE button.
- USE only works while Olly is standing in front of the gate. Elsewhere it says
  "You need to be standing in front of the gate to use this."
- At the gate, USE closes the backpack and plays the gate cutscene (then the Patricia screen, as before).
- Clicking the gate itself no longer starts the cutscene. It tells the player to use the key from the backpack.
- The pickup message now tells the player where to use the key.
- Version bumped to ?v=9210 so Safari fetches the new files.

Checked: all four JS files pass a syntax check, and I ran the game in a headless browser with a
saved game: hover text, key image, click > USE away from the gate (shows the message), and USE at the
gate (backpack closes, cutscene starts) all worked with no errors. I have NOT played it by hand in Safari,
and the cutscene video itself still depends on assets/video/cutscene2/cutscene2.mp4.

Your testing checklist (Safari)
[ ] Hard refresh (Cmd+Shift+R). Finish the 3 objectives and pick up the key.
[ ] Press Y: the key shows the heart-key picture, not an emoji.
[ ] Hover it: "A mysterious key. Seems important."
[ ] Click it, then USE far from the gate: you get the "standing in front of the gate" message.
[ ] Stand right in front of the gate, press Y, click key, USE: bag closes and the cutscene plays.
[ ] Click the gate with the mouse: it tells you to use the key (no cutscene).
[ ] Save and Load Game with the key in your bag: key still shows.
