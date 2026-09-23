GOODBYE GOTH v7.0
ZOMBIE GOTH AI PATCH

WHAT THIS PATCH DOES
- Replaces js/levels/level1.js with the Zombie Goth AI version.
- Adds 19 small, individually cropped Zombie Goth animation frames.
- Zombie Goth now uses a simple readable loop:
  CHASE -> WIND-UP -> ATTACK -> RECOVERY -> CHASE
- Zombie Goth can use two attacks:
  CLAW SWIPE (commoner, 12 damage)
  LUNGE + BITE (less frequent, 18 damage)
- Attacks are telegraphed so Olly can dodge or jump over them.
- Heavy Attack remains available as in the current Level 1 build.
- Player attacks now track the Zombie Goth's current combat position rather than assuming it stays at the original spawn point.

IMPORTANT
This is a patch for the existing Goodbye Goth project. Do not replace the whole project with this folder.

HOW TO INSTALL IN GITHUB
1. Cancel/remove the failed large sprite-sheet upload that is currently sitting on the GitHub upload page.
2. Download and unzip this v7.0 folder.
3. Open the unzipped folder.
4. In your existing Goodbye-Goth GitHub repository, upload/merge the contents so these paths exist:

   assets/characters/combat/zombie-idle-1.png
   assets/characters/combat/zombie-idle-2.png
   assets/characters/combat/zombie-idle-3.png
   assets/characters/combat/zombie-idle-4.png
   assets/characters/combat/zombie-walk-1.png
   assets/characters/combat/zombie-walk-2.png
   assets/characters/combat/zombie-walk-3.png
   assets/characters/combat/zombie-walk-4.png
   assets/characters/combat/zombie-claw-1.png
   assets/characters/combat/zombie-claw-2.png
   assets/characters/combat/zombie-claw-3.png
   assets/characters/combat/zombie-claw-4.png
   assets/characters/combat/zombie-claw-5.png
   assets/characters/combat/zombie-lunge-1.png
   assets/characters/combat/zombie-lunge-2.png
   assets/characters/combat/zombie-lunge-3.png
   assets/characters/combat/zombie-lunge-4.png
   assets/characters/combat/zombie-lunge-5.png
   assets/characters/combat/zombie-lunge-6.png

   js/levels/level1.js

5. Commit the changes directly to the Testing branch, as you have been doing for the current game.
6. Wait for Vercel/GitHub Pages to rebuild, then test the game.

DO NOT UPLOAD THE ORIGINAL LARGE ZOMBIE SPRITE SHEETS
The v7.0 code uses the 19 small cropped files above instead, so the original two sprite-sheet PNGs are not required in the repository for this AI pass.

TEST CHECKLIST
- Enter a Zombie Goth combat encounter.
- Confirm the Zombie walks toward Olly instead of standing still.
- Confirm a warning appears before an attack.
- Test dodging with R/right-click during the warning.
- Test jumping with Space during the attack.
- Confirm Zombie attacks can actually reduce Olly's HP.
- Confirm left-click punch hits the Zombie even after it has moved.
- Confirm Heavy Attack still works.
- Confirm defeating the Zombie returns to the map normally.

SOURCE NOTE
This v7.0 patch is based on the current Level 1 build supplied on 23 September 2026 and the first Zombie AI draft. Existing game assets referenced by level1.js are intentionally not duplicated here because they already belong to the main project.
