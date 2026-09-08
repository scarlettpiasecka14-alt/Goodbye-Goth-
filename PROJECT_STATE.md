# Goodbye Goth v1.4

Focused fix: robust Safari/browser sizing for the 4:3 intro story panels.

- Keeps the four approved 4:3 intro artworks unchanged.
- Makes #game-root fill the available app area so percentage-height sizing cannot collapse.
- Centers the complete 4:3 panel and constrains it to both viewport width and height.
- Removes the Safari/flex sizing failure that could render the story panel as a tiny strip.
- No gameplay, combat, loading screen, or story content changes.


## v1.5
- Fixed the approved loading/title screen centering.
- The title screen now escapes the app's 1180px content-width constraint using a fixed viewport layer.
- Preserved the original 1536x1024 title artwork at its native 3:2 ratio, using viewport-aware sizing so it stays centered without distortion.
- No story, gameplay, combat, or art assets changed.


## v2.3
- Added a title-screen SKIP INTRO shortcut for testing. It bypasses the four intro panels and goes directly to the Goth Abyss cutscene, then rules, then Level 1.
- No other gameplay systems changed.


## v2.3 cutscene
The Goth Abyss cutscene is loaded from `assets/video/cutscene 720p.mov`. The file is intentionally not bundled here and should be added at that exact path before deployment.


## v2.3 display fix
The full-screen transition artwork now uses intrinsic image dimensions with max-width/max-height constraints so the complete artwork remains visible without vertical cropping on Safari and other viewport sizes.


## v2.3
Fixed the full-art intro screens to fit the complete artwork inside the viewport without bottom cropping, using a full-viewport image box with object-fit: contain.
