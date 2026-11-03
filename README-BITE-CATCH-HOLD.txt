GOODBYE GOTH: ZOMBIE GOTH BITE FOLLOW / CONTACT UPDATE
Target branch: Testing4
Replace: js/levels/level1.js

WHAT CHANGED
- Slows Zombie Goth's tracking crawl from 520 to 450 units/second. This remains slightly faster than Olly's 430-unit/second normal walk, but makes the approach less frantic.
- Increases only the Ankle Biter animation's maximum render width by 10%, from 310.5px to 341.55px.
- Gives the eight bite frames distinct phases: frames 01-05 are the slower approach; frame 06 is the bite-contact pose held for one second; frames 07-08 show recoil and return to crouch.
- When Zombie Goth catches Olly at close range while he is grounded and not dodging, she deals the existing 10 HP heavy-attack damage and holds him in place for exactly 1,000 ms while frame 06 is visible.
- Olly can still avoid the catch by jumping or dodging before she reaches him. Once caught, movement, jumping and dodging are briefly disabled.
- If she does not catch Olly, the attack times out safely and enters the existing recovery phase without dealing damage.

PRESERVED
- Existing internal heavy-attack state identifier (heavyKick) for compatibility.
- Existing two-claws-then-heavy-attack cycle.
- Regular claw animation, damage, range and timing.
- Heavy-attack damage (10 HP), existing wind-up, and 1,250 ms recovery.
- Countdown, prep animation, hurt/death animation, map, Chain Goth and all other screens.

INSTALL
1. Open the Testing4 branch in GitHub.
2. Replace js/levels/level1.js with the file at that same path inside this ZIP.
3. Commit to Testing4. Your existing Vercel connection should deploy the change automatically.

CHECKS
- The starting file was the exact current Testing4 Level 1 file used for the previous follow update.
- JavaScript syntax passed `node --check`.
- ZIP integrity was checked.
- Live gameplay has not been tested here. Please test one full Zombie Goth fight, especially the one-second catch hold and bite-contact pose.
