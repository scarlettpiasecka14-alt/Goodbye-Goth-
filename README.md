# Goodbye Goth V9.4 – Chain Goth polish

Replaces V9.3 (and V9.2). Upload this one only.

## What changed (from your feedback)
- **Bigger and less thin:** she is drawn about 14% larger and 5% wider. Two numbers in level1.js control this (`CHAIN_RENDER_SCALE` and `CHAIN_WIDTH_STRETCH`). Tell me "bigger" or "smaller" and I'll change it. The 3-2-1 pose is still drawn smaller so her chain stays clear of the HP bar.
- **New walk:** built from the two good steps of your second walk render (CGwalk2, frames 3 to 19), looped. It is much sharper than the old walk, so the pop when she stops to attack should be gone.
- **Chain spin, clearer and sharper:**
  - The wind-up now reuses the crisp chain-swipe wind-up (the spin's own wind-up frames were the blurriest), held for about 1 second.
  - A **red ring on the floor** shows the danger zone while she winds up and spins. Dodge (R / right-click) while you are in it. Jumping does not avoid it.
  - The spin frames themselves get a sharpen and contrast pass. The original spin render is soft and smudgy, so this only helps so much. If it still bothers you, regenerating that one animation is the real fix.
  - The two hits now land on the last two flashes of the spin (a bit later), so one early dodge covers both.
- **Stun is now earned:** it no longer happens by itself after the spin. Hit her 3 times within 4 seconds (a Heavy Attack counts as 2) and she is stunned for about 2 seconds. "ENEMY STUNNED!" shows over her head with stars. Three small dots above her head show how many hits you have landed. The moment she is stunned, your punch cooldown is reset so you can punish her.
- **Sparks:** they now appear on the floor where the chain actually lies and hits the ground (in front of and behind her in the 3-2-1, and at the end of the chain swipe), and every impact now fires reliably, even on slower computers.
- **Hurt reaction:** much longer. She doubles over and slowly straightens up (about 1.2 seconds), and a Heavy Attack plays the full 2-second version. Her feet stay planted so she no longer snaps back at the end.
- Zombie Goth is untouched.

## Where each file goes (branch Testing5)
| File in this ZIP | GitHub destination |
|---|---|
| js/levels/level1.js | js/levels/level1.js (replace) |
| assets/characters/combat/chain-goth/chain-intro.webp | same path (replace) |
| assets/characters/combat/chain-goth/chain-walk.webp | same path (replace) |
| assets/characters/combat/chain-goth/chain-swipe.webp | same path (replace) |
| assets/characters/combat/chain-goth/chain-spin.webp | same path (replace) |
| assets/characters/combat/chain-goth/chain-stun.webp | same path (replace) |
| assets/characters/combat/chain-goth/chain-hurt.webp | same path (replace) |
| assets/characters/combat/chain-goth/chain-death.webp | same path (replace) |
| tools/build_chain_assets.py | optional |

## Checks done here (honest list)
- JS syntax check passed.
- Headless Chrome with the game slowed down so frames could be captured: reviewed the new walk, sparks, spin wind-up with red ring, spin, three-punch stun with label and dots, and the hurt reaction. A third punch stunned her; one punch gave the hurt reaction. Killing her reached the defeated screen. Zombie Goth still runs and can be defeated. No page errors.
- NOT tested: real-speed feel, spin timing as a player, or on a real keyboard.

## Please test in-game
1. Size: right now? Still too thin or small, or too big?
2. Walk: is the pop when she stops to attack gone? Does the loop look natural?
3. Spin: is the red ring and "DODGE ONLY" warning clear now? Does a dodge avoid it? Does jumping NOT avoid it?
4. Stun: three punches, then "ENEMY STUNNED!". Can you punish her with the reset cooldown? (She has 50 HP, so 3 hits plus 2 more punches can finish the fight quickly. Tell me if you want it harder.)
5. Hurt reaction: better? Too long?
6. Sparks: now on the floor where the chain hits, and every time?
