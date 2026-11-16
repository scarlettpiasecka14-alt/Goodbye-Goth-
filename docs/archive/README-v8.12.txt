GOODBYE GOTH v8.12

Focused Zombie Goth combat polish patch based on v8.11.

CHANGES
- Zombie Goth walk render reduced to 85% of v8.11 size.
- Zombie Goth regular and heavy attack renders reduced to 85% of v8.11 size.
- Countdown prep is now a single frozen staring pose throughout 3-2-1-FIGHT, preventing the bitty slow-motion look.
- After FIGHT, Zombie Goth returns to the approved crouched ready pose.
- Attack wind-up now displays the first pose of the actual attack instead of the ready pose.
- Heavy attack remains the supplied four-frame kick and follows the 2 regular attacks -> heavy kick -> recovery pattern.
- Normal Zombie attack damage remains 5 HP; heavy kick remains 10 HP.
- Olly faces toward the Zombie when the hurt animation triggers.
- Olly KO final frame now remains on the floor for 5 seconds before the knockout flow continues.
- Compact Olly HP display is placed beneath the enemy HP HUD, still out of 100 HP.
- Punch combo hint moved into the lower combat status bar; the floating text below the arena is removed.
- Punches are counted by successful hits. A miss no longer erases successful punches already landed.
- After 3 successful punches, Olly enters a 5-second punch cooldown. The next successful punch begins a fresh three-hit sequence.
- Attack incoming banner reduced slightly and correctly labels the heavy attack as HEAVY KICK.

FILES
- Replace js/levels/level1.js with the version in this patch.
- Add/keep the combat assets included under assets/characters/combat/.

NOTE
This is a focused patch. No unrelated game systems have been rebuilt.
