Goodbye Goth v7.0.8
Zombie combat baseline + canonical Olly asset

IMPORTANT
This patch is built from the known working Level 1 source supplied before the AI experiments. The exploration code is preserved except for the map Olly draw maintaining the new asset's aspect ratio.

Replace / merge:
- js/levels/level1.js
- assets/characters/olly.png
- assets/characters/combat/* (all files in this patch)

What this patch changes:
- Uses the supplied cropped Zombie Goth combat frames as individual PNGs.
- Keeps the Zombie chase / wind-up / claw / lunge / recovery AI.
- Lets Olly cross the Zombie during a jump or dodge so he is not permanently boxed to one side.
- Uses the Zombie's live combat X position for punch, heavy attack, and dodge calculations.
- Adds a simple in-combat Olly HP display.
- Retry after death starts at 50% HP.
- Uses the new supplied Olly image and preserves its proportions on the map.

UNCHANGED / DO NOT TOUCH
- game.js
- story.js
- css/game.css
- Level 1 map layout, objectives, gate, key, relationship challenge, Princess Question, Chain Goth logic, Heavy Attack unlock flow
- Current combat difficulty values

Note: Zombie lunge currently uses the 3 clean Zombie-only lunge poses available in the cropped reference pack. The embedded victim/Bite frames from the original sheet are intentionally not used.
