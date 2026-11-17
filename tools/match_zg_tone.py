#!/usr/bin/env python3
"""Zombie Goth: the walk / claw / bite art was a touch brighter than the 3-2-1, hurt and death art (95th-percentile brightness 172/194/180 vs ~152).
Scale their RGB so all her animations share one tone. Run ONCE on frames that came out of blacken_zg_edges.py. Usage: match_zg_tone.py <factor> <file.webp> ..."""
import sys, numpy as np
from PIL import Image
k = float(sys.argv[1])
for p in sys.argv[2:]:
    a = np.asarray(Image.open(p).convert('RGBA')).astype(np.float32)
    a[..., :3] *= k
    Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA').save(p, 'WEBP', quality=95, method=4)
print('done', len(sys.argv) - 2)
