GOODBYE GOTH v8.11.1 - MINIMAL POLISH PATCH

BASELINE
- Based on the user's safe v8.11 baseline.
- This is a focused patch, not a full-project replacement.

FILES
- Replace: js/levels/level1.js
- Add: assets/characters/combat/zombie-ready-crouch.png

ONLY CHANGES IN THIS PATCH
1. Would You? introduction updated to the approved wording:
   "Princesses have lots of important things to say, but sometimes they lose their train of thought along the way... and all they can manage is ‘Would you...?’

   Press WOULD YOU? in time with the princess to complete the challenge."
   The copy is centrally aligned.
2. Princess Question and Would You? artwork letterboxing uses the page's computed background colour instead of black, without editing the artwork.
3. Zombie Goth's neutral ready/recovery pose uses the supplied dedicated crouch asset; the heavy-kick first frame remains part of the heavy-kick sequence only.
4. The existing eight-frame prep animation uses the same supplied frames in a smooth ping-pong loop for the existing five-second prep window, then holds the last frame. The original image-based 3-2-1-FIGHT assets and 1.5-second countdown phases remain unchanged.

NOT CHANGED
- No map artwork or directional poses.
- No existing walk, claw, heavy-kick, hurt, or death assets are replaced.
- No combat AI or damage values are changed.
- No relationship minigame logic, timing, puzzle answers, combat layout, or HP logic is changed.

INSTALL
Unzip into the project root, allowing the file at js/levels/level1.js to be replaced and the crouch asset to be added. Do not replace the entire project with this patch.

VALIDATION
The JavaScript passes Node syntax checking. ZIP integrity verified. Live browser rendering has not been tested in this environment.
