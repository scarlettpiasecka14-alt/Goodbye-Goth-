GOODBYE GOTH  V9.16  (bug-fix batch). Includes everything from V9.15.

UPLOAD to branch Testing5, keeping these exact paths (replace existing files):
  index.html
  css/screen-polish.css
  js/audio.js
  js/game.js
  js/story.js
  js/settings.js
  js/levels/level1.js
  assets/audio/music/FightMusic1.mp3   (new)
  assets/audio/music/FightMusic2.mp3   (new)

WHAT CHANGED
 1. Cache fix: every script/stylesheet link now has ?v=9160, so Safari cannot keep running old code.
    (If the cooldown seemed missing, old cached code is the likeliest reason; a headless test of this code triggers it.)
 2. WOULD YOU mini-game fixed (its timer read the wrong clock after the V9.15 pause change).
 3. Ring tutorials: ring appears and the fight freezes with it pulsing for 1s, holds still for 1s, then the pop-up opens.
 4. Olly's "taken" cutscene: the code now finds your file name ollytaken.mp4 (also still accepts olly-taken.mp4 / .mov).
 5. Olly no longer swells while falling (one scale for all KO frames).
 6. When an enemy knocks Olly out she groans and walks off the other way for about 3 seconds, then the cutscene plays.
 7. Zombie Goth now keeps one fixed size per animation (walk, crouch, claw, bite were each being rescaled per frame).
    Her pre-attack crouch now trembles harder as the attack nears instead of freezing.
 8. Death hold is 3 seconds for both Zombie Goth and Chain Goth.
 9. Map icon click now uses the normal click sound (interact sound no longer used).
10. NEW GAME glows and fades out instead of vanishing; BEGIN QUEST gets a hover glow and press effect.
11. Fight music: FightMusic1 + FightMusic2 play as the fight playlist.

TEST CHECKLIST
 [ ] Hard-refresh once (Cmd+Shift+R) before testing.
 [ ] Click BEGIN QUEST on the note screen: it glows on hover and continues.
 [ ] Fight Zombie Goth: 3 punches (hits or misses) -> "Resting" counter from 5.0s, and you hear the breathing.
 [ ] First pink ring: ring pulses ~1s, still ~1s, pop-up, GOT IT. Pop-ups appear once only.
 [ ] Let Zombie Goth knock Olly out: Olly stays normal size, she groans and walks away ~3s, cutscene plays.
 [ ] Walk, crouch, claw and bite look the same size.
 [ ] WOULD YOU mini-game: cursor sweeps normally.
 [ ] Fight music plays in fights.

NOT TESTED: Safari, real audio, the cutscene video playing (headless Chrome only confirmed it starts).
OPEN QUESTION: your note says the Chain Goth yellow/red rings are backwards; see chat.
