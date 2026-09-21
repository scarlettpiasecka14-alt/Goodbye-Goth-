GOODBYE GOTH v6.5.25
Fog persistence, performance, camera and movement polish

Replace ONLY: js/levels/level1.js

- Fog is painted once and cleared directly, eliminating repeated full-map fog rebuilds that caused frame drops.
- Overlapping fog banks are cleared as one cluster, preventing apparent reappearance from layers underneath.
- Animated mist wisps are more visible and remain clipped to uncleared fog.
- Camera smoothing is frame-rate independent.
- Movement uses swept substeps and natural axis sliding instead of arbitrary collision nudges.
- Gate exclusion radius is reduced so Olly is less likely to stick beside the gate.
- No changes to map artwork, game.js, CSS, inventory, combat or minigames.
