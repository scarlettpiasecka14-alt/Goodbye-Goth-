#!/usr/bin/env python3
"""Goodbye Goth - Chain Goth death, V9.52: one clean clip (stagger -> kneel -> hands down -> slump -> lying) packed as sheet 'death4'.
Source: keyed (green removed) 1280x720 frames f_NNN.png. Prints the frame table for CHAIN_ATLAS_DATA.death4.
usage: build_chain_death_v4.py <keyed_dir> <repo_root> [first] [last] [step]"""
import sys, os, json
from PIL import Image
src, repo = sys.argv[1], sys.argv[2]
first = int(sys.argv[3]) if len(sys.argv) > 3 else 38
last = int(sys.argv[4]) if len(sys.argv) > 4 else 140
step = int(sys.argv[5]) if len(sys.argv) > 5 else 2
ANCHOR = (1079, 672)   # her floor point in the video frame (between her boots at the start)
UNIT = 0.906           # video px -> source px; UNIT*SCALE = 0.58 screen px per video px = her fight size
SCALE = 0.64; MAX_W = 4096
idx = list(range(first, last + 1, step))
if idx[-1] != last: idx.append(last)
tiles = []
for i in idx:
    im = Image.open(os.path.join(src, 'f_%03d.png' % (i + 1))).convert('RGBA')
    bb = im.getchannel('A').point(lambda v: 255 if v > 12 else 0).getbbox()
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
atlas.save(os.path.join(repo, 'assets/characters/combat/chain-goth/chain-death4.webp'), 'WEBP', quality=88, alpha_quality=100, method=4)
print(json.dumps({'size': [W, H], 'scale': SCALE, 'frames': table, 'src': idx}, separators=(',', ':')))
