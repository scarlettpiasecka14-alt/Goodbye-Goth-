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
    {x:445,y:315,type:'shambler',name:'GRAVEYARD SHAMBLER',hp:40,maxHp:40,dead:false,pattern:'Scratch + lunge / bite',damage:1,attackRange:118,speed:82},
    {x:1120,y:600,type:'chain',name:'CHAIN GOTH',hp:56,maxHp:56,dead:false,pattern:'Side swipe + overhead chain',damage:1,attackRange:260,speed:62}
  ];
  const relationshipChallenge={x:500,y:690},princessQuestion={x:1080,y:470},boss={x:1380,y:820},key={x:1200,y:700};
  let x=470,y=520,maxHp=5,hp=5,mode='map',walkDir='right',facingDir='right',walkPulse=0,kills=0,relationshipDone=false,puzzleSolved=false,keyCollected=false,inventory={},equippedWeapon='fists',checkpoint='cemetery-entrance',checkpointPos={x:470,y:520},target=null,isBoss=false,combatHp=0,combatMax=1,enemyAttackPhase=null,enemyTimer=null,combatRaf=0,combatLast=0,combatState='idle',combatCombo=0,comboWindowUntil=0,attackCooldownUntil=0,dodgeCooldownUntil=0,jumpUntil=0,jumpStart=0,combatKeyState={},combatOver=false,player={x:220,y:405,vx:0,vy:0,z:0,vz:0,invulnUntil:0,facing:'right',action:'idle',actionUntil:0,damageFlashUntil:0},enemyCombat={x:1110,y:405,z:0,state:'idle',stateUntil:0,attackKind:null,attackHitAt:0,lastThink:0},bossRoomEntered=false,relationshipStep=0,relationshipRound=0,relationshipStart=0,relationshipDuration=2600,relationshipAnimating=false,relationshipRAF=0;
  let now=0,raf=0,lastMoveTime=0;
  const held={up:false,down:false,left:false,right:false};
  function setMoveKey(key,down){ const k=(key||'').toLowerCase(); if(mode==='combat'){ if(k==='arrowup'||k==='w')combatKeyState.up=down; if(k==='arrowdown'||k==='s')combatKeyState.down=down; if(k==='arrowleft'||k==='a')combatKeyState.left=down; if(k==='arrowright'||k==='d')combatKeyState.right=down; return; } if(mode!=='map') return; if(k==='arrowup'||k==='w')held.up=down; if(k==='arrowdown'||k==='s')held.down=down; if(k==='arrowleft'||k==='a')held.left=down; if(k==='arrowright'||k==='d')held.right=down; }
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
  function renderInventory(){
    if(!ui.inventoryItems)return;
    const items=[
      ['🏹','Bow',Number(inventory.bow||0)],
      ['🏹','Arrows',Number(inventory.arrows||0)],
      ['🧪','HP Potion',Number(inventory.hpPotion||0)],
      ['🔑','Boss Key',Number(inventory.key||0)],
      ['♥','Max HP Upgrade',Number(inventory.maxHpUpgrade||0)]
    ];
    ui.inventoryItems.innerHTML=items.map(([icon,name,count])=>`<div class="inventory-row ${count?'has-item':''}"><span>${icon} ${name}</span><strong>${count}</strong></div>`).join('');
    ui.inventoryEquipped.textContent=`Equipped: ${equippedWeapon==='bow'?'BOW + ARROWS':'FISTS'}`;
    ui.inventoryToggle.textContent=equippedWeapon==='bow'?'Y • BOW EQUIPPED':'Y • INVENTORY';
    ui.inventoryToggle.setAttribute('aria-expanded',ui.inventoryPanel && !ui.inventoryPanel.classList.contains('hidden')?'true':'false');
  }
  function updateHpHud(){
    const pct=Math.max(0,Math.min(100,(hp/maxHp)*100));
    ui.hpEl.textContent=`${hp} / ${maxHp} HP`;
    if(ui.hpFill){ui.hpFill.style.width=pct+'%';ui.hpFill.parentElement?.parentElement?.setAttribute('data-low',hp<=Math.ceil(maxHp*.3)?'true':'false');}
  }
  function stats(){updateHpHud();renderInventory();ui.gothEl.textContent=`${kills}/2`;ui.relEl.textContent=relationshipDone?'Solved':'Locked';ui.puzzleEl.textContent=puzzleSolved?'Answered':'Locked';ui.checkpoint.textContent=checkpoint.replaceAll('-',' ').replace(/\b\w/g,m=>m.toUpperCase());ui.goalGoths.innerHTML=kills>=2?'<span class="good">✓ Defeat the required Zombie Goths</span>':`○ Defeat the required Zombie Goths (${kills}/2)`;ui.goalRel.innerHTML=relationshipDone?`<span class="good">✓ ${ACTIVITY_DATA.relationshipChallenge.name} complete</span>`:`○ Complete the ${ACTIVITY_DATA.relationshipChallenge.name} Challenge`;ui.goalPuzzle.innerHTML=puzzleSolved?'<span class="good">✓ Princess Question answered</span>':'○ Answer the Princess Question';ui.goalBoss.innerHTML=unlockedBoss()?'<span class="good">✓ Boss key used: gate unlocked</span>':objectivesComplete()?'<span class="locked">🔑 All objectives complete: find the boss key</span>':'<span class="locked">🔒 Boss gate locked</span>'}
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
    if(objectivesComplete()&&!keyCollected&&near(key.x,key.y,55)){keyCollected=true;inventory.key=1;checkpoint='boss-key-collected';checkpointPos={x,y};ui.dialogue.textContent='🔑 You found the boss key. The Queen gate can now be opened.';stats();saveGame();return}
    if(near(boss.x,boss.y,72)){if(unlockedBoss()){bossRoomEntered=true;mode='bossready';ui.bossReady.classList.remove('hidden')}else{ui.dialogue.textContent='🔒 The gate is still locked. Complete every challenge, then collect the key.'}return}
  });
  function move(dir){ setMoveKey(dir,true); setTimeout(()=>setMoveKey(dir,false),45); }
  function checkTriggers(){}
  function interact(){return}

