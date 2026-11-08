GOODBYE GOTH V9.9 - rings, Chain Goth balance, controls customiser, cheats, menu + sound wiring

Upload to Testing5 (same paths, replace existing unless marked NEW):
  js/controls.js        (NEW)
  js/cheats.js          (NEW)
  js/audio.js
  js/settings.js
  js/game.js
  js/story.js
  js/levels/level1.js
  css/screen-polish.css
  assets/audio/sfx/footsteps.mp3   (NEW)
  assets/audio/sfx/typing.mp3      (NEW)
  assets/audio/sfx/click.mp3       (NEW)

MUSIC (upload to assets/audio/music/)
  menu.mp3   <- your title-screen song (NEW file, exactly this name). It plays on the title and the intro story.
  fight.mp3  <- optional fight music (not provided yet, fights are silent until it exists)
  Your 4 background tracks (BackgroundMusicTrack1, BackgroundTrack2/3/4) are already wired: they play on the map in shuffled order,
  moving to the next track when one ends. The gate cutscene and the Goth Abyss video silence the music while they play.
  Sound is still OFF by default (Settings > SOUND).

WHAT CHANGED
1. Title menu moved to the right side so it no longer covers the tagline. The NEW GAME button painted into the art is clickable too.
2. Chain Goth: 100 HP. Her swipe now does 10 damage, her spin does 15 total (8 + 7 across its two passes).
   Olly's punch still does 10, so she takes 10 punches. (Tune: CHAIN_SWIPE_DAMAGE / CHAIN_SPIN_HIT_DAMAGE in js/levels/level1.js.)
3. Attack rings replace the "ATTACK INCOMING" banner:
   PINK = attack coming, jump or dodge.  YELLOW = must JUMP it (built, not used yet).  RED = must DODGE it, jumping won't help.
   Zombie Goth: claw swipe = pink, bite/lunge = RED. The bite can no longer be jumped, only dodged.
   Chain Goth: swipe = pink, spin = red (as before).
   Zombie Goth's wind-up is slightly longer (claw 0.62s, bite 0.8s) so the ring can be read.
4. Controls: Settings > Controls has DEFAULT and CUSTOMISE. In Customise, drag an action onto another box to swap keys, or click a key and press a new one.
   RESET TO DEFAULT restores W/A/S/D, Space (jump/interact), R (dodge), Z (heavy), Y (inventory), X (save). Arrow keys always move. Mouse is fixed.
5. Test cheats: press the ` key (backtick, left of 1) to open a panel: No damage on/off, Skip this fight (win now), Refill HP, Unlock Heavy Attack.
6. Sounds: footsteps while walking (map and fights), typing sound while each intro line types, click when you click the note.

TESTING CHECKLIST
[ ] Title menu on the right; clicking the painted NEW GAME button starts the game
[ ] Settings > Controls > CUSTOMISE: drag Jump onto another key, play, check the new key works; RESET TO DEFAULT works
[ ] Press ` : cheat panel opens; No damage stops all damage; Skip this fight wins the fight
[ ] Zombie Goth: pink ring on claw swipe, red ring on the bite; jumping does NOT avoid the bite, dodging does
[ ] Chain Goth: pink ring on swipe, red on spin; damage 10 / 15; 10 punches to win
[ ] With sound ON: footsteps, typing, note click; map music plays and moves between tracks; add menu.mp3 and check the title song
[ ] Gate cutscene shows your new video and the music pauses during it
Tested in a headless browser: title layout, drag-and-drop rebinding and reset, cheat panel skip fight, rings on both Goths, Chain Goth damage numbers (10 and 8 seen).
Not tested: actual sound output, real keyboard rebinding feel (only drag was tested), Zombie damage taken from the bite/claw in play, yellow ring (not used).
Note: the 4 music tracks are ~22MB each (about 25 minutes each); they stream, but make the first load heavier.
