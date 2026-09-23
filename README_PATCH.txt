Goodbye Goth v6.5.29

Changes:
1. Cutscene 2 playback fixed to use MP4 first, with MOV fallback and a visible error/play state instead of a black flash.
2. Gate lock remains visible until gateOpened becomes true.
3. Added Heavy Attack reward screen after defeating the Chain Goth, using supplied artwork.
4. Heavy Attack unlock state is saved and loaded. Chain Goth remains allowed to use Heavy Attack during its fight; the reward screen formally unlocks/persists it for later fights.

Add the user's cutscene file here:
assets/video/cutscene2/cutscene2.mp4

Patch file to replace:
js/levels/level1.js

New asset to add:
assets/encounters/level1/heavy-attack-reward.png
