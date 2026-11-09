GOODBYE GOTH - V9.13  (Testing5 is currently at V9.12 - confirmed)

UPLOAD each file to the SAME path on GitHub (branch Testing5):
  css/screen-polish.css
  js/game.js
  js/settings.js
  js/levels/level1.js
  assets/audio/sfx/olly-jump.mp3        REPLACES old one (now just the whoosh)
  assets/audio/sfx/olly-land.mp3        NEW (the thud, cut from your jump file)
  assets/audio/sfx/olly-dodge-grunt.mp3 NEW
  assets/audio/sfx/pickup.mp3           NEW
  assets/audio/sfx/chain-clatter.mp3    NEW
  assets/video/cutscene3/README.txt     NEW (marks where the cutscene goes)

YOUR CUTSCENE GOES HERE:  assets/video/cutscene3/olly-taken.mp4   (a .mov with the same name is tried if no .mp4)
It plays after Olly has fallen and before the KNOCKED OUT pop-up, for both Goths. Has a small SKIP button. If the file is missing it is silently skipped.

WHAT CHANGED
- Jump sound: split into a soft whoosh at take-off and the thud at the moment he lands (the thud used to sit ~1.2s after the whoosh).
- Dodge: whoosh + Olly grunt on top (there was no dodge sound in the code before, so I added both).
- 3-punch cooldown: it WAS in the code, but (a) a missed punch reset the counter, so mixing in misses avoided it, and (b) the counter text was hidden under the message bar. Now every swing counts, a 1.5s pause resets, and a big meter shows 3 pips then "OUT OF BREATH 5.0s" with a bar.
- Controls screen now lists O = Settings. The gear is back, small, bottom-left (also still opens with O).
- Removed the key-hint line under the map and the 2/2 / Solved / Answered pills. The message box at the bottom is bigger with larger, bolder text.
- Key pickup plays pickup.mp3. Chain Goth's death plays the zombie death sound AND chain-clatter together.

TEST CHECKLIST
[ ] Controls screen shows O - Settings; gear bottom-left opens settings and does not cover the message box
[ ] Map: no pills at top, no hint line, bigger message box text
[ ] Jump: soft whoosh on take-off, thud as he lands
[ ] Dodge (R): whoosh + grunt, not drowned out by jumping
[ ] Punch 3 times (hit OR miss): meter shows OUT OF BREATH 5.0s and punches are blocked until it ends
[ ] Pick up the key: pickup sound
[ ] Kill Chain Goth: death sound + chain clatter together
[ ] Get knocked out: (no cutscene file yet = straight to the pop-up). Add olly-taken.mp4 then it should play first.

HONEST NOTES: I checked in a headless browser that the map has no pills/hint, the new meter draws, and the knock-out pop-up still appears with no video. I could not listen, so jump/land sync and volume balance are untested; I never saw your cutscene play (no file yet), so its fit/size is untested.
STILL OPEN: fight music, 3-2-1 sound, Chain Goth sounds, and the ring tutorial pop-ups (tell me the image file names/size once you've made them).
