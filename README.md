# Goodbye Goth V9.2 – Chain Goth fixes + death animation

## What changed (from your feedback)
- 3-2-1 FIGHT: she is drawn smaller so her chain no longer goes behind the HP bar. At the very end of the countdown she grows smoothly to her normal fighting size.
- 3-2-1 chain swing: now uses every frame of your animation and plays about one swing per countdown number, so it is slower and smoother.
- Chain swipe: now uses all 20 frames (before it was 12), with the strike at about 30 frames per second, so it reads as one fluid motion instead of separate frames. The wind-up is also smoother. The damage moment is unchanged (5 damage; jump or dodge avoids it).
- Sharper look: the pictures are now drawn at their own size with no resizing. That was the main reason she looked soft before.
- Death: your new death animation is in. She takes the hit, falls, lies on the floor and fades, then the "CHAIN GOTH DEFEATED!" screen appears.
- Walk: unchanged (you said it was perfect).
- Zombie Goth is untouched.

## Where each file goes (branch Testing5)
| File in this ZIP | GitHub destination |
|---|---|
| js/levels/level1.js | js/levels/level1.js (replace) |
| assets/characters/combat/chain-goth/chain-intro.webp | same path (replace) |
| assets/characters/combat/chain-goth/chain-walk.webp | same path (replace) |
| assets/characters/combat/chain-goth/chain-swipe.webp | same path (replace) |
| assets/characters/combat/chain-goth/chain-death.webp | same path (NEW) |
| tools/build_chain_assets.py | optional, my packing script |

## Checks done here (honest list)
- JS syntax check passed.
- Headless Chrome with the game slowed down so I could capture individual frames: reviewed the intro, swipe and death frames. The chain stays below the HP bar in the countdown, the swipe is continuous, and the death plays through and lies on the floor.
- Headless run: killing her reaches the "CHAIN GOTH DEFEATED!" screen with no page errors.
- NOT tested: real-speed feel, and jump/dodge timing (my test browser runs about 4 fps). Please judge speed in the live game.

## Please test in-game
1. 3-2-1: is she the right size? Chain fully visible? Swing speed okay? (If still too fast or slow, tell me which and by how much.)
2. Does the chain swipe now feel fluid and fair? Jump and dodge (R / right-click) still avoid it?
3. Kill her: death plays properly and the defeated screen follows?
4. Does she still look too thin or soft?

## Still waiting for
Hurt reaction, stunned and chain spin (the hurt and stun folders had not arrived on Testing5 when I looked). Her hit reaction is still the placeholder flinch until the hurt reaction frames arrive.
