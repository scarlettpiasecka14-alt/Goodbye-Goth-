GOODBYE GOTH V9.37 - Chain Goth death diagnosis, ring flashes, slam fixes, drag sparks
======================================================================================
UPLOAD to Testing5 (keep folders exactly as in the zip). All six files, they belong together:
  index.html
  js/game.js
  js/settings.js
  js/story.js
  js/levels/level1.js
  css/screen-polish.css

*** CHAIN GOTH DEATH ***
What I found: your repo ALREADY has the new death. assets/characters/combat/chain-goth/chain-death.webp on Testing5 is byte-for-byte the one I built
from ChainGothDeath3, and the code points at it. I ran the exact files from your Testing5 branch in a test browser: the Chain Goth plays the NEW death
(hit starburst, she is thrown back with her arm up, lands flat). So the old one is almost certainly being served to you from a CACHE.
Why the old one can survive: every file address carried the same version tag (?v=9310) for weeks, so a browser/Vercel edge can keep an old copy.
What V9.37 does: every version tag in the game is now ?v=9370 (index.html, game.js, settings.js, story.js, level1.js), so everything is fetched fresh.
HOW TO CHECK IT WORKED: a tiny "V9.37" now shows in the bottom-right corner of the screen. If you do NOT see it after uploading, you are still looking at an old copy
(hard refresh Cmd+Shift+R, or open the site in a private window) and nothing else I tell you will be real until that stamp shows.
If the stamp shows and the death STILL looks old, tell me exactly what you see in the first second of it (is there a yellow starburst on her?) and I will go from there.

WHAT ELSE CHANGED
1. "You've encountered a relationship challenge" now uses the same bold serif as CHALLENGE COMPLETE! (and is a bit bigger).
2. Ring flashes are now identical for EVERY attack and enemy: two flashes of about 0.2 seconds each, finishing just before the hit lands. Before, the flash length
   depended on how long each wind-up was, so some were quick and some slow.
3. Chain Goth slam (yellow): the long yellow strip in front of her used to be a constant glow that hid the ring. Now both the ring and the strip flash twice together, then disappear.
4. Standing BEHIND her when the warning slam lands now damages you (10 HP, called "CHAIN BACKSWING"). Dodging or jumping avoids it.
5. Chain Goth 3-2-1: between the two ground-spark bursts there is now a line of sparks along the floor that follows the chain as it drags across.

HONEST TESTING NOTES
Tested in automated Chrome (not Safari): no JS errors; the new death plays from the Testing5 files; ring flash timing checked numerically (two bursts at the end of the wind-up);
V9.37 stamp shows; red ring tutorial still shows a steady ring. NOT checked by eye: how the drag sparks look (they only draw during the 3-2-1 swings; tell me if they need
to be bigger/denser), the backswing damage in a real fight, and the new flash timing on the Zombie Goth.
