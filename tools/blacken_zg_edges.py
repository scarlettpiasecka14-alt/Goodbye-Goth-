#!/usr/bin/env python3
"""Zombie Goth: paint a thin black 'pen line' over the green-tinted fringe around her hair/body.
For every pixel within EDGE px of transparency: remove any green cast (green capped at max(red, blue)); if the pixel is dark/mid, darken it to near-black.
Bright pixels (skin, nails, the bow, the skull) are left alone. Usage: blacken_zg_edges.py <file.webp> [...]"""
import sys, numpy as np
from PIL import Image, ImageFilter
EDGE = 5   # filter size: ~2px band
def fix(path):
    im = Image.open(path).convert('RGBA'); a = np.asarray(im).astype(np.float32)
    er = np.asarray(im.getchannel('A').filter(ImageFilter.MinFilter(EDGE))).astype(np.float32)
    band = (a[..., 3] > 0) & (er < 250)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    g2 = np.where(band, np.minimum(g, np.maximum(r, b)), g)
    luma = .3 * r + .59 * g2 + .11 * b
    dark = band & (luma < 125)
    k = np.where(dark, .45, 1.0)
    out = np.dstack([r * k, g2 * k, b * k, a[..., 3]]).clip(0, 255).astype(np.uint8)
    Image.fromarray(out, 'RGBA').save(path, 'WEBP', quality=95, method=4)
if __name__ == '__main__':
    for p in sys.argv[1:]: fix(p)
    print('done', len(sys.argv) - 1)
