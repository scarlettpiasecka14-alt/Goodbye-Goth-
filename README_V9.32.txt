GOODBYE GOTH - V9.32 (Patricia voice lines)
Upload to branch Testing5, same folder paths as in this ZIP. Only these files differ from what is on GitHub now (your V9.31 upload is there):
- js/levels/level1.js
- assets/audio/sfx/ : 9 new patricia-*.mp3 lines + 8 patricia-grunt-N.mp3 (cut out of your "Multiple QG attack grunts" file)

WHEN EACH LINE PLAYS (my placement - I could not find our earlier discussion of it, so tell me what to change; it is one small block of code)
- Every attack she starts (not the smoke vanish): a random attack grunt.
- You land a Heavy Attack: the FIRST one = "Who do you think you are"; later ones = "Ugh stop it" (at most every 9 s).
- You land a normal punch: sometimes (28%, max every 8 s) "Hey" or "Ugh stop it".
- You land a punch while she is under 25% HP (once): "You are going to pay for that".
- You dodge or jump her attack: "Nice try" / "Nice try cutie pie" (70% of the time, max every 6 s).
- Your punch misses (too far): "You're trying so hard" (45%, max every 14 s).
- She goes into stage 2 (half health): "This isn't funny anymore".
- Olly drops to 30% HP (once): "Too bad I'm going to have to kill you now".
Only one voice plays at a time (nothing talks over anything); grunts give way to lines. All lines are volume-matched.
I did not use the grunts that were very quiet (3 of the 11 cut pieces were breaths) .

TESTED: automated Chrome, a Patricia fight with X / R / Z presses: lines fired, no overlaps, no JS errors. NOT heard by ear.
