GOODBYE GOTH: ZOMBIE GOTH HEAVY ATTACK ANIMATION UPDATE

TARGET
- Repository: scarlettpiasecka14-alt/Goodbye-Goth-
- Branch: Testing4
- Replace exactly: js/levels/level1.js
- Starting source verified against Testing4 blob SHA: 817e7e0653d72314d975dc6801f96a0acb43c814

WHAT CHANGES
- The existing Zombie Goth heavy-attack animation now loads all eight Ankle Biter frames in order.
- The attack is still called HEAVY ATTACK in the status and incoming-warning text.
- The internal `heavyKick` state name is deliberately retained because the current AI, draw routine and attack/recovery logic already use it.
- The bite animation plays once across the existing 1,000 ms attack and then enters the existing recovery state.

WHAT STAYS THE SAME
- The two-claws-then-heavy-attack AI cycle.
- Heavy-attack timing, active hit window, damage, range and recovery duration.
- The regular claw animation and claw damage.
- Countdown/prep sequence and artwork.
- Hurt/death animations, Olly reactions, map, completion screens, inventory and all other game logic.
- All later Testing4 completion-screen changes are retained because this replacement was built from the exact active Testing4 file.

ASSETS
The eight PNG files are already present in the Testing4 repository at:
assets/characters/combat/zombie-ankle-biter-01.png through zombie-ankle-biter-08.png
This patch therefore does not duplicate them.

UPLOAD
1. Open the Testing4 branch on GitHub.
2. Open `js/levels/level1.js` and replace its contents with the `js/levels/level1.js` file in this ZIP, or use GitHub's Upload files flow to replace that exact path.
3. Commit the change to Testing4 only.
4. Vercel will deploy from the normal GitHub connection.

There is no installer or local game runner in this patch. This is the actual browser-game source file.

VALIDATION
- Built from the exact Testing4 source blob listed above.
- Node.js syntax check passed.
- Verified that the frame array contains 8 images and the loader points to Ankle Biter frames 01-08.
- Verified the internal `heavyKick` state-reference count is unchanged.
- No live browser gameplay test was performed here.
