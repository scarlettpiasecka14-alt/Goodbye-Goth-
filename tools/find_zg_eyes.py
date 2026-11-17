#!/usr/bin/env python3
"""Zombie Goth: locate her eyes in every animation frame (for the in-game glow). Anchors on the pink hair bow, then looks below/left of it for the white-or-red eye blobs.
Prints/returns {set: [[x, y, r] or None per frame]} with x,y,r in the frame's own pixels."""
import numpy as np, json, sys
from PIL import Image
from scipy import ndimage as ndi
def load(f): return np.asarray(Image.open(f).convert('RGBA')).astype(int)
def bow(a):
    r,g,b,al=[a[...,i] for i in range(4)]
    m=(al>200)&(r>150)&(g<110)&(b>50)&(b<190)&(r-g>80); m=ndi.binary_closing(m,iterations=2)
    lab,n=ndi.label(m)
    if n==0: return None
    sizes=ndi.sum(m,lab,range(1,n+1)); k=int(np.argmax(sizes))+1
    cy,cx=ndi.center_of_mass(lab==k); return cx,cy,float(np.sqrt(sizes.max())),(lab==k)
def eyes(a):
    bw=bow(a)
    if bw is None: return []
    bx,by,bs,bm=bw
    S=bs/13.0*1.0   # size factor vs the 'standard' bow, so offsets scale with the frame's resolution
    r,g,b,al=[a[...,i] for i in range(4)]
    lum=.3*r+.59*g+.11*b; mx=np.maximum(np.maximum(r,g),b); mn=np.minimum(np.minimum(r,g),b); sat=(mx-mn)/(mx+1)
    white=(al>200)&(lum>205)&(sat<.16)
    red=(al>200)&(r>170)&(g<85)&(b<120)&(r-g>100)
    cand=white|(red&~ndi.binary_dilation(bm,iterations=6))
    h,w=cand.shape
    yy,xx=np.mgrid[0:h,0:w]
    reg=cand&(xx>bx-9*bs)&(xx<bx+1.5*bs)&(yy>by+1.2*bs)&(yy<by+7.5*bs)
    lab,n=ndi.label(ndi.binary_dilation(reg,iterations=2))
    out=[]
    for k in range(1,n+1):
        m=(lab==k)&reg; area=m.sum()
        if area<(0.12*bs)**2*4 or area>(2.6*bs)**2: continue
        cy,cx=ndi.center_of_mass(m); out.append((cx,cy,float(np.sqrt(area/np.pi))))
    out.sort(key=lambda e:e[1])
    return out[:3],(bx,by,bs)
