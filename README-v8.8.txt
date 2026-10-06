GOODBYE GOTH v8.8 - FINAL COMBAT / ACTIVITY FIXES

Replace:
  js/levels/level1.js
  css/game.css

The included combat Zombie assets are the exact assets already referenced by this build.

v8.8 fixes:
- Combat overlay is genuinely full-screen. The old CSS targeted .combat even though #combat only had class="overlay", so the full-screen rules never matched and the arena rendered as a small panel.
- Restores the 3-2-1-FIGHT Zombie Goth intro / prep sequence.
- Zombie prep, hurt and attack frames no longer get different widths capped and compressed. This removes the major size jumping between poses.
- Zombie attack/reaction/death art is anchored to Olly's actual combat foot line instead of sitting too high.
- Restores short hurt 1-2-3-4-3-2-1 and the longer 3-hit collapse/recovery reaction.
- A third hit during the active hurt reaction upgrades it to the longer collapse instead of being ignored.
- Punch input now has a universal 334ms minimum cadence, preventing Zombie Goth click-spam while preserving the 3-hit combo / 5s cooldown.
- Misses no longer reset the punch cadence, so the player cannot bypass the interval by clicking after a miss.
- Olly is restored to 50 HP whenever he returns from a knockout to the map.
- Chain Goth's fallback combat sprite is enlarged to better match the established fighter scale and is aligned to the combat floor.
- Heavy Attack reward title now reads: YOU'VE UNLOCKED THE HEAVY ATTACK!
- Would You removes the large title and uses a clearer explanatory paragraph so the artwork can be enlarged.
- Princess Question artwork is enlarged again on its full-screen activity layout.
- The approved Heavy Attack animation/damage/cooldown logic is preserved.

Notes:
- This remains a patch, not a complete project export. Keep the rest of the project files unchanged.
- The combat canvas remains internally 1440x810; CSS now presents it as the full-screen arena.
