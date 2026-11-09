GOODBYE GOTH - V9.15  (includes everything in V9.14 - Testing5 is still at V9.13, so upload THIS one and skip V9.14)

UPLOAD each file to the SAME path on GitHub (branch Testing5):
  css/screen-polish.css
  js/audio.js
  js/game.js
  js/levels/level1.js
  assets/tutorial/ring-pink.webp      NEW  (your zombie claw image)
  assets/tutorial/ring-red.webp       NEW  (your crawling bite image)
  assets/tutorial/ring-yellow.webp    NEW  (your Chain Goth image)
  assets/audio/sfx/countdown-tick.mp3, breath-recovery.mp3, chain-spin.mp3, interact.mp3, chain-impact-spin.mp3,
  chain-drop.mp3, chain-impact.mp3, fight-shout.mp3, chain-rattle.mp3, chain-drag.mp3     NEW (from V9.14)

WHAT'S NEW IN V9.15
1. RING TUTORIAL POP-UPS. The first time each ring appears in a fight, the ring is drawn, then ~0.4s later the game freezes (the whole fight clock stops, so nothing happens behind it) and a pop-up shows your image, the colour name and your wording:
   pink   - first Zombie Goth claw      "...avoided by jumping over the enemy."
   red    - first Zombie bite (or Chain Goth spin if you've not seen red yet)   "...can only be avoided by dodging."
   yellow - first Chain Goth swipe      "...can only be avoided by jumping over the enemy."
   Click GOT IT (or Enter / Space / Esc) to carry on. Each one is shown once, then remembered in the browser. To see them again, clear the site's data (or ask me to add a reset button to the cheat panel).
2. CHAIN GOTH SWIPE = YELLOW, JUMP-OVER ONLY. She aims at the side Olly is on. When the chain lands, Olly is only safe if he is BEHIND her (jumped over). Jumping on the spot, jumping backwards, or dodging all still get hit. The ring is now yellow and bigger (reach 360). The spin stays red (dodge only).
3. Combo cooldown is 5 seconds in the code and the HUD counts down from 5.0 ("3.2s" was just an example I wrote in my notes).
4. Music still cannot auto-start without a click - see my message. The hint on the title screen stays.

TEST CHECKLIST (clear site data first if you've already seen a ring)
[ ] Zombie fight: pink ring appears, then pop-up with pink image; fight is frozen until GOT IT; carry on and she attacks normally
[ ] Later in the fight: bite ring -> red pop-up. Neither shows again in the next fight
[ ] Chain fight: swipe wind-up -> yellow pop-up
[ ] Chain swipe: stand in front (jump on the spot / jump back / dodge) = hit; jump OVER her and land behind = "You jumped clean over the swipe!"
[ ] Chain spin: still red, dodge to avoid; jumping doesn't help
[ ] Pressing keys while a pop-up is open does nothing in the fight; after closing, Olly doesn't keep walking

HONEST NOTES: I tested in a headless browser that the yellow pop-up appears, the fight is frozen while open (state didn't change for 2.5s), closes with Enter, that standing in front took the 10 damage, and a jump-over test didn't take damage. I did NOT see the pink and red pop-ups run (same code, different image) and I could not measure the cooldown with a stopwatch in my test setup. Nothing was tested in Safari or by ear.
