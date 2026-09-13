const WORLD_W=1536,WORLD_H=1024;
const SAVE_KEY='goodbyeGothSave_v6';
function safeParseSave(){try{const raw=localStorage.getItem(SAVE_KEY);return raw?JSON.parse(raw):null}catch{return null}}

const mapBackground=new Image();
mapBackground.src='assets/environment/level1-map-bg.png?v=600';
const ollySprite=new Image();
ollySprite.src='assets/characters/olly.png?v=300';
// v4.7 activity architecture: the icon belongs to the ROLE, not to the level.
// These shared icon references can be reused by every level. Only the activity
// behind the role changes from level to level.
const ICON_LIBRARY={
  relationshipChallenge:'assets/icons/relationship-challenge.png',
  princessQuestion:'assets/icons/princess-question.png'
};
const relationshipChallengeIcon=new Image();
relationshipChallengeIcon.src=ICON_LIBRARY.relationshipChallenge;
const princessQuestionIcon=new Image();
princessQuestionIcon.src=ICON_LIBRARY.princessQuestion;

const LEVEL_ACTIVITY_DATA={
  1:{
    relationshipChallenge:{id:'wouldYou',name:'WOULD YOU?',icon:ICON_LIBRARY.relationshipChallenge},
    princessQuestion:{id:'undressQuestion',name:'Princess Question',icon:ICON_LIBRARY.princessQuestion}
  },
  2:{
    relationshipChallenge:{id:'bathroomBurrito',name:'BATHROOM BURRITO',icon:ICON_LIBRARY.relationshipChallenge},
    princessQuestion:{id:'chaosFairyGoth',name:'Which type of goth is known for frolicking in the woods?',icon:ICON_LIBRARY.princessQuestion}
  }
};
const LEVEL_NUMBER=1;
const ACTIVITY_DATA=LEVEL_ACTIVITY_DATA[LEVEL_NUMBER];
const zombieSprites={shambler:new Image(),chain:new Image()};
zombieSprites.shambler.src='assets/characters/zombie-goth.png?v=300';
zombieSprites.chain.src='assets/characters/chain-goth-clean.png?v=620';

/* v6.0: a complete Level 1 rebuild.
   The background is a clean, character-free cemetery illustration.
   All gameplay characters and interactive markers are drawn independently.
   Walkability is handled by explicit collision rectangles, not by a tile grid.
*/
const OBSTACLES=[
  // Major structures only. Decorative gardens/trees are baked into the background
  // and are intentionally not giant invisible barriers.
  {x:15,y:0,w:410,h:385,label:'church'},
  {x:1210,y:20,w:315,h:330,label:'upper-mausoleum'},
  {x:560,y:735,w:410,h:289,label:'lower-mausoleum'},
  {x:1330,y:770,w:190,h:120,label:'boss-gate'}
];
function circleRectHit(px,py,r,o){const cx=Math.max(o.x,Math.min(px,o.x+o.w)),cy=Math.max(o.y,Math.min(py,o.y+o.h));return Math.hypot(px-cx,py-cy)<r}
function blockedWorld(px,py,r=16){if(px<18||py<18||px>WORLD_W-18||py>WORLD_H-18)return true;return OBSTACLES.some(o=>circleRectHit(px,py,r,o))}

function drawOlly(ctx,x,y,s=.78,t=0,front=true,dir='right',moving=false){
  ctx.save();
  const bob=moving?Math.sin(t*18)*1.5:Math.sin(t*2)*.35;
  ctx.translate(x,y-bob);
  ctx.fillStyle='rgba(0,0,0,.34)';ctx.beginPath();ctx.ellipse(0,38*s,23*s,6*s,0,0,Math.PI*2);ctx.fill();
  if(ollySprite.complete&&ollySprite.naturalWidth){
    const w=96*s,h=144*s;
    ctx.save();ctx.scale(dir==='right'?-1:1,1);ctx.drawImage(ollySprite,-w/2,-114*s,w,h);ctx.restore();
  }
  ctx.restore();
}
function drawZombieSprite(ctx,x,y,type,s=.68,t=0,attack=false){
  const img=zombieSprites[type]||zombieSprites.shambler;ctx.save();ctx.translate(x,y+Math.sin(t*7)*1.5);
  ctx.fillStyle='rgba(0,0,0,.34)';ctx.beginPath();ctx.ellipse(0,40*s,28*s,7*s,0,0,Math.PI*2);ctx.fill();
  if(img.complete&&img.naturalWidth){const w=108*s,h=162*s;ctx.drawImage(img,-w/2,-132*s,w,h)}
  if(attack){ctx.strokeStyle=type==='chain'?'#cfb7a5':'#ef91ac';ctx.lineWidth=3*s;ctx.beginPath();ctx.arc(0,-6*s,40*s,0,Math.PI*2);ctx.stroke()}
  ctx.restore();
}

