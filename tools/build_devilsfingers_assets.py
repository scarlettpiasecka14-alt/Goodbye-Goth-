#!/usr/bin/env python3
"""Goodbye Goth - Devil's Fingers (Level 2 miniboss) animation packer.
Mirrors build_patricia_assets.py's pack() algorithm, but each clip gets its
OWN anchor point instead of one shared ANCHOR - these are separate rendered
videos (1280x720, 24fps), each with its own camera framing/zoom, not frames
from one consistent source canvas like Patricia's clips.

Source clips (from Scarlett, chroma-keyed from green-screen video):
  disappearandreappa.mp4  (193 frames, 8.04s)  -> "Burrowing"
  thegrab.mp4              (241 frames, 10.04s) -> "Swallow and Spit" - a
      COMPLETE baked cutscene: both the creature AND Olly are animated
      together in this one clip (grab -> pull in -> implied swallow ->
      spit out -> Olly lands dazed, gets up). Play it back whole, like
      Patricia's stage2 half-health cutscene - don't try to re-composite
      Olly live from this footage.
  CreepyCrawl.mp4           (121 frames, 5.04s)  -> "Crawling" phase 1
      (rearing/bracing windup - "breaks free from its original position")
  DFcrawl.mp4               (145 frames, 6.04s)  -> "Crawling" phase 2
      (the actual ground-traversal - framed further left, mid-slide)
  MushroomFlick.mp4         (97 frames, 4.04s)   -> "Tentacle Swipe"
      (by elimination; the exact strike frame still needs pinning down
      once this is actually wired into combat)
  acidtrip.mp4              (145 frames, 6.04s)  -> "Acid Bombs: The Trip"
      (confirmed - the psychedelic projectile burst is baked into the
      footage itself, no separate VFX needed for the burst)

NOTE: the raw chroma-keyed frame folders are NOT committed to the repo
(unlike Patricia's clips) - across all 6 clips they came to ~490MB, and
Scarlett is actively trying to keep repo/Vercel storage down. Only the
packed atlases (assets/characters/devilsfingers/atlas/*.webp, ~30MB total)
and this script are kept. To rebuild an atlas from scratch: re-extract
frames from the original video with
    ffmpeg -y -i <clip>.mp4 -vsync 0 frame_%04d.png
chroma-key them (green screen, roughly RGB 95-125/160-192/80-100 depending
on the clip's own lighting - sample its own frame corners and key on
"green channel exceeds red/blue" rather than one fixed RGB triplet), place
them in assets/characters/devilsfingers/<folder>/frame_%04d.png, and run
this script.

usage: build_devilsfingers_assets.py <repo_root> [name ...]
"""
import sys, os, json, glob
from PIL import Image

MAX_W = 4096

# name: (source folder, frame step, atlas scale, fixed anchor or None to auto-detect
#        from frame 0's own alpha bbox: bottom-center = this creature's ground
#        contact point, since she's rooted in place and never walks)
CLIPS = {
    'df_disappear':    ('disappear',    3, 1.0,  None),
    'df_creepycrawl':  ('creepycrawl',  2, 1.0,  None),
    'df_dfcrawl':      ('dfcrawl',      2, 1.0,  None),
    'df_flick':        ('flick',        2, 1.0,  None),
    'df_acidtrip':     ('acidtrip',     2, 1.0,  None),
    # full-scene cutscene (both characters baked in): anchor = frame center,
    # not ground-contact - it's drawn as a fixed screen-centered clip, not
    # composited relative to anywhere on the arena floor. Coarser step +
    # smaller scale so the atlas stays under WebP's 16383px dimension limit
    # (every video frame at full res would blow well past it).
    'df_grab':         ('grab',         3, 0.55, (640, 360)),
}

def find_anchor(folder):
    files = sorted(glob.glob(os.path.join(folder, 'frame_*.png')))
    im = Image.open(files[0]).convert('RGBA')
    bb = im.getchannel('A').point(lambda v: 255 if v > 12 else 0).getbbox()
    return ((bb[0] + bb[2]) // 2, bb[3])

def pack(folder, frame_indices, scale, anchor, out_path):
    files = sorted(glob.glob(os.path.join(folder, 'frame_*.png')))
    tiles = []
    for n in frame_indices:
        im = Image.open(files[n]).convert('RGBA')
        bb = im.getchannel('A').point(lambda v: 255 if v > 12 else 0).getbbox()
        if bb is None: bb = (0, 0, 2, 2)
        bb = (max(0, bb[0]-2), max(0, bb[1]-2), min(im.width, bb[2]+2), min(im.height, bb[3]+2))
        crop = im.crop(bb)
        crop = crop.resize((max(1, round(crop.width*scale)), max(1, round(crop.height*scale))), Image.LANCZOS)
        tiles.append((bb, crop))
    x = y = rowh = 0; placed = []
    for bb, crop in tiles:
        if x + crop.width > MAX_W: x = 0; y += rowh; rowh = 0
        placed.append((x, y)); x += crop.width + 2; rowh = max(rowh, crop.height + 2)
    H = y + rowh; W = max(p[0] + t[1].width for p, t in zip(placed, tiles))
    atlas = Image.new('RGBA', (W, H), (0, 0, 0, 0)); table = []
    for (px, py), (bb, crop) in zip(placed, tiles):
        atlas.paste(crop, (px, py))
        table.append([px, py, crop.width, crop.height, bb[0]-anchor[0], bb[1]-anchor[1]])
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    atlas.save(out_path, 'WEBP', quality=92, alpha_quality=100, method=4)
    return atlas.size, table

if __name__ == '__main__':
    repo = sys.argv[1]; names = sys.argv[2:] or list(CLIPS); res = {}
    for name in names:
        folder, step, scale, fixed_anchor = CLIPS[name]
        src = os.path.join(repo, 'assets/characters/devilsfingers', folder)
        n_frames = len(glob.glob(os.path.join(src, 'frame_*.png')))
        anchor = fixed_anchor or find_anchor(src)
        idxs = list(range(0, n_frames, step))
        out = os.path.join(repo, 'assets/characters/devilsfingers/atlas', '%s.webp' % name)
        size, table = pack(src, idxs, scale, anchor, out)
        print('%-16s anchor=%-14s %3d frames atlas %dx%d (%.1f Mpx) %.0f KB' % (
            name, str(anchor), len(idxs), size[0], size[1], size[0]*size[1]/1e6, os.path.getsize(out)/1024), file=sys.stderr)
        res[name] = {'size': list(size), 'scale': scale, 'anchor': list(anchor), 'frames': table}
    print(json.dumps(res, separators=(',', ':')))
