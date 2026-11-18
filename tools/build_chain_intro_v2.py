#!/usr/bin/env python3
"""Goodbye Goth - Chain Goth 3-2-1 (intro), V9.57: the new green-screen clip (121 frames, 24 fps) packed as sheet 'intro'.
Source: keyed (green removed) 1280x720 frames f_NNN.png. Prints the frame table for CHAIN_ATLAS_DATA.intro and rewrites it in js/levels/level1.js.
usage: build_chain_intro_v2.py <keyed_dir> <repo_root>"""
import sys, os, json, re
from PIL import Image
src, repo = sys.argv[1], sys.argv[2]
ANCHOR = (771, 713)    # her floor point in the video frame (same reference as the old intro: the lowest part of her outline)
UNIT = 0.88            # video px -> source px; UNIT*SCALE = her fight size
SCALE = 0.64; MAX_W = 4096
tiles = []
for i in range(1, 122):
    im = Image.open(os.path.join(src, 'f_%03d.png' % i)).convert('RGBA')
    bb = im.getchannel('A').point(lambda v: 255 if v > 10 else 0).getbbox()
    bb = (max(0, bb[0]-2), max(0, bb[1]-2), min(im.width, bb[2]+2), min(im.height, bb[3]+2))
    crop = im.crop(bb)
    crop = crop.resize((max(1, round(crop.width*UNIT*SCALE)), max(1, round(crop.height*UNIT*SCALE))), Image.LANCZOS)
    tiles.append((bb, crop))
x = y = rowh = 0; placed = []
for bb, crop in tiles:
    if x + crop.width > MAX_W: x = 0; y += rowh; rowh = 0
    placed.append((x, y)); x += crop.width + 2; rowh = max(rowh, crop.height + 2)
H = y + rowh; W = max(p[0] + t[1].width for p, t in zip(placed, tiles))
atlas = Image.new('RGBA', (W, H), (0, 0, 0, 0)); table = []
for (px, py), (bb, crop) in zip(placed, tiles):
    atlas.paste(crop, (px, py))
    table.append([px, py, crop.width, crop.height, round((bb[0]-ANCHOR[0])*UNIT), round((bb[1]-ANCHOR[1])*UNIT)])
out = os.path.join(repo, 'assets/characters/combat/chain-goth/chain-intro.webp')
atlas.save(out, 'WEBP', quality=88, alpha_quality=100, method=4)
data = {'size': [W, H], 'scale': SCALE, 'frames': table}
js = os.path.join(repo, 'js/levels/level1.js'); s = open(js).read()
m = re.search(r'"intro":\{"size":.*?\]\]\},"walk"', s)
new = '"intro":' + json.dumps(data, separators=(',', ':')) + ',"walk"'
s = s[:m.start()] + new + s[m.end():]
open(js, 'w').write(s)
print('atlas', W, H, os.path.getsize(out)//1024, 'KB; frames', len(table))
