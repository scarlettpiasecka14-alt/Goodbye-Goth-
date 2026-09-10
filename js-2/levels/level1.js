const MAP=[
  "#########################",
  "##.....................##",
  "##.....................##",
  "##.....................##",
  "##.....................##",
  "##.....................##",
  "##.....................##",
  "##.....................##",
  "##.....................##",
  "##.....................##",
  "##.....................##",
  "##.....................##",
  "##.....................##",
  "#########################",
  "#########################"
];
const TILE=40,COLS=25,ROWS=15,isFloor=(x,y)=>x>=0&&y>=0&&x<COLS&&y<ROWS&&MAP[y][x]==='.';
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const wouldIcon=new Image(); wouldIcon.src='assets/icons/would-you.png';
const quizIcon=new Image(); quizIcon.src='assets/icons/quiz.png';

// 3.6 environment sprites: the maze remains the walkable skeleton, while these images provide the illustrated skin.
const environmentSprites={church:new Image(),spookyhouse:new Image(),cypt:new Image(),tree:new Image(),bush:new Image(),candles:new Image(),angel:new Image(),lantern:new Image(),graves:[]};
environmentSprites.church.src='assets/environment/church.webp?v=380';
environmentSprites.spookyhouse.src='assets/environment/spookyhouse.webp?v=380';
environmentSprites.cypt.src='assets/environment/cypt.webp?v=380';
environmentSprites.tree.src='assets/environment/tree.webp?v=380';
environmentSprites.bush.src='assets/environment/bush.webp?v=380';
environmentSprites.candles.src='assets/environment/candles.webp?v=380';
environmentSprites.angel.src='assets/environment/angelstatue.webp?v=380';
environmentSprites.lantern.src='assets/environment/lantern.webp?v=380';
for(let i=1;i<=15;i++){const img=new Image();img.src=`assets/environment/grave-${i}.webp?v=380`;environmentSprites.graves.push(img)}
function drawEnvSprite(ctx,img,x,y,w,h){if(!img.complete||!img.naturalWidth)return;ctx.drawImage(img,x,y,w,h)}
function drawEnvironmentSpriteLayer(ctx){
  // 3.9: the art is now positioned from the hand-drawn map blueprint.
  // The three major buildings do not overlap, and obstacles sit around them.

  // Buildings: pushed toward the edges so the central cemetery remains open.
  drawEnvSprite(ctx,environmentSprites.church,18,36,236,218);
  drawEnvSprite(ctx,environmentSprites.spookyhouse,728,52,190,170);
  drawEnvSprite(ctx,environmentSprites.cypt,490,338,210,176);

  // Trees: reusable, different sizes, and placed in pockets rather than on routes.
  [
    [300,28,126,136],
    [612,12,150,154],
    [8,330,150,146],
    [790,300,128,128],
    [774,468,156,142],
    [330,456,134,132]
  ].forEach(v=>drawEnvSprite(ctx,environmentSprites.tree,...v));

  // Bush/flower masses: decorative, but their footprints are also blocked below.
  [
    [18,264,110,68],
    [254,286,124,70],
    [398,248,116,70],
    [730,258,124,70],
    [110,500,140,76],
    [744,500,148,78]
  ].forEach(v=>drawEnvSprite(ctx,environmentSprites.bush,...v));

  // Graves: kept readable and spaced around the lanes.
  const graveSpots=[
    [210,174,54,72,1],[286,174,54,72,2],[650,178,54,72,3],[700,176,54,72,4],
    [92,430,54,72,5],[182,438,54,72,6],[720,430,54,72,7],[830,420,54,72,8],
    [420,132,54,72,9],[540,152,54,72,10]
  ];
  graveSpots.forEach(([x,y,w,h,i])=>drawEnvSprite(ctx,environmentSprites.graves[i-1],x,y,w,h));

  // Angel statues on little memorial islands.
  drawEnvSprite(ctx,environmentSprites.angel,152,420,82,108);
  drawEnvSprite(ctx,environmentSprites.angel,862,360,78,104);

  // Lanterns define corners and junctions.
  [
    [152,300,54,82],[470,286,54,82],[706,294,54,82],[930,306,54,82],
    [270,524,54,82],[884,506,54,82]
  ].forEach(v=>drawEnvSprite(ctx,environmentSprites.lantern,...v));

  // Candle clusters make the buildings feel inhabited without creating new obstacles.
  [
    [64,360,104,88],[434,362,112,94],[646,330,108,92],[826,548,110,92]
  ].forEach(v=>drawEnvSprite(ctx,environmentSprites.candles,...v));
}
function rgba(c,a){return c.replace(')',`,${a})`).replace('rgb','rgba')}

