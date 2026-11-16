GOODBYE GOTH: ZOMBIE GOTH HEAVY ATTACK FOLLOW UPDATE

TARGET
- Testing4 branch
- Replace: js/levels/level1.js

WHAT CHANGES
- During the existing Zombie Goth HEAVY ATTACK (the eight-frame Ankle Biter animation), she now crawls towards Olly's live position throughout the one-second attack.
- Her crawl speed is 520 game units/second, slightly faster than Olly's 430-unit/second normal walk, so simply walking away no longer leaves her behind.
- She tracks his current side and direction, and stops just outside the existing body-collision spacing rather than walking through him.
- Jumping and dodging remain available, and the existing damage check still lets those evade the hit.

UNCHANGED
- The 15%-increased bite render width (310.5px).
- Eight Ankle Biter frames and their order.
- The existing HEAVY ATTACK name and internal heavyKick state identifier.
- The two-claws-then-heavy-attack cycle.
- Heavy-attack wind-up, 350-760ms active hit window, one-hit rule, 10 damage, 220px hit range, and 1,000ms attack duration.
- Recovery duration, regular claw, countdown, hurt/death animations, map, progression, Chain Goth and other screens.

INSTALL
1. Open the Testing4 branch in GitHub.
2. Open js/levels/level1.js.
3. Replace its contents with the js/levels/level1.js file in this ZIP and commit to Testing4.
4. Vercel should deploy the updated browser game automatically.

VALIDATION
- Built from the exact Testing4 level1.js blob currently in the working project before this follow update.
- Node JavaScript syntax check passed.
- ZIP integrity check passed.
- The browser animation has not been live-tested here. Please test the bite while walking away, then try jumping/dodging to confirm those evasions still work.
