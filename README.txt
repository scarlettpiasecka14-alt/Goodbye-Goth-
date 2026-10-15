Goodbye Goth — Testing4 interaction-art patch

Baseline verified: Testing4 branch of scarlettpiasecka14-alt/Goodbye-Goth-
Latest repository commit at review: bce06aa690c6f531111e8374377c0b45e8eec3f6 (README-only update).

Install
1. Unzip this archive.
2. Copy its contents into the Testing4 branch, keeping every folder path.
3. Replace files when GitHub asks.
4. Commit the files below. Do not upload the ZIP itself.

Changed files
- js/game.js — adds only the knockout illustration and reusable completion-screen markup/event.
- js/levels/level1.js — replaces the two encounter artwork URLs and opens completion screens after the two fights, Relationship Challenge, and correct Princess Question answer.
- css/game.css — sizes the new completion and knockout artwork.
- assets/characters/combat/olly-after-knockout.png — supplied knockout artwork.
- assets/encounters/level1/zombie-goth-encounter.png — supplied Zombie Goth encounter artwork.
- assets/encounters/level1/chain-goth-encounter.png — supplied Chain Goth encounter artwork.
- assets/encounters/level1/zombie-goth-defeated.png — supplied Zombie Goth completion artwork.
- assets/encounters/level1/chain-goth-defeated.png — supplied Chain Goth completion artwork.
- assets/encounters/level1/relationship-challenge-completed.png — supplied Relationship Challenge completion artwork.
- assets/encounters/level1/princess-question-completed.png — supplied Princess Question completion artwork.

Not changed
- Level 1 entry and map logic.
- Boss/Classic Goth code.
- Combat mechanics, animation timing, countdown, inventory, save/load, and other artwork.

Expected flow
- Defeat either first Goth → that Goth's completed screen → Keep Exploring.
- Defeat the second Goth → that Goth's completed screen → Continue → existing Heavy Attack reward → Keep Exploring.
- Finish Relationship Challenge or correctly answer the Princess Question → its completed screen → Keep Exploring.
- Lose a Goth fight → knockout artwork, approved text, Try Again, and Back to Map.