function drawEncounter(type){
  ectx.imageSmoothingEnabled=true;ectx.imageSmoothingQuality='high';
  ectx.clearRect(0,0,720,300);const gg=ectx.createLinearGradient(0,0,0,300);gg.addColorStop(0,'#2e2436');gg.addColorStop(1,'#111016');ectx.fillStyle=gg;ectx.fillRect(0,0,720,300);for(let i=0;i<15;i++){ectx.fillStyle='#4d3b51';ectx.fillRect((i*61)%720,150+(i%4)*18,28,42)}drawOlly(ectx,180,245,.95,0,true);drawZombieSprite(ectx,520,235,type,.95,1.2,false);ectx.fillStyle='#f3e7ed';ectx.font='bold 18px Georgia';ectx.textAlign='center';ectx.fillText(type==='shambler'?'Mmm... black eyeliner...':'Mmm... accessories...',500,45)}

  function resetCombatVisual(){
    player={x:260,y:455,vx:0,vy:0,z:0,vz:0,invulnUntil:0,facing:'right',action:'idle',actionUntil:0,damageFlashUntil:0};
    combatKeyState={left:false,right:false,up:false,down:false};
    combatCombo=0; comboWindowUntil=0; attackCooldownUntil=0; dodgeCooldownUntil=0; jumpUntil=0; jumpStart=0; combatOver=false;
    const isChain=target?.type==='chain';
    enemyCombat={x:isChain?1130:1080,y:isChain?455:455,z:0,state:'idle',stateUntil:0,attackKind:null,attackHitAt:0,lastThink:performance.now(),nextAttackAt:performance.now()+800};
  }

  function combatBounds(){return {w:cctx.canvas.width,h:cctx.canvas.height};}
  function distCombat(){return Math.hypot(enemyCombat.x-player.x,enemyCombat.y-player.y);}
  function canAttackNow(){return mode==='combat'&&!combatOver&&performance.now()>=attackCooldownUntil;}
  function setAction(name,duration){player.action=name;player.actionUntil=performance.now()+duration;}
  function isAirborne(){return player.z>4;}

  function drawCombat(t){
    const w=cctx.canvas.width,h=cctx.canvas.height;
    cctx.clearRect(0,0,w,h);
    const bg=cctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#17101d');bg.addColorStop(.58,'#241827');bg.addColorStop(1,'#0e0a11');cctx.fillStyle=bg;cctx.fillRect(0,0,w,h);
    // Ground and depth markers keep the arena readable without making it feel like a spreadsheet.
    cctx.fillStyle='#2f2635';cctx.fillRect(0,h*.68,w,h*.32);
    cctx.strokeStyle='rgba(239,145,172,.08)';cctx.lineWidth=2;for(let i=0;i<12;i++){cctx.beginPath();cctx.moveTo(i*140,h*.68);cctx.lineTo(i*90+100,h);cctx.stroke()}
    cctx.fillStyle='#b8a7b5';cctx.font='700 15px system-ui';cctx.fillText('LEFT CLICK  PUNCH     SPACE  JUMP     RIGHT CLICK  DODGE',24,30);
    const now=performance.now();
    if(player.actionUntil<now&&player.z<=0)player.action='idle';
    // Telegraph
    if(enemyAttackPhase){
      cctx.save();cctx.setLineDash([16,10]);cctx.lineWidth=7;cctx.strokeStyle='#ef5d79';cctx.fillStyle='rgba(239,93,121,.10)';
      if(enemyAttackPhase.kind==='lunge'){
        cctx.beginPath();cctx.moveTo(enemyCombat.x,enemyCombat.y);cctx.lineTo(player.x,player.y);cctx.stroke();
        cctx.beginPath();cctx.arc(enemyCombat.x,enemyCombat.y,58,0,Math.PI*2);cctx.fill();cctx.stroke();
      } else if(enemyAttackPhase.kind==='scratch'){
        cctx.beginPath();cctx.arc(enemyCombat.x,enemyCombat.y,105,0,Math.PI*2);cctx.fill();cctx.stroke();
      } else if(enemyAttackPhase.kind==='side'){
        cctx.beginPath();cctx.moveTo(enemyCombat.x,enemyCombat.y-70);cctx.lineTo(enemyCombat.x+(target?.type==='chain'?-170:170),enemyCombat.y-10);cctx.stroke();
      } else if(enemyAttackPhase.kind==='overhead'){
        cctx.beginPath();cctx.moveTo(enemyCombat.x,enemyCombat.y-150);cctx.lineTo(enemyCombat.x,enemyCombat.y+85);cctx.stroke();
      }
      cctx.setLineDash([]);cctx.font='900 24px system-ui';cctx.textAlign='center';cctx.fillStyle='#ffd9e2';cctx.fillText('DODGE!',player.x,player.y-76);cctx.restore();
    }
    // Invulnerability flash
    if(player.invulnUntil>now){cctx.save();cctx.globalAlpha=.22;cctx.fillStyle='#9deaff';cctx.beginPath();cctx.arc(player.x,player.y-player.z,72,0,Math.PI*2);cctx.fill();cctx.restore()}
    // Shadow + characters. The existing single-portrait assets are intentionally used as fallbacks until pose assets are supplied.
    cctx.save();cctx.globalAlpha=.35;cctx.fillStyle='#000';cctx.beginPath();cctx.ellipse(player.x,h*.71,55,13,0,0,Math.PI*2);cctx.fill();cctx.beginPath();cctx.ellipse(enemyCombat.x,h*.71,68,14,0,0,Math.PI*2);cctx.fill();cctx.restore();
    drawCombatOlly(cctx,player.x,player.y-player.z,1.15,player.facing,player.action,now);
    drawCombatEnemy(cctx,enemyCombat.x,enemyCombat.y-enemyCombat.z,target?.type||'shambler',enemyCombat.state,now);
    // Enemy HP bar and labels are deliberately large.
    cctx.fillStyle='#f3e7ed';cctx.font='900 22px Georgia';cctx.textAlign='center';cctx.fillText(isBoss?'THE CLASSIC GOTH':(target?.name||'ZOMBIE GOTH'),enemyCombat.x,enemyCombat.y-150);
    cctx.fillStyle='#231824';cctx.fillRect(enemyCombat.x-170,enemyCombat.y-126,340,18);cctx.fillStyle='#ef91ac';cctx.fillRect(enemyCombat.x-170,enemyCombat.y-126,340*(combatHp/combatMax),18);
    cctx.textAlign='left';
  }

  function drawCombatOlly(c,px,py,s,dir,action,t){
    c.save();c.translate(px,py);
    if(player.damageFlashUntil>t)c.globalAlpha=.45;
    const bob=(action==='idle'?Math.sin(t/280)*2:0);
    c.translate(0,bob);
    const w=128*s,h=192*s;
    if(ollySprite.complete&&ollySprite.naturalWidth){
      c.save();c.scale(dir==='right'?1:-1,1);c.drawImage(ollySprite,-w/2,-160,w,h);c.restore();
    }else{c.fillStyle='#d98aa4';c.fillRect(-35,-110,70,110)}
    if(action==='punch1'||action==='punch2'||action==='punch3'||action==='airAttack'){
      c.strokeStyle='#f7c4d6';c.lineWidth=13;c.lineCap='round';const dirN=dir==='right'?1:-1;c.beginPath();c.moveTo(dirN*28,-88);c.lineTo(dirN*(82+(action==='punch3'?10:0)),-70+(action==='airAttack'?-18:0));c.stroke();
    }
    if(action==='dodge'){c.strokeStyle='rgba(239,145,172,.65)';c.lineWidth=4;c.beginPath();c.ellipse(0,-40,82,70,0,0,Math.PI*2);c.stroke()}
    c.restore();
  }

  function drawCombatEnemy(c,px,py,type,state,t){
    c.save();c.translate(px,py);
    const shake=state==='attack'?Math.sin(t/35)*4:0;c.translate(shake,0);
    const img=zombieSprites[type]||zombieSprites.shambler; if(img.complete&&img.naturalWidth){const w=150,h=225;c.drawImage(img,-w/2,-178,w,h)}
    if(state==='attack'){c.strokeStyle=type==='chain'?'#d0baa8':'#ef91ac';c.lineWidth=7;c.beginPath();c.arc(0,-45,78,0,Math.PI*2);c.stroke()}
    c.restore();
  }

  function startCombat(bossFight){
    // Classic Goth is intentionally not implemented in 6.0. The gate remains present, but the real boss is a later patch.
    if(bossFight){ui.dialogue.textContent='The Classic Goth arena is reserved for the next boss patch. Level 1 combat training is ready.';return;}
    isBoss=false;mode='combat';combatMax=target?.maxHp||40;combatHp=combatMax;resetCombatVisual();
    ui.combatName.textContent=target?.name||'ZOMBIE GOTH';
    ui.combatPattern.textContent=target?.type==='chain'?'Medium range • side swipe + overhead chain • jump over the overhead': 'Close range • scratch + lunge/bite • dodge the red warnings';
    ui.enemyHp.style.width='100%';ui.enemyHpText.textContent=`${combatHp} / ${combatMax}`;
    ui.combatStatus.innerHTML='<strong>HOW TO FIGHT:</strong> Move with WASD / arrows. FACE the Goth, then LEFT CLICK to punch. SPACE jumps. Left click while airborne = heavy attack. RIGHT CLICK dodges.';
    ui.combat.classList.remove('hidden');
    clearInterval(enemyTimer);cancelAnimationFrame(combatRaf);
    combatLast=performance.now();
    const loop=(t)=>{if(mode!=='combat')return;combatStep(Math.min(.033,(t-combatLast)/1000),t);combatLast=t;drawCombat(t);combatRaf=requestAnimationFrame(loop)};
    combatRaf=requestAnimationFrame(loop);
  }

  function combatMove(dt){
    const s=player.action==='dodge'?520:260;let dx=(combatKeyState.right?1:0)-(combatKeyState.left?1:0);let dy=(combatKeyState.down?1:0)-(combatKeyState.up?1:0);
    if(dx||dy){const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;player.x=Math.max(90,Math.min(cctx.canvas.width-90,player.x+dx*s*dt));player.y=Math.max(300,Math.min(cctx.canvas.height*.72,player.y+dy*s*dt));if(Math.abs(dx)>.15)player.facing=dx<0?'left':'right'}
  }

  function jump(){
    if(mode!=='combat'||performance.now()<jumpUntil||player.z>5)return;
    jumpStart=performance.now();jumpUntil=jumpStart+650;player.vz=520;setAction('jump',650);ui.combatStatus.textContent='⬆ JUMP! Left click in the air for a heavier hit.';
  }

  function doPunch(){
    if(!canAttackNow())return;
    const now=performance.now(), airborne=player.z>8;
    if(now>comboWindowUntil)combatCombo=0;
    combatCombo=(combatCombo%3)+1;
    const combo=combatCombo;
    const duration=combo===3?360:260;
    attackCooldownUntil=now+duration;
    comboWindowUntil=now+520;
    setAction(airborne?'airAttack':`punch${combo}`,duration);
    const dir=player.facing==='right'?1:-1;
    const dx=enemyCombat.x-player.x,dy=enemyCombat.y-player.y,range=airborne?145:112;
    const facingOk=dir*dx>8;
    const connected=Math.hypot(dx,dy)<range&&Math.abs(dy)<95&&facingOk;
    if(connected){
      const damage=airborne?(target?.type==='chain'?12:15):(target?.type==='chain'?8:10);
      combatHp=Math.max(0,combatHp-damage);
      ui.enemyHp.style.width=(combatHp/combatMax*100)+'%';ui.enemyHpText.textContent=`${combatHp} / ${combatMax}`;
      enemyCombat.state='hurt';enemyCombat.stateUntil=now+180;
      ui.combatStatus.textContent=`💥 ${airborne?'HEAVY ':'PUNCH '+combo+' • '}${damage} damage!`;
      if(combatHp<=0){combatOver=true;setTimeout(()=>endCombat(true),260)}
    }else{
      ui.combatStatus.textContent=airborne?'💨 Heavy attack missed.':'👊 Miss. Turn Olly to face the Goth before punching.';
    }
  }

  function combatAttack(){if(mode!=='combat')return; if(equippedWeapon==='bow'&&Number(inventory.arrows||0)>0){/* Bow arrives with a later reward patch. */} doPunch();}

  function combatDodge(){
    if(mode!=='combat'||performance.now()<dodgeCooldownUntil)return;
    const now=performance.now();dodgeCooldownUntil=now+850;player.invulnUntil=now+460;setAction('dodge',460);
    const dir=(combatKeyState.left?-1:combatKeyState.right?1:(player.facing==='right'?1:-1));player.x=Math.max(90,Math.min(cctx.canvas.width-90,player.x+dir*190));
    ui.combatStatus.textContent='↪ DODGE ROLL! You are invulnerable for a moment.';
  }

  function enemyThink(now){
    if(!target)return;const d=distCombat();const isChain=target.type==='chain';
    if(enemyCombat.state==='hurt'&&now<enemyCombat.stateUntil)return;
    if(enemyAttackPhase)return;
    // Approach until attack range.
    if(d>(isChain?255:115)){
      const speed=isChain?target.speed:target.speed;const dx=player.x-enemyCombat.x,dy=player.y-enemyCombat.y,l=Math.hypot(dx,dy)||1;enemyCombat.x+=dx/l*speed*(1/60);enemyCombat.y+=dy/l*speed*(1/60);enemyCombat.state='idle';return;
    }
    if(now<(enemyCombat.nextAttackAt||0))return;
    const kind=isChain?(Math.random()<.52?'side':'overhead'):(Math.random()<.56?'scratch':'lunge');
    const telegraph=kind==='scratch'?500:kind==='lunge'?700:820;
    enemyAttackPhase={kind,startedAt:now,hitAt:now+telegraph};enemyCombat.attackKind=kind;enemyCombat.state='telegraph';enemyCombat.stateUntil=now+telegraph;ui.combatStatus.textContent=kind==='scratch'?'⚠ SCRATCH INCOMING: back away or dodge!':kind==='lunge'?'⚠ LUNGE: dodge sideways!':kind==='side'?'⚠ CHAIN SWIPE: move away!':'⚠ OVERHEAD CHAIN: JUMP!';
  }

  function resolveEnemyAttack(now){
    if(!enemyAttackPhase||now<enemyAttackPhase.hitAt)return;
    const a=enemyAttackPhase;enemyAttackPhase=null;enemyCombat.state='attack';enemyCombat.stateUntil=now+240;
    const d=distCombat();let hit=false;
    if(now<player.invulnUntil)hit=false;
    else if(a.kind==='scratch')hit=d<125;
    else if(a.kind==='lunge')hit=d<150;
    else if(a.kind==='side')hit=Math.abs(player.y-enemyCombat.y)<95&&Math.abs(player.x-enemyCombat.x)<230;
    else if(a.kind==='overhead')hit=player.z<85&&Math.abs(player.x-enemyCombat.x)<92;
    if(hit){hp=Math.max(0,hp-(target?.damage||1));player.damageFlashUntil=now+220;stats();ui.combatStatus.textContent='💥 HIT! Dodge earlier next time.';if(hp<=0){endCombat(false);return}}else{ui.combatStatus.textContent=a.kind==='overhead'?'⬆ You cleared the overhead chain!':'↪ Clean dodge.'}
    const base=target?.type==='chain'?1050:1250;enemyCombat.nextAttackAt=now+base;
  }

  function combatStep(dt,now){
    if(mode!=='combat')return;
    combatMove(dt);
    if(player.z>0||player.vz){player.z+=player.vz*dt;player.vz-=1250*dt;if(player.z<=0){player.z=0;player.vz=0;if(player.action==='jump'||player.action==='airAttack')player.action='idle'}}
    enemyThink(now);resolveEnemyAttack(now);
  }

  function endCombat(won){
    clearInterval(enemyTimer);cancelAnimationFrame(combatRaf);ui.combat.classList.add('hidden');enemyAttackPhase=null;mode='map';
    if(won){
      if(target){target.dead=true;kills++;checkpointPos={x,y};checkpoint=target.type==='chain'?'chain-goth-defeated':'zombie-goth-defeated';target=null;hp=Math.max(1,hp);ui.dialogue.textContent=kills===1?'✅ Zombie Goth defeated. Your checkpoint is updated.':'✅ Both Level 1 Goth fights are complete. Now solve the two special challenges.';stats();saveGame();}
      return;
    }
    ui.deathText.textContent='A goth has dragged Olly off to a very embarrassing corner of the cemetery. You restart from your last completed objective.';ui.death.classList.remove('hidden');mode='dead';ui.retryCombat.disabled=true;setTimeout(()=>{ui.retryCombat.disabled=false},1150);
  }

  function retryCombat(){ui.death.classList.add('hidden');hp=maxHp;stats();x=checkpointPos.x;y=checkpointPos.y;mode='map';target=target||enemies.find(e=>!e.dead);setTimeout(()=>{if(target)startCombat(false)},250)}
  function backToMap(){ui.death.classList.add('hidden');hp=maxHp;stats();x=checkpointPos.x;y=checkpointPos.y;mode='map';ui.dialogue.textContent='You retreat to the last objective checkpoint.'}

  function confirmEncounter(){ui.encounter.classList.add('hidden');startCombat(false)}
  function closeEncounter(){ui.encounter.classList.add('hidden');target=null;mode='map'}
  function startEncounterFight(){confirmEncounter()}
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
        relationshipDone=true;checkpoint='relationship-complete';checkpointPos={x,y};mode='map';cancelAnimationFrame(relationshipRAF);ui.relationship.classList.add('hidden');saveGame();
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
      puzzleSolved=true;checkpoint='princess-question-complete';checkpointPos={x,y};
      mode='map';
      ui.puzzle.classList.add('hidden');
      saveGame();
      ui.dialogue.textContent=unlockedBoss()?'🧩 Correct. “Get your kit off, mate.” Against all odds, the rest of the requirements are also complete. The gate can now open.':'🧩 Correct. “Get your kit off, mate.” One objective down. The Goths are still guarding the exit, because apparently there are rules.';
      stats();
    }else{
      ui.puzzleFeedback.textContent='❌ Incorrect. The princess remains imprisoned, and somewhere a goth has just judged you.';
    }
  }
  function startBoss(){ui.bossReady.classList.add('hidden');ui.bossIntro.classList.add('hidden');target=null;combatCheckpoint={x,y};startCombat(true)}
  function toggleInventory(){
    if(mode==='combat' && Number(inventory.bow||0)>0){equippedWeapon=equippedWeapon==='bow'?'fists':'bow';ui.combatStatus.textContent=equippedWeapon==='bow'?'🏹 Bow equipped.':'👊 Fists equipped.';renderInventory();return;}
    if(ui.inventoryPanel){ui.inventoryPanel.classList.toggle('hidden');renderInventory();}
  }

  function saveGame(){
    try{
      const state={version:6,savedAt:new Date().toISOString(),level:1,x,y,hp,maxHp,kills,relationshipDone,puzzleSolved,keyCollected,inventory,equippedWeapon,checkpoint,checkpointPos,enemies:enemies.map(e=>({dead:e.dead,hp:e.hp}))};
      localStorage.setItem(SAVE_KEY,JSON.stringify(state));
      ui.dialogue.textContent='💾 Game saved. Inventory, health upgrades and the boss key are persistent.';
      return true;
    }catch(err){console.error('Goodbye Goth save failed',err);return false;}
  }
  function loadGame(){
    const state=safeParseSave();
    if(!state || ![3,4,5,6].includes(state.version))return false;
    try{
      x=Number.isFinite(state.x)?Math.min(WORLD_W-40,Math.max(40,state.x)):x;
      y=Number.isFinite(state.y)?Math.min(WORLD_H-40,Math.max(40,state.y)):y;
      maxHp=Number.isFinite(state.maxHp)?Math.max(5,state.maxHp):maxHp;
      hp=Number.isFinite(state.hp)?Math.max(0,Math.min(maxHp,state.hp)):maxHp;
      kills=Number.isFinite(state.kills)?state.kills:kills;
      relationshipDone=!!state.relationshipDone;puzzleSolved=!!state.puzzleSolved;keyCollected=!!state.keyCollected;
      inventory=state.inventory&&typeof state.inventory==='object'?state.inventory:{};
      equippedWeapon=state.equippedWeapon==='bow'&&Number(inventory.bow||0)>0?'bow':'fists';
      checkpoint=state.checkpoint||'cemetery-entrance';checkpointPos=state.checkpointPos&&Number.isFinite(state.checkpointPos.x)&&Number.isFinite(state.checkpointPos.y)?state.checkpointPos:{x,y};
      if(Array.isArray(state.enemies)){state.enemies.forEach((saved,i)=>{if(enemies[i]){enemies[i].dead=!!saved.dead;if(Number.isFinite(saved.hp))enemies[i].hp=saved.hp;}})}
      mode='map';target=null;bossRoomEntered=false;stats();drawMini();ui.dialogue.textContent='📂 Game loaded. Your inventory and objective progress are intact.';return true;
    }catch(err){console.error('Goodbye Goth load failed',err);return false;}
  }
  function start(){stats();drawMini();cancelAnimationFrame(relationshipRAF);clearInterval(enemyTimer);cancelAnimationFrame(raf);const loop=t=>{const dt=Math.min(0.04,(t-(now||t))/1000);now=t;if(mode==='map')updateMovement(dt);if(walkPulse>0)walkPulse=0;drawWorld(t);drawMini();raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);requestAnimationFrame(combatTick)}
  function primaryAction(){if(mode==='encounter')startEncounterFight();else if(mode==='combat')jump();else if(mode==='map')checkTriggers()}

  return {start,move,setMoveKey,primaryAction,interact,confirmEncounter,closeEncounter,startEncounterFight,combatAttack,combatDodge,retryCombat,backToMap,completeRelationship,answerPuzzle,startBoss,saveGame,loadGame,toggleInventory};
}
