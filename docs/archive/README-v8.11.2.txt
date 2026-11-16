GOODBYE GOTH v8.11.2 - TARGETED LAYOUT + ZOMBIE COMBAT PATCH

BASELINE
- Built directly on the v8.11.1 Minimal Polish Patch ZIP.
- This is still a focused patch, not a full-project replacement.

FILES
- Replace: js/levels/level1.js
- Add/replace: assets/characters/combat/zombie-ready-crouch.png

CHANGES
1. Princess Question and WOULD YOU? artwork image elements now follow their natural aspect ratio, eliminating black object-fit side bars without editing the art.
2. WOULD YOU? intro keeps the same approved wording but removes the oversized blank line between the two instructions.
3. Zombie Goth's prep animation plays through its frames once across the five-second prep window, then holds its final pose for the remaining countdown phase. It no longer ping-pongs through the animation roughly three times. Original image-based 3-2-1-FIGHT artwork and 1.5-second phases remain intact.
4. Dedicated crouched ready pose reduced from 440px to 370px. Hurt, death, walking, claw and kick artwork is not replaced.
5. Zombie approaches to a closer melee range before starting attacks. Damage ranges reduced from 205/245px to 135/165px for light/heavy attacks.
6. Post-attack recovery uses walking frames and a repositioning step instead of displaying the oversized crouch after an attack. She then returns to the ready crouch before the next wind-up. Her deterministic pattern remains two light claws followed by a heavy kick, then a longer recovery.
7. Zombie Goth's existing death animation is preserved and its final frame now remains on screen for an additional five seconds before combat ends. Olly's hurt/KO behaviour is unchanged.

NOT CHANGED
- Map art, map directional poses, existing countdown artwork, puzzle answers, combat HP/damage values, Olly punch cooldown, Olly hurt/KO art, Zombie Goth hurt/death assets, and Chain Goth behaviour are not intentionally changed.

INSTALL
Unzip into the project root, allowing js/levels/level1.js to be replaced and the crouch asset to be added/replaced. Do not replace the entire project with this patch.

VALIDATION
JavaScript syntax and ZIP integrity checked locally. Live browser rendering has not been tested here, so please test the two screens and one full Zombie Goth fight before treating the behaviour as final.
