GOODBYE GOTH  V9.17. Includes everything from V9.16 (upload this instead of V9.16 if you haven't yet).

UPLOAD to branch Testing5, keeping these exact paths (replace existing files):
  index.html
  css/screen-polish.css
  js/audio.js
  js/controls.js
  js/game.js
  js/story.js
  js/settings.js
  js/levels/level1.js
  assets/audio/music/FightMusic1.mp3   (new, skip if already uploaded)
  assets/audio/music/FightMusic2.mp3   (new, skip if already uploaded)

NEW IN V9.17
 1. Chain Goth attacks swapped, as you described:
    - SPIN (rapid chain swing with sparks) = YELLOW ring. Chain is too long to dodge: you must jump OVER her
      and land behind her. Jumping on the spot, jumping backwards or dodging all still get hit.
    - SWIPE (quick whip) = RED ring, shorter reach (300). Only a DODGE avoids it. Jumping, even over her, does not.
    The tutorial pop-ups still say yellow = jump over, red = dodge only, so they stay true.
 2. "Dodge roll" / "Roll" now just say "Dodge" (controls screen and settings).
 3. Gate cutscene: replacement goes in assets/video/cutscene2/ named cutscene2.mp4 (overwrite the old one).
    The version tag in the code was bumped so browsers load the new file instead of the cached one.

TEST CHECKLIST
 [ ] Hard-refresh (Cmd+Shift+R).
 [ ] Chain Goth quick swipe (red ring): dodge it = no damage; jump over her = still hit.
 [ ] Chain Goth spin (yellow ring): jump over her and land behind = no damage; dodge or stand = hit.
 [ ] Controls screen and Settings say "Dodge".
 [ ] Open the gate: the new cutscene plays.
Plus the V9.16 checklist (cooldown, WOULD YOU, KO walk-away, zombie size, fight music).

TESTED in headless Chrome with slow-motion timing: swipe stand=hit, swipe dodge=mostly avoided (late/early dodge can still be hit),
spin stand=hit, spin jump-over=avoided. NOT tested: Safari, real audio, the new cutscene file.