// Sprite collision footprints. Transparent pixels are visual; these simple rectangles are the
// gameplay footprints that stop Olly walking through scenery.
const OBSTACLES=[
  {x:0.3,y:1.1,w:6.0,h:4.5,name:'church'},
  {x:18.0,y:1.4,w:4.8,h:3.9,name:'spooky house'},
  {x:11.8,y:8.0,w:5.4,h:4.5,name:'mausoleum'},
  // tree footprints
  {x:7.0,y:0.7,w:3.3,h:3.4,name:'tree'},
  {x:14.8,y:0.4,w:3.7,h:3.8,name:'tree'},
  {x:0.1,y:8.1,w:3.6,h:3.5,name:'tree'},
  {x:19.2,y:7.4,w:3.3,h:3.4,name:'tree'},
  {x:19.0,y:11.6,w:3.8,h:3.2,name:'tree'},
  {x:7.9,y:11.2,w:3.3,h:3.1,name:'tree'},
  // flower / bush footprints
  {x:0.2,y:6.5,w:2.9,h:1.8,name:'flowers'},
  {x:6.1,y:7.1,w:3.2,h:1.9,name:'flowers'},
  {x:9.8,y:6.2,w:2.9,h:1.8,name:'flowers'},
  {x:18.2,y:6.5,w:3.2,h:1.9,name:'flowers'},
  {x:2.4,y:12.1,w:3.7,h:1.8,name:'flowers'},
  {x:18.3,y:12.1,w:3.8,h:1.9,name:'flowers'},
  // memorial / grave footprints
  {x:4.9,y:4.2,w:1.4,h:1.6,name:'grave'}, {x:6.8,y:4.2,w:1.4,h:1.6,name:'grave'},
  {x:16.0,y:4.3,w:1.4,h:1.6,name:'grave'}, {x:17.2,y:4.2,w:1.4,h:1.6,name:'grave'},
  {x:2.0,y:10.3,w:1.4,h:1.7,name:'grave'}, {x:4.1,y:10.5,w:1.4,h:1.7,name:'grave'},
  {x:17.8,y:10.3,w:1.4,h:1.7,name:'grave'}, {x:20.6,y:10.1,w:1.4,h:1.7,name:'grave'},
  {x:10.4,y:3.5,w:1.4,h:1.7,name:'grave'}, {x:13.5,y:3.9,w:1.4,h:1.7,name:'grave'}
];
function spriteBlocksTile(tx,ty){
  const px=tx+0.5,py=ty+0.5;
  return OBSTACLES.some(o=>px>=o.x && px<=o.x+o.w && py>=o.y && py<=o.y+o.h);
}
function walkableTile(tx,ty){return isFloor(tx,ty)&&!spriteBlocksTile(tx,ty);}

