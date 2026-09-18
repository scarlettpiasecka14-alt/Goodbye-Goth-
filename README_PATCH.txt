GOODBYE GOTH v6.5.7
Olly Animation Cleanup + Level 1 Entry Art

Active paths in this package:
- css/game.css
- js/game.js
- js/levels/level1.js
- assets/environment/combat-background-level1.png
- assets/story/level1-entrance.png
- assets/characters/combat/*

Changes:
- Uses the supplied Olly combat sprite sheet as properly cropped transparent animation frames.
- Preserves each frame's natural aspect ratio to stop Olly stretching.
- Corrects Olly's combat-facing direction so attacks face the Goth.
- Removes the old canvas attack-effect overlays that were contributing to visual clutter.
- Slows punch, dodge, jump and heavy-attack animation playback so the poses are readable.
- Removes the large on-canvas JUMP label.
- Makes dodge travel away from the Goth instead of toward it.
- Replaces the Level 1 entrance artwork with the supplied updated image.
- Does not change map rendering, inventory, Would You logic, or the combat background.
