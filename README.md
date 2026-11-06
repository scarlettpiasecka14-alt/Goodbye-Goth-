# Goodbye Goth V9.1 – Chain Goth (Part 1)

Chain Goth is now the second Level 1 enemy, built from the Zombie Goth AI.
Part 1 uses the three animation folders you've uploaded so far: 3-2-1 FIGHT, walk and chain swipe.

## What she does
- 3-2-1 FIGHT intro (same countdown flow as Zombie Goth), then she walks toward Olly.
- Chain swipe: about half a second of wind-up with the "ATTACK INCOMING" banner, then a fast low sweep. 5 damage. Jump or dodge (R / right-click) avoids it.
- Gets hit: flinches and flashes with green sparks (placeholder until your hurt-reaction art is uploaded).
- Defeated: topples and fades, then "CHAIN GOTH DEFEATED!" (placeholder until the death art is uploaded).
- Zombie Goth, the Heavy Attack unlock and the 50 HP return are unchanged.

## Where each file goes (branch Testing5)
| File in this ZIP | GitHub destination (replace / add) |
|---|---|
| js/levels/level1.js | js/levels/level1.js (replace) |
| assets/characters/combat/chain-goth/chain-intro.webp | same path (new) |
| assets/characters/combat/chain-goth/chain-walk.webp | same path (new) |
| assets/characters/combat/chain-goth/chain-swipe.webp | same path (new) |
| tools/build_chain_assets.py | optional, only for my future use |

Upload keeping the folder structure (GitHub: Add file > Upload files, drag the folders in).
The big original folders (321 fight, CGwalk, chaingothchainswipe) are NOT used by the game. They're only my source frames, so you can leave them or delete them later to keep the repo light.

## Checks done here (honest list)
- JS syntax check: passed.
- Headless Chrome test (not real play): intro runs, then chase, wind-up, swipe. Each swipe did exactly 5 damage once. Punching her and killing her reaches the "CHAIN GOTH DEFEATED!" screen with no page errors. Zombie Goth still starts and runs.
- Screenshots reviewed: size, floor line and facing match Olly.
- My test browser only ran about 4 fps, so I could NOT properly test jump or dodge timing.

## Please test in-game
1. Fight Chain Goth: do 3-2-1 FIGHT and the walk look right? Is she the right size and on the floor?
2. Does the swipe look/feel fair? Does jumping over it or dodging (R / right-click) avoid the damage?
3. Punch and Heavy Attack her: does she react? Does she die and show the defeated screen?
4. Beat both Goths: Heavy Attack still unlocks, 50 HP return still works.
5. Re-check Zombie Goth quickly.
6. If an animation loops badly, tell me which one and send frames you prefer.

## Part 2 (when you upload the rest)
Chain spin (hits around her, dodge works, jumping doesn't), stunned after the spin, real hurt reaction, real death, then the pattern swipe, swipe, spin.
You only need the `frames` folders, not the `spritesheet-...` files.
