GOODBYE GOTH: ZOMBIE GOTH ANKLE BITER UPDATE

SOURCE USED
The reference Level 1 source was recovered from our earlier chat: level1(20261012-171432).js (12 October 2026). I have NOT used that older file to overwrite your project, because it predates later screen-polish work.

Instead, this is an in-place patch. It checks the Level 1 file already in your project for the expected four-frame heavy-attack declaration and existing sprite loader before changing anything. It recognises the known heavy-attack wording variants. If the file does not match, it stops without editing it.

WHAT THIS DOES
- Replaces Zombie Goth's four-frame heavy-kick artwork with the supplied eight-frame Ankle Biter animation.
- Keeps the existing heavy-attack AI state and attack order. The internal code identifier remains "heavyKick" only to avoid disturbing the established AI logic.
- Updates the visible attack warning/status and damage-reaction label to say HEAVY BITE.
- Plays the eight bite frames once across the existing 1,000 ms attack, then enters the existing recovery phase.

WHAT IT DOES NOT CHANGE
- Regular claw attack or its animation.
- The existing two-claws-then-heavy-attack AI cycle.
- Heavy-attack hit timing, damage, range, or recovery/cooldown.
- Countdown/prep animation or countdown artwork.
- Zombie Goth hurt/death animation, Olly's reactions, map, or Chain Goth.
- Any other level, screen, or the rest of js/levels/level1.js.

INSTALL ON MAC
1. Make a copy of your current Goodbye Goth project folder first.
2. Extract the entire ZIP into the main project folder, the same folder that contains index.html. Allow the eight PNGs to be added under assets/characters/combat/.
3. Double-click Apply-Zombie-Goth-Ankle-Biter.command.
4. The script updates js/levels/level1.js in place and creates a timestamped backup beside it before changing anything.
5. If the script reports SUCCESS, the code update is applied. If it cannot recognise the expected code, it stops without changing level1.js.

The patch does not upload or commit anything to GitHub. After you have tested it locally, you can commit the changed file and eight new PNGs to your Testing4 working branch. Your separate safe repository called 8.5 is not touched.

VALIDATION
The in-place updater was tested against the saved 12 October chat source. The resulting JavaScript passed `node --check`, and the ZIP archive passed an integrity check. The updater also checks the expected patterns before editing, and runs `node --check` on your local file if Node.js is installed. This has not been live-browser tested here.
