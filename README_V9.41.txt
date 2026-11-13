GOODBYE GOTH  V9.41  (corner stamp says V9.41)
Upload to Testing5 keeping these exact paths. Both zips together; V9.40 must already be in.
Zip 1 (code):  index.html, js/game.js, js/settings.js, js/story.js, js/cheats.js, js/audio.js, js/levels/level1.js, css/screen-polish.css, tools/build_patricia_assets.py
Zip 2 (images): assets/characters/patricia/atlas/pat-combo.webp, pat-salv.webp (NEW), pat-smoke.webp
Optional clean-up: pat-hurt.webp and pat-defeat.webp in that folder are no longer used and can be deleted.

WHAT CHANGED
- Zombie Goth: your new 3-2-1 is now the ONLY intro (the old scratch one is gone; cheat "intro old" still shows it for comparing).
- Chain Goth death: slower (about 4s instead of 2.5s) and drawn about 22% smaller.
- Backpack: now looks like a backpack (domed top with a carry loop, canvas weave, stitching, a zipped front pocket holding the slots).
- Sound after switching browser tabs: when you come back, the sound engine is woken (and rebuilt if Safari won't wake it), so effects and voice lines should return. NOT tested in Safari, so please try: switch tab, come back, punch/listen.
- Patricia:
  * Walk: she now travels faster (130 vs 95) so her feet stop sliding. If still off, tell me too fast/too slow.
  * Sword combo: its source art is ~20% smaller in its picture than her other moves (458px vs 564px tall), which is why she looked small AND soft (blown up more). Now drawn at the same height as her other moves, from a larger image.
  * Smoke: some smoke frames are cut off by the edge of the original picture (that was the square edges). Those edges now fade out, and I added my own soft purple puffs on top as she vanishes and reappears.
  * She is invincible for the whole time she is in the smoke.
  * Hurt: the old hurt clip is removed. Her four hurt reactions are now the Salvagable? jumps: (1) first jump (2) second jump (3) third jump (4) the hunched flinch. Each has its own grunt (grunt-4, 7, 3, 8). A punch picks a random one (never the same twice in a row); a Heavy picks one of the two big ones. At half health she plays all four in a row.
  * Death: no death animation. She freezes for under half a second, then the death cutscene plays. I looked for the cutscene file in the repo and could not find one, so NOTHING plays yet: please upload it as assets/video/cutscene4/patricia-death.mp4 (patriciadeath.mp4 also works) and it will play automatically; until then the fight just ends.
  * Lightning is faster (wind-up 950->720ms, discharge and settle quicker). Sword swipe (lunge) slightly slower (~14%).
- Idle face flicker: NOT fixed. I checked and the source frames themselves change her face slightly frame to frame; I'd need your better frames to fix that (see message).

TESTED: ran Patricia's fight in a desktop Chrome test copy for ~10 seconds: no errors, she is the right size, the purple puffs show, combo/lunge/smoke/vstrike all run. NOT checked by eye: each hurt reaction, the death moment, whether the four reactions pop when they end, the walk-speed match, the tab-switch sound fix (Safari only), or the real feel of the new 3-2-1 timing.
Memory: image total is about the same as V9.39 (~95 megapixels). Tell me if Safari stutters.
