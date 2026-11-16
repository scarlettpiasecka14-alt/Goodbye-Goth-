GOODBYE GOTH - ZOMBIE GOTH HEAVY ATTACK SIZE +15%

TARGET
- Repository: scarlettpiasecka14-alt/Goodbye-Goth-
- Branch: Testing4
- Replace: js/levels/level1.js

CHANGE
The Ankle Biter heavy-attack width cap has been increased from 270 game-canvas pixels to 310.5 pixels. This is exactly 15% larger. The cap applies only while the existing Zombie Goth heavy-attack state is active.

UNCHANGED
- Eight Ankle Biter frames and their order
- Existing HEAVY ATTACK name and internal state identifier
- Attack duration, damage, active hit window, range, recovery and cooldown
- Regular claw attack and all other Zombie Goth animations
- Countdown, map, screens, inventory, Chain Goth and save data

UPLOAD
1. Open the Testing4 branch in GitHub.
2. Replace the contents of js/levels/level1.js with the included file at that exact path.
3. Commit to Testing4. The existing GitHub-to-Vercel connection should deploy it normally.

The eight bite PNGs are already in the repository and are not included again. The separate safe repository called 8.5 is not touched.

VALIDATION
- The starting level1.js file matches the active Testing4 source blob: ef80e0de82d6e09b14b836afb706568dc7b9602e.
- Node.js syntax check passed after the change.
- This has not been live-browser tested.