export function createLevel1(ui){
  const ctx=ui.canvas.getContext('2d'),mctx=ui.miniMap.getContext('2d'),ectx=ui.encounterCanvas.getContext('2d'),cctx=ui.combatCanvas.getContext('2d'),rctx=ui.relationshipCanvas.getContext('2d');
  const GRID=32,COLS=48,ROWS=32;
  const revealed=Array.from({length:ROWS},()=>Array(COLS).fill(true));
  const enemies=[
    {x:445,y:315,type:'shambler',name:'GRAVEYARD SHAMBLER',hp:4,maxHp:4,dead:false,pattern:'Slow lunge'},
    {x:1120,y:600,type:'chain',name:'CHAIN GOTH',hp:5,maxHp:5,dead:false,pattern:'Long-range chain lash'}
  ];
  const relationshipChallenge={x:500,y:690},princessQuestion={x:1080,y:470},boss={x:1380,y:820},key={x:1200,y:700};
  let x=470,y=520,hp=5,mode='map',walkDir='right',facingDir='right',walkPulse=0,kills=0,relationshipDone=false,puzzleSolved=false,keyCollected=false,inventory={},checkpoint='cemetery-entrance',target=null,isBoss=false,combatHp=0,combatMax=1,enemyAttackPhase=null,enemyTimer=null,combatRaf=0,projectiles=[],player={x:145,y:300,invuln:0,aimX:650,aimY:170},combatCheckpoint=null,bossRoomEntered=false,relationshipStep=0,relationshipRound=0,relationshipStart=0,relationshipDuration=2600,relationshipAnimating=false,relationshipRAF=0;
  let now=0,raf=0,lastMoveTime=0;
  const held={up:false,down:false,left:false,right:false};
  function setMoveKey(key,down){ if(mode!=='map') return; const k=(key||'').toLowerCase(); if(k==='arrowup'||k==='w')held.up=down; if(k==='arrowdown'||k==='s')held.down=down; if(k==='arrowleft'||k==='a')held.left=down; if(k==='arrowright'||k==='d')held.right=down; }
  function updateMovement(dt){
    if(mode!=='map')return;
    const speed=240;
    let dx=(held.right?1:0)-(held.left?1:0);
    let dy=(held.down?1:0)-(held.up?1:0);
    if(!dx&&!dy){walkPulse=0;return;}
    const len=Math.hypot(dx,dy)||1; dx=dx/len*speed*dt; dy=dy/len*speed*dt;
    const tryMove=(nx,ny)=>{
      if(blockedWorld(nx,ny,16))return false;
      if(Math.hypot(nx-boss.x,ny-boss.y)<68&&!unlockedBoss())return false;
      return true;
    };
    const nx=x+dx, ny=y+dy;
    let moved=false;
    if(tryMove(nx,y)){x=nx;moved=true;}
    if(tryMove(x,ny)){y=ny;moved=true;}
    if(moved){
      walkPulse=1;
      if(Math.abs(dx)>Math.abs(dy))facingDir=dx<0?'left':'right';
      walkDir=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');
      ui.dialogue.textContent='The cemetery is strangely peaceful. Somewhere nearby, a goth is probably plotting.';
    }
  }
  const W2C=(gx,gy)=>({x:gx,y:gy});
  function reveal(){/* v6: Level 1 is fully visible. */}
  function objectivesComplete(){return kills>=2&&relationshipDone&&puzzleSolved}
  function unlockedBoss(){return objectivesComplete()&&keyCollected}
  function stats(){ui.hpEl.textContent=hp;ui.gothEl.textContent=`${kills}/2`;ui.relEl.textContent=relationshipDone?'Solved':'Locked';ui.puzzleEl.textContent=puzzleSolved?'Answered':'Locked';ui.goalGoths.innerHTML=kills>=2?'<span class="good">✓ Defeat the required Zombie Goths</span>':`○ Defeat the required Zombie Goths (${kills}/2)`;ui.goalRel.innerHTML=relationshipDone?`<span class="good">✓ ${ACTIVITY_DATA.relationshipChallenge.name} complete</span>`:`○ Complete the ${ACTIVITY_DATA.relationshipChallenge.name} Challenge`;ui.goalPuzzle.innerHTML=puzzleSolved?'<span class="good">✓ Princess Question answered</span>':'○ Answer the Princess Question';ui.goalBoss.innerHTML=unlockedBoss()?'<span class="good">✓ Boss gate unlocked</span>':'<span class="locked">🔒 Boss gate locked</span>'}
  function drawMini(){
    mctx.clearRect(0,0,250,180);mctx.fillStyle='#0d0b11';mctx.fillRect(0,0,250,180);
    if(mapBackground.complete&&mapBackground.naturalWidth)mctx.drawImage(mapBackground,0,0,250,167);
    const marker=(px,py,c,r=4)=>{mctx.fillStyle=c;mctx.beginPath();mctx.arc(px/WORLD_W*250,py/WORLD_H*167,r,0,Math.PI*2);mctx.fill()};
    marker(x,y,'#fff',4);
    if(!relationshipDone)marker(relationshipChallenge.x,relationshipChallenge.y,'#ef91ac');
    if(!puzzleSolved)marker(princessQuestion.x,princessQuestion.y,'#9deaff');
    if(!enemies[0].dead)marker(enemies[0].x,enemies[0].y,'#ef91ac',4);
    if(!enemies[1].dead)marker(enemies[1].x,enemies[1].y,'#ef91ac',4);
    if(!keyCollected&&objectivesComplete())marker(key.x,key.y,'#f0cf8b',4);
    marker(boss.x,boss.y,unlockedBoss()?'#f0cf8b':'#8f7286',4);
  }
  function drawMarker(ctx,img,px,py,w=68,h=68,label=''){
    ctx.save();ctx.globalAlpha=.98;ctx.shadowColor='rgba(255,146,195,.55)';ctx.shadowBlur=14;
    if(img.complete&&img.naturalWidth)ctx.drawImage(img,px-w/2,py-h/2,w,h);else{ctx.fillStyle='#d9699d';ctx.beginPath();ctx.arc(px,py,26,0,Math.PI*2);ctx.fill()}
    if(label){ctx.shadowBlur=0;ctx.fillStyle='#fff3f8';ctx.font='700 16px Georgia';ctx.textAlign='center';ctx.fillText(label,px,py+h/2+20)}
    ctx.restore();
  }
  function drawWorld(t){
    const vw=ui.canvas.clientWidth||1000,vh=ui.canvas.clientHeight||600;
    const sx=ui.canvas.width/vw,sy=ui.canvas.height/vh;ctx.clearRect(0,0,ui.canvas.width,ui.canvas.height);ctx.save();ctx.scale(sx,sy);
    const zoom=1.24;
    const playerX=x,playerY=y,viewW=vw/zoom,viewH=vh/zoom;
    const camX=Math.max(viewW/2,Math.min(WORLD_W-viewW/2,playerX)),camY=Math.max(viewH/2,Math.min(WORLD_H-viewH/2,playerY));
    ctx.translate(vw/2-camX*zoom,vh/2-camY*zoom);ctx.scale(zoom,zoom);
    if(mapBackground.complete&&mapBackground.naturalWidth)ctx.drawImage(mapBackground,0,0,WORLD_W,WORLD_H);else{ctx.fillStyle='#1b1420';ctx.fillRect(0,0,WORLD_W,WORLD_H)}
    if(!enemies[0].dead)drawZombieSprite(ctx,enemies[0].x,enemies[0].y,'shambler',.84,t/1000,false);
    if(!enemies[1].dead)drawZombieSprite(ctx,enemies[1].x,enemies[1].y,'chain',.82,t/1000,false);
    if(!relationshipDone)drawMarker(ctx,relationshipChallengeIcon,relationshipChallenge.x,relationshipChallenge.y,84,84,'');
    if(!puzzleSolved)drawMarker(ctx,princessQuestionIcon,princessQuestion.x,princessQuestion.y,96,96,'');
    if(!keyCollected&&objectivesComplete()){
      ctx.save();ctx.translate(key.x,key.y);ctx.shadowColor='#ffe49b';ctx.shadowBlur=20;ctx.fillStyle='#f5d27e';ctx.beginPath();ctx.arc(0,0,10+Math.sin(t/180)*2,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff2c7';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(8,0);ctx.lineTo(30,0);ctx.lineTo(30,8);ctx.moveTo(20,0);ctx.lineTo(20,-7);ctx.stroke();ctx.restore();
    }
    drawOlly(ctx,playerX,playerY,.78,t/1000,true,facingDir,walkPulse>0);
    ctx.restore();
  }
  function canvasPointToWorld(e){
    const rect=ui.canvas.getBoundingClientRect(),vw=ui.canvas.clientWidth||1000,vh=ui.canvas.clientHeight||600;
    const zoom=1.24;
    const sx=(e.clientX-rect.left)*(vw/rect.width),sy=(e.clientY-rect.top)*(vh/rect.height),viewW=vw/zoom,viewH=vh/zoom;
    const camX=Math.max(viewW/2,Math.min(WORLD_W-viewW/2,x)),camY=Math.max(viewH/2,Math.min(WORLD_H-viewH/2,y));
    return {x:(sx-vw/2+camX*zoom)/zoom,y:(sy-vh/2+camY*zoom)/zoom};
  }
  function openEncounter(enemy){target=enemy;combatCheckpoint={x,y};mode='encounter';drawEncounter(enemy.type);ui.encounterName.textContent=enemy.name;ui.encounterText.innerHTML=enemy.type==='shambler'?'<strong>Zombie Goth:</strong> “Mmm... black eyeliner...”<br><br>She lunges toward you. Are you ready?':'<strong>Chain Goth:</strong> She slams her chain beside you and giggles mercilessly at your terrified expression.<br><br>Are you ready?';ui.encounter.classList.remove('hidden')}
  ui.canvas.addEventListener('pointerdown',e=>{
    if(mode!=='map')return;const pt=canvasPointToWorld(e);const near=(px,py,r)=>Math.hypot(pt.x-px,pt.y-py)<r;
    const enemyHit=enemies.find(z=>!z.dead&&near(z.x,z.y,70));if(enemyHit){openEncounter(enemyHit);return}
    if(!relationshipDone&&near(relationshipChallenge.x,relationshipChallenge.y,58)){startRelationship();return}
    if(!puzzleSolved&&near(princessQuestion.x,princessQuestion.y,58)){mode='puzzle';ui.puzzle.classList.remove('hidden');ui.puzzleFeedback.textContent='Choose wisely. The Goths have inexplicably made this a formal assessment.';return}
    if(objectivesComplete()&&!keyCollected&&near(key.x,key.y,55)){keyCollected=true;inventory.key=1;ui.dialogue.textContent='🔑 A little brass key drops onto the cobblestones. Finally, a sensible piece of game design.';stats();return}
    if(near(boss.x,boss.y,72)){if(unlockedBoss()){bossRoomEntered=true;mode='bossready';ui.bossReady.classList.remove('hidden')}else{ui.dialogue.textContent='🔒 The gate is still locked. Complete every challenge, then collect the key.'}return}
  });
  function move(dir){ setMoveKey(dir,true); setTimeout(()=>setMoveKey(dir,false),45); }
  function checkTriggers(){}
  function interact(){return}

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
      const state={version:3,savedAt:new Date().toISOString(),level:1,x,y,hp,kills,relationshipDone,puzzleSolved,keyCollected,inventory,checkpoint,enemies:enemies.map(e=>({dead:e.dead,hp:e.hp}))};
      localStorage.setItem(SAVE_KEY,JSON.stringify(state));
      ui.dialogue.textContent='💾 Game saved. The Goths will have to wait.';
      return true;
    }catch(err){console.error('Goodbye Goth save failed',err);return false;}
  }
  function loadGame(){
    const state=safeParseSave();
    if(!state || ![2,3].includes(state.version))return false;
    try{
      x=Number.isFinite(state.x)?Math.min(WORLD_W-40,Math.max(40,state.x)):x;
      y=Number.isFinite(state.y)?Math.min(WORLD_H-40,Math.max(40,state.y)):y;
      hp=Number.isFinite(state.hp)?state.hp:hp; kills=Number.isFinite(state.kills)?state.kills:kills;
      relationshipDone=!!state.relationshipDone; puzzleSolved=!!state.puzzleSolved; keyCollected=!!state.keyCollected; inventory=state.inventory&&typeof state.inventory==='object'?state.inventory:{}; checkpoint=state.checkpoint||'cemetery-entrance';
      if(Array.isArray(state.enemies)){state.enemies.forEach((saved,i)=>{if(enemies[i]){enemies[i].dead=!!saved.dead;if(Number.isFinite(saved.hp))enemies[i].hp=saved.hp;}})}
      mode='map'; target=null; bossRoomEntered=false;
      stats(); drawMini(); ui.dialogue.textContent='📂 Game loaded. Welcome back to the cemetery.'; return true;
    }catch(err){console.error('Goodbye Goth load failed',err);return false;}
  }
  function start(){stats();drawMini();cancelAnimationFrame(relationshipRAF);clearInterval(enemyTimer);cancelAnimationFrame(raf);const loop=t=>{const dt=Math.min(0.04,(t-(now||t))/1000);now=t;if(mode==='map')updateMovement(dt);if(walkPulse>0)walkPulse=0;drawWorld(t);drawMini();raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);requestAnimationFrame(combatTick)}
  function primaryAction(){if(mode==='encounter')startEncounterFight();else if(mode==='combat')combatAttack();else if(mode==='map')checkTriggers()}

  return {start,move,setMoveKey,primaryAction,interact,startEncounterFight,combatAttack,combatDodge,shootAtPointer,retryCombat,backToMap,completeRelationship,answerPuzzle,startBoss,saveGame,loadGame};
}
