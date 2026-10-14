Goodbye Goth patch — prepared from the Version-8-safe code for upload to Testing-3

Install
1. Download and unzip this patch.
2. Copy the included files into the root of the Testing-3 repository, preserving the folder paths and allowing the two encounter files to be replaced.
3. Commit the changed files and the new artwork to Testing-3.

Included changes
- A 10-slot, backpack-style inventory grid with clear item icons and names.
- The supplied Zombie Goth and Chain Goth encounter art.
- First-person enemy defeat screens, relationship challenge completion, and princess question completion screens.
- Second Goth defeated → Continue → Heavy Attack unlocked → Keep Exploring.
- Olly knockout artwork and a smaller knockout animation, retaining Try Again and Back to Map.
- Zombie Goth countdown animation that plays its numbered image sequence once from frame_0000.png through frame_0060.png.

The 61 countdown frames are already present in the safe branch at:
assets/characters/combat/zombie-prep-frames/

The patch does not include index.html or map-walk changes. It is based on Version-8-safe so the existing map walk and level encounter flow remain from that safe version.
