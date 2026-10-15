GOODBYE GOTH: ZOMBIE GOTH STATIC COUNTDOWN PATCH

WHAT THIS CHANGES
- Uses the included Zombie Goth portrait as a single static pose during the existing intro countdown.
- Leaves the 3, 2, 1 and FIGHT artwork and timing unchanged.
- Leaves her post-countdown movement, ready pose, attacks, damage and other fight mechanics unchanged.
- Avoids mirroring the front-facing intro portrait.

HOW TO APPLY (MAC)
1. Make sure you are working on your Testing4 game folder, not your safe backup.
2. Unzip this patch directly into the game folder, the one containing index.html. Allow the included asset folder to merge with the existing assets folder.
3. Double-click Apply-Zombie-Static-Patch.command. If macOS blocks it, right-click it and choose Open.
4. The script backs up js/levels/level1.js as js/levels/level1.js.before-zombie-static.bak before editing it.
5. Test the Zombie Goth fight locally. This patch does not commit or upload anything to GitHub.

If the script reports that the file does not match, stop rather than forcing it. The patch deliberately refuses to edit an unexpected version.

TO UNDO
Restore js/levels/level1.js from js/levels/level1.js.before-zombie-static.bak and remove assets/characters/combat/zombie-intro-static.png.
