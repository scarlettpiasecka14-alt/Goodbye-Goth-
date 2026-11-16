GOODBYE GOTH v7.6 - ZOMBIE GOTH SIDE-PROFILE WALK UPDATE

This is a v7.5-based game patch.

CHANGED
- Replaces the v7.5 four-frame Zombie Goth walk with the new 12-frame strict side-profile cycle supplied on 1 Oct 2026.
- Uses the 12 frames in order at readable timing: [110,100,100,110,100,100,110,100,100,110,100,100] ms.
- Normalizes frame alignment so the character's ground position remains stable while animating.
- New walk artwork faces LEFT natively. Code now understands that the walk frames have a different native facing direction from the existing attack frames and flips them only when necessary.
- Heavy Attack progression remains: it unlocks after BOTH Level 1 Goths are defeated, regardless of fight order.
- Existing v7.5 combat/AI/reaction work is otherwise carried forward.

NEW ANIMATION WORKFLOW
1. Generate the character/design.
2. Generate a consistent strict side-profile master/reference.
3. Use dedicated animation/sprite software to generate or refine the motion cycle.
4. Export individual transparent frames and wire them into the game.

FILES
- js/levels/level1.js
- assets/characters/combat/zombie-walk-1.png through zombie-walk-12.png
- assets/characters/combat/zombie-walk-preview-v7.6.png

Upload/replace the patch files in the same paths in the GitHub Testing branch.
