Goodbye Goth full-screen patch — prepared from the Version-8-safe code for upload to Testing-3

Install
1. Download and unzip this patch.
2. Copy the included files into the root of the Testing-3 repository, preserving the folder paths and allowing the two encounter files to be replaced.
3. Commit the changed files and the new artwork to Testing-3. Do not upload the ZIP itself.

Included changes
- A 10-slot, backpack-style inventory grid with clear item icons and names.
- The map without the right-hand objectives, minimap, checkpoint, and save column. Olly's HP HUD and Inventory button remain on screen.
- Full-screen inventory, encounter, activity, completion, knockout, heavy-attack reward, boss, and victory screens with smaller text.
- The supplied Zombie Goth and Chain Goth encounter art.
- The supplied knockout, enemy-defeat, relationship-completion, and princess-question-completion artwork.
- The final supplied copy for both defeat screens, the relationship completion, the princess answer, and Olly's knockout screen.
- Second Goth defeated → Continue → Heavy Attack unlocked → Keep Exploring.
- Olly knockout artwork and a smaller knockout animation, retaining Try Again and Back to Map.
- Zombie Goth countdown that displays 3 → 2 → 1 → FIGHT while playing its numbered image sequence exactly once, from frame_0000.png through frame_0060.png, in five seconds.

The 61 countdown frames are already present in the safe branch at:
assets/characters/combat/zombie-prep-frames/

The patch does not include index.html or map-walk changes. It is based on Version-8-safe so the existing map walk and level encounter flow remain from that safe version.
