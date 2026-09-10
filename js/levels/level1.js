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
const SAVE_KEY='goodbyeGothSave_v4';
function safeParseSave(){try{const raw=localStorage.getItem(SAVE_KEY);return raw?JSON.parse(raw):null}catch{return null}}
const wouldIcon=new Image(); wouldIcon.src='assets/icons/would-you.png';
const quizIcon=new Image(); quizIcon.src='assets/icons/quiz.png';

const environmentSprites={church:new Image(),spookyhouse:new Image(),cypt:new Image(),tree:new Image(),bush:new Image(),candles:new Image(),angel:new Image(),lantern:new Image(),graves:[]};
environmentSprites.church.src='assets/environment/church.webp?v=393';
environmentSprites.spookyhouse.src='assets/environment/spookyhouse.webp?v=393';
environmentSprites.cypt.src='assets/environment/cypt.webp?v=393';
environmentSprites.tree.src='assets/environment/tree.webp?v=393';
environmentSprites.bush.src='assets/environment/bush.webp?v=393';
environmentSprites.candles.src='assets/environment/candles.webp?v=393';
environmentSprites.angel.src='assets/environment/angelstatue.webp?v=393';
environmentSprites.lantern.src='assets/environment/lantern.webp?v=393';
for(let i=1;i<=15;i++){const img=new Image();img.src=`assets/environment/grave-${i}.webp?v=393`;environmentSprites.graves.push(img)}
function drawEnvSprite(ctx,img,x,y,w,h){if(!img.complete||!img.naturalWidth)return;ctx.drawImage(img,x,y,w,h)}

