GOODBYE GOTH V9.23 - map collision rebuilt, closer camera, map music timing
(includes everything from V9.21 and V9.22, so upload THIS one only)

Upload to branch Testing5. Every path must start with index.html, css/, js/ or assets/ (no wrapper folder):
  index.html
  css/screen-polish.css
  js/game.js, js/settings.js, js/story.js
  js/levels/level1.js
  assets/audio/sfx/patricia-unfair-fight.mp3, patricia-check-backpack.mp3
  assets/items/potion-vial.webp
  assets/combat/OllyDrink/ (51 files)
About 62 files, so one commit is fine.

1. MAP MUSIC
The map music now starts as soon as the intro cutscene ends and the "Welcome to the Goth Abyss" screen appears.

2. NEW WALKABLE / UNWALKABLE MAP
- The old 96x64 hand-drawn grid is gone. The walkable area is now picked out of the actual map picture by colour:
  the pink-purple cobblestone path is walkable; gardens, trees, graves, benches, statues, buildings, fences, the pond and the gate are not.
- It is stored as a finer 384x256 grid (4x4 pixel cells), so edges follow the art much more closely.
- Olly's feet AND a point 8px to each side must be on the path, so he can't overlap hedges or walk over bushes.
- Two small connecting bits I added by hand: the nook by the left lantern, and the strip in front of the crypt steps.
- Everything walkable is one connected area (I checked by computer that you can reach every part from the start).
- Olly's start spot moved a few pixels onto the path (it used to be on the edge).
- If an OLD save has Olly standing on a spot that is now blocked, he is moved to the nearest path when you load.
- The "use key" spot in front of the gate now matches the path in front of the gate.
- TO SEE THE WALKABLE AREA: put ?walk=1 on the end of the game's web address (e.g. https://yourgame.vercel.app/?walk=1).
  Green = he can walk there, red = blocked. Tell me any spot that is wrong and I'll fix the grid.

3. CLOSER CAMERA
Map zoom went from 1.42 to 1.7, so less of the map is visible and Olly, the Goths and the scenery look larger.
(One number, MAP_ZOOM near the top of js/levels/level1.js, if you want it closer or further.)

Checked: JS syntax check passes. In a headless browser I loaded saves, confirmed that a save on a bush snaps onto the path,
that Olly stops at garden edges when walking, that the green debug overlay matches the picture, and that the key USE at the gate
still works, with no errors. I have NOT played the whole level by hand in Safari.

Things I noticed and did NOT change
- Clicking enemies, the riddle, the relationship challenge, the key and the gate lock works from anywhere (you don't have to
  walk up to them). The relationship challenge icon sits in the pond garden (blocked) and the Zombie Goth stands at a garden edge.
  They still work, but tell me if you want them moved onto the path.
- A few tiny dark corners of path (e.g. behind the angel top-left) are not walkable. Use ?walk=1 to spot more.

Testing checklist (Safari, hard refresh Cmd+Shift+R)
[ ] Skip/finish the intro cutscene: map music starts when "Welcome to the Goth Abyss" appears.
[ ] Walk around the whole level. Can't walk over bushes/graves/trees; can walk the whole cobblestone path.
[ ] Open the game with ?walk=1 and compare green vs the picture.
[ ] Walk to the front of the gate; key > USE works there.
[ ] Load an older save: Olly lands on a path.
[ ] Zoom feels right (tell me if you want it closer/further).
