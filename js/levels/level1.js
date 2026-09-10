const TILE=40,COLS=30,ROWS=20,WORLD_W=1200,WORLD_H=800;
// Level 1 is deliberately open. The dotted route from Scarlett's paper sketch is only a suggestion,
// not a corridor. Everything is walkable except the objects listed in OBSTACLES.
const MAP=Array.from({length:ROWS},()=>'.'.repeat(COLS));
const isFloor=(x,y)=>x>=0&&y>=0&&x<COLS&&y<ROWS;
const SAVE_KEY='goodbyeGothSave_v4';
function safeParseSave(){try{const raw=localStorage.getItem(SAVE_KEY);return raw?JSON.parse(raw):null}catch{return null}}
const wouldIcon=new Image(); wouldIcon.src='assets/icons/would-you.png';
const quizIcon=new Image(); quizIcon.src='assets/icons/quiz.png';

const environmentSprites={chapel:new Image(),mausoleum:new Image(),smallMausoleum:new Image(),treeLarge:new Image(),treeMedium:new Image(),treePink:new Image(),bush:new Image(),candles:new Image(),angel:new Image(),lantern:new Image(),graves:new Image(),gate:new Image()};
environmentSprites.chapel.src='assets/environment/chapel.webp?v=410';
environmentSprites.mausoleum.src='assets/environment/mausoleum.webp?v=410';
environmentSprites.smallMausoleum.src='assets/environment/small-mausoleum.webp?v=410';
environmentSprites.treeLarge.src='assets/environment/tree-large.webp?v=410';
environmentSprites.treeMedium.src='assets/environment/tree-medium.webp?v=410';
environmentSprites.treePink.src='assets/environment/tree-pink.webp?v=410';
environmentSprites.bush.src='assets/environment/bush.webp?v=410';
environmentSprites.candles.src='assets/environment/candles.webp?v=410';
environmentSprites.angel.src='assets/environment/angel.webp?v=410';
environmentSprites.lantern.src='assets/environment/lantern.webp?v=410';
environmentSprites.graves.src='assets/environment/graves.webp?v=410';
environmentSprites.gate.src='assets/environment/gate.webp?v=410';
function drawEnvSprite(ctx,img,x,y,w,h){if(!img.complete||!img.naturalWidth)return;ctx.drawImage(img,x,y,w,h)}

// Collision is based on sensible footprint rectangles, not the transparent pixels of the artwork.
// This keeps the map easy to edit and prevents the old "black strip" / inaccessible-corner problem.
const OBSTACLES=[
  // Buildings
  {x:75,y:55,w:315,h:250,label:'chapel'},
  {x:795,y:70,w:190,h:210,label:'small-mausoleum'},
  {x:560,y:575,w:300,h:190,label:'mausoleum'},
  // Trees
  {x:8,y:18,w:205,h:185,label:'tree'},
  {x:455,y:8,w:195,h:185,label:'tree'},
  {x:1000,y:260,w:175,h:190,label:'tree'},
  {x:25,y:580,w:205,h:175,label:'tree'},
  {x:895,y:575,w:210,h:185,label:'tree'},
  // Bush/flower patches: solid enough to walk around, but smaller than the visual sprite.
  {x:435,y:250,w:155,h:75,label:'bush'},
  {x:965,y:175,w:150,h:78,label:'bush'},
  {x:245,y:505,w:180,h:82,label:'bush'},
  {x:855,y:480,w:175,h:82,label:'bush'},
  {x:430,y:695,w:170,h:75,label:'bush'}
];
function circleRectHit(px,py,r,o){const cx=Math.max(o.x,Math.min(px,o.x+o.w)),cy=Math.max(o.y,Math.min(py,o.y+o.h));return Math.hypot(px-cx,py-cy)<r}
function blockedWorld(px,py,r=15){if(px<20||py<20||px>WORLD_W-20||py>WORLD_H-20)return true;return OBSTACLES.some(o=>circleRectHit(px,py,r,o))}

