#!/usr/bin/env python3
"""Goodbye Goth - Zombie Goth v2 animation packer (V9.24).
Takes the 1440x1440 animator frames, bottom-aligns every frame on a shared canvas per animation,
shrinks to the exact size they are drawn at in the arena, and saves one small WebP per frame
in assets/characters/combat/zombie-v2/.   usage: build_zombie_assets.py <repo_root>"""
import sys, os, json
from PIL import Image
import numpy as np

AX = 720   # horizontal anchor on the animator canvas
# name -> (source folder, frame numbers, scale)
ANIMS = {
    'walk':  ('zgwalk2',  list(range(0, 33)), 0.47),
    'death': ('ZGdaeth2', list(range(0, 45)), 0.47),
    'intro': ('321fight', list(range(0, 61)), 0.52),
}
def build(repo, name, folder, frames, scale):
    src = os.path.join(repo, 'assets/characters/combat', folder)
    ims = []
    for n in frames:
        im = Image.open(os.path.join(src, 'frame_%04d.png' % n)).convert('RGBA')
        bb = im.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox()
        ims.append((im, bb))
    half = max(max(AX - bb[0], bb[2] - AX) for _, bb in ims) + 4
    height = max(bb[3] - bb[1] for _, bb in ims) + 4
    W = int(round(2 * half * scale)); H = int(round(height * scale))
    out_dir = os.path.join(repo, 'assets/characters/combat/zombie-v2'); os.makedirs(out_dir, exist_ok=True)
    for i, (im, bb) in enumerate(ims):
        canvas = Image.new('RGBA', (2 * half, height), (0, 0, 0, 0))
        crop = im.crop((bb[0], bb[1], bb[2], bb[3]))
        canvas.alpha_composite(crop, (bb[0] - (AX - half), height - 4 - (bb[3] - bb[1])))   # feet / lowest pixel on the canvas bottom (4px margin)
        canvas = canvas.resize((W, H), Image.LANCZOS)
        canvas.save(os.path.join(out_dir, '%s-%03d.webp' % (name, i + 1)), 'WEBP', quality=88, alpha_quality=100, method=6)
    return {'frames': len(frames), 'size': [W, H], 'margin': round(4 * scale)}
if __name__ == '__main__':
    repo = sys.argv[1]; res = {}
    for name, (folder, frames, sc) in ANIMS.items():
        res[name] = build(repo, name, folder, frames, sc); print(name, res[name], file=sys.stderr)
    print(json.dumps(res))
