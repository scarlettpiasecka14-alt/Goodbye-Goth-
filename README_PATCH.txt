GOODBYE GOTH v6.5.11 – Combat Readability + Heavy Attack Controls

Active paths in this package:
- css/game.css
- js/game.js
- js/levels/level1.js
- assets/environment/combat-background-level1.png
- assets/story/level1-entrance.png
- existing combat character sprites

Changes:
- Combat movement is side-on and horizontally bounded; vertical WASD movement is removed.
- Olly is anchored to the combat floor to prevent floating/off-screen movement.
- Combat idle uses the same ready-pose family as the dodge art for consistent scale.
- Jump now uses three clear poses and a smaller physical arc.
- Dodge now uses three clear poses with the middle slide held during movement.
- Heavy Attack is now a standalone Z-key ability.
- Heavy Attack is available for Chain Goth and bosses, but locked during Zombie Goth.
- Heavy Attack uses a short ground lunge, 20 damage, 15-second cooldown, and a forgiving hit window.
- Punch remains left click and retains the 3-hit / 5-second cooldown.
- Right-click and R remain dodge controls.
- Space remains jump.
- Y remains inventory and X remains save.
- No map renderer, inventory, or Would You changes.
