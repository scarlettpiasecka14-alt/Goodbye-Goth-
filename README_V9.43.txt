GOODBYE GOTH  V9.43  (corner stamp V9.43)  - one small zip, upload on top of V9.42 on the Testing5 branch.
Chain Goth's death: smoother and slower. Nothing else is changed.

WHERE EACH FILE GOES ON GITHUB (same folders as in this zip)
  index.html                                               ->  index.html                                               (replace)
  js/game.js                                               ->  js/game.js                                               (replace)
  js/levels/level1.js                                      ->  js/levels/level1.js                                      (replace)
  assets/characters/combat/chain-goth/chain-death.webp     ->  assets/characters/combat/chain-goth/chain-death.webp     (replace)
  assets/characters/combat/chain-goth/chain-deathb.webp    ->  assets/characters/combat/chain-goth/chain-deathb.webp    (NEW file, exact lowercase name)
  README_V9.43.txt                                         ->  README_V9.43.txt                                         (optional)

WHAT CHANGED
1. No more growing. The death video slowly zooms in (about 32% by the end), so she used to shrink the moment she died and then swell as she fell.
   I removed the zoom from all 61 frames. She now stays at her normal fight size the whole way down and her feet / body stay on the floor line.
2. Smoother. 57 new in-between frames were added wherever she moves gently (the stagger, the kneel, slumping forward, settling on the floor): 118 frames instead of 61.
   The three very fast moments (the hit, the drop to her knees, the final flop) have no in-betweens on purpose: blending those gave blurry double images.
3. Slower. The fall now takes 6.0 seconds (was 4.3), then she lies still and fades as before (1.5 s).
4. Tidied the flickering hair tips at the right edge of the lying pose (the video cut them off at its frame edge).

IF YOU WANT TO TUNE IT (tell me and I'll do it, or it is one line near the top of js/levels/level1.js, search CHAIN_DEATH_FRAME_MS)
  CHAIN_DEATH_FRAME_MS = 100   speed. 70 = the old speed, 100 = now, 120 = slower still.
  CHAIN_DEATH_SCALE = 1        her size during the death. 1 = same as in the fight. (V9.41 used 0.78 to hide the zoom; that is no longer needed.)

TESTING CHECKLIST
[ ] Corner stamp says V9.43 (if it still says V9.42, hard refresh: Cmd+Shift+R).
[ ] Start the Chain Goth fight and beat her (cheat box: tap Option, type  chain win  , Enter).
[ ] She is the SAME size at the moment she dies as she was in the fight (no sudden shrink).
[ ] She does not grow while falling, and ends lying on the floor line, not sunk below it.
[ ] The stagger / kneel / slump look fluid; tell me any moment that still looks jumpy or any frame that looks smeared.
[ ] Speed feels right (say "slower" / "faster" and roughly how much).
[ ] Death sounds still play; she fades out; the CHAIN GOTH DEFEATED screen appears.
[ ] Zombie Goth and Patricia fights still behave as before (their code was not touched).

TESTED: JavaScript syntax check passed on js/game.js and js/levels/level1.js. In a desktop Chrome test copy I started the Chain Goth fight with the cheat,
won it, and captured the death frame by frame: it played start to finish at the right size, on the floor, faded, and reached the defeated screen with no errors.
NOT TESTED: how it looks at full speed to a human eye (my test browser draws only about 3 frames a second, so I checked frames, not motion), Safari, sound timing, a real fight win by punching.
NOTE (already there before this version, not changed): the game asks for Zombie Goth intro frames intro2-062 to intro2-073 that are not in assets/characters/combat/zombie-v2/ (harmless "not found" messages).
