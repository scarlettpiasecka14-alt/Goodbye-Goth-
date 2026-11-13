GOODBYE GOTH  V9.39  (corner stamp says V9.39)
Upload to branch Testing5, keeping these exact folders (drag the folders in / replace files):

  index.html
  js/game.js, js/settings.js, js/story.js
  js/levels/level1.js
  tools/build_patricia_assets.py, tools/build_chain_assets.py
  assets/characters/combat/chain-goth/chain-death.webp      <- NEW Chain Goth death (built from your ChainGothDeathNew folder)
  assets/characters/patricia/atlas/pat-walk, idle, lunge, combo, lightning, hurt, defeat .webp  (7 files, rebuilt)

CHAIN GOTH DEATH: I found ChainGothDeathNew (61 frames) in the repo and built it in: she hangs in the air, drops to her knees, falls. Plays at real video speed (~2.5s). You can leave/delete the old ChainGothDeath folders; the game no longer reads them.

PATRICIA - answer to "are you using my images?": yes, the atlases are built from the frame folders in your repo, but before this they were shrunk to 66% and only every 2nd-3rd frame was kept, which is why she looked soft and jerky next to Olly. Now:
 - bigger atlases (walk/idle/hurt 90%, lunge/combo/defeat 80%), and nearly all frames kept (walk 29, idle 31, lunge 61, combo 61, hurt 41, defeat 31)
 - the "blend between frames" trick is removed (it caused the facial flicker)
 - idle plays forwards then backwards so it never jumps
 - she is drawn at full size again (was shrunk to 90%), Olly beside her 95%
 - dead Chain Goth no longer flashes on the floor before Patricia loads
 - every hit now makes her flinch (punch = short flinch, Heavy = long); she can't flinch out of an attack mid-strike
 - she gives up a lunge/sword combo if Olly is far away

NOT TESTED: I ran it in a desktop Chrome test copy: she loads, walks, uses lunge/combo/smoke, no errors, no dead chain. I have NOT checked every animation frame by frame, her feet alignment on the new frames, or the hurt timing by eye. That is the next step: please tell me which animation looks wrong, one at a time. Sound pass comes after.
CAUTION: the Patricia atlases are bigger now (~100 megapixels total). Please tell me if Safari stutters or reloads the page.
