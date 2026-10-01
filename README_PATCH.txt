GOODBYE GOTH v7.7 - OLLY MAP DIRECTIONS + ZOMBIE GOTH SCALE

Base:
- v7.6 Zombie Goth Side-Profile Walk build.

THIS PATCH CHANGES
1. MAP OLly now uses direction-specific walking poses:
   - W / Arrow Up = BACK / rear view
   - S / Arrow Down = FRONT view
   - A / Arrow Left = LEFT-facing side view
   - D / Arrow Right = RIGHT-facing side view
2. The supplied Side Walk pose is used as the natural RIGHT-facing pose and mirrored for LEFT.
3. These new Olly poses are MAP ONLY. Combat movement, combat sprites, attacks, jump and dodge are unchanged.
4. Zombie Goth's combat render is enlarged so the new side-profile walk/attack set no longer appears miniature.
5. Zombie Goth AI timing, HP, damage, difficulty, collision and attack logic are unchanged.
6. Heavy Attack progression remains: it unlocks after BOTH Level 1 Goths are defeated, in either order.

DESIGN NOTE
- The new Olly map poses lock in the supplied beard/stubble and The Weeknd shirt treatment.
- The back-facing pose naturally shows the rear of the shirt rather than the front graphic.
- These are static directional walk poses with the existing movement bob. They are not yet multi-frame walk cycles.

FUTURE ANIMATION WORKFLOW
1. Generate/lock character design.
2. Generate a consistent master view / side profile.
3. Animate or refine in dedicated animation/sprite software.
4. Export transparent frames.
5. Wire them into the game.

CHANGED FILES
- js/levels/level1.js
- assets/characters/map/olly-walk-front.png
- assets/characters/map/olly-walk-back.png
- assets/characters/map/olly-walk-left.png
- assets/characters/map/olly-walk-right.png
- assets/characters/map/olly-map-direction-preview-v7.7.png
- README-v7.7.txt
