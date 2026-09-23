GOODBYE GOTH v7.0.6 — ZOMBIE AI + CLEAN COMBAT FRAMES

This patch is intentionally limited to Level 1 combat plus one restoration fix:
- Zombie Goth combat AI continues to use the existing v7.x behaviour.
- Zombie combat visuals now use the individually cropped PNG frames from the supplied reference sheets.
- No sheet labels, numbers, borders or embedded Olly are used.
- The map/exploration Olly sprite rendering is restored to preserve the canonical sprite aspect ratio, fixing the warped Olly seen after previous patches.

FILES
assets/characters/combat/*.png -> cropped Zombie Goth combat frames
js/levels/level1.js -> replacement Level 1 source

IMPORTANT
1. Do NOT replace game.js, story.js, game.css or index.html for this patch.
2. Do NOT replace assets/characters/olly.png with another file. The level1.js in this patch keeps the existing canonical asset and fixes only its aspect-ratio rendering.
3. Merge the assets folder into the existing repository and replace js/levels/level1.js.

TEST
- Open the map: Olly should have his normal proportions.
- Enter Zombie Goth combat.
- Zombie should be visible using the clean cropped frames.
- Check idle, walk, claw and lunge frames.
- Existing Zombie AI behaviour remains otherwise unchanged.
