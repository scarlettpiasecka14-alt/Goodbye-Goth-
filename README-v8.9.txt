GOODBYE GOTH v8.9 - ZOMBIE GOTH COMBAT SCALE + AI ATTACK CYCLE

Based on v8.8.

Changes:
1. Combat arena now occupies the entire viewport. HUD, status and buttons sit over the artwork instead of consuming vertical space.
2. Zombie Goth WALK animation is 10% smaller than v8.8.
3. Zombie Goth regular ATTACK animation is 10% smaller than v8.8.
4. Zombie Goth intro/crouch, hurt/reaction and death animations are 20% larger than v8.8.
5. Zombie Goth AI now uses a deterministic attack pattern:
   regular claw -> regular claw -> HEAVY CLAW -> repeat.
6. Heavy Claw uses the approved claw animation with a slower attack timing, wider hit range and 24 damage (2x the regular 12 damage).
7. Regular claw remains 12 damage.
8. No new sprite assets are required. The Heavy Claw is an AI combat behaviour using the existing approved claw art until a dedicated heavy sprite sequence is introduced.

Files to replace:
- js/levels/level1.js
- css/game.css
