# Goodbye Goth v0.1

This is the first real project build for the anniversary game.

## What is in this version

- Illustrated intro panels using the current Goodbye Goth storyboard artwork.
- A connected Level 1 cemetery map.
- Fog-of-war style map reveal as Olly explores.
- Animated/stylised gameplay characters.
- Encounter scene before fights.
- Combat with enemy attacks, telegraphs, dodge timing, health and attack cooldown.
- A working Level 1 puzzle.
- A Level 1 boss entry point.
- Modular files so future levels can be added without rebuilding the whole game.

## Important project rule

Do not replace the project with a new single-file prototype.

Future changes should be made inside this project structure and saved as new versions.

## Run locally

The game uses JavaScript modules, so opening `index.html` directly from Finder may be blocked by some browsers.

The easiest beginner-friendly option is to upload the folder to GitHub and connect it to Netlify.

For local testing, a simple local web server can also be used.

## Current visual source

`assets/story/storyboard-reference.png` is the current visual target.
The cropped panels in `assets/story/` are taken from that storyboard.

## Planned next versions

v0.2
- Improve Olly and Scarlett character likeness.
- Add proper idle/walk/attack animation frames.
- Make enemy AI more varied.
- Finish the Level 1 boss as a distinct multi-phase fight.

v0.3
- Add Level 2 infrastructure.
- Add reusable puzzle templates.
- Add different goth archetypes.

v0.4+
- Levels 2-12.
- 12 bosses.
- Final Luna reveal.
- Scarlett rescue.
- Wedding ending.
- Tiny goth end-screen jumpscare.

## Game direction

The game should become harder by adding:
- more goths
- more puzzles
- harder enemy patterns
- larger/branching maps
- more complex puzzle chains

Do not rely on merely giving enemies larger health bars.