function drawCemetery(ctx,w,h){
  // 3.7: clean cemetery base. The old blocky placeholder buildings/trees are gone.
  // The maze remains the walkable skeleton; illustrated PNG/WebP sprites supply the scenery.
  const sky=ctx.createLinearGradient(0,0,0,h);
  sky.addColorStop(0,'#171126');sky.addColorStop(.48,'#241935');sky.addColorStop(1,'#0a0810');
  ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);

  // Distant silhouettes only, deliberately subtle so they don't compete with the real sprites.
  ctx.fillStyle='rgba(12,9,18,.72)';
  for(let i=0;i<19;i++){
    const bx=i*58-16, bw=28+(i%3)*10, bh=58+(i%5)*13;
    const by=h*.40;
    ctx.fillRect(bx,by-bh,bw,bh);
    ctx.beginPath();ctx.moveTo(bx-8,by-bh);ctx.lineTo(bx+bw/2,by-bh-18-(i%2)*8);ctx.lineTo(bx+bw+8,by-bh);ctx.closePath();ctx.fill();
  }

  // Moon + haze.
  const glow=ctx.createRadialGradient(w*.80,h*.16,8,w*.80,h*.16,150);
  glow.addColorStop(0,'rgba(255,190,224,.26)');glow.addColorStop(1,'rgba(255,190,224,0)');
  ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
  ctx.fillStyle='rgba(241,200,223,.88)';ctx.beginPath();ctx.arc(w*.80,h*.16,46,0,Math.PI*2);ctx.fill();

  // Ground.
  ctx.fillStyle='#14101a';ctx.fillRect(0,h*.36,w,h*.64);
  ctx.fillStyle='rgba(91,62,91,.10)';
  for(let i=0;i<50;i++){
    const gx=(i*97)%w, gy=h*.39+(i*71)%(h*.57);
    ctx.beginPath();ctx.ellipse(gx,gy,18+(i%4)*3,5+(i%3)*2,0,0,Math.PI*2);ctx.fill();
  }

  // Walkable routes use irregular cobble seams instead of a visible tile grid.
  function floorTile(tx,ty){
    const px=tx*TILE, py=ty*TILE;
    const seed=Math.abs((tx*37+ty*73)%9);
    ctx.fillStyle=(seed%3===0)?'#514756':'#5a4f5f';
    ctx.fillRect(px,py,TILE,TILE);

    ctx.strokeStyle='rgba(29,23,33,.72)';
    ctx.lineWidth=1.7;
    ctx.beginPath();
    ctx.moveTo(px+4,py+15+(seed%3)*2);
    ctx.quadraticCurveTo(px+18,py+10+(seed%4)*3,px+TILE-4,py+16+(seed%2));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(px+7+(seed%4)*3,py+31);
    ctx.quadraticCurveTo(px+20,py+25+(seed%3)*2,px+TILE-7,py+29-(seed%2)*2);
    ctx.stroke();

    ctx.fillStyle='rgba(214,185,201,.08)';
    ctx.beginPath();
    ctx.ellipse(px+12+(seed%3)*8,py+8+(seed%4)*5,4+(seed%2),2,0,0,Math.PI*2);
    ctx.fill();
  }
  ctx.fillStyle='#574d5e';ctx.fillRect(TILE, TILE, (COLS-2)*TILE, (ROWS-2)*TILE);
  for(let yy=1;yy<ROWS-1;yy++) for(let xx=1;xx<COLS-1;xx++) floorTile(xx,yy);

  // Narrow stone edging keeps the major lanes legible without swallowing them.
  ctx.strokeStyle='rgba(24,18,29,.82)';
  ctx.lineWidth=6;
  [[80,322,360,322],[520,322,900,322],[250,558,820,558]].forEach(([x1,y1,x2,y2])=>{
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  });

  // Small route borders and ironwork, kept understated.
  function fence(x1,y1,x2,y2){
    ctx.strokeStyle='#17121a';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    const len=Math.hypot(x2-x1,y2-y1), n=Math.max(2,Math.floor(len/24));
    for(let i=0;i<=n;i++){
      const u=i/n, px=x1+(x2-x1)*u, py=y1+(y2-y1)*u;
      ctx.strokeStyle='#0e0b12';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(px,py+10);ctx.lineTo(px,py-10);ctx.stroke();
      ctx.fillStyle='#c55b90';ctx.beginPath();ctx.moveTo(px,py-15);ctx.lineTo(px-3,py-9);ctx.lineTo(px+3,py-9);ctx.closePath();ctx.fill();
    }
  }
  fence(24,6*TILE+12,10*TILE,6*TILE+12);
  fence(18*TILE,2*TILE+8,24*TILE,2*TILE+8);
  fence(5*TILE,12*TILE+8,13*TILE,12*TILE+8);

  // Illustrated environment sprites.
  drawEnvironmentSpriteLayer(ctx);

  // Keep a little ambient mist without drawing over the readable sprite silhouettes.
  const mist=ctx.createRadialGradient(w*.5,h*.46,30,w*.5,h*.46,h*.6);
  mist.addColorStop(0,'rgba(188,150,188,0)');
  mist.addColorStop(.72,'rgba(188,150,188,.045)');
  mist.addColorStop(1,'rgba(8,6,12,.24)');
  ctx.fillStyle=mist;ctx.fillRect(0,0,w,h);
}
function drawOlly(ctx,x,y,s=.7,t=0,front=true,dir='right',moving=false){
  ctx.save();
  const bob=moving ? Math.sin(t*18)*1.6 : Math.sin(t*2)*0.4;
  // The supplied Olly artwork faces right. Only flip for horizontal movement;
  // keep the last horizontal facing while moving vertically.
  const faceX = dir === 'right' ? -1 : 1;
  ctx.translate(x,y-bob);
  ctx.fillStyle='rgba(0,0,0,.36)';ctx.beginPath();ctx.ellipse(0,39*s,24*s,6*s,0,0,Math.PI*2);ctx.fill();
  if(ollySprite.complete && ollySprite.naturalWidth){
    const w=96*s,h=144*s;
    ctx.save();
    ctx.scale(faceX,1);
    ctx.drawImage(ollySprite,-w/2,-114*s,w,h);
    ctx.restore();
  }
  ctx.restore();
}

