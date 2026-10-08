GOODBYE GOTH v8.13

Focused Level 1 Zombie Goth combat polish patch based on v8.12.

ZOMBIE GOTH
- Walk render enlarged from the v8.12 value so she remains clearly taller than Olly.
- Regular claw attack render enlarged.
- Heavy Kick render enlarged.
- Heavy Kick uses four newly normalized frames from the supplied kick artwork so the four attack poses share the same sprite canvas and floor alignment.
- Dedicated Crouching Zombie Goth artwork is now the ONLY generic ready/idle/recovery pose.
- The first frame of the Heavy Kick remains available only inside the actual Heavy Kick sequence.
- The generic crouch-ready pose is never reused as an incoming-attack pose.

3-2-1-FIGHT
- Restored a smooth 3 / 2 / 1 / FIGHT countdown.
- Each phase remains on screen for 1.5 seconds.
- The Zombie holds the same dedicated crouched staring pose throughout the countdown.
- No rapid prep-sprite animation and no attack-prep artwork is used during the countdown.
- After FIGHT, she returns briefly to the same crouched ready pose before approaching Olly.

COMBAT HUD
- Added a persistent compact OLLY HP bar directly underneath the enemy HP HUD.
- It remains out of 100 HP and updates live during the fight.
- Existing lower combat status bar remains in place for the punch/cooldown indicator.

OTHER
- Olly hurt and KO animations from v8.12 are retained unchanged.
- Zombie normal damage remains 5 HP.
- Zombie Heavy Kick remains 10 HP.
- Zombie AI pattern remains Normal -> Normal -> Heavy Kick -> recovery -> repeat.
- Olly punch sequence remains 3 successful hits -> 5 second cooldown.

FILES
- Replace: js/levels/level1.js
- Add/replace: assets/characters/combat/zombie-ready-crouch.png
- Add/replace: assets/characters/combat/zombie-heavy-kick-1.png through zombie-heavy-kick-4.png

VALIDATION
- JavaScript syntax checked with Node.js.
