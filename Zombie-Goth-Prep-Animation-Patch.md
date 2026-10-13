# Zombie Goth countdown prep animation patch

Use the 61 PNGs in assets/characters/combat/zombie-prep-frames/ (frame_0000.png through frame_0060.png). In js/levels/level1.js, make these changes:

1. Change prep: Array.from({ length: 8 }, () => new Image()) to prep: Array.from({ length: 61 }, () => new Image()).
2. Change the prep image loader to:

    zombieCombatFrames.prep.forEach((img, i) => img.src = `assets/characters/combat/zombie-prep-frames/frame_${String(i).padStart(4, '0')}.png?v=9000`);

3. Replace the prep timing/sequence constants with:

    const ZOMBIE_PREP_TOTAL_MS = 5000;

Keep the existing countdown constants. Remove ZOMBIE_PREP_FRAME_MS, ZOMBIE_PREP_SEQUENCE, and ZOMBIE_PREP_CYCLE_MS.

4. In getZombieCombatFrame(nowMs), in the intro branch replace the modulo/ping-pong frame selection with:

    const prepProgress = Math.min(1, Math.max(0, elapsed) / ZOMBIE_PREP_TOTAL_MS);
    index = Math.min(frames.length - 1, Math.floor(prepProgress * frames.length));

The animation runs forward once over the five-second prep and holds frame 0060 through the final one-second countdown phase.
