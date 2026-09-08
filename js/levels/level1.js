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
  const g=ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,'#201a2f');g.addColorStop(.52,'#171223');g.addColorStop(1,'#0b0910');
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);

  // Moon and distant gothic silhouette.
  ctx.fillStyle='#f1cfe0';ctx.beginPath();ctx.arc(w*.78,h*.15,42,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=28;ctx.shadowColor='rgba(241,207,224,.18)';ctx.fill();ctx.shadowBlur=0;
  ctx.fillStyle='#0e0b15';
  for(let i=0;i<14;i++){const bx=i*78-18,base=h*.43;ctx.fillRect(bx,base-45-(i%3)*18,20,45+(i%3)*18);ctx.beginPath();ctx.moveTo(bx-4,base-45-(i%3)*18);ctx.lineTo(bx+10,base-70-(i%2)*10);ctx.lineTo(bx+24,base-45-(i%3)*18);ctx.fill();}

  // Stone paths aligned with the playable route.
  ctx.fillStyle='#4a414e';ctx.fillRect(w*.20,h*.34,w*.64,h*.12);ctx.fillRect(w*.43,h*.08,w*.14,h*.84);ctx.fillRect(w*.08,h*.72,w*.72,h*.15);
  ctx.fillStyle='#5b4e61';for(let px=55;px<w*.78;px+=54){ctx.fillRect(px,h*.775,40,5)}for(let py=70;py<h*.9;py+=48){ctx.fillRect(w*.495,py,5,33)}

  // Trees around the edges, plus a few framing the main paths.
  for(let i=0;i<18;i++){const x=28+(i*137)%930,y=40+(i*83)%500;
    ctx.fillStyle='#0d1015';ctx.fillRect(x-5,y+18,10,36);ctx.beginPath();ctx.arc(x,y,30+(i%3)*7,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#171325';ctx.beginPath();ctx.arc(x+18,y-10,24,0,Math.PI*2);ctx.fill();
  }

  // Graves.
  for(let i=0;i<32;i++){const x=28+(i*91)%920,y=108+(i*53)%420;
    const wide=i%5===0;
    ctx.fillStyle=i%2?'#716d79':'#5f5d68';ctx.fillRect(x,y,wide?30:24,wide?42:36);ctx.beginPath();ctx.arc(x+(wide?15:12),y,wide?15:12,Math.PI,0);ctx.fill();
    ctx.strokeStyle='#96919c';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x+12,y+8);ctx.lineTo(x+12,y+24);ctx.moveTo(x+5,y+15);ctx.lineTo(x+19,y+15);ctx.stroke();
  }

  // Mausoleums / crypts.
  const maus=[{x:95,y:112},{x:350,y:305},{x:690,y:118},{x:805,y:328}];
  maus.forEach((m,i)=>{ctx.fillStyle='#4b4551';ctx.fillRect(m.x,m.y,72,55);ctx.beginPath();ctx.moveTo(m.x-6,m.y);ctx.lineTo(m.x+36,m.y-24);ctx.lineTo(m.x+78,m.y);ctx.fill();ctx.fillStyle='#18131d';ctx.fillRect(m.x+26,m.y+22,20,33);ctx.fillStyle='#d78aa8';ctx.fillRect(m.x+34,m.y+29,4,6);});

  // Statues.
  for(let i=0;i<6;i++){const x=170+i*145,y=150+(i%2)*265;ctx.fillStyle='#77727d';ctx.fillRect(x-7,y+19,14,48);ctx.beginPath();ctx.arc(x,y,11,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(x-16,y+23);ctx.lineTo(x-27,y+54);ctx.lineTo(x-5,y+48);ctx.fill();ctx.beginPath();ctx.moveTo(x+16,y+23);ctx.lineTo(x+27,y+54);ctx.lineTo(x+5,y+48);ctx.fill();}

  // Lanterns.
  for(let i=0;i<11;i++){const x=55+i*91,y=140+(i%4)*103;ctx.strokeStyle='#76616c';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y,x,y+28);ctx.stroke();ctx.fillStyle='#c98961';ctx.fillRect(x-8,y-5,16,12);ctx.fillStyle='#ffd7a1';ctx.beginPath();ctx.arc(x,y+1,4.5,0,Math.PI*2);ctx.fill();}

  // Church / spooky house at the upper-left side route.
  ctx.fillStyle='#3b3442';ctx.fillRect(90,75,155,96);ctx.fillStyle='#2b2632';ctx.beginPath();ctx.moveTo(78,75);ctx.lineTo(166,25);ctx.lineTo(257,75);ctx.fill();
  ctx.fillStyle='#15111a';ctx.fillRect(156,108,25,63);ctx.fillStyle='#a36583';ctx.fillRect(162,120,13,24);ctx.fillStyle='#111';ctx.fillRect(110,105,20,20);ctx.fillRect(202,105,20,20);

  // Iron fencing around parts of the cemetery.
  ctx.strokeStyle='#15131a';ctx.lineWidth=6;
  const fenceLines=[[30,h*.63,w*.27,h*.63],[w*.58,h*.18,w*.92,h*.18],[w*.20,h*.92,w*.55,h*.92]];
  fenceLines.forEach(([x1,y1,x2,y2])=>{ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();for(let x=x1;x<=x2;x+=18){ctx.fillRect(x,y1-18,5,20)}});

  // A few pink petals make the place feel pretty as well as creepy.
  ctx.fillStyle='#cc5e89';for(let i=0;i<24;i++){const x=(i*119)%w,y=80+(i*71)%470;ctx.beginPath();ctx.ellipse(x,y,5,2,((i%4)-2)*.25,0,Math.PI*2);ctx.fill();}

  // The boss gate is drawn near the right-hand end of the main route.
  const gx=20*TILE+4, gy=8*TILE+2;
  ctx.strokeStyle='#24202b';ctx.lineWidth=5;ctx.beginPath();ctx.arc(gx+20,gy+40,36,Math.PI,0);ctx.stroke();
  for(let i=-2;i<=2;i++){ctx.fillRect(gx+18+i*11,gy+5,4,36)}
}

