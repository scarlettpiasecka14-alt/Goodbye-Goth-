GOODBYE GOTH — TARGETED ZOMBIE GOTH POLISH

Starting point: js/levels/level1.js from the Testing branch as read on 13 October 2026.

REPLACE
- Replace the existing js/levels/level1.js with the included file at js/levels/level1.js.
- No art assets are changed or added.

CHANGES
- The countdown prep uses a 100 ms ping-pong animation loop throughout the five-second countdown, instead of holding each of eight poses for 625 ms.
- The crouched ready pose is shown only while Zombie Goth is in close range preparing an attack. If Olly moves away, she returns immediately to her walking chase.
- The heavy kick is enlarged from 330 px to 410 px and has a longer active window and a wider 220 px hit range. Damage remains 10 HP.
- The warning label now correctly says HEAVY KICK.

VALIDATION
- This is a targeted source replacement based on the Testing branch. It has not been deployed or tested live in a browser. Please check the countdown and a full Zombie Goth fight before treating the changes as confirmed.
