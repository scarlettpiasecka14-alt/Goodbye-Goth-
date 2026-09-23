GOODBYE GOTH v7.0.1 - ZOMBIE AI FIX

This is a corrected follow-up to v7.0.

WHY THIS FIX EXISTS
The first v7.0 patch loaded the new cropped Zombie Goth images correctly, but the drawing function still treated each image as if it were a sprite sheet. That caused an error in the combat draw loop, which made the Zombie Goth disappear.

THIS PATCH FIXES THAT
The combat renderer now draws the bundled individual PNG frame directly.
A bundled idle-frame fallback is also used while images are loading.

FILES TO COPY INTO YOUR EXISTING GOODBYE GOTH PROJECT

assets/characters/combat/
    zombie-idle-1.png through zombie-idle-4.png
    zombie-walk-1.png through zombie-walk-4.png
    zombie-claw-1.png through zombie-claw-5.png
    zombie-lunge-1.png through zombie-lunge-6.png

js/levels/level1.js
    Replace your current file with this one.

IMPORTANT
Do not delete your existing project assets. This is a patch to merge into the working game.

GITHUB STEPS
1. Cancel any failed PNG upload currently open on GitHub.
2. Unzip this folder.
3. Open the assets folder and merge the characters/combat files into your existing assets/characters/combat folder.
4. Replace js/levels/level1.js with the version in this patch.
5. Commit the changes to the same branch you are testing.
6. Wait for Vercel to redeploy.
7. Start a Zombie Goth encounter.

EXPECTED RESULT
The Zombie Goth should remain visible in combat, walk toward Olly, use idle/walk animation, telegraph a claw swipe or lunge/bite, and deal damage if Olly does not jump or dodge.

HEAVY ATTACK
The existing Heavy Attack system is preserved. Press Z as before.
