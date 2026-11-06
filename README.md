# Goodbye Goth V9.3 – Chain Goth complete (all 7 animations) + ground sparks

This replaces V9.2. If you upload this one you do NOT need V9.2 as well.

## What's new
- Chain swipe AND chain spin. Her pattern is swipe, swipe, spin, then repeats.
  - Spin: a long (about 1.1s) wind-up with a RED-bordered warning "CHAIN SPIN • DODGE ONLY • CAN'T JUMP IT", then a spin that hits twice (5 + 5 damage). Dodge (R / right-click) avoids it. Jumping does NOT.
  - Tip: dodge early in the spin, because one well-timed dodge covers both hits.
- Stunned: after every spin she is dizzy for about 2 seconds. Punches still count, but they don't interrupt her. Then she goes back to chasing.
- Hurt reaction: her real hurt animation plays when you punch her (short) or hit her with the Heavy Attack (longer). Hitting her during the swipe wind-up still interrupts it, like Zombie Goth.
- Death: your death animation, then the "CHAIN GOTH DEFEATED!" screen (already in V9.2).
- Sparks: a spark burst where the chain's mace hits the ground in the 3-2-1 and in the chain swipe. (This is drawn by the game, no new art needed. The spin already has sparks in your art.)
- Zombie Goth is untouched.

## Where each file goes (branch Testing5)
| File in this ZIP | GitHub destination |
|---|---|
| js/levels/level1.js | js/levels/level1.js (replace) |
| assets/characters/combat/chain-goth/chain-intro.webp | same path (replace) |
| assets/characters/combat/chain-goth/chain-walk.webp | same path (replace) |
| assets/characters/combat/chain-goth/chain-swipe.webp | same path (replace) |
| assets/characters/combat/chain-goth/chain-death.webp | same path (new if you skipped V9.2) |
| assets/characters/combat/chain-goth/chain-spin.webp | same path (NEW) |
| assets/characters/combat/chain-goth/chain-stun.webp | same path (NEW) |
| assets/characters/combat/chain-goth/chain-hurt.webp | same path (NEW) |
| tools/build_chain_assets.py | optional |

## Checks done here (honest list)
- JS syntax check passed.
- Headless Chrome with the game slowed down so frames could be captured: reviewed the spin (wind-up, spin, stun), hurt reaction, sparks, intro, swipe and death frames. Order of attacks confirmed as swipe, swipe, spin, stun, chase. A punch during the stun does damage without interrupting her. Killing her reaches the defeated screen. Zombie Goth still runs and can be defeated. No page errors.
- In the slowed-down test a well-timed dodge took 0 damage from the spin.
- NOT tested: real-speed feel, and jump-vs-spin on a real keyboard. The spin ignores jumping in the code, but I haven't seen that on screen.

## Please test in-game
1. Does she do swipe, swipe, spin? Is the red warning clear?
2. Spin: does a dodge avoid it, and does jumping NOT avoid it?
3. After the spin, is the stun a fair window to hit her?
4. Punch and Heavy Attack reactions look right? Death looks right?
5. Sparks: right place and size? (Easy to tweak.)
6. Does her size look the same in every animation? (The spin and stun were made at different zoom levels, so I scaled them to match. Tell me if any looks bigger or smaller.)

## Not done yet
Walk quality: waiting for your decision on looping the two good steps (see my message).
