GOODBYE GOTH  V9.18  PERFORMANCE FIX  (includes everything from V9.17)

WHY: the game was downloading ~85 MB before the title screen worked and ~157 MB by the map. Big PNGs and
20+ MB music files all at once made Safari stall, delay the music and finally crash the tab.
NOW: ~7 MB at the title screen and ~45 MB by the map, and fight art only loads once you reach the map.

UPLOAD IN THIS ORDER (GitHub only takes ~100 files per upload, so it is in 4 ZIPs). Keep the folder paths:
  1) V9.18-part1-images.zip   (42 files)  assets/... .webp images
  2) V9.18-part2-fight-frames.zip (88 files)  assets/characters/combat/... .webp frames
  3) V9.18-part3-audio-video.zip  (9 files)  smaller music/ambience (SAME file names, overwrite) + assets/video/cutscene-intro.mp4
  4) V9.18-part4-code.zip  (this one, upload LAST)  index.html, css/, js/

The old .png/.mov files can stay in the repo (the game no longer loads them). Deleting them later just makes the repo smaller.

OTHER CHANGES
 - Fight art (Olly, Zombie Goth, Chain Goth) now downloads in the background a couple of seconds after the map opens, not at the title.
 - The 25-minute ambience is no longer pre-fetched before it is needed.
 - The intro cutscene is now a 3 MB mp4 (was a 23 MB .mov).
 - Version tag bumped to 9180 so Safari fetches the new files.

TEST CHECKLIST
 [ ] Hard refresh (Cmd+Shift+R). Title screen appears quickly and Menu music starts after your first click.
 [ ] Intro, cutscene, map all load without stalling; map music starts.
 [ ] Fight Zombie Goth and Chain Goth: sprites all show (nothing invisible).
 [ ] Everything from the V9.17/V9.16 checklists.
NOT TESTED: Safari itself, real audio. Measured in headless Chrome: title screen 7 MB, map 46 MB.
Audio quality: music is now 64 kbps (map), 128 kbps (title/fight), ambience 96 kbps. Tell me if it sounds worse.
