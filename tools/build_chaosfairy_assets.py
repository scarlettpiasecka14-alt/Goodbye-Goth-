#!/usr/bin/env python3
"""Goodbye Goth - Chaos Fairy Goth (Level 2 boss) animation packer.

Packs the raw 1440x1440 chroma-keyed frame folders Scarlett uploaded to
assets/characters/chaosfairy/ into small WebP atlases (same [x,y,w,h,offX,offY] table
format as the Devil's Fingers atlases). Only the atlases are meant to ship.

Each clip's frames are NORMALISED so the standing figure is the same size in every clip
(Arrowshotattempt1 was rendered ~0.6x smaller than the rest): offsets are stored in
normalised source pixels and every clip reports scale = PACK_SCALE (0.5 of that space).
Anchor = centre of her boots on frame 0, so every clip's standing feet line up.

CLIPS: name: (source folder, first frame, last frame, step, keep_main_only)
  keep_main_only drops the loose bow/quiver props that float beside her in Arrowshotattempt1.

usage: build_chaosfairy_assets.py <repo_root> <fairydust_frames_dir>
  (Raw frame folders were removed from the repo to save space - restore them from the original
  animation drive, in assets/characters/chaosfairy/<ClipFolder>/frame_####.png, before re-running.)
  (Fairydust is NOT in the repo - pass the folder that holds its frame_####.png files.)
"""
import sys, os, json, glob
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

MAX_W = 4096
PACK_SCALE = 0.5
REF_FIG_H = 616          # standing figure height in FGarrowattempt2 / Flutter / electricarrow / Fairydust
ALPHA_T = 12

CLIPS = {
    'cfg_idle':     ('Flutter',           0, 60, 2, False),   # front-on hover/bob loop
    'cfg_shot':     ('FGarrowattempt2',   0, 58, 2, False),   # side-on crouch + full draw (basic shot windup)
    'cfg_heavy':    ('Arrowshotattempt1', 0, 30, 2, True),    # raise + glowing hand (heavy windup); frames 31+ have the broken stretched arrow
    'cfg_electric': ('electricarrow',     0, 60, 2, False),   # front-on draw to nocked arrow (telegraphed special)
    'cfg_dust':     ('@fairydust',        0, 60, 2, False),   # twirl in a pool of fairy dust (blink / storm)
}

def main_mask(im, keep_main_only):
    a = np.array(im)[..., 3] > ALPHA_T
    if not keep_main_only:
        return a
    lab, n = ndi.label(ndi.binary_dilation(a, iterations=25))
    if n <= 1:
        return a
    sizes = ndi.sum(a, lab, range(1, n + 1))
    return a & (lab == int(np.argmax(sizes)) + 1)

def fig_box(im, keep_main_only):
    m = main_mask(im, keep_main_only)
    ys, xs = np.where(m)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1

def pack(files, norm, anchor, keep_main_only):
    tiles = []
    for f in files:
        im = Image.open(f).convert('RGBA')
        if keep_main_only:
            arr = np.array(im)
            m = main_mask(im, True)
            arr[~m, 3] = 0
            im = Image.fromarray(arr)
        bb = im.getchannel('A').point(lambda v: 255 if v > ALPHA_T else 0).getbbox() or (0, 0, 2, 2)
        bb = (max(0, bb[0] - 2), max(0, bb[1] - 2), min(im.width, bb[2] + 2), min(im.height, bb[3] + 2))
        crop = im.crop(bb)
        s = PACK_SCALE * norm
        crop = crop.resize((max(1, round(crop.width * s)), max(1, round(crop.height * s))), Image.LANCZOS)
        tiles.append((bb, crop))
    x = y = rowh = 0; placed = []
    for bb, crop in tiles:
        if x + crop.width > MAX_W: x = 0; y += rowh; rowh = 0
        placed.append((x, y)); x += crop.width + 2; rowh = max(rowh, crop.height + 2)
    H = y + rowh; W = max(p[0] + t[1].width for p, t in zip(placed, tiles))
    atlas = Image.new('RGBA', (W, H), (0, 0, 0, 0)); table = []
    for (px, py), (bb, crop) in zip(placed, tiles):
        atlas.paste(crop, (px, py))
        # offsets in NORMALISED source pixels (source px * norm), relative to the anchor
        table.append([px, py, crop.width, crop.height,
                      round((bb[0] * norm) - anchor[0], 2), round((bb[1] * norm) - anchor[1], 2)])
    return atlas, table

if __name__ == '__main__':
    repo, fd_dir = sys.argv[1], sys.argv[2]
    base = os.path.join(repo, 'assets/characters/chaosfairy')
    out_dir = os.path.join(base, 'atlas'); os.makedirs(out_dir, exist_ok=True)
    res = {}
    for name, (folder, a, b, step, keep) in CLIPS.items():
        src = fd_dir if folder == '@fairydust' else os.path.join(base, folder)
        files = sorted(glob.glob(os.path.join(src, 'frame_*.png')))
        sel = [files[i] for i in range(a, min(b, len(files) - 1) + 1, step)]
        f0 = Image.open(files[0]).convert('RGBA')
        x0, y0, x1, y1 = fig_box(f0, keep)
        norm = REF_FIG_H / float(y1 - y0) if keep else 1.0   # only Arrowshotattempt1 is rendered at a different size
        m0 = main_mask(f0, keep)
        ys_, xs_ = np.where(m0[max(0, y1 - 45):y1, :])         # feet band: boots only, so every clip lines up on her feet
        feet_x = float(xs_.mean()) if len(xs_) else (x0 + x1) / 2.0
        anchor = (feet_x * norm, y1 * norm)
        atlas, table = pack(sel, norm, anchor, keep)
        out = os.path.join(out_dir, name + '.webp')
        atlas.save(out, 'WEBP', quality=88, alpha_quality=100, method=4)
        print('%-13s frames=%2d norm=%.3f anchor=(%.0f,%.0f) atlas %dx%d %.0f KB' % (
            name, len(sel), norm, anchor[0], anchor[1], atlas.width, atlas.height, os.path.getsize(out) / 1024), file=sys.stderr)
        res[name] = {'size': list(atlas.size), 'scale': PACK_SCALE, 'anchor': [round(anchor[0]), round(anchor[1])],
                     'src_frames': [a, min(b, len(files) - 1), step], 'frames': table}
    with open(os.path.join(base, 'atlas_data.json'), 'w') as fh:
        json.dump(res, fh, separators=(',', ':'))
