GOODBYE GOTH V9.8 - Settings screen, sound OFF by default, cutscene cache fix

Upload to Testing5 (same paths, replace existing):
  js/settings.js        (NEW)
  js/audio.js
  js/game.js
  js/levels/level1.js

WHAT CHANGED
1. SETTINGS screen: sound on/off, master / music / sound-effects volume, brightness (50-130%), fullscreen, controls list.
   Open it from the title menu (new SETTINGS button) or the small gear at the top-middle of the screen. Esc or CLOSE shuts it.
   Settings are remembered in the browser.
2. SOUND IS OFF BY DEFAULT now (so Olly can't hear anything). Turn it on in Settings > SOUND. To make it ON by default later,
   change "master: 0" to "master: 1" near the top of js/audio.js.
3. Gate cutscene cache fix: the video link version was bumped (v=9800) so browsers load your new cutscene2.mp4 instead of the old cached one.

REPLACING THE GATE CUTSCENE
  Upload your new video to GitHub (Testing5) at exactly:   assets/video/cutscene2/cutscene2.mp4
  (same name as the old one - GitHub will ask to replace/overwrite it). Must be .mp4 and under 25MB for the web uploader.
  Then upload js/levels/level1.js from this ZIP (it has the cache fix). After Vercel redeploys, hard-refresh (Ctrl+Shift+R).
  The intro "Goth Abyss" video is a different file (assets/video/cutscene 720p.mov) - untouched.

TESTING CHECKLIST
[ ] Title screen shows NEW GAME / LOAD GAME / SETTINGS / QUIT; SETTINGS opens the panel
[ ] Gear button works on the map; settings do NOT open during a fight (gear is hidden behind the fight screen)
[ ] Sound OFF by default: punches make no noise until you switch it on
[ ] Sound ON: punch and goth sounds play; sliders change loudness
[ ] Brightness slider darkens/brightens everything, and stays after refresh
[ ] Pressing keys in Settings does not move Olly
[ ] New gate cutscene plays after unlocking the gate
Tested: panel opens/closes, toggles and brightness work in a headless browser. Fullscreen and real sound output were not tested.
Note: the title menu is a bit taller with 4 buttons; check it looks OK on your screen.
