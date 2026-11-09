GOODBYE GOTH - V9.11 (replaces V9.10 - if you haven't uploaded V9.10, skip it; this includes everything from it)
Testing5 was last updated at V9.9 (commit dbb6b24), so V9.10 had not been uploaded yet.

UPLOAD each file to the SAME path on GitHub (branch Testing5), replacing the old one:
  css/screen-polish.css
  js/audio.js
  js/controls.js
  js/game.js
  js/settings.js
  js/story.js
  js/levels/level1.js
  assets/audio/sfx/ambience.mp3          NEW (my placeholder drone; replace with yours, same name)
  assets/audio/sfx/olly-hurt.mp3         NEW
  assets/audio/sfx/olly-hurt-heavy.mp3   NEW
  assets/audio/sfx/olly-attack.mp3       NEW
  assets/audio/sfx/olly-heavy-attack.mp3 NEW
  assets/audio/sfx/olly-jump.mp3         NEW
  assets/audio/sfx/zombie-death.mp3      NEW
  assets/audio/sfx/punch-3.mp3           NEW
  assets/audio/sfx/footsteps.mp3         REPLACES the old one (your new footsteps)

WHERE YOUR OWN SOUNDS GO (all in the GitHub repo, exact file names matter)
  Title/loading-screen song : assets/audio/music/menu.mp3   (fades out slowly over ~2.5s when New Game is pressed)
  Ambience (intro + map)    : assets/audio/sfx/ambience.mp3 (loops; intro level 40%, map level 30%; typing stays on top)
  Map icon click sound      : assets/audio/sfx/interact.mp3 (plays when you click a map icon: enemies, challenges, gate)
  Pick-up sound             : assets/audio/sfx/pickup.mp3   (plays when you collect the key)
  Fight music (optional)    : assets/audio/music/fight.mp3
Until interact.mp3 / pickup.mp3 / menu.mp3 exist those moments are simply silent (nothing breaks).

WHAT CHANGED SINCE V9.9
- Everything in V9.10 (floating title menu, O opens Settings, un-stretched fights, Chain Goth jump-over, dodge always backwards, longer bite ring, instant Web Audio sfx, vanishing-chain safeguards).
- New sounds wired in: Olly light hurt / heavy hurt (heavy = bite, spin, or 15+ damage), Olly attack grunt (on a punch swing, at most once per 1.5s), Olly heavy attack, jump+land (plays when jumping), Zombie death (also used for Chain Goth for now), punch-3 joins the random punch pool.
- Ambience plays in the intro (stops when the cutscene starts) and on the map (stops in fights and cutscenes).
- ONE click sound (click.mp3) now plays for every button: title menu, story, "KEEP EXPLORING", "I'M READY", settings etc. Map icons and pickups use their own sounds instead.

TEST CHECKLIST (Safari, turn Sound ON with O)
[ ] Title: click New Game - song fades out gently, ambience under intro, typing still clearly audible
[ ] Click sound on title buttons, story next, I'M READY, KEEP EXPLORING
[ ] Map: ambience + music + footsteps; clicking an icon does NOT play click.mp3 (silent until interact.mp3 added)
[ ] Fight: Olly grunt on punches, hurt sounds when hit (heavier for bite/spin), heavy attack sound, jump sound, zombie dies with the death sound
[ ] Sounds feel instant

HONEST NOTES: syntax-checked and loaded in a headless browser (no page errors, fight starts, jump works). I could not listen to anything or test in Safari, so volume balance (ambience vs typing/music) and the jump sound timing are untested. The 2.5s jump sound plays from the jump start; the landing part may not line up with the landing.
