GOODBYE GOTH V9.5 - Chain Goth full-size intro + new fight HUD

Upload each file to Testing5, same path (replace the existing file):
  js/game.js
  js/levels/level1.js
  css/screen-polish.css
  assets/characters/combat/chain-goth/chain-intro.webp
  tools/build_chain_assets.py   (optional, just my packer script)

WHAT CHANGED
1. Chain Goth is now full fighting size for the whole 3-2-1 (no more growing into it).
2. The 3 yellow dots are gone. Replaced by a STUN meter under her HP bar: it fills with each hit
   (3 hits, heavy counts double), fades if you stop hitting her, then turns gold and drains
   while she is stunned. The "ENEMY STUNNED!" label above her head stays.
3. Enemy HP is now a small God-of-War style plate in the top-left (name, HP bar, stun bar)
   instead of the full-width bar. Zombie Goth gets the same plate without a stun meter.
4. Olly's HP bar + Inventory button now sit top-right during fights.

TESTING CHECKLIST
[ ] Chain Goth fight: she is the same size on 3, 2, 1 and when the fight starts
[ ] Her chain tip may touch the very top edge on a couple of intro frames - tell me if it bothers you
[ ] Hit her once: stun bar partly fills, then drains away after ~4s if you stop
[ ] Hit her 3 times quickly: bar fills, goes gold, label says STUNNED!, drains over ~2s
[ ] Zombie Goth fight: small plate top-left, no stun bar, Olly HP + Inventory top-right
[ ] Inventory button is clickable during a fight
Note: tested in a headless browser (HUD, intro, meter filling/decay). The full gold stun-drain
state and the Zombie fight were not played through.
