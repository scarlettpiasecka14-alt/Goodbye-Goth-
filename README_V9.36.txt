GOODBYE GOTH V9.36 - Patricia overhaul + warning rings + Princess Question layout
(CUMULATIVE: includes everything from V9.35, so upload this one even though you never uploaded 35)
==========================================================================================
UPLOAD to Testing5 (keep folders exactly as in the zip):
  css/screen-polish.css
  js/game.js
  js/levels/level1.js
  assets/characters/combat/chain-goth/chain-death.webp
  assets/fonts/CormorantGaramond-regular-600.woff
  assets/fonts/CormorantGaramond-italic-600.woff
  assets/fonts/OFL-CormorantGaramond.txt
  tools/build_chain_assets.py   (optional)

WHAT'S NEW IN 9.36
1. Princess Question: the question is plain text (no box). The four answers keep their boxes, in a square: A B on top, C D below
   (stacks to one column only on very narrow phones).
2. Warning rings (ALL enemies: Patricia, Chain Goth, Zombie Goth): the ring now FLASHES TWICE in the attack's colour during the
   wind-up, then disappears so you can see the animation. (The ring tutorial pop-ups still show a steady ring while frozen.)
3. Patricia's size: she is drawn about 10% smaller and Olly slightly bigger (his boss-fight scale 0.8 -> 0.92). She is still clearly taller, roughly 1.3x.
4. Feet: the walk and sword-combo clips sat on a different ground line than her idle pose, which made her float. Each clip is now shifted to the same floor line.
5. She reacts to you (no more fixed order). She picks her next move from what you are doing:
   - you are far away -> lunge or vanish; you are close -> sword combo
   - you spam punches (3 in 3 seconds) -> she answers with an immediate sword combo
   - you keep dodging/jumping her attacks -> she vanishes and comes round behind you
   - you keep jumping (stage 2) -> lightning becomes much more likely
   - never the same move twice in a row
   During wind-ups she turns to face you and shuffles towards you; the lunge dashes at where you are standing when it fires.
6. Vanish: she follows Olly's LIVE position while she is in the smoke and reappears directly behind him (the side he is not facing), then strikes after a very short wind-up.
   A purple ring flashes on her and one on where she will strike. The "SHE REAPPEARS HERE" label is gone.
7. Purple ring tutorial: the first time she vanishes, the fight pauses with this text: "Some enemies have special abilities. When an enemy is using a special
   ability, the enemy and the affected areas will appear in purple rings." Put your image at assets/tutorial/ring-purple.webp (until it exists the pop-up shows text only).
8. Speed: walk is much slower (animation 105ms -> 150ms per frame, ground speed 140 -> 95; stage 2 is 15% faster). Lightning is quicker
   (wind-up 1170 -> 950ms, discharge 1100 -> 900ms). Combo wind-up is longer (700 -> 950ms) so the ring flashes can be read.
9. Smoother: Patricia's frames now cross-fade into each other instead of stepping.
10. Half health: the hit that takes her to 150 HP pauses the fight (Olly cannot act), the camera pushes in slightly on her while her hurt animation plays,
    she says "you're going to pay for that", then she goes straight into the lightning attack. The red flash and the HALF HEALTH banner are gone (the tick on her HP bar stays).
    (The old 25%-health line is now "not funny".)

HONEST TESTING NOTES
Tested in automated Chrome (not Safari, not by eye in real time): ring flashes appear and vanish; vanish placed her directly behind Olly (when Olly was
facing right she appeared on his left); half-health went hurt -> lightning with the zoom; her boots and Olly's sit on the same line; no JS errors.
NOT verified: how the speed FEELS (walk/lightning numbers are my estimates: tell me "slower/faster"), whether the AI feels reactive enough, and the cross-fade
may look slightly ghostly on very fast moves. Chain Goth / Zombie ring flashes were changed in one shared function but I did not play those fights this round.
Still to do: purple tutorial image, writing pass on tutorials, Patricia hurt/death art, wrong-answer voice lines, balance (her 300 HP vs Olly's 100).