function drawOlly(ctx,x,y,s=.7,t=0,front=true,dir='down',moving=false){
  // Chunky hand-drawn/pixel-cartoon Olly. The old geometric mannequin made
  // horizontal movement look like backwards walking, so the map character
  // now has a clear silhouette, animated limbs, curls, Weeknd shirt and bow.
  ctx.save();
  const phase=moving ? Math.sin(t*11) : 0;
  const bob=moving ? Math.abs(Math.sin(t*11))*1.8 : Math.sin(t*2)*0.6;
  ctx.translate(x,y-bob);
  const flip=dir==='left'?-1:1;
  ctx.scale(flip,1);

  // ground shadow
  ctx.fillStyle='rgba(0,0,0,.32)';
  ctx.beginPath();ctx.ellipse(0,34*s,25*s,7*s,0,0,Math.PI*2);ctx.fill();

  // legs and olive cargos
  const legA=moving?phase*5:0, legB=moving?-phase*5:0;
  ctx.strokeStyle='#17151b';ctx.lineWidth=7*s;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-7*s,19*s);ctx.lineTo((-9+legA)*s,36*s);ctx.moveTo(7*s,19*s);ctx.lineTo((9+legB)*s,36*s);ctx.stroke();
  ctx.strokeStyle='#303a2f';ctx.lineWidth=11*s;
  ctx.beginPath();ctx.moveTo(-7*s,17*s);ctx.lineTo((-9+legA)*s,31*s);ctx.moveTo(7*s,17*s);ctx.lineTo((9+legB)*s,31*s);ctx.stroke();
  ctx.fillStyle='#15151a';ctx.fillRect((-15+legA)*s,29*s,11*s,6*s);ctx.fillRect((4+legB)*s,29*s,11*s,6*s);

  // torso / The Weeknd shirt
  ctx.fillStyle='#16151a';ctx.strokeStyle='#09090c';ctx.lineWidth=2*s;
  ctx.beginPath();ctx.roundRect(-19*s,-18*s,38*s,39*s,7*s);ctx.fill();ctx.stroke();
  ctx.fillStyle='#8b766e';ctx.font=`bold ${7*s}px Arial`;ctx.textAlign='center';ctx.fillText('The Weeknd',0,0);
  ctx.fillStyle='#3c3534';ctx.fillRect(-10*s,4*s,20*s,11*s);
  ctx.fillStyle='#b8a59c';ctx.fillRect(-7*s,6*s,14*s,2*s);ctx.fillRect(-5*s,10*s,10*s,2*s);

  // swinging arms
  const armA=moving?phase*4:0, armB=moving?-phase*4:0;
  ctx.strokeStyle='#d1a48e';ctx.lineWidth=6*s;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-17*s,-10*s);ctx.lineTo((-23+armA)*s,7*s);ctx.moveTo(17*s,-10*s);ctx.lineTo((23+armB)*s,5*s);ctx.stroke();
  ctx.fillStyle='#d1a48e';ctx.beginPath();ctx.arc((-23+armA)*s,8*s,4*s,0,Math.PI*2);ctx.arc((23+armB)*s,6*s,4*s,0,Math.PI*2);ctx.fill();

  // neck
  ctx.fillStyle='#c9957f';ctx.fillRect(-6*s,-24*s,12*s,9*s);

  // face
  ctx.fillStyle='#d6a28d';ctx.strokeStyle='#20171a';ctx.lineWidth=2*s;
  ctx.beginPath();ctx.roundRect(-14*s,-42*s,28*s,27*s,9*s);ctx.fill();ctx.stroke();
  // ears
  ctx.beginPath();ctx.arc(-14*s,-29*s,4*s,0,Math.PI*2);ctx.arc(14*s,-29*s,4*s,0,Math.PI*2);ctx.fill();

  // curly hair silhouette, deliberately larger and messier like the reference
  ctx.fillStyle='#24181b';ctx.strokeStyle='#100d11';ctx.lineWidth=2*s;
  ctx.beginPath();
  ctx.arc(-10*s,-43*s,10*s,0,Math.PI*2);ctx.arc(0,-48*s,11*s,0,Math.PI*2);ctx.arc(11*s,-43*s,10*s,0,Math.PI*2);ctx.arc(-15*s,-35*s,7*s,0,Math.PI*2);ctx.arc(15*s,-35*s,7*s,0,Math.PI*2);ctx.fill();ctx.stroke();
  // curl highlights
  ctx.fillStyle='#4b3030';
  [[-10,-46],[-2,-51],[7,-48],[14,-40],[-15,-37],[2,-43]].forEach(([cx,cy])=>{ctx.beginPath();ctx.arc(cx*s,cy*s,3*s,0,Math.PI*2);ctx.fill()});

  // eyebrows / eyes / beard
  ctx.strokeStyle='#4b2d2b';ctx.lineWidth=2*s;ctx.beginPath();ctx.moveTo(-9*s,-31*s);ctx.lineTo(-3*s,-32*s);ctx.moveTo(3*s,-32*s);ctx.lineTo(9*s,-31*s);ctx.stroke();
  ctx.fillStyle='#17141a';ctx.fillRect(-7*s,-28*s,4*s,2*s);ctx.fillRect(3*s,-28*s,4*s,2*s);
  ctx.fillStyle='#69473e';ctx.beginPath();ctx.arc(0,-20*s,8*s,0,Math.PI);ctx.fill();
  ctx.strokeStyle='#9b6858';ctx.lineWidth=1*s;ctx.beginPath();ctx.moveTo(-3*s,-23*s);ctx.lineTo(3*s,-23*s);ctx.stroke();

  // bow in his hand, with a small walking swing
  ctx.save();ctx.translate(23*s,0);ctx.rotate(-0.12+phase*0.03);
  ctx.strokeStyle='#b98a5c';ctx.lineWidth=2.5*s;ctx.beginPath();ctx.moveTo(0,-22*s);ctx.lineTo(0,20*s);ctx.stroke();
  ctx.strokeStyle='#6f4731';ctx.lineWidth=1.5*s;ctx.beginPath();ctx.arc(0,-1*s,15*s,-1.15,1.15);ctx.stroke();
  ctx.restore();
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
    {x:17,y:5,type:'chain',name:'CHAIN ZOMBIE',hp:5,maxHp:5,dead:false,pattern:'Chain lash'}
  ];
  const relationship={x:9,y:7},puzzle={x:17,y:10},boss={x:20,y:8};
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
    enemies.forEach(e=>{if(!e.dead&&revealed[e.y][e.x])drawZombie(ctx,e.x*TILE+20,e.y*TILE+30,e.type,.58,t/1000)});
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

  function drawEncounter(type){ectx.clearRect(0,0,720,300);const gg=ectx.createLinearGradient(0,0,0,300);gg.addColorStop(0,'#2e2436');gg.addColorStop(1,'#111016');ectx.fillStyle=gg;ectx.fillRect(0,0,720,300);for(let i=0;i<15;i++){ectx.fillStyle='#4d3b51';ectx.fillRect((i*61)%720,150+(i%4)*18,28,42)}drawOlly(ectx,180,245,.95,0,true);drawZombie(ectx,520,230,type,.95,1.2,false);ectx.fillStyle='#f3e7ed';ectx.font='bold 18px Georgia';ectx.textAlign='center';ectx.fillText(type==='shambler'?'Mmm... black eyeliner...':'Mmm... accessories...',500,45)}

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
    if(isBoss)drawBoss(cctx,690,250,1.25,performance.now()/1000,!!enemyAttackPhase,enemyPhaseNumber());else drawZombieCombat(cctx,690,255,target?.type||'shambler',!!enemyAttackPhase);
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
    ui.combatPattern.textContent=bossFight?'Phase 1 • DODGE red warnings • FIRE arrows':(target?.pattern||'Watch red warnings • DODGE • FIRE arrows');
    ui.enemyHp.style.width='100%';
    ui.combatStatus.innerHTML='<strong>HOW TO FIGHT:</strong> Click anywhere in the arena to aim and fire. When the enemy flashes a red warning, press <strong>DODGE</strong>. Hit the enemy until its health bar is empty.';
    ui.combat.classList.remove('hidden');
    clearInterval(enemyTimer);enemyTimer=setInterval(enemyAttackTick,bossFight?900:1250);
    clearInterval(combatRaf);const loop=()=>{if(mode==='combat'){drawCombat(performance.now());combatRaf=requestAnimationFrame(loop)}};combatRaf=requestAnimationFrame(loop);
  }
  function enemyAttackTick(){if(mode!=='combat')return;const now=performance.now();const faster=isBoss&&enemyPhaseNumber()===3;const kind=(target?.type==='chain'||isBoss&&enemyPhaseNumber()===2)?'ring':'lunge';enemyAttackPhase={kind,x:isBoss?690:670,y:isBoss?250:255,radius:100};ui.combatStatus.textContent=kind==='lunge'?'⚠ She is about to charge. DODGE!':'⚠ Incoming attack wave. DODGE!';setTimeout(()=>{if(mode!=='combat')return;const hit=performance.now()>player.invuln;if(hit){hp=Math.max(0,hp-1);stats();ui.combatStatus.textContent='💥 You were hit. Your health is now '+hp+'.';if(hp<=0){endCombat(false);return}}else ui.combatStatus.textContent='↪ Dodged! Fire back now.';enemyAttackPhase=null},faster?420:620)}

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

  function checkTriggers(){if(mode!=='map')return;let e=enemies.find(z=>!z.dead&&dist({x,y},{x:z.x,y:z.y})<1.01);if(e){target=e;combatCheckpoint={x,y};mode='encounter';drawEncounter(e.type);ui.encounterName.textContent=e.name;ui.encounterText.innerHTML=e.type==='shambler'?'<strong>Zombie Goth:</strong> “Mmm... black eyeliner...”<br><br>She shuffles closer. Then faster.':'<strong>Zombie Goth:</strong> “Mmm... accessories...”<br><br>The chain starts moving.';ui.encounter.classList.remove('hidden');return}
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