function drawCemetery(ctx,w,h){
  // 3.9.3: keep the original maze layout, but replace all old placeholder buildings/trees/graves with the supplied illustrated sprites.
  ctx.fillStyle='#0b0911';ctx.fillRect(0,0,w,h);

  // Distant purple night sky and moon, kept deliberately subtle so gameplay remains readable.
  const sky=ctx.createLinearGradient(0,0,0,h*.48);
  sky.addColorStop(0,'#181127');sky.addColorStop(1,'#211a31');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h*.55);
  const glow=ctx.createRadialGradient(w*.82,h*.13,8,w*.82,h*.13,120);glow.addColorStop(0,'rgba(255,201,226,.24)');glow.addColorStop(1,'rgba(255,201,226,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h*.4);
  ctx.fillStyle='#eec8dc';ctx.beginPath();ctx.arc(w*.82,h*.14,38,0,Math.PI*2);ctx.fill();

  // Grass floor. No procedural block buildings or circular placeholder trees.
  ctx.fillStyle='#12101a';ctx.fillRect(0,h*.34,w,h*.66);
  for(let i=0;i<120;i++){
    const gx=(i*83)%w, gy=h*.38+(i*47)%(h*.58);
    ctx.strokeStyle=i%2?'#28222f':'#332738';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(gx,gy+4);ctx.lineTo(gx+2,gy-2);ctx.moveTo(gx+3,gy+4);ctx.lineTo(gx+6,gy);ctx.stroke();
  }

  // Illustrated architecture sits in dedicated, non-overlapping spaces.
  drawEnvSprite(ctx,environmentSprites.church,8,18,325,298);
  drawEnvSprite(ctx,environmentSprites.spookyhouse,735,45,215,196);
  drawEnvSprite(ctx,environmentSprites.cypt,365,345,245,212);
  drawEnvSprite(ctx,environmentSprites.cypt,820,326,165,150);

  // Continuous stone paths matching the original maze: top branch, central spine, lower route and side connectors.
  function stonePath(x,y,pw,ph,vertical=false){
    ctx.fillStyle='rgba(20,14,24,.72)';ctx.fillRect(x+5,y+7,pw,ph);
    ctx.fillStyle='#574b5d';ctx.fillRect(x,y,pw,ph);
    ctx.strokeStyle='#221b27';ctx.lineWidth=4;ctx.strokeRect(x,y,pw,ph);
    ctx.strokeStyle='#78687b';ctx.lineWidth=1.2;
    if(vertical){
      for(let xx=x+12;xx<x+pw;xx+=28){ctx.beginPath();ctx.moveTo(xx,y+3);ctx.lineTo(xx+((xx/28)%2?4:-3),y+ph-3);ctx.stroke();}
      for(let yy=y+14;yy<y+ph;yy+=30){ctx.beginPath();ctx.moveTo(x+3,yy);ctx.lineTo(x+pw-3,yy);ctx.stroke();}
    }else{
      for(let yy=y+14;yy<y+ph;yy+=30){ctx.beginPath();ctx.moveTo(x+3,yy);ctx.lineTo(x+pw-3,yy+((yy/30)%2?2:-1));ctx.stroke();}
      for(let xx=x+12;xx<x+pw;xx+=34){ctx.beginPath();ctx.moveTo(xx,y+3);ctx.lineTo(xx+3,y+ph-3);ctx.stroke();}
    }
  }
  stonePath(w*.18,h*.33,w*.65,h*.13,false);
  stonePath(w*.44,h*.08,w*.15,h*.82,true);
  stonePath(w*.07,h*.70,w*.74,h*.16,false);
  stonePath(w*.09,h*.48,w*.19,h*.08,false);
  stonePath(w*.74,h*.50,w*.17,h*.08,false);

  // Trees are now the supplied illustrated tree sprite, reused at different scales.
  [[18,8,155,160],[332,18,132,138],[805,188,148,152],[22,430,165,145],[652,430,155,142]].forEach(v=>drawEnvSprite(ctx,environmentSprites.tree,...v));
  // Bushes frame the routes but deliberately leave the interaction icons and enemy pockets clear.
  [[0,185,150,88],[300,295,135,82],[650,245,145,92],[875,450,115,78],[168,500,150,82],[610,505,140,88]].forEach(v=>drawEnvSprite(ctx,environmentSprites.bush,...v));

  // Grave variants, each used as a real sprite instead of a procedural placeholder.
  const graveSpots=[
    [22,320,58,86,1],[115,315,56,82,2],[255,300,62,86,3],[345,188,60,82,4],
    [535,198,58,80,5],[642,312,60,84,6],[875,255,58,84,7],[80,520,62,84,8],
    [280,520,60,78,9],[635,520,60,82,10],[915,520,58,78,11]
  ];
  graveSpots.forEach(([gx,gy,gw,gh,i])=>drawEnvSprite(ctx,environmentSprites.graves[i-1],gx,gy,gw,gh));

  // Memorial groups and angels stay around, rather than on top of, the walkable markers.
  [[160,355,88,114],[738,325,82,108]].forEach(v=>drawEnvSprite(ctx,environmentSprites.angel,...v));
  [[430,187,62,92],[748,190,62,92],[50,362,62,92],[930,360,62,92]].forEach(v=>drawEnvSprite(ctx,environmentSprites.lantern,...v));
  [[330,220,122,102],[585,360,128,104],[838,268,112,92]].forEach(v=>drawEnvSprite(ctx,environmentSprites.candles,...v));

  // Small stone edging gives the paths definition without turning them into giant grey blocks.
  ctx.strokeStyle='#322936';ctx.lineWidth=2;
  function edgeLine(x1,y1,x2,y2){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
  edgeLine(w*.18,h*.33,w*.83,h*.33);edgeLine(w*.18,h*.46,w*.83,h*.46);edgeLine(w*.07,h*.70,w*.81,h*.70);edgeLine(w*.07,h*.86,w*.81,h*.86);

  // Light petals and a few foreground roses.
  ctx.fillStyle='#d75f91';for(let i=0;i<34;i++){const px=(i*137)%w,py=75+(i*71)%(h-100);ctx.beginPath();ctx.ellipse(px,py,4.5,2,((i%5)-2)*.22,0,Math.PI*2);ctx.fill()}

  // Boss gate in the lower-right approach. The actual blocking logic remains in movement code.
  const gx=20*TILE+2,gy=8*TILE+4;
  ctx.strokeStyle='#1a141d';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(gx,gy+66);ctx.lineTo(gx,gy+12);ctx.quadraticCurveTo(gx+40,gy-25,gx+80,gy+12);ctx.lineTo(gx+80,gy+66);ctx.stroke();
  for(let i=0;i<7;i++){const px=gx+9+i*11;ctx.strokeStyle='#27202a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(px,gy+10);ctx.lineTo(px,gy+67);ctx.stroke()}
  ctx.fillStyle='#f0cf8b';ctx.beginPath();ctx.arc(gx+40,gy+35,7,0,Math.PI*2);ctx.fill();
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
    {x:18,y:10,type:'chain',name:'CHAIN GOTH',hp:5,maxHp:5,dead:false,pattern:'Long-range chain lash'}
  ];
  const relationship={x:5,y:9},puzzle={x:19,y:8},boss={x:20,y:8};
  let x=3,y=11,hp=5,mode='map',walkDir='right',facingDir='right',walkPulse=0,kills=0,relationshipDone=false,puzzleSolved=false,keyCollected=false,inventory={},checkpoint='cemetery-entrance',target=null,isBoss=false,combatHp=0,combatMax=1,enemyAttackPhase=null,enemyTimer=null,combatRaf=0,projectiles=[],player={x:135,y:260,invuln:0,aimX:500,aimY:180},combatCheckpoint=null,bossRoomEntered=false,relationshipStep=0,relationshipRound=0,relationshipStart=0,relationshipDuration=2600,relationshipAnimating=false,relationshipRAF=0;
  let now=0,raf=0;

  function reveal(){for(let yy=0;yy<ROWS;yy++)for(let xx=0;xx<COLS;xx++)if(Math.hypot(xx-x,yy-y)<=3.7)revealed[yy][xx]=true}
  function unlockedBoss(){return kills>=2&&relationshipDone&&puzzleSolved}
  function stats(){ui.hpEl.textContent=hp;ui.gothEl.textContent=`${kills}/2`;ui.relEl.textContent=relationshipDone?'Solved':'Locked';ui.puzzleEl.textContent=puzzleSolved?'Answered':'Locked';ui.goalGoths.innerHTML=kills>=2?'<span class="good">✓ Defeat the required Zombie Goths</span>':`○ Defeat the required Zombie Goths (${kills}/2)`;ui.goalRel.innerHTML=relationshipDone?'<span class="good">✓ WOULD YOU? Puzzle complete</span>':'○ Complete the WOULD YOU? Puzzle';ui.goalPuzzle.innerHTML=puzzleSolved?'<span class="good">✓ Princess Question answered</span>':'○ Answer the Princess Question';ui.goalBoss.innerHTML=unlockedBoss()?'<span class="good">✓ Boss gate unlocked</span>':'<span class="locked">🔒 Boss gate locked</span>'}
  function drawMini(){mctx.clearRect(0,0,250,180);mctx.fillStyle='#0d0b11';mctx.fillRect(0,0,250,180);for(let yy=0;yy<ROWS;yy++)for(let xx=0;xx<COLS;xx++){if(revealed[yy][xx]){mctx.fillStyle=isFloor(xx,yy)?'#57505b':'#17131b';mctx.fillRect(xx*10,yy*10,10,10)}else{mctx.fillStyle='#0c0a0e';mctx.fillRect(xx*10,yy*10,10,10)}}mctx.fillStyle='#f3eff0';mctx.beginPath();mctx.arc(x*10+5,y*10+5,3.5,0,Math.PI*2);mctx.fill();if(!relationshipDone&&revealed[relationship.y][relationship.x]){mctx.fillStyle='#ef91ac';mctx.fillRect(relationship.x*10+1,relationship.y*10+1,8,8)}if(!puzzleSolved&&revealed[puzzle.y][puzzle.x]){mctx.fillStyle='#e5c5d5';mctx.fillRect(puzzle.x*10+1,puzzle.y*10+1,8,8)}if(unlockedBoss()&&revealed[boss.y][boss.x]){mctx.fillStyle='#f0cf8b';mctx.fillRect(boss.x*10+2,boss.y*10+2,6,6)}}
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
      if(!revealed[yy][xx]){ctx.fillStyle='rgba(3,2,7,.92)';ctx.fillRect(xx*TILE,yy*TILE,TILE,TILE)}
      else if(!isFloor(xx,yy)){ctx.fillStyle='rgba(2,2,6,.28)';ctx.fillRect(xx*TILE,yy*TILE,TILE,TILE)}
    }
    enemies.forEach(e=>{if(!e.dead&&revealed[e.y][e.x])drawZombieSprite(ctx,e.x*TILE+20,e.y*TILE+38,e.type,.68,t/1000)});
    if(!relationshipDone&&revealed[relationship.y][relationship.x]){
      if(wouldIcon.complete&&wouldIcon.naturalWidth) ctx.drawImage(wouldIcon,relationship.x*TILE-40,relationship.y*TILE-40,120,100);
      else {ctx.fillStyle='#ef91ac';ctx.font='56px Georgia';ctx.textAlign='center';ctx.fillText('✣',relationship.x*TILE+20,relationship.y*TILE+38)}
    }
    if(!puzzleSolved&&revealed[puzzle.y][puzzle.x]){
      if(quizIcon.complete&&quizIcon.naturalWidth) ctx.drawImage(quizIcon,puzzle.x*TILE-42,puzzle.y*TILE-42,124,124);
      else {ctx.fillStyle='#e6c5d3';ctx.font='52px Georgia';ctx.textAlign='center';ctx.fillText('♥',puzzle.x*TILE+20,puzzle.y*TILE+38)}
    }
    if(revealed[boss.y][boss.x]){ctx.fillStyle=unlockedBoss()?'#f0cf8b':'#8c7584';ctx.font='24px Georgia';ctx.textAlign='center';ctx.fillText(unlockedBoss()?'✦':'🔒',boss.x*TILE+20,boss.y*TILE+29);if(unlockedBoss()){ctx.fillStyle='#ef91ac';ctx.font='bold 14px system-ui';ctx.fillText('GATE OPEN',boss.x*TILE+20,boss.y*TILE+56)}}
    if(bossRoomEntered){ctx.fillStyle='rgba(8,5,15,.55)';ctx.fillRect(21*TILE,6*TILE,3*TILE,5*TILE);ctx.strokeStyle='#8d617f';ctx.lineWidth=3;ctx.strokeRect(21*TILE+8,6*TILE+8,3*TILE-16,5*TILE-16);ctx.fillStyle='#f0d5e3';ctx.font='bold 15px Georgia';ctx.textAlign='center';ctx.fillText('CLASSIC GOTH',22*TILE+20,8*TILE+28)}
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

    // The locked boss gate cannot be crossed until all Level 1 objectives are complete.
    if(nx===20&&ny===8&&!unlockedBoss()){
      ui.dialogue.textContent='🔒 The iron gate is sealed. Complete the four requirements in any order: defeat 2 Goths, finish WOULD YOU?, and answer the Princess Question.';
      return;
    }
    // Crossing into the chamber creates the Level 1.5 threshold.
    if(nx>=21&&x===20&&y===8&&unlockedBoss()){
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

    const hitChallenge=Math.hypot(pt.x-(relationship.x*TILE+20),pt.y-(relationship.y*TILE+20))<60;
    const hitPuzzle=Math.hypot(pt.x-(puzzle.x*TILE+20),pt.y-(puzzle.y*TILE+20))<60;
    if(hitChallenge&&!relationshipDone){startRelationship();return}
    if(hitPuzzle&&!puzzleSolved){
      mode='puzzle';
      ui.puzzle.classList.remove('hidden');
      ui.puzzleFeedback.textContent='Choose wisely. The Goths have inexplicably made this a formal assessment.';
      return;
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
      const state={version:1,savedAt:new Date().toISOString(),level:1,x,y,hp,kills,relationshipDone,puzzleSolved,keyCollected,inventory,checkpoint,revealed,enemies:enemies.map(e=>({dead:e.dead,hp:e.hp}))};
      localStorage.setItem(SAVE_KEY,JSON.stringify(state));
      ui.dialogue.textContent='💾 Game saved. The Goths will have to wait.';
      return true;
    }catch(err){console.error('Goodbye Goth save failed',err);return false;}
  }
  function loadGame(){
    const state=safeParseSave();
    if(!state)return false;
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
