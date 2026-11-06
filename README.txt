GOODBYE GOTH V9.6 - Chain Goth balance + HUD sides

Upload to Testing5 (replace, same paths):
  js/levels/level1.js
  css/screen-polish.css

WHAT CHANGED
1. Chain Goth HP 50 -> 80 (8 punches instead of 5). Easy to tune: the two "hp: 80 / maxHp: 80" lines on the Chain Goth entry.
2. Olly's punch reach vs Chain Goth is now 280px (was 205). She stands ~250px away, so you no longer have to stand on her.
   Zombie Goth reach is unchanged.
3. HUD sides swapped during fights: Olly's HP + Inventory on the LEFT, enemy plate on the RIGHT.

TESTING CHECKLIST
[ ] Punch Chain Goth from her normal stand-off distance - it should land
[ ] Fight now takes about 8 hits (2-3 combos + the 5s cooldown), still stunning her after 3 quick hits
[ ] Olly HP + Inventory top-left, enemy plate with stun bar top-right
[ ] Zombie Goth reach feels the same as before
Tested: punch reach in a headless browser. The HP swap and difficulty feel were not played in-game.
