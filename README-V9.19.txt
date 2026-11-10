GOODBYE GOTH - V9.19 (one zip)
Unzip, make sure the folder is named exactly what's inside (the zip has index.html, css, js and assets at the top level).
Upload so every path matches exactly (drag the folders css, js, assets and the file index.html into Testing5):

  index.html
  css/screen-polish.css
  js/game.js  js/levels/level1.js  js/audio.js  js/settings.js  js/controls.js  js/story.js
  assets/story/patricia-encounter.webp          (NEW - the Patricia screen)
  assets/audio/sfx/olly-land.mp3                (REPLACES the silent old file)
  assets/audio/sfx/olly-ko.mp3                  (NEW)
  assets/audio/sfx/tutorial.mp3                 (NEW)

WHAT CHANGED
1. Settings gear: now sits beside INVENTORY in Olly's HUD (top-right). The corner gear is hidden while playing, so the map is full screen. It still shows on the title screen.
2. Landing sound: the old olly-land.mp3 was silent. Replaced with a thud. (I made it from synthesised sound - listen and tell me if you'd like a different one.)
3. Tutorial sound: a chime plays the moment the fight freezes for a ring tutorial.
4. Zombie Goth bite: a dodge that starts while the red ring is closing in (or just as she lunges) now beats the bite. Before, the dodge ended before she reached him. The red ring also flashes white during the dodge window.
5. Punch cooldown: combo is now 2 swings, then a 5s rest. Counter shows "Out of breath 4.2s" above Olly. (Meter shows 2 pips.)
6. New Game button no longer turns black on hover.
7. Knockout: Olly's hurt + knockout sounds play first; about 1s later the winner groans and walks away for 3s with no chain noises; then the Taken cutscene.
8. NEW: "You've encountered Patricia, The Classic Goth" screen appears after the gate cutscene, with I'M READY and SAVE AND QUIT. Save and Quit saves and returns to the title; Load Game brings you back to this screen.
   NOTE: I'M READY starts the existing PLACEHOLDER boss fight (100 HP, no Patricia art yet). The real Patricia fight needs her sprite frames.

TESTING CHECKLIST (please try in Safari; hard refresh Cmd+Shift+R)
[ ] Gear is next to Inventory; nothing in the bottom-left corner on the map.
[ ] Hover over New Game: no black fill.
[ ] Jump: you hear a landing thud.
[ ] First red/pink/yellow ring: chime plays when the fight freezes.
[ ] Zombie bite: dodge as the red ring flashes white -> she misses.
[ ] Punch twice -> "Out of breath" countdown, 5s rest.
[ ] Let an enemy knock you out: groans/KO sounds, enemy walks off ~3s, then Taken cutscene.
[ ] Open the gate -> cutscene -> Patricia screen. Try Save and Quit, then Load Game.
