GOODBYE GOTH v7.0.3
ZOMBIE GOTH AI BEHAVIOUR PATCH

This patch is based on the tested v7.0.2 Zombie AI build.

WHAT THIS FIXES
- Olly can move across the entire combat arena instead of being clamped to one side of the Zombie.
- Olly can pass around the Zombie, so she cannot permanently trap him at the wall.
- The Zombie continuously follows Olly even if he runs to the opposite side.
- Jumping and dodging no longer make the Zombie abandon the chase.
- The Zombie no longer requires Olly to walk directly into her before choosing an attack.
- Attacks alternate between CLAW SWIPE and LUNGE + BITE so both are reliably seen during testing.
- Lunge has a readable wind-up and targets Olly's position without embedding a duplicate Olly inside the enemy artwork.
- After an attack finishes, the Zombie immediately returns to CHASE.
- Player pushback is bounded so Olly cannot be pinned against the arena edge.

IMPORTANT
The Zombie art is intentionally unchanged in this patch. The current sprite sheets/crops still need a separate visual cleanup pass. This patch is for behaviour and movement only.

INSTALL
1. Unzip this folder.
2. Merge the assets/ folder into the project assets/ folder.
3. Replace js/levels/level1.js with the supplied file.
4. Commit the changes to GitHub and allow Vercel to redeploy.

TEST CHECKLIST
1. Start a Zombie Goth fight.
2. Do not move: she should approach you.
3. Run left and right across the arena: she should follow.
4. Jump while she attacks: the attack should miss and she should resume chasing.
5. Dodge through/away from her: she should resume chasing.
6. Walk past her: Olly should be able to get to the other side, and she should turn and follow.
7. Wait through two attack cycles: you should see both CLAW SWIPE and LUNGE + BITE.
