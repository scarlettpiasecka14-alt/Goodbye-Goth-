GOODBYE GOTH  V9.27  (Level 1 finishing pass, part 1: the map notes)

UPLOAD to branch Testing5, keeping the same folder paths (replace existing files):
  index.html
  css/screen-polish.css
  js/controls.js
  js/game.js
  js/settings.js
  js/story.js
  js/audio.js
  js/levels/level1.js
  assets/audio/sfx/minigame-win.mp3   (new)
  assets/audio/sfx/quiz-win.mp3       (new)
  assets/audio/sfx/round-ok.mp3       (new)
  assets/audio/sfx/wrong-buzz.mp3     (new)

WHAT CHANGED (your notes, in order)
2. Controls panel now says every key can be changed in Settings (Controls > Customise), and that saving is in Settings.
3. "Inventory" is now "Inventory (backpack)" in the panels and Settings; the map button says "BACKPACK".
4. SAVE GAME is a button at the top of Settings (new GAME section). The old X-to-save key is gone.
5. X is now Olly's punch (rebindable in Settings). Left click still punches for now. Heavy attack stays on Z.
   NOTE: if you had customised your keys before, they reset to the new defaults once if they clash.
6. Map camera now sits ~90px higher than Olly so the church top/cross shows at the start. The Chain Goth only
   fades in out of the mist when Olly gets close (about 560-760 map px), so he cannot show up at the start on any screen size.
7. Would You: bigger speech bubble with a tail, 7 rounds (was 5), decoy phrases ("Would you mind if...", "Would you... ugh"),
   the bubble turns bright pink and pulses only on the real "WOULD YOU?", the target shrinks every round, progress dots,
   and any miss restarts that round's ramble.
8. New sounds: ding for each correct press, buzz for a mistake / wrong answer, a fanfare when Would You is completed,
   a chime when the Princess Question is answered correctly. (Synthesised placeholders. Send me real ones any time.)
9. Fog is now a soft mauve (not white/grey), a bit thinner and softer-edged.
10. The heart icon WAS broken: the copy of it embedded in the code was a corrupt, cut-off image. It now loads the normal
   icon file, is drawn in its real proportions (it was squashed into a square), and both the heart and the puzzle-piece
   markers moved out of the bushes onto open path.

NOT DONE YET (needs you / later): item 1 (writing-style pass over intros and tutorials); a harder second look at the
Would You difficulty once you have played it.

TESTING CHECKLIST (Safari, normal reload is enough)
[ ] Start view: church top cross visible, no Chain Goth on screen.
[ ] Map button says BACKPACK; press Y: panel says INVENTORY (BACKPACK).
[ ] Controls screen (before Level 1) shows the new lines and the note.
[ ] Settings (O): SAVE GAME button works ("Saved"); Load Game from the title screen brings you back.
[ ] Fight a Goth: X punches. Settings > Controls > Customise shows "Punch" and you can rebind it.
[ ] Walk toward the skull circle: the heart marker looks like a heart (not flat), sits on the path, and you can open it.
[ ] Would You: bubble looks right, pink pulse only on the real WOULD YOU?, 7 rounds, sounds play, win fanfare at the end.
[ ] Princess Question: wrong answer buzzes, right answer chimes.
[ ] Fog looks soft and mauve; nothing odd at the top-left.

HOW IT WAS TESTED: automated browser run (Chrome, not Safari). Confirmed: start view, BACKPACK label, Save button writes a save,
X punch damages a Goth, Would You advanced several rounds, no script errors. NOT confirmed: the sounds by ear, the final win
screen of Would You (my bot could not press precisely enough for the last 3 rounds), and anything in Safari.
