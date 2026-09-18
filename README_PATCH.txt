GOODBYE GOTH v6.5.8
Combat Animation + Heavy Attack Lunge Cleanup

Active paths in this package:
- css/game.css
- js/game.js
- js/levels/level1.js
- assets/environment/combat-background-level1.png
- assets/story/level1-entrance.png
- assets/characters/combat/*

Changes:
- Removes the translucent dodge circle effect entirely.
- Slows dodge playback to 1.2s so each pose is readable.
- Slows jump playback to 1.0s and heavy attack playback to 1.2s.
- Slows punch playback to 0.9s.
- Caps combat sprite draw dimensions so wide animation frames cannot balloon and make Olly look stretched.
- Keeps each sprite's natural aspect ratio.
- Prevents Olly from walking through the Goth and appearing behind her.
- Reworks heavy/jump attack movement so Olly lunges forward toward the Goth during the attack rather than only jumping vertically.
- Gives the heavy attack a slightly more forgiving 180px hit range to match the lunge.
- Replaces the floating JUMP label with contextual status text.
- Keeps existing punch/dodge/jump/heavy mechanics and cooldowns intact.
- Does not change map rendering, inventory, Would You, or the combat background.
- No new idle sprite is introduced in this patch because no replacement idle asset was supplied; idle sizing is tightened while preserving the current asset.
