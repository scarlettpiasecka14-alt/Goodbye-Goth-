#!/usr/bin/env python3
"""Goodbye Goth - Patricia animation packer (V9.25).
Packs chosen frames of each 1440x1440 Patricia animation into ONE trimmed WebP atlas per move
(assets/characters/patricia/atlas/pat-<name>.webp) and prints the frame table for level1.js.
usage: build_patricia_assets.py <repo_root> [name ...]"""
import sys, os, json
from PIL import Image
ANCHOR = (760, 999)     # feet position (source px) shared by all of her clips
SCALE = 0.66            # default atlas scale (the arena draws her at 0.66 x her pack factor)
R = lambda a, b, s=1: list(range(a, b, s))
# V9.39: (folder, frames, atlas scale). Frames are now (nearly) every video frame so she plays at the speed of your preview; the atlas is stored at a higher
# resolution than the arena draws it, so on a big/retina screen she is sharp. (video is 24 fps: step 1 = 41.7 ms per frame)
ANIMS = {
    'walk':      ('walk', R(32, 61), 0.9),
    'idle':      ('321fight', R(0, 61, 2), 0.9),
    'lunge':     ('SwordSwipe', R(0, 61), 0.8),
    'combo':     ('Swordcombo', R(0, 61), 0.8),
    'lightning': ('Lightningstrike', R(0, 61, 2), 0.56),
    'smoke':     ('Purplesmoke', R(0, 61, 3), 0.66),
    'hurt':      ('hurtand recover', R(0, 41), 0.9),
    'defeat':    ('Salvagable?', R(0, 61, 2), 0.8),
}
MAX_W = 4096
def pack(repo, name, folder, frames, SCALE):
    src = os.path.join(repo, 'assets/characters/patricia', folder)
    tiles = []
    for n in frames:
        im = Image.open(os.path.join(src, 'frame_%04d.png' % n)).convert('RGBA')
        bb = im.getchannel('A').point(lambda v: 255 if v > 12 else 0).getbbox()
        if bb is None: bb = (0, 0, 2, 2)
        bb = (max(0, bb[0]-2), max(0, bb[1]-2), min(im.width, bb[2]+2), min(im.height, bb[3]+2))
        crop = im.crop(bb)
        crop = crop.resize((max(1, round(crop.width*SCALE)), max(1, round(crop.height*SCALE))), Image.LANCZOS)
        tiles.append((bb, crop))
    x = y = rowh = 0; placed = []
    for bb, crop in tiles:
        if x + crop.width > MAX_W: x = 0; y += rowh; rowh = 0
        placed.append((x, y)); x += crop.width + 2; rowh = max(rowh, crop.height + 2)
    H = y + rowh; W = max(p[0] + t[1].width for p, t in zip(placed, tiles))
    atlas = Image.new('RGBA', (W, H), (0, 0, 0, 0)); table = []
    for (px, py), (bb, crop) in zip(placed, tiles):
        atlas.paste(crop, (px, py))
        table.append([px, py, crop.width, crop.height, bb[0]-ANCHOR[0], bb[1]-ANCHOR[1]])   # offsets in SOURCE px (x SCALE at draw time)
    out_dir = os.path.join(repo, 'assets/characters/patricia/atlas'); os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, 'pat-%s.webp' % name)
    atlas.save(out, 'WEBP', quality=88, alpha_quality=100, method=4)
    return out, atlas.size, table
if __name__ == '__main__':
    repo = sys.argv[1]; names = sys.argv[2:] or list(ANIMS); res = {}
    for n in names:
        folder, frames, sc = ANIMS[n]
        out, size, table = pack(repo, n, folder, frames, sc)
        print('%-9s %2d frames atlas %dx%d (%.1f Mpx) %.0f KB' % (n, len(frames), size[0], size[1], size[0]*size[1]/1e6, os.path.getsize(out)/1024), file=sys.stderr)
        res[n] = {'size': list(size), 'scale': sc, 'frames': table}
    print(json.dumps(res, separators=(',', ':')))
