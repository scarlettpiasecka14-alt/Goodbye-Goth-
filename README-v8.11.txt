GOODBYE GOTH v8.11

This is a focused Level 1 combat patch based on v8.9. v9.0 is intentionally NOT used as the baseline.

FILES TO REPLACE / ADD
- Replace: js/levels/level1.js
- Add/replace: assets/characters/combat/zombie-heavy-1.png through zombie-heavy-4.png
- Add: assets/characters/combat/olly-hurt-1.png through olly-hurt-6.png
- Add: assets/characters/combat/olly-ko-1.png through olly-ko-8.png

ZOMBIE GOTH
- Normal claw damage: 5 HP.
- Heavy attack is the supplied four-frame kick sequence: heavy kick damage 10 HP.
- AI pattern is deterministic: Normal -> Normal -> Heavy Kick -> repeat.
- Heavy Kick has a longer recovery / attack break after it finishes.
- The attack-prep animation is used only during the 3-2-1-FIGHT intro and is not an attack state.
- The crouched ready pose is used after the intro and during recovery.
- Countdown phases are 1.5 seconds each: 3, 2, 1, FIGHT.
- The prep/staring animation runs for approximately 5 seconds before holding its final pose through the last countdown phase.
- Regular attack render is kept smaller than the walk render to reduce the previous size jump.
- Zombie death render is reduced and re-grounded.
- Olly's 3-punch combo remains 3 successful punches, then a 5-second cooldown with no hidden 900 ms combo reset.

OLLY REACTIONS
- Normal Zombie Goth hit: six-frame upright hurt animation.
- When Olly HP reaches 0: eight-frame collapse/KO animation.
- No separate 3-hit KO trigger is used.
- Olly is then returned at 50 HP through the existing checkpoint/dead flow.
- The end-state text is "KNOCKED OUT", not literal death.

HEAVY ATTACK
- Olly's own Heavy Attack remains unchanged.
- This patch only adds the Zombie Goth's heavy kick attack.

VALIDATION
- JavaScript syntax checked with Node.js.
