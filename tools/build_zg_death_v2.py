#!/usr/bin/env python3
"""Zombie Goth death v2: Vidu clip (green screen, 24 fps) -> keyed frames -> assets/characters/combat/zombie-v2/death2-NNN.webp.
Usage: build_zg_death_v2.py <keyed_frames_dir>   (frames from chromakey2.py, named raw_001.png ...)
Prints the JS constants for level1.js (frame durations, knee-impact time, floor offset)."""
import sys, glob, os, numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from glow_zg_eyes import bow
SRC = sorted(glob.glob(os.path.join(sys.argv[1], 'raw_*.png')))
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'characters', 'combat', 'zombie-v2')
# (first source frame, last source frame, step, speed): stagger -> knees -> kneeling sway -> slump + collapse (faster) -> lying still
SEGS = [(3, 38, 2, 1.3), (38, 88, 2, 1.5), (88, 122, 2, 2.2), (122, 143, 3, 1.0)]
KNEE_SRC = 38
picks = []   # (source index, duration ms)
for a, b, step, speed in SEGS:
    for i in range(a, b, step): picks.append((i, round(step / 24 / speed * 1000)))
picks.append((143, 400))
imgs = [Image.open(SRC[i]).convert('RGBA') for i, _ in picks]
# union box; horizontal anchor = centre of the standing pose
alphas = [np.asarray(im)[..., 3] > 40 for im in imgs]
boxes = []
for m in alphas:
    ys, xs = np.where(m); boxes.append((xs.min(), ys.min(), xs.max(), ys.max()))
anchor = (boxes[0][0] + boxes[0][2]) / 2
x0 = min(b[0] for b in boxes); x1 = max(b[2] for b in boxes)
half = max(anchor - x0, x1 - anchor) + 4
top = min(b[1] for b in boxes) - 2; bottom = max(b[3] for b in boxes) + 2
STORE = 1.5   # frames are stored 1.5x the on-screen size (sharp on retina); drawn at scale 1/1.5
bw = bow(np.asarray(imgs[0]).astype(int)); bsz = bw[2]
S = 13.2 * STORE / bsz   # so her hair bow is ~13.2 px on screen, like her other animations
box = (int(anchor - half), int(top), int(anchor + half), int(bottom))
for f in glob.glob(os.path.join(OUT, 'death2-*.webp')): os.remove(f)
for n, im in enumerate(imgs):
    c = im.crop(box); c = c.resize((round(c.width * S), round(c.height * S)), Image.LANCZOS)
    c.save(os.path.join(OUT, f'death2-{n + 1:03d}.webp'), 'WEBP', quality=92, method=4)
stand_pad = (box[3] - boxes[0][3])   # raw px between her boots and the bottom of the image in the first frame
print('frames', len(imgs), 'size', c.size)
print('const ZOMBIE_DEATH2_MS =', [d for _, d in picks])
print('knee frame index', [k for k, (i, _) in enumerate(picks) if i >= KNEE_SRC][0])
print('floor offset (screen px) =', round(stand_pad * S / STORE, 1))
