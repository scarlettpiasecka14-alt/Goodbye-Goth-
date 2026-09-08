const MAP=[
  "#########################",
  "#########################",
  "##..............#########",
  "##..............#########",
  "##..............#########",
  "##..............#########",
  "#####...#####...#####...#",
  "#####...................#",
  "#####...................#",
  "##......................#",
  "##......................#",
  "##...................####",
  "##...................####",
  "#########################",
  "#########################"
];
const TILE=40,COLS=25,ROWS=15,isFloor=(x,y)=>x>=0&&y>=0&&x<COLS&&y<ROWS&&MAP[y][x]==='.';
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

function rgba(c,a){return c.replace(')',`,${a})`).replace('rgb','rgba')}

function drawCemetery(ctx,w,h){
  // More illustrative, hand-drawn cemetery. The underlying walkable map stays the same.
  const sky=ctx.createLinearGradient(0,0,0,h);
  sky.addColorStop(0,'#1a1430');sky.addColorStop(.48,'#211733');sky.addColorStop(1,'#0b0910');
  ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);

  // Soft moon glow.
  const glow=ctx.createRadialGradient(w*.79,h*.16,8,w*.79,h*.16,125);
  glow.addColorStop(0,'rgba(255,196,225,.28)');glow.addColorStop(1,'rgba(255,196,225,0)');
  ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#f2cadf';ctx.beginPath();ctx.arc(w*.79,h*.16,50,0,Math.PI*2);ctx.fill();

  // Distant church spires / crypt skyline.
  ctx.fillStyle='#0d0a15';
  for(let i=0;i<17;i++){
    const bx=i*64-18, bw=28+(i%3)*10, bh=72+(i%4)*26, base=h*.39;
    ctx.fillRect(bx,base-bh,bw,bh);
    ctx.beginPath();ctx.moveTo(bx-7,base-bh);ctx.lineTo(bx+bw/2,base-bh-28-(i%2)*10);ctx.lineTo(bx+bw+7,base-bh);ctx.closePath();ctx.fill();
    if(i%4===1){ctx.fillStyle='#6e365b';ctx.fillRect(bx+bw*.42,base-bh+18,5,16);ctx.fillStyle='#0d0a15';}
  }

  // Mossy grass base with subtle texture.
  ctx.fillStyle='#11101a';ctx.fillRect(0,h*.37,w,h*.63);
  for(let i=0;i<90;i++){
    const gx=(i*83)%w, gy=h*.40+(i*47)%(h*.53);
    ctx.strokeStyle=i%2?'#25202e':'#302736';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(gx,gy+5);ctx.lineTo(gx+2,gy-2);ctx.moveTo(gx+3,gy+5);ctx.lineTo(gx+6,gy);ctx.stroke();
  }

  // Main stone paths with individual cobbles and soft edge shadows.
  function pathRect(x,y,pw,ph,horiz){
    ctx.fillStyle='#302a36';ctx.fillRect(x+4,y+4,pw,ph);
    ctx.fillStyle='#554858';ctx.fillRect(x,y,pw,ph);
    ctx.strokeStyle='rgba(12,9,16,.65)';ctx.lineWidth=3;ctx.strokeRect(x,y,pw,ph);
    ctx.strokeStyle='#746174';ctx.lineWidth=1.2;
    if(horiz){for(let yy=y+12;yy<y+ph;yy+=15){ctx.beginPath();ctx.moveTo(x+3,yy);ctx.lineTo(x+pw-3,yy);ctx.stroke()}}
    else{for(let xx=x+12;xx<x+pw;xx+=15){ctx.beginPath();ctx.moveTo(xx,y+3);ctx.lineTo(xx,y+ph-3);ctx.stroke()}}
  }
  pathRect(w*.18,h*.32,w*.65,h*.13,true);
  pathRect(w*.44,h*.08,w*.15,h*.83,false);
  pathRect(w*.07,h*.70,w*.74,h*.16,true);
  // Connecting side paths matching the existing route.
  pathRect(w*.09,h*.48,w*.19,h*.08,true);
  pathRect(w*.74,h*.50,w*.17,h*.08,true);

  // Trees with visible trunks and branching silhouettes.
  function tree(x,y,scale=1){
    ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
    ctx.fillStyle='#21151b';ctx.fillRect(-8,10,16,62);
    ctx.strokeStyle='#140d12';ctx.lineWidth=8;ctx.lineCap='round';
    [[0,28,-28,4],[1,20,30,-2],[-2,4,-8,-34],[3,1,18,-31]].forEach(([x1,y1,x2,y2])=>{ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()});
    ctx.fillStyle='#0c1015';
    [[-28,-2,34],[8,-15,38],[-8,16,35],[30,8,30]].forEach(([cx,cy,r])=>{ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill()});
    ctx.fillStyle='rgba(86,35,73,.55)';ctx.beginPath();ctx.arc(10,-4,29,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  tree(70,85,1.35);tree(360,92,1.05);tree(825,74,1.30);tree(955,340,1.1);tree(260,395,.95);tree(690,412,1.0);

  // Graves, with stone depth, carved crosses and inscriptions.
  function grave(x,y,s=1,style=0){
    ctx.save();ctx.translate(x,y);ctx.scale(s,s);
    const stone=style%2?'#797080':'#6c6673';
    ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(-17,22,34,7);
    ctx.fillStyle='#39343f';ctx.fillRect(-18,4,36,27);
    ctx.fillStyle=stone;ctx.beginPath();ctx.roundRect(-16,-6,32,30,8);ctx.fill();
    ctx.fillStyle='#8f8895';ctx.fillRect(-10,-3,20,3);
    ctx.strokeStyle='#b1a8b3';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,1);ctx.lineTo(0,13);ctx.moveTo(-6,7);ctx.lineTo(6,7);ctx.stroke();
    ctx.fillStyle='#3e3742';ctx.font='5px Georgia';ctx.textAlign='center';ctx.fillText('♥',0,20);
    if(style===2){ctx.fillStyle='#8d496c';ctx.beginPath();ctx.arc(-10,5,3,0,Math.PI*2);ctx.fill()}
    ctx.restore();
  }
  const graves=[[42,170,1,0],[92,255,.9,1],[135,360,1.15,0],[210,214,.85,2],[272,170,1.0,0],[315,368,1.1,1],[390,245,.85,0],[465,165,.95,2],[535,310,.95,0],[600,190,1.05,1],[655,385,.9,0],[745,275,1.15,2],[815,178,.95,0],[895,370,1.05,1],[946,250,.9,0]];
  graves.forEach(g=>grave(...g));

  // Mausoleum / crypt buildings, with columns and doors.
  function mausoleum(x,y,wid=88,hei=62){
    ctx.save();ctx.translate(x,y);
    ctx.fillStyle='#27222b';ctx.fillRect(-4,5,wid+8,hei+8);
    ctx.fillStyle='#6a616d';ctx.fillRect(0,0,wid,hei);
    ctx.fillStyle='#7d7280';ctx.beginPath();ctx.moveTo(-7,0);ctx.lineTo(wid/2,-27);ctx.lineTo(wid+7,0);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#8e8290';ctx.lineWidth=2;ctx.strokeRect(0,0,wid,hei);
    ctx.fillStyle='#352e3a';ctx.fillRect(wid*.33,hei*.35,wid*.34,hei*.65);
    ctx.fillStyle='#c8789c';ctx.fillRect(wid*.46,hei*.45,4,14);
    ctx.fillStyle='#3d3541';ctx.fillRect(7,10,5,hei-18);ctx.fillRect(wid-12,10,5,hei-18);
    ctx.fillStyle='#9e8d9d';ctx.font='10px Georgia';ctx.textAlign='center';ctx.fillText('REST',wid/2,19);ctx.fillText('IN PEACE',wid/2,31);
    ctx.restore();
  }
  mausoleum(75,104,94,64);mausoleum(344,286,92,66);mausoleum(720,108,92,66);mausoleum(820,330,90,66);

  // Church / spooky house at the upper-left, clearly recognisable.
  ctx.fillStyle='#554c58';ctx.fillRect(91,74,157,98);
  ctx.fillStyle='#2c2430';ctx.beginPath();ctx.moveTo(78,74);ctx.lineTo(169,20);ctx.lineTo(260,74);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#1c151e';ctx.lineWidth=5;ctx.stroke();
  // tower
  ctx.fillStyle='#5f5363';ctx.fillRect(194,38,38,92);ctx.beginPath();ctx.moveTo(187,38);ctx.lineTo(213,9);ctx.lineTo(239,38);ctx.closePath();ctx.fill();
  ctx.fillStyle='#17121a';ctx.fillRect(104,105,23,22);ctx.fillRect(198,105,23,22);ctx.fillRect(152,108,30,64);
  ctx.fillStyle='#f29ac1';ctx.fillRect(161,120,12,21);ctx.fillStyle='#8d5f7d';ctx.fillRect(209,54,8,14);
  ctx.strokeStyle='#17121a';ctx.lineWidth=2;ctx.strokeRect(91,74,157,98);
  // tiny cross
  ctx.strokeStyle='#8f7c8d';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(213,14);ctx.lineTo(213,31);ctx.moveTo(207,22);ctx.lineTo(219,22);ctx.stroke();

  // Angel statues on carved bases.
  function angel(x,y,scale=1){
    ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
    ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(-18,36,36,7);
    ctx.fillStyle='#8b8490';ctx.fillRect(-15,22,30,14);
    ctx.fillStyle='#9c94a0';ctx.beginPath();ctx.arc(0,5,11,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#756e79';ctx.beginPath();ctx.moveTo(-9,13);ctx.lineTo(0,31);ctx.lineTo(9,13);ctx.closePath();ctx.fill();
    ctx.fillStyle='#a59ca8';ctx.beginPath();ctx.ellipse(-16,15,12,6,-.45,0,Math.PI*2);ctx.ellipse(16,15,12,6,.45,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#5a5360';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-16,15);ctx.lineTo(-8,21);ctx.moveTo(16,15);ctx.lineTo(8,21);ctx.stroke();
    ctx.restore();
  }
  angel(205,330,.95);angel(750,342,.92);angel(905,164,.8);

  // Lanterns with real glows.
  function lantern(x,y,scale=1){
    ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
    const lg=ctx.createRadialGradient(0,0,2,0,0,38);lg.addColorStop(0,'rgba(255,210,151,.34)');lg.addColorStop(1,'rgba(255,210,151,0)');ctx.fillStyle=lg;ctx.fillRect(-40,-40,80,80);
    ctx.strokeStyle='#292129';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,-25);ctx.lineTo(0,15);ctx.stroke();
    ctx.fillStyle='#2a2027';ctx.fillRect(-10,-11,20,25);ctx.strokeStyle='#76606d';ctx.lineWidth=1.5;ctx.strokeRect(-10,-11,20,25);
    ctx.fillStyle='#ffd9a4';ctx.beginPath();ctx.arc(0,-1,6,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#221a20';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-7,-16);ctx.lineTo(0,-24);ctx.lineTo(7,-16);ctx.stroke();
    ctx.restore();
  }
  [[48,300,1],[250,255,.9],[305,510,1],[535,205,.9],[640,500,1],[855,245,.95],[940,480,1]].forEach(a=>lantern(...a));

  // Iron fences with more recognisable posts and spearheads.
  function fence(x1,y1,x2,y2){
    ctx.strokeStyle='#16131b';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    const len=Math.hypot(x2-x1,y2-y1),steps=Math.max(1,Math.floor(len/22));
    for(let i=0;i<=steps;i++){
      const u=i/steps,px=x1+(x2-x1)*u,py=y1+(y2-y1)*u;
      ctx.strokeStyle='#100d14';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(px,py+16);ctx.lineTo(px,py-15);ctx.stroke();
      ctx.fillStyle='#d071a0';ctx.beginPath();ctx.moveTo(px,py-21);ctx.lineTo(px-3,py-15);ctx.lineTo(px+3,py-15);ctx.closePath();ctx.fill();
    }
  }
  fence(25,h*.63,w*.27,h*.63);fence(w*.60,h*.19,w*.92,h*.19);fence(w*.21,h*.92,w*.55,h*.92);

  // Petals and small flowers.
  ctx.fillStyle='#d95e91';for(let i=0;i<28;i++){const px=(i*127)%w,py=80+(i*67)%(h-100);ctx.beginPath();ctx.ellipse(px,py,5,2,((i%5)-2)*.2,0,Math.PI*2);ctx.fill();}
  for(let i=0;i<12;i++){const fx=(i*157)%w,fy=h*.48+(i*41)%(h*.45);ctx.fillStyle='#ae3d73';ctx.beginPath();ctx.arc(fx,fy,3,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#2f4731';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(fx,fy+4);ctx.lineTo(fx,fy+10);ctx.stroke();}

  // Boss gate, now clearly a physical iron arch with a blocked opening.
  const gx=20*TILE+4, gy=8*TILE+2;
  ctx.fillStyle='#2b2630';ctx.fillRect(gx-9,gy+4,10,75);ctx.fillRect(gx+78,gy+4,10,75);
  ctx.strokeStyle='#19151d';ctx.lineWidth=7;ctx.beginPath();ctx.arc(gx+40,gy+40,45,Math.PI,0);ctx.stroke();
  for(let i=0;i<7;i++){const px=gx+10+i*11;ctx.fillRect(px,gy+9,5,55);ctx.fillStyle='#b65c8d';ctx.beginPath();ctx.moveTo(px+2.5,gy+2);ctx.lineTo(px-1,gy+10);ctx.lineTo(px+6,gy+10);ctx.closePath();ctx.fill();ctx.fillStyle='#19151d';}
  ctx.fillStyle='#0e0b12';ctx.fillRect(gx+12,gy+17,56,47);

  // Light fog pools to make the reveal feel atmospheric rather than just black tiles.
  const fog=ctx.createLinearGradient(0,h*.45,0,h);fog.addColorStop(0,'rgba(255,214,234,.01)');fog.addColorStop(.72,'rgba(172,133,170,.07)');fog.addColorStop(1,'rgba(96,71,101,.12)');ctx.fillStyle=fog;ctx.fillRect(0,0,w,h);
}

function drawOlly(ctx,x,y,s=.7,t=0,front=true,dir='down',moving=false){
  // Olly, simplified from the provided caricature/walking reference.
  // Neutral friendly face, curly dark hair, Weeknd shirt, olive cargos and red shoes.
  ctx.save();
  const phase=moving ? Math.sin(t*11) : 0;
  const bob=moving ? Math.abs(Math.sin(t*11))*1.25 : Math.sin(t*2)*0.45;
  ctx.translate(x,y-bob);
  const side=dir==='left'||dir==='right';
  const flip=dir==='left'?-1:1;
  ctx.scale(flip,1);

  // shadow
  ctx.fillStyle='rgba(0,0,0,.36)';ctx.beginPath();ctx.ellipse(0,39*s,24*s,6.5*s,0,0,Math.PI*2);ctx.fill();

  // legs and trousers
  const stride=moving?phase*6:0;
  ctx.strokeStyle='#17131a';ctx.lineWidth=7*s;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-7*s,13*s);ctx.lineTo((-9+stride)*s,31*s);ctx.moveTo(7*s,13*s);ctx.lineTo((9-stride)*s,31*s);ctx.stroke();
  ctx.strokeStyle='#394335';ctx.lineWidth=10*s;
  ctx.beginPath();ctx.moveTo(-7*s,11*s);ctx.lineTo((-9+stride)*s,29*s);ctx.moveTo(7*s,11*s);ctx.lineTo((9-stride)*s,29*s);ctx.stroke();

  // red sneakers, visible and consistent with the reference.
  ctx.fillStyle='#a64b58';ctx.strokeStyle='#4b1d26';ctx.lineWidth=1.4*s;
  ctx.beginPath();ctx.roundRect((-15+stride)*s,27*s,14*s,8*s,3*s);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.roundRect((1-stride)*s,27*s,14*s,8*s,3*s);ctx.fill();ctx.stroke();
  ctx.strokeStyle='#f2ced4';ctx.lineWidth=1.3*s;ctx.beginPath();ctx.moveTo((-12+stride)*s,31*s);ctx.lineTo((-3+stride)*s,31*s);ctx.moveTo((4-stride)*s,31*s);ctx.lineTo((13-stride)*s,31*s);ctx.stroke();

  // torso / Weeknd shirt
  ctx.fillStyle='#16161a';ctx.strokeStyle='#0a090d';ctx.lineWidth=1.6*s;
  ctx.beginPath();ctx.roundRect(-19*s,-19*s,38*s,34*s,7*s);ctx.fill();ctx.stroke();
  ctx.fillStyle='#9b827e';ctx.font=`bold ${6.2*s}px Arial`;ctx.textAlign='center';ctx.fillText('The Weeknd',0,-4*s);
  ctx.fillStyle='#514346';ctx.fillRect(-9*s,0,18*s,9*s);
  ctx.fillStyle='#bba7a1';ctx.fillRect(-6*s,2*s,12*s,1.6*s);ctx.fillRect(-4*s,5.2*s,8*s,1.5*s);

  // arms
  const arm= moving ? phase*4 : 0;
  ctx.strokeStyle='#c98974';ctx.lineWidth=5.2*s;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-16*s,-10*s);ctx.lineTo((-22+arm)*s,6*s);ctx.moveTo(16*s,-10*s);ctx.lineTo((22-arm)*s,6*s);ctx.stroke();
  ctx.fillStyle='#c98974';ctx.beginPath();ctx.arc((-22+arm)*s,7*s,3.5*s,0,Math.PI*2);ctx.arc((22-arm)*s,7*s,3.5*s,0,Math.PI*2);ctx.fill();

  // neck and face
  ctx.fillStyle='#c98f7a';ctx.fillRect(-5*s,-24*s,10*s,7*s);
  ctx.fillStyle='#d49a84';ctx.strokeStyle='#3a2025';ctx.lineWidth=1.5*s;
  ctx.beginPath();ctx.roundRect(-14*s,-42*s,28*s,25*s,9*s);ctx.fill();ctx.stroke();

  // curls: larger, messier, closer to the provided caricature.
  ctx.fillStyle='#25171a';ctx.strokeStyle='#110b0f';ctx.lineWidth=1.6*s;
  const curls=[[-11,-43,9],[-3,-48,10],[6,-48,10],[14,-42,9],[-14,-36,7],[14,-35,7],[-4,-39,7],[7,-40,7]];
  curls.forEach(([cx,cy,rr])=>{ctx.beginPath();ctx.arc(cx*s,cy*s,rr*s,0,Math.PI*2);ctx.fill();});
  ctx.fillStyle='#4b2c2b';[[-8,-46],[-1,-51],[7,-48],[13,-41],[-11,-37],[2,-42]].forEach(([cx,cy])=>{ctx.beginPath();ctx.arc(cx*s,cy*s,2.6*s,0,Math.PI*2);ctx.fill()});

  // friendly eyes and brows, no open mouth.
  ctx.strokeStyle='#5a332f';ctx.lineWidth=1.6*s;ctx.beginPath();ctx.moveTo(-9*s,-31*s);ctx.lineTo(-3*s,-32*s);ctx.moveTo(3*s,-32*s);ctx.lineTo(9*s,-31*s);ctx.stroke();
  ctx.fillStyle='#282027';ctx.beginPath();ctx.arc(-6*s,-28*s,2*s,0,Math.PI*2);ctx.arc(6*s,-28*s,2*s,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#9b675a';ctx.lineWidth=1.1*s;ctx.beginPath();ctx.moveTo(-2.8*s,-22*s);ctx.quadraticCurveTo(0,-21*s,2.8*s,-22*s);ctx.stroke();
  // subtle stubble
  ctx.fillStyle='rgba(86,57,54,.38)';for(let i=0;i<8;i++){const sx=(-8+(i%4)*5)*s,sy=(-19+Math.floor(i/4)*2.3)*s;ctx.beginPath();ctx.arc(sx,sy,0.8*s,0,Math.PI*2);ctx.fill();}

  // no bow at Level 1 start. It is earned as the boss reward.
  ctx.restore();
}

const zombieSprites={shambler:new Image(),fire:new Image()};
zombieSprites.shambler.src='assets/zombies/zombie-shambler.svg';
zombieSprites.fire.src='assets/zombies/fire-goth.svg';
function drawZombieSprite(ctx,x,y,type,s=.75,t=0,attack=false){
  const img=zombieSprites[type]||zombieSprites.shambler;
  ctx.save();
  ctx.translate(x,y+Math.sin(t*7)*2);
  ctx.fillStyle='rgba(0,0,0,.34)';ctx.beginPath();ctx.ellipse(0,38*s,27*s,7*s,0,0,Math.PI*2);ctx.fill();
  if(img.complete && img.naturalWidth){
    const w=108*s,h=157*s;
    ctx.globalAlpha=attack?.98:1;
    ctx.drawImage(img,-w/2,-125*s,w,h);
  }else{
    // Keep the old procedural drawing until the sprite asset has loaded.
    ctx.fillStyle='#2a222c';ctx.beginPath();ctx.roundRect(-20*s,-75*s,40*s,112*s,14*s);ctx.fill();
    ctx.fillStyle='#c3a3ae';ctx.beginPath();ctx.arc(0,-84*s,18*s,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#f0a2b9';ctx.beginPath();ctx.arc(-7*s,-86*s,3*s,0,Math.PI*2);ctx.arc(7*s,-86*s,3*s,0,Math.PI*2);ctx.fill();
  }
  if(attack){ctx.strokeStyle='#ef91ac';ctx.lineWidth=3*s;ctx.beginPath();ctx.arc(0,-4*s,38*s,0,Math.PI*2);ctx.stroke()}
  ctx.restore();
}

function drawZombie(ctx,x,y,type,s=.75,t=0,attack=false){
  ctx.save();ctx.translate(x,y+Math.sin(t*7)*2);ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(0,44*s,26*s,7*s,0,0,Math.PI*2);ctx.fill();
  if(type==='shambler'){
    ctx.fillStyle='#0d0a10';ctx.beginPath();ctx.ellipse(0,-29*s,22*s,31*s,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#aa8b96';ctx.beginPath();ctx.arc(0,-28*s,13*s,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2a222c';ctx.beginPath();ctx.moveTo(-17*s,-12*s);ctx.lineTo(-27*s,41*s);ctx.lineTo(27*s,41*s);ctx.lineTo(17*s,-12*s);ctx.closePath();ctx.fill();ctx.fillStyle='#e7a2b8';ctx.fillRect(-10*s,-30*s,6*s,3*s);ctx.fillRect(4*s,-30*s,6*s,3*s);
  }else if(type==='chain'){
    ctx.fillStyle='#08070d';ctx.beginPath();ctx.ellipse(0,-28*s,24*s,35*s,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c7a8b2';ctx.beginPath();ctx.arc(0,-29*s,12*s,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3a2c3c';ctx.fillRect(-15*s,-13*s,30*s,46*s);ctx.strokeStyle='#b8a0b4';ctx.lineWidth=3*s;ctx.beginPath();ctx.moveTo(16*s,-2*s);ctx.lineTo(42*s,10*s);ctx.stroke();
  }
  if(attack){ctx.strokeStyle='#ef91ac';ctx.lineWidth=3*s;ctx.beginPath();ctx.arc(0,-5*s,36*s,0,Math.PI*2);ctx.stroke()}
  ctx.restore();
}

function drawBoss(ctx,x,y,s=1,t=0,attack=false,phase=1){
  ctx.save();ctx.translate(x,y+Math.sin(t*4)*1.5);ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(0,52*s,36*s,8*s,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#08070c';ctx.beginPath();ctx.ellipse(0,-42*s,32*s,46*s,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e0c0b7';ctx.beginPath();ctx.arc(0,-38*s,16*s,0,Math.PI*2);ctx.fill();ctx.fillStyle='#18101a';ctx.beginPath();ctx.moveTo(-22*s,-16*s);ctx.lineTo(-36*s,53*s);ctx.lineTo(36*s,53*s);ctx.lineTo(22*s,-16*s);ctx.closePath();ctx.fill();ctx.fillStyle='#bfa1b8';ctx.font=`${11*s}px Georgia`;ctx.textAlign='center';ctx.fillText('☾',0,3*s);
  if(attack){ctx.strokeStyle=phase===3?'#f6c7d8':'#ef91ac';ctx.lineWidth=4*s;ctx.beginPath();ctx.arc(0,-5*s,48*s,0,Math.PI*2);ctx.stroke()}
  ctx.restore();
}

export function createLevel1(ui){
  const ctx=ui.canvas.getContext('2d'),mctx=ui.miniMap.getContext('2d'),ectx=ui.encounterCanvas.getContext('2d'),cctx=ui.combatCanvas.getContext('2d'),rctx=ui.relationshipCanvas.getContext('2d');
  const revealed=Array.from({length:ROWS},()=>Array(COLS).fill(false));
  const enemies=[
    {x:8,y:6,type:'shambler',name:'GRAVEYARD SHAMBLER',hp:4,maxHp:4,dead:false,pattern:'Slow lunge'},
    {x:17,y:5,type:'fire',name:'FIRE GOTH',hp:5,maxHp:5,dead:false,pattern:'Throws fireballs'}
  ];
  const relationship={x:12,y:8},puzzle={x:17,y:10},boss={x:20,y:8};
  let x=3,y=11,hp=5,mode='map',walkDir='down',walkPulse=0,kills=0,relationshipDone=false,puzzleSolved=false,target=null,isBoss=false,combatHp=0,combatMax=1,enemyAttackPhase=null,enemyTimer=null,combatRaf=0,projectiles=[],player={x:135,y:260,invuln:0,aimX:500,aimY:180},combatCheckpoint=null,bossRoomEntered=false,relationshipStep=0,relationshipRound=0,relationshipStart=0,relationshipDuration=2600,relationshipAnimating=false,relationshipRAF=0;
  let now=0,raf=0;

  function reveal(){for(let yy=0;yy<ROWS;yy++)for(let xx=0;xx<COLS;xx++)if(Math.hypot(xx-x,yy-y)<=3.7)revealed[yy][xx]=true}
  function unlockedBoss(){return kills>=2&&relationshipDone&&puzzleSolved}
  function stats(){ui.hpEl.textContent=hp;ui.gothEl.textContent=`${kills}/2`;ui.relEl.textContent=relationshipDone?'Done':'Locked';ui.puzzleEl.textContent=puzzleSolved?'Solved':'Locked';ui.goalGoths.innerHTML=kills>=2?'<span class="good">✓ Defeat the required Zombie Goths</span>':`○ Defeat the required Zombie Goths (${kills}/2)`;ui.goalRel.innerHTML=relationshipDone?'<span class="good">✓ Relationship Challenge complete</span>':'○ Complete the Relationship Challenge';ui.goalPuzzle.innerHTML=puzzleSolved?'<span class="good">✓ Puzzle solved</span>':'○ Solve the Puzzle';ui.goalBoss.innerHTML=unlockedBoss()?'<span class="good">✓ Boss gate unlocked</span>':'<span class="locked">🔒 Boss gate locked</span>'}
  function drawMini(){mctx.clearRect(0,0,250,180);mctx.fillStyle='#0d0b11';mctx.fillRect(0,0,250,180);for(let yy=0;yy<ROWS;yy++)for(let xx=0;xx<COLS;xx++){if(revealed[yy][xx]){mctx.fillStyle=isFloor(xx,yy)?'#57505b':'#17131b';mctx.fillRect(xx*10,yy*10,10,10)}else{mctx.fillStyle='#0c0a0e';mctx.fillRect(xx*10,yy*10,10,10)}}mctx.fillStyle='#f3eff0';mctx.beginPath();mctx.arc(x*10+5,y*10+5,3.5,0,Math.PI*2);mctx.fill();if(!relationshipDone&&revealed[relationship.y][relationship.x]){mctx.fillStyle='#ef91ac';mctx.fillRect(relationship.x*10+2,relationship.y*10+2,6,6)}if(!puzzleSolved&&revealed[puzzle.y][puzzle.x]){mctx.fillStyle='#e5c5d5';mctx.fillRect(puzzle.x*10+2,puzzle.y*10+2,6,6)}if(unlockedBoss()&&revealed[boss.y][boss.x]){mctx.fillStyle='#f0cf8b';mctx.fillRect(boss.x*10+2,boss.y*10+2,6,6)}}
  function drawWorld(t){
    drawCemetery(ctx,1000,600);
    // Fog-of-war: only explored tiles are visible.
    for(let yy=0;yy<ROWS;yy++)for(let xx=0;xx<COLS;xx++){
      if(!revealed[yy][xx]){ctx.fillStyle='rgba(3,2,7,.94)';ctx.fillRect(xx*TILE,yy*TILE,TILE,TILE)}
      else if(!isFloor(xx,yy)){ctx.fillStyle='rgba(2,2,6,.35)';ctx.fillRect(xx*TILE,yy*TILE,TILE,TILE)}
    }
    // Route markers, kept subtle so exploration remains primary.
    enemies.forEach(e=>{if(!e.dead&&revealed[e.y][e.x])drawZombieSprite(ctx,e.x*TILE+20,e.y*TILE+38,e.type,.68,t/1000)});
    if(!relationshipDone&&revealed[relationship.y][relationship.x]){ctx.fillStyle='#ef91ac';ctx.font='28px Georgia';ctx.textAlign='center';ctx.fillText('♥',relationship.x*TILE+20,relationship.y*TILE+29)}
    if(!puzzleSolved&&revealed[puzzle.y][puzzle.x]){ctx.fillStyle='#e6c5d3';ctx.font='26px Georgia';ctx.textAlign='center';ctx.fillText('✣',puzzle.x*TILE+20,puzzle.y*TILE+29)}
    if(revealed[boss.y][boss.x]){
      ctx.fillStyle=unlockedBoss()?'#f0cf8b':'#8c7584';ctx.font='24px Georgia';ctx.textAlign='center';ctx.fillText(unlockedBoss()?'✦':'🔒',boss.x*TILE+20,boss.y*TILE+29);
      if(unlockedBoss()){ctx.fillStyle='#ef91ac';ctx.font='bold 14px system-ui';ctx.fillText('GATE OPEN',boss.x*TILE+20,boss.y*TILE+56)}
    }
    if(bossRoomEntered){
      ctx.fillStyle='rgba(8,5,15,.55)';ctx.fillRect(21*TILE,6*TILE,3*TILE,5*TILE);
      ctx.strokeStyle='#8d617f';ctx.lineWidth=3;ctx.strokeRect(21*TILE+8,6*TILE+8,3*TILE-16,5*TILE-16);
      ctx.fillStyle='#f0d5e3';ctx.font='bold 15px Georgia';ctx.textAlign='center';ctx.fillText('CLASSIC GOTH',22*TILE+20,8*TILE+28);
    }
    drawOlly(ctx,x*TILE+20,y*TILE+35,.70,t/1000,true,walkDir,walkPulse>0)
  }

  function drawEncounter(type){ectx.clearRect(0,0,720,300);const gg=ectx.createLinearGradient(0,0,0,300);gg.addColorStop(0,'#2e2436');gg.addColorStop(1,'#111016');ectx.fillStyle=gg;ectx.fillRect(0,0,720,300);for(let i=0;i<15;i++){ectx.fillStyle='#4d3b51';ectx.fillRect((i*61)%720,150+(i%4)*18,28,42)}drawOlly(ectx,180,245,.95,0,true);drawZombieSprite(ectx,520,235,type,.95,1.2,false);ectx.fillStyle='#f3e7ed';ectx.font='bold 18px Georgia';ectx.textAlign='center';ectx.fillText(type==='shambler'?'Mmm... black eyeliner...':'Mmm... accessories...',500,45)}

  function resetCombatVisual(){projectiles=[];enemyAttackPhase=null;player={x:145,y:300,invuln:0,aimX:650,aimY:170};}
  function drawCombat(t){
    const w=900,h=450;
    const g=cctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#241a2c');g.addColorStop(.55,'#17121c');g.addColorStop(1,'#0c090f');cctx.fillStyle=g;cctx.fillRect(0,0,w,h);
    // Ground and cemetery details so the arena is visibly a fight, not a blank panel.
    cctx.fillStyle='#211a25';cctx.fillRect(0,h-105,w,105);
    cctx.fillStyle='#4a3b4e';for(let i=0;i<9;i++){const gx=40+i*105;cctx.fillRect(gx,h-165,5,60);cctx.fillRect(gx-12,h-165,29,5);}
    cctx.fillStyle='#5d4a60';for(let i=0;i<14;i++){const gx=(i*71)%860+20,gy=70+(i%4)*45;cctx.fillRect(gx,gy,4,4);}
    cctx.fillStyle='#d9c9d4';cctx.font='bold 14px system-ui';cctx.textAlign='left';cctx.fillText('CLICK / FIRE ARROW',24,30);cctx.font='12px system-ui';cctx.fillStyle='#a99aaa';cctx.fillText('Red warning = DODGE',24,49);
    // Aim reticle
    if(player.aimX&&player.aimY){cctx.strokeStyle='rgba(245,218,231,.65)';cctx.lineWidth=2;cctx.beginPath();cctx.arc(player.aimX,player.aimY,13,0,Math.PI*2);cctx.moveTo(player.aimX-19,player.aimY);cctx.lineTo(player.aimX-7,player.aimY);cctx.moveTo(player.aimX+7,player.aimY);cctx.lineTo(player.aimX+19,player.aimY);cctx.moveTo(player.aimX,player.aimY-19);cctx.lineTo(player.aimX,player.aimY-7);cctx.moveTo(player.aimX,player.aimY+7);cctx.lineTo(player.aimX,player.aimY+19);cctx.stroke();}
    // Attack telegraphs
    if(enemyAttackPhase){cctx.strokeStyle='#f05d79';cctx.lineWidth=6;cctx.setLineDash([12,8]);if(enemyAttackPhase.kind==='lunge'){cctx.beginPath();cctx.moveTo(enemyAttackPhase.x,enemyAttackPhase.y);cctx.lineTo(player.x,player.y);cctx.stroke();cctx.fillStyle='rgba(240,93,121,.18)';cctx.beginPath();cctx.moveTo(enemyAttackPhase.x,enemyAttackPhase.y);cctx.lineTo(player.x+46,player.y+46);cctx.lineTo(player.x-46,player.y-46);cctx.closePath();cctx.fill()}else{cctx.beginPath();cctx.arc(player.x,player.y,enemyAttackPhase.radius,0,Math.PI*2);cctx.stroke();cctx.fillStyle='rgba(240,93,121,.12)';cctx.beginPath();cctx.arc(player.x,player.y,enemyAttackPhase.radius,0,Math.PI*2);cctx.fill()}cctx.setLineDash([]);cctx.fillStyle='#ffd7e3';cctx.font='900 22px system-ui';cctx.textAlign='center';cctx.fillText('DODGE!',player.x,player.y-62);}
    projectiles.forEach(p=>{cctx.fillStyle='#f7dbe6';cctx.beginPath();cctx.arc(p.x,p.y,5,0,Math.PI*2);cctx.fill();cctx.strokeStyle='#fff2f7';cctx.lineWidth=2;cctx.beginPath();cctx.moveTo(p.x,p.y);cctx.lineTo(p.x-p.vx*2,p.y-p.vy*2);cctx.stroke();});
    drawOllyWorldCombat(player.x,player.y,1.0,player.aimX,player.aimY,performance.now()/1000,player.invuln>performance.now());
    if(isBoss)drawBoss(cctx,690,250,1.25,performance.now()/1000,!!enemyAttackPhase,enemyPhaseNumber());else drawZombieSprite(cctx,690,255,target?.type||'shambler',1.0,performance.now()/1000,!!enemyAttackPhase);
    // Enemy label / hit target
    cctx.fillStyle='#f3e7ed';cctx.font='900 18px Georgia';cctx.textAlign='center';cctx.fillText(isBoss?'QUEEN GOTH':(target?.name||'ZOMBIE GOTH'),690,355);
    cctx.fillStyle='#332635';cctx.fillRect(620,370,140,10);cctx.fillStyle='#ef91ac';cctx.fillRect(620,370,140*(combatHp/combatMax),10);
  }
  function drawOllyWorldCombat(c,px,py,s,ax,ay,t,hurt){c.save();c.translate(px,py);if(hurt)c.globalAlpha=.5; c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(0,54*s,32*s,8*s,0,0,Math.PI*2);c.fill();c.fillStyle='#35271f';c.beginPath();c.ellipse(0,-50*s,25*s,25*s,0,0,Math.PI*2);c.fill();c.fillStyle='#d9b59e';c.beginPath();c.arc(0,-46*s,14*s,0,Math.PI*2);c.fill();c.fillStyle='#dbe0e7';c.fillRect(-20*s,-30*s,40*s,34*s);c.fillStyle='#273029';c.fillRect(-16*s,4*s,32*s,22*s);c.strokeStyle='#111';c.lineWidth=4*s;c.beginPath();c.moveTo(-10*s,26*s);c.lineTo(-12*s,47*s);c.moveTo(10*s,26*s);c.lineTo(12*s,47*s);c.stroke();const ang=Math.atan2(ay-py,ax-px);c.save();c.rotate(ang);c.strokeStyle='#b58d68';c.lineWidth=4*s;c.beginPath();c.moveTo(15*s,-2*s);c.lineTo(46*s,-2*s);c.stroke();c.strokeStyle='#6b4731';c.lineWidth=2*s;c.beginPath();c.arc(15*s,-2*s,25*s,-1.2,1.2);c.stroke();c.restore();c.restore()}
  function drawZombieCombat(c,px,py,type,attack){c.save();c.translate(px,py);if(type==='shambler'){c.fillStyle='#0d0a10';c.beginPath();c.ellipse(0,-48,35,48,0,0,Math.PI*2);c.fill();c.fillStyle='#aa8b96';c.beginPath();c.arc(0,-40,17,0,Math.PI*2);c.fill();c.fillStyle='#2a222c';c.beginPath();c.moveTo(-23,-18);c.lineTo(-35,62);c.lineTo(35,62);c.lineTo(23,-18);c.closePath();c.fill()}else{c.fillStyle='#09080e';c.beginPath();c.ellipse(0,-44,37,51,0,0,Math.PI*2);c.fill();c.fillStyle='#c6a5b0';c.beginPath();c.arc(0,-40,17,0,Math.PI*2);c.fill();c.fillStyle='#3a2c3c';c.fillRect(-24,-22,48,68);c.strokeStyle='#b89fb0';c.lineWidth=5;c.beginPath();c.moveTo(26,-3);c.lineTo(70,18);c.stroke()}if(attack){c.strokeStyle='#ef91ac';c.lineWidth=6;c.beginPath();c.arc(0,-8,65,0,Math.PI*2);c.stroke()}c.restore()}
  function enemyPhaseNumber(){if(!isBoss)return 1;const r=combatHp/combatMax;return r<=.34?3:r<=.67?2:1}

  function startCombat(bossFight){
    isBoss=bossFight;mode='combat';combatMax=bossFight?18:(target?.maxHp||4);combatHp=combatMax;resetCombatVisual();
    ui.combatName.textContent=bossFight?'THE CLASSIC GOTH • QUEEN':target?.name||'ZOMBIE GOTH';
    ui.combatPattern.textContent=bossFight?'Phase 1 • DODGE red warnings':(target?.pattern||'Watch red warnings • DODGE');
    ui.enemyHp.style.width='100%';
    ui.combatStatus.innerHTML=bossFight?'<strong>HOW TO FIGHT:</strong> Watch for attack warnings, dodge them, and strike the Queen Goth.':'<strong>HOW TO FIGHT:</strong> Attack the Zombie Goth and dodge when she warns you. Your next combat pass will add the full jump/roll system.';
    ui.combat.classList.remove('hidden');
    clearInterval(enemyTimer);enemyTimer=setInterval(enemyAttackTick,bossFight?900:1250);
    clearInterval(combatRaf);const loop=()=>{if(mode==='combat'){drawCombat(performance.now());combatRaf=requestAnimationFrame(loop)}};combatRaf=requestAnimationFrame(loop);
  }
  function enemyAttackTick(){if(mode!=='combat')return;const now=performance.now();const faster=isBoss&&enemyPhaseNumber()===3;const kind=(target?.type==='fire'||isBoss&&enemyPhaseNumber()===2)?'ring':'lunge';enemyAttackPhase={kind,x:isBoss?690:670,y:isBoss?250:255,radius:100};ui.combatStatus.textContent=kind==='lunge'?'⚠ She is about to charge. DODGE!':'🔥 Incoming fireball wave. DODGE!';setTimeout(()=>{if(mode!=='combat')return;const hit=performance.now()>player.invuln;if(hit){hp=Math.max(0,hp-1);stats();ui.combatStatus.textContent='💥 You were hit. Your health is now '+hp+'.';if(hp<=0){endCombat(false);return}}else ui.combatStatus.textContent='↪ Dodged! Fire back now.';enemyAttackPhase=null},faster?420:620)}

  function shootAt(xm,ym){if(mode!=='combat')return;const dx=xm-player.x,dy=ym-player.y,len=Math.hypot(dx,dy)||1;const vx=dx/len*12,vy=dy/len*12;projectiles.push({kind:'arrow',x:player.x+vx,y:player.y+vy,vx,vy,ttl:90});player.aimX=xm;player.aimY=ym;ui.combatStatus.textContent='🏹 Arrow fired.';}
  function updateProjectiles(){for(let i=projectiles.length-1;i>=0;i--){const p=projectiles[i];p.x+=p.vx;p.y+=p.vy;p.ttl--;if(p.kind==='arrow'&&Math.hypot(p.x-(isBoss?690:690),p.y-255)<48){combatHp=Math.max(0,combatHp-1);ui.enemyHp.style.width=(combatHp/combatMax*100)+'%';ui.combatStatus.textContent='🎯 Hit!';projectiles.splice(i,1);if(combatHp<=0){setTimeout(()=>endCombat(true),180)}}else if(p.ttl<=0||p.x<0||p.x>900||p.y<0||p.y>450)projectiles.splice(i,1)} }

  function combatTick(){if(mode==='combat'){updateProjectiles();if(player.invuln>performance.now()){};requestAnimationFrame(combatTick)}}
  window.addEventListener('pointermove',e=>{if(mode!=='combat')return;const r=ui.combatCanvas.getBoundingClientRect();player.aimX=(e.clientX-r.left)*(ui.combatCanvas.width/r.width);player.aimY=(e.clientY-r.top)*(ui.combatCanvas.height/r.height)});
  ui.combatCanvas.addEventListener('pointerdown',e=>{if(mode!=='combat')return;shootAtPointer(e)});
  window.addEventListener('keydown',e=>{if(mode!=='combat')return;const k=e.key.toLowerCase();if(['arrowleft','arrowright','arrowup','arrowdown',' ','shift'].includes(k))e.preventDefault();if(k===' '){combatAttack()}else if(k==='shift'){combatDodge()}else if(k==='arrowleft'||k==='arrowright'||k==='arrowup'||k==='arrowdown'){move(k.replace('arrow',''))}});
  function combatAttack(){if(mode==='combat')shootAt(player.aimX,player.aimY)}
  function shootAtPointer(e){const r=ui.combatCanvas.getBoundingClientRect();shootAt((e.clientX-r.left)*(ui.combatCanvas.width/r.width),(e.clientY-r.top)*(ui.combatCanvas.height/r.height))}
  function combatDodge(){if(mode!=='combat')return;player.invuln=performance.now()+650;const dx=player.x<450?1:-1;player.x=Math.max(55,Math.min(845,player.x+dx*120));ui.combatStatus.textContent='↪ DODGE ROLL!';}

  function endCombat(won){clearInterval(enemyTimer);cancelAnimationFrame(combatRaf);ui.combat.classList.add('hidden');mode='map';if(won){if(isBoss){ui.win.classList.remove('hidden');return}if(target){target.dead=true;kills++;target=null;ui.dialogue.textContent=kills===1?'✅ First Zombie Goth defeated. The cemetery path opens.':'✅ Both Zombie Goths defeated. Complete the two special events.'}}else{ui.deathText.textContent='The goth got you. Olly wakes at the last checkpoint, bruised but ready for another shot.';ui.death.classList.remove('hidden');mode='dead'}stats()}
  function retryCombat(){ui.death.classList.add('hidden');hp=5;stats();if(combatCheckpoint){x=combatCheckpoint.x;y=combatCheckpoint.y;reveal()}mode='map';if(target||isBoss){setTimeout(()=>startCombat(isBoss),100)}}
  function backToMap(){ui.death.classList.add('hidden');hp=5;stats();if(combatCheckpoint){x=combatCheckpoint.x;y=combatCheckpoint.y;reveal()}mode='map';ui.dialogue.textContent='You retreat to the checkpoint. The goths are still waiting.'}

  function checkTriggers(){if(mode!=='map')return;let e=enemies.find(z=>!z.dead&&dist({x,y},{x:z.x,y:z.y})<1.01);if(e){target=e;combatCheckpoint={x,y};mode='encounter';drawEncounter(e.type);ui.encounterName.textContent=e.name;ui.encounterText.innerHTML=e.type==='shambler'?'<strong>Zombie Goth:</strong> “Mmm... black eyeliner...”<br><br>She shuffles closer. Then faster.':'<strong>Fire Goth:</strong> “ill burn you like the sun burns me...”<br><br>Flames gather in her hands.';ui.encounter.classList.remove('hidden');return}
    if(!relationshipDone&&dist({x,y},relationship)<1.01){startRelationship();return}
    if(kills>=2&&!puzzleSolved&&dist({x,y},puzzle)<1.01){mode='puzzle';ui.puzzle.classList.remove('hidden');ui.puzzleFeedback.textContent='';return}
    if(unlockedBoss()&&dist({x,y},boss)<1.01){mode='bossintro';ui.bossIntro.classList.remove('hidden');return}}

  function move(dir){
    if(mode==='combat'){
      const step=18;
      if(dir==='left') player.x=Math.max(55,player.x-step);
      if(dir==='right') player.x=Math.min(845,player.x+step);
      if(dir==='up') player.y=Math.max(90,player.y-step);
      if(dir==='down') player.y=Math.min(400,player.y+step);
      return;
    }
    if(mode!=='map')return;
    const dx=dir==='left'?-1:dir==='right'?1:0,dy=dir==='up'?-1:dir==='down'?1:0,nx=x+dx,ny=y+dy;
    if(!isFloor(nx,ny))return;

    // The locked boss gate cannot be crossed until all Level 1 objectives are complete.
    if(nx===20&&ny===8&&!unlockedBoss()){
      ui.dialogue.textContent='🔒 The iron gate is sealed. Defeat both Zombie Goths, survive WOULD YOU?, and solve the question first.';
      return;
    }
    // Crossing into the chamber creates the Level 1.5 threshold.
    if(nx>=21&&x===20&&y===8&&unlockedBoss()){
      x=nx;y=ny;walkDir=dir;walkPulse=1;bossRoomEntered=true;mode='bossready';
      ui.bossReady.classList.remove('hidden');
      return;
    }

    x=nx;y=ny;walkDir=dir;walkPulse=1;setTimeout(()=>{walkPulse=0},180);
    reveal();ui.dialogue.textContent='The cemetery reveals more of the path...';drawMini();checkTriggers();
  }
  function interact(){checkTriggers()}
  function startEncounterFight(){ui.encounter.classList.add('hidden');startCombat(false)}
  function drawRelationshipArt(){
    rctx.clearRect(0,0,720,250);
    const grad=rctx.createLinearGradient(0,0,720,250);grad.addColorStop(0,'#211821');grad.addColorStop(1,'#0f0b12');rctx.fillStyle=grad;rctx.fillRect(0,0,720,250);
    // Simple cartoon versions for this interaction only. The final character assets come later.
    drawOlly(rctx,210,205,.95,relationshipRound*.4,true);
    rctx.fillStyle='#e9a8bf';rctx.beginPath();rctx.ellipse(520,170,32,70,0,0,Math.PI*2);rctx.fill();
    rctx.fillStyle='#2d2028';rctx.beginPath();rctx.ellipse(520,128,35,36,0,0,Math.PI*2);rctx.fill();
    rctx.fillStyle='#d7a898';rctx.beginPath();rctx.arc(520,132,22,0,Math.PI*2);rctx.fill();
    rctx.strokeStyle='#b88ca4';rctx.lineWidth=3;rctx.beginPath();rctx.arc(520,134,24,0,Math.PI*2);rctx.stroke();
}
function startRelationship(){
    mode='relationship';relationshipRound=0;relationshipStep=0;relationshipDuration=3000;relationshipStart=performance.now();
    ui.relationship.classList.remove('hidden');
    ui.wouldFeedback.textContent='Wait for the ramble to reach the words “WOULD YOU?” Then press the button.';
    ui.wouldDisplay.textContent='“Can I ask you a question...”';
    drawRelationshipArt();animateRelationship();
}
function animateRelationship(){
    cancelAnimationFrame(relationshipRAF);
    const tick=t=>{
      if(mode!=='relationship')return;
      const elapsed=t-relationshipStart;
      const pct=Math.min(1,elapsed/relationshipDuration);
      const zoneStart=Math.min(.84 + relationshipRound*.025,.9);
      const zoneWidth=Math.max(.07, .105-relationshipRound*.012);
      ui.timingCursor.style.left=`${pct*100}%`;
      ui.timingZone.style.left=`${zoneStart*100}%`;
      ui.timingZone.style.width=`${zoneWidth*100}%`;
      let line='“Can I ask you a question...”';
      if(pct>=.22&&pct<.43) line='“Have you ever...”';
      else if(pct>=.43&&pct<.63) line='“Do you like...”';
      else if(pct>=.63&&pct<zoneStart) line='“What was I going to say?”';
      else if(pct>=zoneStart) line='“WOULD YOU?”';
      ui.wouldDisplay.textContent=line;
      if(pct>=1){
        relationshipStart=performance.now();
        ui.wouldFeedback.textContent='Missed it. She rambles again. Listen for the sudden “WOULD YOU?”';
      }
      relationshipRAF=requestAnimationFrame(tick);
    };
    relationshipRAF=requestAnimationFrame(tick);
}
function completeRelationship(){
    if(mode!=='relationship')return;
    const elapsed=performance.now()-relationshipStart;
    const pct=elapsed/relationshipDuration;
    const zoneStart=Math.min(.84 + relationshipRound*.025,.9);
    const zoneEnd=zoneStart+Math.max(.07,.105-relationshipRound*.012);
    if(pct>=zoneStart&&pct<=zoneEnd){
      relationshipStep++;
      if(relationshipStep>=3){
        relationshipDone=true;mode='map';cancelAnimationFrame(relationshipRAF);ui.relationship.classList.add('hidden');
        ui.dialogue.textContent='💕 Relationship Challenge complete. You survived the full ramble and pressed WOULD YOU? at exactly the right moment.';stats();
      }else{
        relationshipRound++;relationshipDuration=Math.max(2100,3000-relationshipStep*350);relationshipStart=performance.now();
        ui.wouldFeedback.textContent='✅ PERFECT. She is already starting another ramble... Round '+(relationshipStep+1)+' of 3.';
      }
    }else{
      ui.wouldFeedback.textContent=pct<zoneStart?'❌ Too early. She has not reached “WOULD YOU?” yet.':'❌ Too late. She already said “WOULD YOU?”';
    }
}
  function answerPuzzle(answer){if(mode!=='puzzle')return;if(answer==='correct'){puzzleSolved=true;mode='map';ui.puzzle.classList.add('hidden');ui.dialogue.textContent='🧩 Correct. Princess etiquette level: appalling. The boss gate is now open.';stats()}else ui.puzzleFeedback.textContent='❌ Wrong. Even the cemetery is disappointed in you.'}
  function startBoss(){ui.bossReady.classList.add('hidden');ui.bossIntro.classList.add('hidden');target=null;combatCheckpoint={x,y};startCombat(true)}
  function start(){reveal();stats();drawMini();cancelAnimationFrame(relationshipRAF);clearInterval(enemyTimer);cancelAnimationFrame(raf);const loop=t=>{now=t;if(walkPulse>0 && t%99999>-1){} if(mode==='map')drawWorld(t);drawMini();raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);requestAnimationFrame(combatTick)}
  function primaryAction(){if(mode==='encounter')startEncounterFight();else if(mode==='combat')combatAttack();else if(mode==='map')checkTriggers()}

  return {start,move,primaryAction,interact,startEncounterFight,combatAttack,combatDodge,shootAtPointer,retryCombat,backToMap,completeRelationship,answerPuzzle,startBoss};
}
