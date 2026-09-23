GOODBYE GOTH v7.0.5 – ZOMBIE AI FIX

This patch builds on v7.0.4 and fixes the combat stability/player feedback issues seen during testing.

CHANGES
1. Olly now has a robust rendering fallback. If a cropped combat frame is missing or still loading, the canonical assets/characters/olly.png sprite is used instead, so Olly cannot simply disappear.
2. Olly can move across the full combat arena. The Zombie no longer creates an invisible wall that traps him to one side.
3. The enemy is rendered before Olly so Olly remains visible when they overlap.
4. Olly HP is now shown as a visible HUD inside the combat arena.
5. When Olly dies, he immediately respawns at 50% HP (or higher if his maximum HP is below 100).
6. RETRY COMBAT keeps the half-HP respawn rather than restoring full HP.
7. Zombie AI behaviour from v7.0.4 is otherwise preserved.

GITHUB
Merge the contents of this patch into the existing repository, keeping the folder structure.
Replace:
  js/levels/level1.js
Add/replace:
  assets/characters/olly.png
Keep the Zombie cropped animation PNGs in:
  assets/characters/combat/

TEST
- Enter Zombie Goth combat.
- Confirm Olly is visible immediately.
- Run Olly all the way across the arena and confirm he can cross the Zombie rather than being trapped.
- Confirm the OLLY HP bar and number are visible.
- Let the Zombie hit Olly until he dies.
- Confirm the death screen appears and the next attempt starts with 50/100 HP.
- Confirm Zombie continues pursuing after Olly jumps or dodges.
