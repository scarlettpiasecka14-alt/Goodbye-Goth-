GOODBYE GOTH  V9.28  (fixes from your fight notes)

Needs V9.27 uploaded too (this builds on it; upload V9.27 first or just upload both, same file names, V9.28 wins).

UPLOAD to branch Testing5, same folder paths, replace existing:
  index.html
  css/screen-polish.css
  js/game.js
  js/settings.js
  js/story.js
  js/levels/level1.js

WHAT CHANGED
Chain Goth
 - Walking backwards FIXED: her walk art faced the opposite way from every other animation, so she looked like she
   was walking away from Olly and you could not hit her. She now walks facing him.
 - 3-2-1 intro animation slowed down slightly (about 10%).
 - Yellow attack (the slam): now plays faster (was slow motion), the spark wave reaches further, a real yellow RING is
   drawn on the floor around her (so the yellow ring tutorial now matches what you see in the fight), and she GLOWS
   yellow while the slam is winding up (the yellow "ghost"). The yellow floor warning is still there and is brighter.
Zombie Goth
 - Walk: no more flashing. The walk clip was not a seamless loop (upright at the start, crouched at the end), so it
   jumped every cycle. It now plays forwards then backwards, and about 1.8x faster (it looked like slow motion).
 - 3-2-1 animation plays faster (finishes in ~70% of the countdown, then holds the ready pose).
 - Harder: she chases faster, keeps walking towards you while she winds up an attack (she used to stand still, so
   stepping away was free), the red heavy attack has longer reach and the red ring is bigger to match, claw hits a
   little harder and further.
Combo
 - Combo pips and the punch rest reset when a fight ends, and the combo display no longer shows on the map.
Princess Question screen
 - Restyled to match Would You: the question is a speech bubble, answers are a 2x2 grid of cards with lettered badges,
   hover highlight. Same text as before. (Tell me what you dislike about it and I will change it.)

ANSWERS TO YOUR QUESTIONS
 - Settings in fights: O (and the gear button top-left of the fight HUD) already opens Settings and pauses the fight
   in V9.26. If it did not for you, you were on a build before V9.26.
 - Cheat codes: press the ` key (backtick, left of 1) anywhere to open the TEST CHEATS panel: No damage ON/OFF,
   Skip this fight (win now), Refill Olly's HP, Unlock Heavy Attack. Press ` again to close.

NOT TOUCHED: Patricia, Level 2+.

TESTING CHECKLIST (normal reload in Safari)
[ ] Chain Goth faces Olly while she walks, and you can punch her.
[ ] Chain 3-2-1 feels a touch slower, not sluggish.
[ ] Yellow slam: yellow ring + yellow glow on her, wave reaches further, still jumpable by going OVER her.
[ ] Zombie Goth walk is smooth (no flashing) and brisk; 3-2-1 brisk.
[ ] Zombie follows you while winding up; red attack catches you from further; she feels harder (tell me if too hard).
[ ] After winning/leaving a fight there is no COMBO on the map.
[ ] Princess Question screen looks right, wrong answer buzzes, right answer chimes.

HOW IT WAS TESTED: automated browser (Chrome, not Safari). Confirmed by screenshot: Chain Goth now faces Olly when walking;
yellow ring and glow during the slam; new quiz screen; O opens Settings during a fight; no script errors.
NOT confirmed: zombie flash gone (I verified the cause and the new playback logic, not by eye), balance/difficulty, anything in Safari, sounds.
