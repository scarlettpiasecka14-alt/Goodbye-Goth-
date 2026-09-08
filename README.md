# Goodbye Goth v1.4

## This version
This is a focused browser-sizing fix for the approved 4:3 intro artwork.

The story panels remain the same artwork. The change is only to make the story root and panel size robustly across Safari/browser viewport states, preventing the panel from collapsing into a narrow strip.

## Upload
Unzip and upload the contents of this folder to the repository root.


### v1.5
Loading/title screen centering fix only.


## v2.10 Level 1 visual foundation
The existing Level 1 layout is retained, while the cemetery rendering has been upgraded with more recognisable graves, mausoleums, church architecture, angel statues, trees, lantern glows, fences, stone paths, petals and atmospheric fog. Olly now uses a friendlier caricature-inspired look with curly hair, Weeknd shirt, olive cargos and red shoes, with no bow at Level 1 start.


## v2.10 update
- Replaced the zombie enemy art with more detailed, clearly readable Zombie Goth sprites.
- Fire Goth remains unmistakably undead while adding flame effects.
- Enlarged the world-map enemy sprites slightly.
- Moved the Level 1 relationship challenge marker farther from the first Zombie Goth (from near 8,6 to 12,8).


## v2.10 Cloudflare configuration
Added root `wrangler.jsonc` so Cloudflare Workers Builds can deploy both production and non-production branches using the repository as static assets.
