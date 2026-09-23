GOODBYE GOTH v7.0.4
Zombie Goth behaviour fix

IMPORTANT
This patch is built from the known-working v7.0.2 Level 1 source. It keeps the existing art assets and only changes Zombie Goth combat behaviour.

FILES
- js/levels/level1.js
- assets/characters/combat/zombie-idle-1.png through zombie-idle-4.png
- assets/characters/combat/zombie-walk-1.png through zombie-walk-4.png
- assets/characters/combat/zombie-claw-1.png through zombie-claw-5.png
- assets/characters/combat/zombie-lunge-1.png through zombie-lunge-3.png

GITHUB
1. Cancel/remove any failed upload currently open.
2. Unzip this patch.
3. Merge the assets/ and js/ folders into the existing Goodbye-Goth repository.
4. Replace the existing js/levels/level1.js with this version.
5. Commit directly to the Testing branch, as usual.
6. Wait for Vercel to deploy.

WHAT THIS FIXES
- Olly can move across the whole combat arena and can pass the Zombie.
- Zombie continuously follows Olly instead of being trapped on one side.
- Jumping and dodging do not permanently stun or stop the chase.
- Zombie alternates claw and lunge attacks so both can be tested reliably.
- Zombie gets a clear wind-up before attacking.
- Lunge aims to stop beside Olly instead of carrying the player through the enemy art.
- After an attack or missed attack, Zombie returns to chase.
- The patch removes the malformed duplicate jump() declaration accidentally introduced in v7.0.3. That was the cause of the black/crashed game.

NOT CHANGED YET
- Zombie artwork/white outlines.
- Walk-frame quality.
- Olly hurt/reaction animations.
- Zombie hurt/reaction/death animations.
- True two-character bite interaction.

TEST CHECKLIST
- Start a Zombie Goth fight.
- Walk left/right across the arena. Confirm Olly can pass her.
- Let her approach without touching anything.
- Jump while she is winding up. Confirm the attack can miss and she follows again.
- Dodge while she is winding up. Confirm the attack can miss and she follows again.
- Run to the opposite side of the arena. Confirm she follows.
- Wait for several attack cycles. Confirm CLAW then LUNGE repeat.
- Confirm no duplicate Olly appears during the lunge.
