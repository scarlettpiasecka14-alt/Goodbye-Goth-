GOODBYE GOTH - ZOMBIE GOTH HEAVY ATTACK SIZE FIX

Target branch: Testing4
File to replace:
  js/levels/level1.js

WHAT CHANGED
The Ankle Biter animation uses wide horizontal sprite frames. The game previously rendered Zombie Goth with a very large width allowance (1400 game-canvas pixels), making the bite pose spread across a large part of the arena.

This update applies a 270-pixel maximum width only while the existing Zombie Goth HEAVY ATTACK animation is playing. This matches the standard combat drawing width. Her other animations are unchanged.

NOT CHANGED
- Existing heavy attack name/state and attack order
- Eight Ankle Biter frames and their order
- Attack duration, damage, hit window, range, recovery and cooldown
- Regular claw attack
- Countdown, other Zombie Goth animations, Chain Goth, map, screens and inventory

INSTALL
1. Open the Testing4 branch in GitHub.
2. Open js/levels/level1.js.
3. Replace that file with the included js/levels/level1.js, keeping the same path and filename.
4. Commit the change to Testing4. Vercel should then deploy the update in the normal way.

The eight Ankle Biter PNGs are already in Testing4 and do not need to be uploaded again.

CHECKS
- JavaScript syntax checked with Node.
- Only the heavy-attack rendering width cap was changed in this update.
- Not live-browser tested in this environment.
