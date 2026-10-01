GOODBYE GOTH v7.5 - ZOMBIE WALK TEST

Base: v7.4.1

Changed:
- Replaced the previous 3-frame Zombie Goth walk with four selected frames from the free AI animation pass.
- Selected source frames: 3, 5, 7 and 10 (1-based numbering from the supplied 12-frame animation).
- Walk cycle: 1 -> 2 -> 3 -> 4 -> loop.
- Slower timing: 160ms, 140ms, 160ms, 140ms.
- Updated image cache-busting to v7500.
- Corrected the combat status text so Chain Goth is not described as the Heavy Attack unlock trigger.
- No combat balance, AI difficulty, HP, damage, or other Level 1 mechanics changed.

Changed files:
- js/levels/level1.js
- assets/characters/combat/zombie-walk-1.png
- assets/characters/combat/zombie-walk-2.png
- assets/characters/combat/zombie-walk-3.png
- assets/characters/combat/zombie-walk-4.png
- assets/characters/combat/zombie-walk-preview-v7.5.png
- assets/characters/olly.png

Upload/replace the patch contents in the same locations in the GitHub Testing branch.
