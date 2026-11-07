GOODBYE GOTH V9.7 - old HP bar removed + sound system + first sound effects

Upload to Testing5 (same paths, replace where a file exists):
  js/audio.js                       (NEW)
  js/game.js
  js/levels/level1.js
  assets/audio/sfx/  (7 NEW files: punch-1, punch-2, goth-hurt-1..4, goth-pain .mp3)

WHAT CHANGED
1. The old Olly HP panel that was drawn on the fight canvas (hiding under the new HUD) is removed.
2. New audio system. Plays sound effects and music; a missing file is just silent, nothing breaks.
3. Your sounds are trimmed/volume-matched and wired in:
   - Olly's punch lands  -> punch-1 / punch-2 (alternating)
   - Heavy attack lands  -> punch-2 + goth-pain
   - Goth hit reaction   -> one of 4 random goth-hurt sounds
   - Music: map + story play assets/audio/music/map.mp3, fights play assets/audio/music/fight.mp3 (files not added yet = silent)
   Volumes default to music 35%, effects 80% (saved in the browser; a settings screen can change them later).
   Browsers only allow sound after a first click, so music starts on the first click/tap.

MUSIC - WHERE TO PUT IT
  assets/audio/music/map.mp3     (map + story, loops)
  assets/audio/music/fight.mp3   (fights, loops)
Keep each to a 2-4 minute loop, ~3MB (GitHub web upload limit is 25MB per file). A 3-hour file is far too big;
cut a section out first (e.g. mp3cut.net or Audacity), then upload.

TESTING CHECKLIST
[ ] Fight: only ONE HP bar for Olly (top-left), enemy plate top-right
[ ] Punch hits make a punch sound; the Goth makes a hurt noise
[ ] Heavy attack: bigger hit sound
[ ] No console errors if music files are missing
[ ] After adding music: map music plays, switches to fight music in a fight and back after
Tested: page loads and the fight HUD renders in a headless browser. Sounds could not be heard or timed by me - please check how they feel.