const ollySprite=new Image();
ollySprite.src='assets/characters/olly.png?v=300';
const zombieSprites={shambler:new Image(),chain:new Image()};
zombieSprites.shambler.src='assets/characters/zombie-goth.png?v=380';
zombieSprites.chain.src='assets/characters/chain-goth.webp?v=380';
function drawZombieSprite(ctx,x,y,type,s=.75,t=0,attack=false){
  const img=zombieSprites[type]||zombieSprites.shambler;
  ctx.save();
  const bob=Math.sin(t*7)*1.5;
  ctx.translate(x,y+bob);
  ctx.fillStyle='rgba(0,0,0,.34)';ctx.beginPath();ctx.ellipse(0,40*s,30*s,7*s,0,0,Math.PI*2);ctx.fill();
  if(img.complete && img.naturalWidth){
    const w=108*s,h=162*s;
    ctx.drawImage(img,-w/2,-132*s,w,h);
  }
  if(attack){ctx.strokeStyle=type==='fire'?'#ff6e4c':'#ef91ac';ctx.lineWidth=3*s;ctx.beginPath();ctx.arc(0,-6*s,40*s,0,Math.PI*2);ctx.stroke()}
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
    {x:5,y:7,type:'shambler',name:'GRAVEYARD SHAMBLER',hp:4,maxHp:4,dead:false,pattern:'Slow lunge'},
    {x:18,y:10,type:'chain',name:'CHAIN GOTH',hp:5,maxHp:5,dead:false,pattern:'Chain lash'}
  ];
  const relationship={x:6,y:9},puzzle={x:19,y:5},boss={x:22,y:11};
  let x=3,y=8,hp=5,mode='map',walkDir='right',facingDir='right',walkPulse=0,kills=0,relationshipDone=false,puzzleSolved=false,target=null,isBoss=false,combatHp=0,combatMax=1,enemyAttackPhase=null,enemyTimer=null,combatRaf=0,projectiles=[],player={x:135,y:260,invuln:0,aimX:500,aimY:180},combatCheckpoint=null,bossRoomEntered=false,relationshipStep=0,relationshipRound=0,relationshipStart=0,relationshipDuration=2600,relationshipAnimating=false,relationshipRAF=0;
  let now=0,raf=0;

  function reveal(){for(let yy=0;yy<ROWS;yy++)for(let xx=0;xx<COLS;xx++)if(Math.hypot(xx-x,yy-y)<=4.2)revealed[yy][xx]=true}
  function unlockedBoss(){return kills>=2&&relationshipDone&&puzzleSolved}
  function stats(){ui.hpEl.textContent=hp;ui.gothEl.textContent=`${kills}/2`;ui.relEl.textContent=relationshipDone?'Solved':'Locked';ui.puzzleEl.textContent=puzzleSolved?'Answered':'Locked';ui.goalGoths.innerHTML=kills>=2?'<span class="good">✓ Defeat the required Zombie Goths</span>':`○ Defeat the required Zombie Goths (${kills}/2)`;ui.goalRel.innerHTML=relationshipDone?'<span class="good">✓ WOULD YOU? Puzzle complete</span>':'○ Complete the WOULD YOU? Puzzle';ui.goalPuzzle.innerHTML=puzzleSolved?'<span class="good">✓ Princess Question answered</span>':'○ Answer the Princess Question';ui.goalBoss.innerHTML=unlockedBoss()?'<span class="good">✓ Boss gate unlocked</span>':'<span class="locked">🔒 Boss gate locked</span>'}
  function drawMini(){mctx.clearRect(0,0,250,180);mctx.fillStyle='#0d0b11';mctx.fillRect(0,0,250,180);for(let yy=0;yy<ROWS;yy++)for(let xx=0;xx<COLS;xx++){if(revealed[yy][xx]){mctx.fillStyle=isFloor(xx,yy)?'#57505b':'#17131b';mctx.fillRect(xx*10,yy*10,10,10)}else{mctx.fillStyle='#0c0a0e';mctx.fillRect(xx*10,yy*10,10,10)}}mctx.fillStyle='#f3eff0';mctx.beginPath();mctx.arc(x*10+5,y*10+5,3.5,0,Math.PI*2);mctx.fill();if(!relationshipDone&&revealed[relationship.y][relationship.x]){mctx.fillStyle='#ef91ac';mctx.fillRect(relationship.x*10+2,relationship.y*10+2,6,6)}if(!puzzleSolved&&revealed[puzzle.y][puzzle.x]){mctx.fillStyle='#e5c5d5';mctx.fillRect(puzzle.x*10+2,puzzle.y*10+2,6,6)}if(unlockedBoss()&&revealed[boss.y][boss.x]){mctx.fillStyle='#f0cf8b';mctx.fillRect(boss.x*10+2,boss.y*10+2,6,6)}}
  function drawWorld(t){
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    const vw=ui.canvas.clientWidth||1000, vh=ui.canvas.clientHeight||600;
    const WORLD_W=1000, WORLD_H=600, zoom=1.24;
    ctx.clearRect(0,0,ui.canvas.width,ui.canvas.height);
    const sx=ui.canvas.width/vw, sy=ui.canvas.height/vh;
    ctx.save();ctx.scale(sx,sy);
    ctx.fillStyle='#07050b';ctx.fillRect(0,0,vw,vh);
    const playerX=x*TILE+20, playerY=y*TILE+35;
    const viewW=vw/zoom, viewH=vh/zoom;
    const camX=Math.max(viewW/2,Math.min(WORLD_W-viewW/2,playerX));
    const camY=Math.max(viewH/2,Math.min(WORLD_H-viewH/2,playerY));
    ctx.translate(vw/2-camX*zoom,vh/2-camY*zoom);
    ctx.scale(zoom,zoom);
    drawCemetery(ctx,WORLD_W,WORLD_H);
    // Fog-of-war stays tile-based, but now follows the zoomed camera just like the world.
    for(let yy=0;yy<ROWS;yy++)for(let xx=0;xx<COLS;xx++){
      if(!revealed[yy][xx]){ctx.fillStyle='rgba(3,2,7,.66)';ctx.fillRect(xx*TILE,yy*TILE,TILE,TILE)}
      else if(!isFloor(xx,yy)){ctx.fillStyle='rgba(2,2,6,.28)';ctx.fillRect(xx*TILE,yy*TILE,TILE,TILE)}
    }
    enemies.forEach(e=>{if(!e.dead&&revealed[e.y][e.x])drawZombieSprite(ctx,e.x*TILE+20,e.y*TILE+54,e.type,.62,t/1000)});
    if(!relationshipDone&&revealed[relationship.y][relationship.x]){
      if(wouldIcon.complete&&wouldIcon.naturalWidth){ctx.shadowColor='rgba(255,105,170,.9)';ctx.shadowBlur=18;ctx.drawImage(wouldIcon,relationship.x*TILE-26,relationship.y*TILE-26,72,72);ctx.shadowBlur=0;} else {ctx.fillStyle='#ef91ac';ctx.font='40px Georgia';ctx.textAlign='center';ctx.fillText('✣',relationship.x*TILE+20,relationship.y*TILE+28)}
      ctx.fillStyle='#f8d8e7';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText('CLICK',relationship.x*TILE+20,relationship.y*TILE+58);
    }
    if(!puzzleSolved&&revealed[puzzle.y][puzzle.x]){
      if(quizIcon.complete&&quizIcon.naturalWidth){ctx.shadowColor='rgba(255,190,220,.9)';ctx.shadowBlur=18;ctx.drawImage(quizIcon,puzzle.x*TILE-26,puzzle.y*TILE-26,72,72);ctx.shadowBlur=0;} else {ctx.fillStyle='#e6c5d3';ctx.font='40px Georgia';ctx.textAlign='center';ctx.fillText('♥',puzzle.x*TILE+20,puzzle.y*TILE+28)}
      ctx.fillStyle='#f8d8e7';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText('CLICK',puzzle.x*TILE+20,puzzle.y*TILE+58);
    }
    if(revealed[boss.y][boss.x]){ctx.fillStyle=unlockedBoss()?'#f0cf8b':'#8c7584';ctx.font='24px Georgia';ctx.textAlign='center';ctx.fillText(unlockedBoss()?'✦':'🔒',boss.x*TILE+20,boss.y*TILE+29);if(unlockedBoss()){ctx.fillStyle='#ef91ac';ctx.font='bold 14px system-ui';ctx.fillText('GATE OPEN',boss.x*TILE+20,boss.y*TILE+56)}}
    if(bossRoomEntered){ctx.fillStyle='rgba(8,5,15,.55)';ctx.fillRect(20*TILE,9*TILE,4*TILE,4*TILE);ctx.strokeStyle='#8d617f';ctx.lineWidth=3;ctx.strokeRect(20*TILE+8,9*TILE+8,4*TILE-16,4*TILE-16);ctx.fillStyle='#f0d5e3';ctx.font='bold 15px Georgia';ctx.textAlign='center';ctx.fillText('CLASSIC GOTH',22*TILE,11*TILE+28)}
    drawOlly(ctx,playerX,playerY,.78,t/1000,true,facingDir,walkPulse>0);
    ctx.restore();
  }

  function drawEncounter(type){
  ectx.imageSmoothingEnabled=true;ectx.imageSmoothingQuality='high';
  ectx.clearRect(0,0,720,300);const gg=ectx.createLinearGradient(0,0,0,300);gg.addColorStop(0,'#2e2436');gg.addColorStop(1,'#111016');ectx.fillStyle=gg;ectx.fillRect(0,0,720,300);for(let i=0;i<15;i++){ectx.fillStyle='#4d3b51';ectx.fillRect((i*61)%720,150+(i%4)*18,28,42)}drawOlly(ectx,180,245,.95,0,true);drawZombieSprite(ectx,520,235,type,.95,1.2,false);ectx.fillStyle='#f3e7ed';ectx.font='bold 18px Georgia';ectx.textAlign='center';ectx.fillText(type==='shambler'?'Mmm... black eyeliner...':'Mmm... accessories...',500,45)}

  function resetCombatVisual(){projectiles=[];enemyAttackPhase=null;player={x:145,y:300,invuln:0,aimX:650,aimY:170};}
  function drawCombat(t){
    cctx.imageSmoothingEnabled=true;cctx.imageSmoothingQuality='high';
    const w=900,h=450;
    const g=cctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#241a2c');g.addColorStop(.55,'#17121c');g.addColorStop(1,'#0c090f');cctx.fillStyle=g;cctx.fillRect(0,0,w,h);
    // Ground and cemetery details so the arena is visibly a fight, not a blank panel.
    cctx.fillStyle='#211a25';cctx.fillRect(0,h-105,w,105);
    cctx.fillStyle='#4a3b4e';for(let i=0;i<9;i++){const gx=40+i*105;cctx.fillRect(gx,h-165,5,60);cctx.fillRect(gx-12,h-165,29,5);}
    cctx.fillStyle='#5d4a60';for(let i=0;i<14;i++){const gx=(i*71)%860+20,gy=70+(i%4)*45;cctx.fillRect(gx,gy,4,4);}
    cctx.fillStyle='#d9c9d4';cctx.font='bold 14px system-ui';cctx.textAlign='left';cctx.fillText('MOVE • JUMP • DODGE • ATTACK',24,30);cctx.font='12px system-ui';cctx.fillStyle='#a99aaa';cctx.fillText('Watch the warning and react',24,49);
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
  function drawOllyWorldCombat(c,px,py,s,ax,ay,t,hurt){
  c.save();c.translate(px,py);if(hurt)c.globalAlpha=.5;
  c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(0,54*s,32*s,8*s,0,0,Math.PI*2);c.fill();
  if(ollySprite.complete && ollySprite.naturalWidth){
    const w=116*s,h=174*s;
    c.drawImage(ollySprite,-w/2,-140*s,w,h);
  }
  c.restore();
}
function drawZombieCombat(c,px,py,type,attack){
    // v2.9: use the same detailed zombie sprite in combat as on the map.
    drawZombieSprite(c,px,py+20,type,1.0,performance.now()/1000,attack);
  }
  function enemyPhaseNumber(){if(!isBoss)return 1;const r=combatHp/combatMax;return r<=.34?3:r<=.67?2:1}

  function startCombat(bossFight){
    isBoss=bossFight;mode='combat';combatMax=bossFight?18:(target?.maxHp||4);combatHp=combatMax;resetCombatVisual();
    ui.combatName.textContent=bossFight?'THE CLASSIC GOTH • QUEEN':target?.name||'ZOMBIE GOTH';
    ui.combatPattern.textContent=bossFight?'Phase 1 • DODGE red warnings':(target?.pattern||'Watch red warnings • DODGE');
    ui.enemyHp.style.width='100%';
    ui.combatStatus.innerHTML=bossFight?'<strong>HOW TO FIGHT:</strong> Watch for attack warnings, dodge them, and strike the Queen Goth.':'<strong>HOW TO FIGHT:</strong> Move, jump and dodge her attacks. Your melee attack will be connected in the next combat pass.';
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

  function endCombat(won){clearInterval(enemyTimer);cancelAnimationFrame(combatRaf);ui.combat.classList.add('hidden');mode='map';if(won){if(isBoss){ui.win.classList.remove('hidden');return}if(target){target.dead=true;kills++;target=null;ui.dialogue.textContent=kills===1?'✅ First Zombie Goth defeated. A modest achievement, but one cannot expect miracles before lunch.':'✅ Both Zombie Goths defeated. Now complete the special events, because apparently fighting was only the easy bit.'}}else{ui.deathText.textContent='The goth got you. Olly wakes at the last checkpoint, bruised but ready for another shot.';ui.death.classList.remove('hidden');mode='dead'}stats()}
  function retryCombat(){ui.death.classList.add('hidden');hp=5;stats();if(combatCheckpoint){x=combatCheckpoint.x;y=combatCheckpoint.y;reveal()}mode='map';if(target||isBoss){setTimeout(()=>startCombat(isBoss),100)}}
  function backToMap(){ui.death.classList.add('hidden');hp=5;stats();if(combatCheckpoint){x=combatCheckpoint.x;y=combatCheckpoint.y;reveal()}mode='map';ui.dialogue.textContent='You retreat to the checkpoint. The goths are still waiting.'}

  function beginEnemyEncounter(e){
    target=e;combatCheckpoint={x,y};mode='encounter';drawEncounter(e.type);
    ui.encounterName.textContent=e.name;
    ui.encounterText.innerHTML=e.type==='shambler'
      ? '<strong>Graveyard Shambler:</strong> “Mmm... black eyeliner...”<br><br>She is blocking the path. Click to fight.'
      : '<strong>Chain Goth:</strong> “Come here, mate.”<br><br>Her chain drags across the stones. Click to fight.';
    ui.encounter.classList.remove('hidden');
  }
  function beginPuzzle(){
    mode='puzzle';ui.puzzle.classList.remove('hidden');
    ui.puzzleFeedback.textContent='Choose wisely. The Goths have inexplicably made this a formal assessment.';
  }
  function beginRelationship(){startRelationship();}
  function beginBossGate(){mode='bossintro';ui.bossIntro.classList.remove('hidden');}

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
    if(!walkableTile(nx,ny))return;

    // The locked boss gate cannot be crossed until all Level 1 objectives are complete.
    if(nx===22&&ny===11&&!unlockedBoss()){
      ui.dialogue.textContent='🔒 The iron gate is sealed. Complete the four requirements in any order: defeat 2 Goths, finish WOULD YOU?, and answer the Princess Question.';
      return;
    }
    // Crossing into the chamber creates the Level 1.5 threshold.
    if(nx>=23&&x===22&&y===11&&unlockedBoss()){
      x=nx;y=ny;walkDir=dir;if(dir==='left'||dir==='right')facingDir=dir;walkPulse=1;bossRoomEntered=true;mode='bossready';
      ui.bossReady.classList.remove('hidden');
      return;
    }

    x=nx;y=ny;walkDir=dir;if(dir==='left'||dir==='right')facingDir=dir;walkPulse=1;setTimeout(()=>{walkPulse=0},180);
    reveal();ui.dialogue.textContent='The cemetery reveals more of the path. Apparently nobody thought to install signs.';drawMini();
  }
  function canvasPointToWorld(e){
    const rect=ui.canvas.getBoundingClientRect();
    const vw=ui.canvas.clientWidth||1000, vh=ui.canvas.clientHeight||600, zoom=1.24;
    const sx=(e.clientX-rect.left)*(vw/rect.width), sy=(e.clientY-rect.top)*(vh/rect.height);
    const playerX=x*TILE+20, playerY=y*TILE+35;
    const viewW=vw/zoom, viewH=vh/zoom;
    const camX=Math.max(viewW/2,Math.min(1000-viewW/2,playerX));
    const camY=Math.max(viewH/2,Math.min(600-viewH/2,playerY));
    return {x:(sx-vw/2+camX*zoom)/zoom,y:(sy-vh/2+camY*zoom)/zoom};
  }
  ui.canvas.addEventListener('pointerdown',e=>{
    if(mode!=='map')return;
    const pt=canvasPointToWorld(e);
    const worldDist=(tx,ty)=>Math.hypot(pt.x-(tx*TILE+20),pt.y-(ty*TILE+20));

    // CLICK-ONLY interactions. Walking into an object never launches an activity.
    // Click the visible objects instead of walking into them.
    const liveEnemy=enemies.filter(z=>!z.dead).sort((a,b)=>worldDist(a.x,a.y)-worldDist(b.x,b.y))[0];
    if(liveEnemy && worldDist(liveEnemy.x,liveEnemy.y)<48){beginEnemyEncounter(liveEnemy);return}
    if(!relationshipDone && worldDist(relationship.x,relationship.y)<46){beginRelationship();return}
    if(!puzzleSolved && worldDist(puzzle.x,puzzle.y)<46){beginPuzzle();return}
    if(unlockedBoss() && worldDist(boss.x,boss.y)<60){beginBossGate();return}

    ui.dialogue.textContent='Nothing happened. This cemetery is full of objects that are deliberately not interactive.';
  });
  ui.canvas.addEventListener('pointermove',e=>{
    if(mode!=='map')return;
    const pt=canvasPointToWorld(e);
    const hits=[
      ...enemies.filter(z=>!z.dead).map(z=>({x:z.x,y:z.y,r:48})),
      ...(relationshipDone?[]:[{x:relationship.x,y:relationship.y,r:46}]),
      ...(puzzleSolved?[]:[{x:puzzle.x,y:puzzle.y,r:46}]),
      ...(unlockedBoss()?[{x:boss.x,y:boss.y,r:60}]:[])
    ];
    ui.canvas.style.cursor=hits.some(h=>Math.hypot(pt.x-(h.x*TILE+20),pt.y-(h.y*TILE+20))<h.r)?'pointer':'default';
  });
  function interact(){
    if(mode!=='map')return;
    ui.dialogue.textContent='Click the heart, puzzle, Goth, or unlocked gate to interact. Walking past things no longer starts activities.';
  }
  function startEncounterFight(){ui.encounter.classList.add('hidden');startCombat(false)}
  function drawRelationshipArt(){
    // The relationship screen now uses the approved illustrated artwork directly in the UI.
    rctx.clearRect(0,0,rctx.canvas.width,rctx.canvas.height);
  }
function startRelationship(){
    mode='relationship';relationshipRound=0;relationshipStep=0;relationshipDuration=2600;relationshipStart=performance.now();
    ui.relationship.classList.remove('hidden');
    ui.wouldFeedback.textContent='The princess is rambling. Your job is to weaponise your timing. Round 1 of 5.';
    ui.wouldDisplay.textContent='“Can I ask you a question...”';
    drawRelationshipArt();animateRelationship();
}
function animateRelationship(){
    cancelAnimationFrame(relationshipRAF);
    const tick=t=>{
      if(mode!=='relationship')return;
      const elapsed=t-relationshipStart;
      const pct=Math.min(1,elapsed/relationshipDuration);
      const zoneStart=Math.min(.80 + relationshipRound*.025,.90);
      const zoneWidth=Math.max(.055,.105-relationshipRound*.012);
      ui.timingCursor.style.left=`${pct*100}%`;
      ui.timingZone.style.left=`${zoneStart*100}%`;
      ui.timingZone.style.width=`${zoneWidth*100}%`;
      let line='“Can I ask you a question...”';
      if(pct>=.18&&pct<.36) line='“Have you ever...”';
      else if(pct>=.36&&pct<.54) line='“Do you like...”';
      else if(pct>=.54&&pct<zoneStart) line='“What was I going to say?”';
      else if(pct>=zoneStart) line='“WOULD YOU?”';
      ui.wouldDisplay.textContent=line;
      if(pct>=1){
        relationshipStart=performance.now();
        ui.wouldFeedback.textContent='Too late. The princess has already escaped the sentence. She rambles again. Round '+(relationshipStep+1)+' of 5.';
      }
      relationshipRAF=requestAnimationFrame(tick);
    };
    relationshipRAF=requestAnimationFrame(tick);
}
function completeRelationship(){
    if(mode!=='relationship')return;
    const elapsed=performance.now()-relationshipStart;
    const pct=elapsed/relationshipDuration;
    const zoneStart=Math.min(.80 + relationshipRound*.025,.90);
    const zoneEnd=zoneStart+Math.max(.055,.105-relationshipRound*.012);
    if(pct>=zoneStart&&pct<=zoneEnd){
      relationshipStep++;
      if(relationshipStep>=5){
        relationshipDone=true;mode='map';cancelAnimationFrame(relationshipRAF);ui.relationship.classList.add('hidden');
        ui.dialogue.textContent=unlockedBoss()?'💕 WOULD YOU? complete. Miraculously, the rest of the requirements are also done. The gate can now open.':'💕 WOULD YOU? complete. Five perfectly timed interruptions. One more requirement remains before the gate can open.';stats();
      }else{
        relationshipRound++;relationshipDuration=[2600,2250,1950,1650,1400][relationshipRound]||1200;relationshipStart=performance.now();
        ui.wouldFeedback.textContent='✅ PERFECT. She has started another ramble. Round '+(relationshipStep+1)+' of 5. Less time this time, because apparently love needed a difficulty curve.';
      }
    }else{
      ui.wouldFeedback.textContent=pct<zoneStart?'❌ Too early. The phrase has not escaped her yet.':'❌ Too late. She has already said “WOULD YOU?” and is emotionally moving on.';
    }
}

  function answerPuzzle(answer){
    if(mode!=='puzzle')return;
    if(answer==='correct'){
      puzzleSolved=true;
      mode='map';
      ui.puzzle.classList.add('hidden');
      ui.dialogue.textContent=unlockedBoss()?'🧩 Correct. “Get your kit off, mate.” Against all odds, the rest of the requirements are also complete. The gate can now open.':'🧩 Correct. “Get your kit off, mate.” One objective down. The Goths are still guarding the exit, because apparently there are rules.';
      stats();
    }else{
      ui.puzzleFeedback.textContent='❌ Incorrect. The princess remains imprisoned, and somewhere a goth has just judged you.';
    }
  }
  function startBoss(){ui.bossReady.classList.add('hidden');ui.bossIntro.classList.add('hidden');target=null;combatCheckpoint={x,y};startCombat(true)}
  function start(){reveal();stats();drawMini();cancelAnimationFrame(relationshipRAF);clearInterval(enemyTimer);cancelAnimationFrame(raf);const loop=t=>{now=t;if(walkPulse>0 && t%99999>-1){} if(mode==='map')drawWorld(t);drawMini();raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);requestAnimationFrame(combatTick)}
  function primaryAction(){if(mode==='encounter')startEncounterFight();else if(mode==='combat')combatAttack();else if(mode==='map')interact()}

  return {start,move,primaryAction,interact,startEncounterFight,combatAttack,combatDodge,shootAtPointer,retryCombat,backToMap,completeRelationship,answerPuzzle,startBoss};
}