function drawCemetery(ctx,w,h){
  ctx.clearRect(0,0,w,h);
  // Base ground. No tiled grey maze, no giant procedural blocks.
  const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#171126');bg.addColorStop(.5,'#12101a');bg.addColorStop(1,'#0b0910');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);

  // Soft moonlight and distant cemetery silhouettes.
  ctx.fillStyle='rgba(32,25,48,.7)';for(let i=0;i<18;i++){const bx=i*76;ctx.beginPath();ctx.moveTo(bx,185);ctx.lineTo(bx+18,145);ctx.lineTo(bx+36,185);ctx.lineTo(bx+54,150);ctx.lineTo(bx+72,185);ctx.closePath();ctx.fill()}
  const moon=ctx.createRadialGradient(1020,95,10,1020,95,120);moon.addColorStop(0,'rgba(244,207,226,.25)');moon.addColorStop(1,'rgba(244,207,226,0)');ctx.fillStyle=moon;ctx.fillRect(880,0,240,240);
  ctx.fillStyle='#dcb7cd';ctx.globalAlpha=.65;ctx.beginPath();ctx.arc(1020,95,42,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;

  // Grass texture.
  for(let i=0;i<260;i++){const gx=(i*97)%w,gy=20+(i*53)%(h-35);ctx.strokeStyle=i%3?'rgba(87,75,78,.28)':'rgba(116,92,102,.25)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(gx,gy+5);ctx.lineTo(gx+2,gy);ctx.moveTo(gx+4,gy+5);ctx.lineTo(gx+6,gy+1);ctx.stroke()}

  // Broad cobblestone paths. These are visual routes only; free movement is allowed over the grass.
  function pathRect(x,y,pw,ph){
    ctx.fillStyle='#3e3644';ctx.fillRect(x,y,pw,ph);
    ctx.fillStyle='rgba(111,94,112,.18)';ctx.fillRect(x+4,y+4,pw-8,ph-8);
    ctx.strokeStyle='#1e1824';ctx.lineWidth=4;ctx.strokeRect(x,y,pw,ph);
    ctx.strokeStyle='rgba(137,119,137,.42)';ctx.lineWidth=1.3;
    for(let yy=y+14;yy<y+ph;yy+=28){ctx.beginPath();ctx.moveTo(x+3,yy);ctx.lineTo(x+pw-3,yy+((Math.floor(yy/28)%2)?2:-1));ctx.stroke()}
    for(let xx=x+16;xx<x+pw;xx+=34){ctx.beginPath();ctx.moveTo(xx,y+3);ctx.lineTo(xx+((Math.floor(xx/34)%2)?3:-2),y+ph-3);ctx.stroke()}
  }
  pathRect(40,330,1120,115);                 // main east-west path
  pathRect(430,190,120,410);                 // north-south connector
  pathRect(110,445,210,95);                  // lower-left branch
  pathRect(830,425,250,105);                 // lower-right branch
  pathRect(1010,505,105,185);                // boss approach
  pathRect(560,90,180,105);                   // upper connector

  // Buildings sit in three separate pockets and never overlap each other.
  drawEnvSprite(ctx,environmentSprites.chapel,55,35,330,285);
  drawEnvSprite(ctx,environmentSprites.smallMausoleum,790,55,205,235);
  drawEnvSprite(ctx,environmentSprites.mausoleum,545,555,325,225);

  // Decorative trees can partially cover buildings, as requested.
  [[0,5,225,205],[455,0,205,205],[995,245,205,220],[20,565,225,215],[890,560,230,220]].forEach(v=>drawEnvSprite(ctx,environmentSprites.treeLarge,...v));
  [[360,20,150,155],[660,15,145,150],[1015,440,145,150]].forEach(v=>drawEnvSprite(ctx,environmentSprites.treeMedium,...v));
  drawEnvSprite(ctx,environmentSprites.treePink,275,30,190,165);
  // Bushes repeat around the paths without swallowing the interaction markers.
  [[425,250,175,92],[955,165,180,95],[230,500,195,92],[845,475,195,94],[420,690,190,90]].forEach(v=>drawEnvSprite(ctx,environmentSprites.bush,...v));

  // Grave sheet: use several cropped source regions from the supplied sheet.
  if(environmentSprites.graves.complete&&environmentSprites.graves.naturalWidth){
    const g=environmentSprites.graves;
    const crops=[
      [0,0,270,455,35,235,78,105],[270,0,255,455,190,225,76,105],[525,0,270,455,635,250,76,105],[795,0,260,455,700,420,78,105],
      [0,455,270,390,55,470,78,105],[270,455,255,390,375,470,76,105],[525,455,270,390,665,470,78,105],[795,455,260,390,1025,455,78,105],
      [0,845,270,354,250,610,78,105],[270,845,255,354,960,620,78,105]
    ];
    crops.forEach(([sx,sy,sw,sh,dx,dy,dw,dh])=>ctx.drawImage(g,sx,sy,sw,sh,dx,dy,dw,dh));
  }

  // Angels, candle clusters and lanterns are scenery, never interaction markers.
  drawEnvSprite(ctx,environmentSprites.angel,125,455,105,145);
  drawEnvSprite(ctx,environmentSprites.angel,965,425,105,145);
  [[360,275,110,100],[670,300,110,100],[1050,300,110,100],[610,690,120,105]].forEach(v=>drawEnvSprite(ctx,environmentSprites.candles,...v));
  [[55,300,65,105],[410,300,65,105],[710,300,65,105],[1090,300,65,105],[300,450,65,105],[1080,620,65,105]].forEach(v=>drawEnvSprite(ctx,environmentSprites.lantern,...v));

  // Subtle fence fragments help sell the cemetery without creating walls across the map.
  ctx.strokeStyle='rgba(30,24,34,.9)';ctx.lineWidth=5;
  [[40,305,420,305],[745,305,1160,305],[40,555,430,555],[860,555,1160,555]].forEach(([x1,y1,x2,y2])=>{ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();for(let x=x1;x<x2;x+=35){ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y1-8);ctx.lineTo(x,y1+8);ctx.stroke()}});

  // Pink petals across the open areas.
  for(let i=0;i<55;i++){const px=(i*149)%w,py=35+(i*83)%(h-60);ctx.fillStyle=i%2?'rgba(231,101,150,.65)':'rgba(255,177,205,.45)';ctx.beginPath();ctx.ellipse(px,py,4,2,((i%7)-3)*.2,0,Math.PI*2);ctx.fill()}

  // Boss gate at the bottom-right, using the supplied iron-gate sprite.
  drawEnvSprite(ctx,environmentSprites.gate,1010,610,185,125);
  ctx.fillStyle='#f0cf8b';ctx.strokeStyle='#fff0c7';ctx.lineWidth=2;ctx.beginPath();ctx.arc(1100,668,8,0,Math.PI*2);ctx.fill();ctx.stroke();
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
zombieSprites.shambler.src='assets/characters/zombie-goth.png?v=300';
zombieSprites.chain.src='assets/characters/chain-goth.webp?v=370';
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
  if(attack){ctx.strokeStyle=type==='chain'?'#cfb7a5':'#ef91ac';ctx.lineWidth=3*s;ctx.beginPath();ctx.arc(0,-6*s,40*s,0,Math.PI*2);ctx.stroke()}
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
    {x:23,y:14,type:'chain',name:'CHAIN GOTH',hp:5,maxHp:5,dead:false,pattern:'Long-range chain lash'}
  ];
  // These are deliberately spread out so every objective has its own little destination.
  const relationship={x:7,y:13},puzzle={x:21,y:5},boss={x:27,y:17},key={x:25,y:13};
  let x=5,y=9,hp=5,mode='map',walkDir='right',facingDir='right',walkPulse=0,kills=0,relationshipDone=false,puzzleSolved=false,keyCollected=false,inventory={},checkpoint='cemetery-entrance',target=null,isBoss=false,combatHp=0,combatMax=1,enemyAttackPhase=null,enemyTimer=null,combatRaf=0,projectiles=[],player={x:135,y:260,invuln:0,aimX:500,aimY:180},combatCheckpoint=null,bossRoomEntered=false,relationshipStep=0,relationshipRound=0,relationshipStart=0,relationshipDuration=2600,relationshipAnimating=false,relationshipRAF=0;
  let now=0,raf=0;

  function reveal(){for(let yy=0;yy<ROWS;yy++)for(let xx=0;xx<COLS;xx++)if(Math.hypot(xx-x,yy-y)<=3.7)revealed[yy][xx]=true}
  function objectivesComplete(){return kills>=2&&relationshipDone&&puzzleSolved}
  function unlockedBoss(){return objectivesComplete()&&keyCollected}
  function stats(){ui.hpEl.textContent=hp;ui.gothEl.textContent=`${kills}/2`;ui.relEl.textContent=relationshipDone?'Solved':'Locked';ui.puzzleEl.textContent=puzzleSolved?'Answered':'Locked';ui.goalGoths.innerHTML=kills>=2?'<span class="good">✓ Defeat the required Zombie Goths</span>':`○ Defeat the required Zombie Goths (${kills}/2)`;ui.goalRel.innerHTML=relationshipDone?'<span class="good">✓ WOULD YOU? Puzzle complete</span>':'○ Complete the WOULD YOU? Puzzle';ui.goalPuzzle.innerHTML=puzzleSolved?'<span class="good">✓ Princess Question answered</span>':'○ Answer the Princess Question';ui.goalBoss.innerHTML=unlockedBoss()?'<span class="good">✓ Boss gate unlocked</span>':'<span class="locked">🔒 Boss gate locked</span>'}
  function drawMini(){mctx.clearRect(0,0,250,180);mctx.fillStyle='#0d0b11';mctx.fillRect(0,0,250,180);for(let yy=0;yy<ROWS;yy++)for(let xx=0;xx<COLS;xx++){if(revealed[yy][xx]){mctx.fillStyle=isFloor(xx,yy)?'#57505b':'#17131b';mctx.fillRect(xx*10,yy*10,10,10)}else{mctx.fillStyle='#0c0a0e';mctx.fillRect(xx*10,yy*10,10,10)}}mctx.fillStyle='#f3eff0';mctx.beginPath();mctx.arc(x*10+5,y*10+5,3.5,0,Math.PI*2);mctx.fill();if(kills>=2&&relationshipDone&&puzzleSolved&&!keyCollected&&revealed[key.y][key.x]){mctx.fillStyle='#f0cf8b';mctx.fillRect(key.x*10+2,key.y*10+2,6,6)}if(!relationshipDone&&revealed[relationship.y][relationship.x]){mctx.fillStyle='#ef91ac';mctx.fillRect(relationship.x*10+1,relationship.y*10+1,8,8)}if(!puzzleSolved&&revealed[puzzle.y][puzzle.x]){mctx.fillStyle='#e5c5d5';mctx.fillRect(puzzle.x*10+1,puzzle.y*10+1,8,8)}if(unlockedBoss()&&revealed[boss.y][boss.x]){mctx.fillStyle='#f0cf8b';mctx.fillRect(boss.x*10+2,boss.y*10+2,6,6)}}
  function drawWorld(t){
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    const vw=ui.canvas.clientWidth||1000, vh=ui.canvas.clientHeight||600;
    const zoom=Math.max(1,Math.min(1.22,Math.max(vw/WORLD_W,vh/WORLD_H)*1.04));
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
    // Soft fog-of-war. It no longer creates a wall of black squares, so unexplored space still feels like part of one continuous cemetery.
    const playerWorldX=x*TILE+20,playerWorldY=y*TILE+35;
    const fog=ctx.createRadialGradient(playerWorldX,playerWorldY,150,playerWorldX,playerWorldY,390);
    fog.addColorStop(0,'rgba(5,3,10,0)');fog.addColorStop(.62,'rgba(5,3,10,.22)');fog.addColorStop(1,'rgba(5,3,10,.68)');
    ctx.fillStyle=fog;ctx.fillRect(0,0,WORLD_W,WORLD_H);
    enemies.forEach(e=>{if(!e.dead&&revealed[e.y][e.x])drawZombieSprite(ctx,e.x*TILE+20,e.y*TILE+38,e.type,.68,t/1000)});
    if(!relationshipDone&&revealed[relationship.y][relationship.x]){
      const rx=relationship.x*TILE+20,ry=relationship.y*TILE+25;
      if(wouldIcon.complete&&wouldIcon.naturalWidth) ctx.drawImage(wouldIcon,rx-38,ry-38,76,76);
      else {ctx.fillStyle='#ef91ac';ctx.font='42px Georgia';ctx.textAlign='center';ctx.fillText('♥',rx,ry+15)}
    }
    if(!puzzleSolved&&revealed[puzzle.y][puzzle.x]){
      const px=puzzle.x*TILE+20,py=puzzle.y*TILE+25;
      if(quizIcon.complete&&quizIcon.naturalWidth) ctx.drawImage(quizIcon,px-38,py-38,76,76);
      else {ctx.fillStyle='#e6c5d3';ctx.font='42px Georgia';ctx.textAlign='center';ctx.fillText('✣',px,py+15)}
    }
    if(kills>=2&&relationshipDone&&puzzleSolved&&!keyCollected&&revealed[key.y][key.x]){
      ctx.fillStyle='#f0cf8b';ctx.strokeStyle='#fff0c7';ctx.lineWidth=2;ctx.beginPath();ctx.arc(key.x*TILE+20,key.y*TILE+24,12,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#f0cf8b';ctx.fillRect(key.x*TILE+29,key.y*TILE+21,20,6);ctx.fillStyle='#241a25';ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillText('KEY',key.x*TILE+20,key.y*TILE+47);
    }
    if(revealed[boss.y][boss.x]){ctx.fillStyle=unlockedBoss()?'#f0cf8b':'#8c7584';ctx.font='28px Georgia';ctx.textAlign='center';ctx.fillText(unlockedBoss()?'✦':'🔒',boss.x*TILE+20,boss.y*TILE+29);if(unlockedBoss()){ctx.fillStyle='#ef91ac';ctx.font='bold 13px system-ui';ctx.fillText('GATE OPEN',boss.x*TILE+20,boss.y*TILE+54)}}
    if(bossRoomEntered){ctx.fillStyle='rgba(8,5,15,.35)';ctx.fillRect(1100,610,80,150);ctx.strokeStyle='#8d617f';ctx.lineWidth=3;ctx.strokeRect(1105,615,70,140);ctx.fillStyle='#f0d5e3';ctx.font='bold 15px Georgia';ctx.textAlign='center';ctx.fillText('CLASSIC GOTH',1140,685)}
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
  function enemyAttackTick(){if(mode!=='combat')return;const now=performance.now();const faster=isBoss&&enemyPhaseNumber()===3;const kind=(isBoss&&enemyPhaseNumber()===2)?'ring':'lunge';enemyAttackPhase={kind,x:isBoss?690:670,y:isBoss?250:255,radius:100};ui.combatStatus.textContent=kind==='lunge'?'⚠ She is about to charge. DODGE!':'🔥 Incoming fireball wave. DODGE!';setTimeout(()=>{if(mode!=='combat')return;const hit=performance.now()>player.invuln;if(hit){hp=Math.max(0,hp-1);stats();ui.combatStatus.textContent='💥 You were hit. Your health is now '+hp+'.';if(hp<=0){endCombat(false);return}}else ui.combatStatus.textContent='↪ Dodged! Hit back now.';enemyAttackPhase=null},faster?420:620)}

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

  function checkTriggers(){
    // v3.9.2: exploration is passive. Walking into a marker never opens an activity.
    // Boss gate entry remains handled separately by movement/collision.
  }

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
    const candidateX=nx*TILE+20,candidateY=ny*TILE+35;
    if(blockedWorld(candidateX,candidateY,15))return;

    // The locked boss gate cannot be crossed until all Level 1 objectives are complete.
    if(nx===27&&ny===17&&!unlockedBoss()){
      ui.dialogue.textContent='🔒 The iron gate is sealed. Complete the three objectives in any order, then collect the key to open the gate.';
      return;
    }
    // Crossing into the chamber creates the Level 1.5 threshold.
    if(nx>=28&&x===27&&y===17&&unlockedBoss()){
      x=nx;y=ny;walkDir=dir;if(dir==='left'||dir==='right')facingDir=dir;walkPulse=1;bossRoomEntered=true;mode='bossready';
      ui.bossReady.classList.remove('hidden');
      return;
    }

    x=nx;y=ny;walkDir=dir;if(dir==='left'||dir==='right')facingDir=dir;walkPulse=1;setTimeout(()=>{walkPulse=0},180);
    reveal();ui.dialogue.textContent='The cemetery reveals more of the path. Apparently nobody thought to install signs.';drawMini();
  }
  function canvasPointToWorld(e){
    const rect=ui.canvas.getBoundingClientRect();
    const vw=ui.canvas.clientWidth||1000, vh=ui.canvas.clientHeight||600, zoom=Math.max(1,Math.min(1.22,Math.max(vw/WORLD_W,vh/WORLD_H)*1.04));
    const sx=(e.clientX-rect.left)*(vw/rect.width), sy=(e.clientY-rect.top)*(vh/rect.height);
    const playerX=x*TILE+20, playerY=y*TILE+35;
    const viewW=vw/zoom, viewH=vh/zoom;
    const camX=Math.max(viewW/2,Math.min(WORLD_W-viewW/2,playerX));
    const camY=Math.max(viewH/2,Math.min(WORLD_H-viewH/2,playerY));
    return {x:(sx-vw/2+camX*zoom)/zoom,y:(sy-vh/2+camY*zoom)/zoom};
  }
  ui.canvas.addEventListener('pointerdown',e=>{
    if(mode!=='map')return;
    const pt=canvasPointToWorld(e);
    const px=x*TILE+20, py=y*TILE+35;

    const enemyHit=enemies.find(z=>{
      if(z.dead) return false;
      return Math.hypot(pt.x-(z.x*TILE+20),pt.y-(z.y*TILE+28))<62;
    });
    if(enemyHit){
      target=enemyHit;
      combatCheckpoint={x,y};
      mode='encounter';
      drawEncounter(enemyHit.type);
      ui.encounterName.textContent=enemyHit.name;
      ui.encounterText.innerHTML=enemyHit.type==='shambler'
        ? '<strong>Zombie Goth:</strong> “Mmm... black eyeliner...”<br><br>She shuffles closer. Then faster.'
        : '<strong>Chain Goth:</strong> “Come here, mate.”<br><br>Her chain drags across the stones. Click to fight.';
      ui.encounter.classList.remove('hidden');
      return;
    }

    const hitChallenge=Math.hypot(pt.x-(relationship.x*TILE+20),pt.y-(relationship.y*TILE+25))<46;
    const hitPuzzle=Math.hypot(pt.x-(puzzle.x*TILE+20),pt.y-(puzzle.y*TILE+25))<46;
    const hitKey=Math.hypot(pt.x-(key.x*TILE+20),pt.y-(key.y*TILE+24))<40;
    if(hitChallenge&&!relationshipDone){startRelationship();return}
    if(hitPuzzle&&!puzzleSolved){
      mode='puzzle';
      ui.puzzle.classList.remove('hidden');
      ui.puzzleFeedback.textContent='Choose wisely. The Goths have inexplicably made this a formal assessment.';
      return;
    }
    if(hitKey&&objectivesComplete()&&!keyCollected){
      keyCollected=true;inventory.key=1;ui.dialogue.textContent='🔑 A little brass key drops onto the cobblestones. Finally, a sensible piece of game design.';stats();return;
    }
  });

  function interact(){ return; }
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
  function saveGame(){
    try{
      const state={version:2,savedAt:new Date().toISOString(),level:1,x,y,hp,kills,relationshipDone,puzzleSolved,keyCollected,inventory,checkpoint,revealed,enemies:enemies.map(e=>({dead:e.dead,hp:e.hp}))};
      localStorage.setItem(SAVE_KEY,JSON.stringify(state));
      ui.dialogue.textContent='💾 Game saved. The Goths will have to wait.';
      return true;
    }catch(err){console.error('Goodbye Goth save failed',err);return false;}
  }
  function loadGame(){
    const state=safeParseSave();
    if(!state || state.version!==2)return false;
    try{
      x=Number.isFinite(state.x)?state.x:x; y=Number.isFinite(state.y)?state.y:y; hp=Number.isFinite(state.hp)?state.hp:hp; kills=Number.isFinite(state.kills)?state.kills:kills;
      relationshipDone=!!state.relationshipDone; puzzleSolved=!!state.puzzleSolved; keyCollected=!!state.keyCollected; inventory=state.inventory&&typeof state.inventory==='object'?state.inventory:{}; checkpoint=state.checkpoint||'cemetery-entrance';
      if(Array.isArray(state.revealed)&&state.revealed.length===ROWS){for(let yy=0;yy<ROWS;yy++)for(let xx=0;xx<COLS;xx++)revealed[yy][xx]=!!state.revealed[yy]?.[xx];}
      if(Array.isArray(state.enemies)){state.enemies.forEach((saved,i)=>{if(enemies[i]){enemies[i].dead=!!saved.dead;if(Number.isFinite(saved.hp))enemies[i].hp=saved.hp;}})}
      mode='map'; target=null; bossRoomEntered=false;
      reveal(); stats(); drawMini(); ui.dialogue.textContent='📂 Game loaded. Welcome back to the cemetery.';
      return true;
    }catch(err){console.error('Goodbye Goth load failed',err);return false;}
  }
  function start(){reveal();stats();drawMini();cancelAnimationFrame(relationshipRAF);clearInterval(enemyTimer);cancelAnimationFrame(raf);const loop=t=>{now=t;if(walkPulse>0 && t%99999>-1){} if(mode==='map')drawWorld(t);drawMini();raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);requestAnimationFrame(combatTick)}
  function primaryAction(){if(mode==='encounter')startEncounterFight();else if(mode==='combat')combatAttack();else if(mode==='map')checkTriggers()}

  return {start,move,primaryAction,interact,startEncounterFight,combatAttack,combatDodge,shootAtPointer,retryCombat,backToMap,completeRelationship,answerPuzzle,startBoss,saveGame,loadGame};
}
