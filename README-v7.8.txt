GOODBYE GOTH v7.8 - MAP WALK FIX + ZOMBIE GOTH SCALE/GROUND FIX

Base: v7.7

Changes:
1. FIXED OLly MAP WALK DIRECTION RENDER
   - The previous build reset the movement flag before drawWorld rendered the player.
   - v7.8 now uses the held WASD/arrow movement state directly while drawing the map.
   - W / Up = back-facing walk pose.
   - S / Down = front-facing walk pose.
   - A / Left = left-facing side pose.
   - D / Right = right-facing side pose.
   - This is MAP ONLY. Combat movement and combat animations remain unchanged.

2. ZOMBIE GOTH WALKING FRAMES ENLARGED
   - The 12 side-profile walking frames are tightly cropped to the actual visible character pixels.
   - Chase render height is now 415px, giving approximately a 75% increase in visible character height compared with the previous padded-frame render.
   - Each frame now uses its actual bottom edge, removing the transparent padding that caused the Goth to float.
   - The walk frames are positioned so the feet meet the same combat floor as Olly.
   - Existing attack frames and AI behaviour are left unchanged.

3. PRESERVED GAMEPLAY
   - No changes to enemy AI difficulty, damage, attack timing, collision, dodge, jump, punch or Heavy Attack behaviour.
   - Heavy Attack remains unlocked only after both Level 1 Goths have been defeated, regardless of order.

Assets included:
- assets/characters/map/olly-walk-front.png
- assets/characters/map/olly-walk-back.png
- assets/characters/map/olly-walk-left.png
- assets/characters/map/olly-walk-right.png
- assets/characters/combat/zombie-walk-1.png through zombie-walk-12.png
- assets/characters/combat/zombie-walk-preview-v7.8.png
- js/levels/level1.js

Animation workflow for future character art:
1. Generate/lock the character design.
2. Generate a consistent orientation or pose using a pose reference image whenever possible.
3. Use dedicated animation/sprite software to create the movement between poses.
4. Export transparent frames and integrate them into the game.
