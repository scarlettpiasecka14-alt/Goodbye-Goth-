
const MAP = [
  "#########################",
  "######....###############",
  "######....###############",
  "##........######....#####",
  "##........######....#####",
  "##........######....#####",
  "##..................#####",
  "##........######....#####",
  "##........######....#####",
  "##########.....##########",
  "##########.....##########",
  "##########...........####",
  "##########...........####",
  "#########################",
  "#########################"
];

const TILE=40, COLS=25, ROWS=15;
const isFloor=(x,y)=>x>=0&&y>=0&&x<COLS&&y<ROWS&&MAP[y][x]===".";
const md=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);

function drawCemetery(c,w,h){
  const g=c.createLinearGradient(0,0,0,h);
  g.addColorStop(0,"#33253a");g.addColorStop(1,"#0d0b10");
  c.fillStyle=g;c.fillRect(0,0,w,h);
  c.fillStyle="#eee9df";c.beginPath();c.arc(w*.78,h*.16,38,0,Math.PI*2);c.fill();
  c.fillStyle="#17131b";c.fillRect(0,h*.72,w,h*.28);
  c.strokeStyle="#4b3c51";c.lineWidth=2;
  for(let i=0;i<18;i++){const xx=(i*71)%w,yy=70+(i*43)%225;c.beginPath();c.moveTo(xx,yy);c.lineTo(xx+5,yy+60);c.stroke()}
  for(let i=0;i<13;i++){const xx=18+i*78,yy=h*.62-(i%3)*24;c.fillStyle="#5a5260";c.fillRect(xx,yy,30,54);c.beginPath();c.arc(xx+15,yy,15,Math.PI,0);c.fill()}
  c.fillStyle="#d394b1";for(let i=0;i<20;i++){const xx=20+(i*89)%w,yy=h*.66+(i%4)*13;c.beginPath();c.arc(xx,yy,3,0,Math.PI*2);c.fill()}
}

function drawOlly(c,x,y,scale=.6,t=0,pose="back"){
  c.save();const cx=x*TILE+20,cy=y*TILE+34+Math.sin(t*7)*1.2;c.translate(cx,cy);
  if(pose==="back"){
    c.fillStyle="#2c231f";c.beginPath();c.ellipse(0,-34*scale,23*scale,24*scale,0,0,Math.PI*2);c.fill();
    c.fillStyle="#dbe0e7";c.fillRect(-17*scale,-12*scale,34*scale,27*scale);
    c.fillStyle="#25212a";c.fillRect(-14*scale,15*scale,28*scale,17*scale);
    c.strokeStyle="#101015";c.lineWidth=4*scale;c.beginPath();c.moveTo(-8*scale,32*scale);c.lineTo(-9*scale,48*scale);c.moveTo(8*scale,32*scale);c.lineTo(9*scale,48*scale);c.stroke();
    c.fillStyle="#fff";c.fillRect(-17*scale,48*scale,11*scale,5*scale);c.fillRect(6*scale,48*scale,11*scale,5*scale);
    c.strokeStyle="#b68c6a";c.lineWidth=2*scale;c.beginPath();c.moveTo(13*scale,-1*scale);c.lineTo(28*scale,-15*scale);c.stroke();
  }else{
    c.fillStyle="#2c231f";c.beginPath();c.ellipse(0,-38*scale,24*scale,25*scale,0,Math.PI,Math.PI*2);c.fill();
    c.fillStyle="#d9b59d";c.beginPath();c.arc(0,-33*scale,14*scale,0,Math.PI*2);c.fill();
    c.fillStyle="#dbe0e7";c.fillRect(-18*scale,-18*scale,36*scale,29*scale);
    c.fillStyle="#25212a";c.fillRect(-15*scale,12*scale,30*scale,18*scale);
    c.strokeStyle="#111";c.lineWidth=4*scale;c.beginPath();c.moveTo(-9*scale,29*scale);c.lineTo(-10*scale,47*scale);c.moveTo(9*scale,29*scale);c.lineTo(10*scale,47*scale);c.stroke();
  }
  c.restore();
}

function drawZombie(c,x,y,type,t,attack=false){
  c.save();const cx=x*TILE+20,cy=y*TILE+32+Math.sin(t*6)*1.8;c.translate(cx,cy);
  if(type==="shambler"){
    c.fillStyle="#09080e";c.beginPath();c.ellipse(0,-36,21,30,0,0,Math.PI*2);c.fill();
    c.fillStyle="#a98692";c.beginPath();c.arc(0,-31,13,0,Math.PI*2);c.fill();
    c.fillStyle="#28212d";c.beginPath();c.moveTo(-15,-17);c.lineTo(-27,40);c.lineTo(27,40);c.lineTo(15,-17);c.closePath();c.fill();
  }else if(type==="chain"){
    c.fillStyle="#0b0910";c.beginPath();c.ellipse(0,-37,23,32,0,0,Math.PI*2);c.fill();
    c.fillStyle="#bc9aaa";c.beginPath();c.arc(0,-31,12,0,Math.PI*2);c.fill();
    c.fillStyle="#342838";c.fillRect(-15,-16,30,44);
    c.strokeStyle="#b494a7";c.lineWidth=3;c.beginPath();c.moveTo(18,0);c.lineTo(38,9);c.stroke();
  }
  if(attack){c.strokeStyle="#ef91ac";c.lineWidth=3;c.beginPath();c.arc(0,-8,35,0,Math.PI*2);c.stroke()}
  c.restore();
}

function drawClassicBoss(c,x,y,s=1,t=0,attack=false){
  c.save();const cx=x*TILE+20,cy=y*TILE+30+Math.sin(t*4)*1.2;c.translate(cx,cy);
  c.fillStyle="#07060a";c.beginPath();c.ellipse(0,-35*s,29*s,42*s,0,0,Math.PI*2);c.fill();
  c.fillStyle="#dfc1b8";c.beginPath();c.arc(0,-33*s,16*s,0,Math.PI*2);c.fill();
  c.fillStyle="#171019";c.beginPath();c.moveTo(-18*s,-14*s);c.lineTo(-30*s,48*s);c.lineTo(30*s,48*s);c.lineTo(18*s,-14*s);c.closePath();c.fill();
  c.strokeStyle="#caa2c1";c.lineWidth=2*s;c.beginPath();c.arc(0,-33*s,17*s,0,Math.PI*2);c.stroke();
  if(attack){c.strokeStyle="#ef91ac";c.lineWidth=4*s;c.beginPath();c.arc(0,-4*s,46*s,0,Math.PI*2);c.stroke()}
  c.restore();
}

export function createLevel1(ui){
  const ctx=ui.canvas.getContext("2d"), cctx=ui.combatCanvas.getContext("2d");
  const revealed=Array.from({length:ROWS},()=>Array(COLS).fill(false));

  const enemies=[
    {x:8,y:6,type:"shambler",name:"GRAVEYARD SHAMBLER",hp:4,maxHp:4,dead:false,
     pattern:"slow lunge",description:"Slow, close-range, but deceptively hard to dodge."},
    {x:17,y:5,type:"chain",name:"CHAIN ZOMBIE",hp:5,maxHp:5,dead:false,
     pattern:"chain lash",description:"Keeps its distance and lashes out in a wider arc."}
  ];
  const relationship={x:4,y:7};
  const puzzle={x:13,y:12};
  const boss={x:20,y:11};

  let x=3,y=6,hp=5,kills=0,relationshipDone=false,puzzleSolved=false,mode="map";
  let target=null,isBoss=false,combatHp=0,combatMax=1,attackLocked=false,dodgeUntil=0,lastEnemyAttack=0;
  let enemyLoop=0, raf=0, now=0, relationshipStep=0;

  function reveal(){
    for(let yy=0;yy<ROWS;yy++)for(let xx=0;xx<COLS;xx++)
      if(Math.hypot(xx-x,yy-y)<=3.6)revealed[yy][xx]=true;
  }

  function stats(){
    ui.hpEl.textContent=hp;
    ui.gothEl.textContent=`${kills}/2`;
    ui.relEl.textContent=relationshipDone?"Done":"Locked";
    ui.puzzleEl.textContent=puzzleSolved?"Solved":"Locked";
    ui.goalGoths.innerHTML=kills>=2?'<span class="good">✓ Defeat the required Zombie Goths</span>':`○ Defeat the required Zombie Goths (${kills}/2)`;
    ui.goalRel.innerHTML=relationshipDone?'<span class="good">✓ Complete the Relationship Challenge</span>':'○ Complete the Relationship Challenge';
    ui.goalPuzzle.innerHTML=puzzleSolved?'<span class="good">✓ Solve the Puzzle</span>':'○ Solve the Puzzle';
    const unlocked=kills>=2&&relationshipDone&&puzzleSolved;
    ui.goalBoss.innerHTML=unlocked?'<span class="good">✓ Boss gate unlocked</span>':'<span class="locked">🔒 Boss gate locked</span>';
  }

  function drawWorld(t){
    drawCemetery(ctx,1000,600);
    for(let yy=0;yy<ROWS;yy++)for(let xx=0;xx<COLS;xx++){
      if(!revealed[yy][xx]){ctx.fillStyle="#060509";ctx.fillRect(xx*TILE,yy*TILE,TILE,TILE);continue}
      ctx.fillStyle=isFloor(xx,yy)?"#302a35":"#131017";ctx.fillRect(xx*TILE,yy*TILE,TILE,TILE);
      if(isFloor(xx,yy)){ctx.strokeStyle="#514655";ctx.strokeRect(xx*TILE+.5,yy*TILE+.5,TILE-1,TILE-1)}
    }
    enemies.forEach(e=>{if(!e.dead&&revealed[e.y][e.x])drawZombie(ctx,e.x,e.y,e.type,t/1000)});
    if(!relationshipDone&&revealed[relationship.y][relationship.x]){ctx.fillStyle="#ef91ac";ctx.font="25px system-ui";ctx.textAlign="center";ctx.fillText("♥",relationship.x*TILE+20,relationship.y*TILE+30)}
    if(!puzzleSolved&&revealed[puzzle.y][puzzle.x]){ctx.fillStyle="#e6c4d4";ctx.font="25px system-ui";ctx.textAlign="center";ctx.fillText("✣",puzzle.x*TILE+20,puzzle.y*TILE+30)}
    const bossUnlocked=kills>=2&&relationshipDone&&puzzleSolved;
    if(bossUnlocked&&revealed[boss.y][boss.x]){ctx.fillStyle="#f0d08b";ctx.font="25px system-ui";ctx.textAlign="center";ctx.fillText("♛",boss.x*TILE+20,boss.y*TILE+30)}
    drawOlly(ctx,x,y,.55,t/1000);
  }

  function drawCombat(isBoss=false,enemyAttack=false,hit=false){
    const g=cctx.createLinearGradient(0,0,0,300);g.addColorStop(0,"#312239");g.addColorStop(1,"#0f0c12");
    cctx.fillStyle=g;cctx.fillRect(0,0,700,300);cctx.fillStyle="#16121a";cctx.fillRect(0,235,700,65);
    drawOlly(cctx,4.3,5.6,.96,now/1000,"front");
    if(isBoss)drawClassicBoss(cctx,12.4,5.1,1.18,now/1000,enemyAttack);
    else drawZombie(cctx,12.4,5.1,target?.type||"shambler",now/1000,enemyAttack);
    if(enemyAttack){cctx.strokeStyle="#ef91ac";cctx.lineWidth=4;cctx.strokeRect(275,10,150,36);cctx.fillStyle="#f2d8e3";cctx.font="bold 16px Georgia";cctx.textAlign="center";cctx.fillText("⚠ INCOMING",350,34)}
  }

  function startLoop(){
    cancelAnimationFrame(raf);
    const loop=t=>{now=t;drawWorld(t);raf=requestAnimationFrame(loop)};
    raf=requestAnimationFrame(loop);
  }

  function checkTriggers(){
    if(mode!=="map")return;
    const enemy=enemies.find(e=>!e.dead&&md({x,y},e)<=0);
    if(enemy){
      target=enemy;mode="encounter";
      ui.encounterImage.src=enemy.id===1?"assets/story/classic-goth.png":"assets/story/classic-goth-fight.png";
      ui.encounterName.textContent=enemy.name;
      ui.encounterText.innerHTML=
        enemy.id===1
        ? `<strong>Zombie Goth:</strong> “Mmm... black eyeliner...”<br><br>She shambles toward you. Slowly. Unfortunately, very purposefully.`
        : `<strong>Zombie Goth:</strong> “Mmm... accessories...”<br><br>She twirls a chain. That seems like a problem.`;
      ui.encounter.classList.remove("hidden");
      return;
    }
    if(!relationshipDone&&md({x,y},relationship)<=0){mode="relationship";relationshipStep=0;ui.relationship.classList.remove("hidden");ui.wouldFeedback.textContent="";ui.wouldDisplay.textContent="“Would you...”";return}
    if(kills>=2&&!puzzleSolved&&md({x,y},puzzle)<=0){mode="puzzle";ui.puzzle.classList.remove("hidden");return}
    if(kills>=2&&relationshipDone&&puzzleSolved&&md({x,y},boss)<=0){mode="bossintro";ui.bossIntro.classList.remove("hidden");return}
  }

  function move(dir){
    if(mode!=="map")return;
    const dx=dir==="left"?-1:dir==="right"?1:0;
    const dy=dir==="up"?-1:dir==="down"?1:0;
    const nx=x+dx,ny=y+dy;
    if(!isFloor(nx,ny))return;
    // Required progression gates keep the route but never block a corridor that doesn't need gating.
    if(nx===11&&y===6&&kills<1)return;
    if(nx===15&&y===6&&kills<2)return;
    x=nx;y=ny;reveal();ui.dialogue.textContent="The cemetery reveals more of the path...";checkTriggers();stats();
  }

  function startEncounterFight(){
    ui.encounter.classList.add("hidden");
    beginCombat(false);
  }

  function beginCombat(bossFight){
    mode="combat";isBoss=bossFight;
    combatMax=bossFight?12:(target?.maxHp||4);combatHp=combatMax;attackLocked=false;dodgeUntil=0;lastEnemyAttack=performance.now();
    ui.combatName.textContent=bossFight?"THE CLASSIC GOTH • QUEEN":"ZOMBIE GOTH";
    ui.combatPattern.textContent=bossFight?"Phase attacks • 12 HP":"Different zombie patterns • dodge to survive";
    ui.combatHp.style.width="100%";
    ui.combatStatus.textContent=bossFight?"The Queen watches you. This is not a normal goth.":"Watch the warning, dodge, then fire.";
    ui.combat.classList.remove("hidden");
    clearInterval(enemyLoop);
    enemyLoop=setInterval(enemyTurn,900);
    snapshotCombat();
  }

  function snapshotCombat(){ui.combatHp.style.width=`${Math.max(0,combatHp/combatMax*100)}%`;stats();}

  function enemyTurn(){
    if(mode!=="combat")return;
    const warning=isBoss?"She raises her hand. The room darkens.":"The zombie goth tenses. Incoming attack.";
    ui.combatStatus.textContent=warning;
    drawCombat(isBoss,true,false);
    setTimeout(()=>{
      if(mode!=="combat")return;
      if(performance.now()>dodgeUntil){
        hp=Math.max(0,hp-1);
        ui.combatStatus.textContent=isBoss?"💥 The Classic Goth hit you.":"💥 Zombie Goth hit you.";
        drawCombat(isBoss,false,true);
        if(hp<=0){endCombat(false);return}
      }else{
        ui.combatStatus.textContent="↪ Dodged. Now fire an arrow.";
      }
      lastEnemyAttack=performance.now();snapshotCombat();
    },330);
  }

  function combatAttack(){
    if(mode!=="combat"||attackLocked)return;
    // More responsive than a pure random check: attacking immediately after a dodge is the best time.
    attackLocked=true;
    const bonus=performance.now()-dodgeUntil<250;
    const chance=bonus?0.96:0.84;
    drawCombat(isBoss,false,false);
    setTimeout(()=>{attackLocked=false},360);
    if(Math.random()<chance){
      combatHp=Math.max(0,combatHp-1);
      ui.combatStatus.textContent=bonus?"🎯 Perfect timing! Arrow hits hard.":"🏹 Arrow hit!";
      snapshotCombat();
      if(combatHp<=0)setTimeout(()=>endCombat(true),220);
    }else{
      ui.combatStatus.textContent="Miss! The next attack is already coming.";
    }
  }

  function combatDodge(){
    if(mode!=="combat")return;
    dodgeUntil=performance.now()+720;
    ui.combatStatus.textContent="↪ Dodge window active.";
    drawCombat(isBoss,false,false);
  }

  function endCombat(won){
    clearInterval(enemyLoop);ui.combat.classList.add("hidden");
    if(!won){
      hp=5;x=3;y=6;mode="map";reveal();ui.dialogue.textContent="Olly gets knocked out and wakes at the cemetery entrance. Try again.";
      snapshotCombat();return;
    }
    if(!isBoss&&target){
      target.dead=true;kills++;target=null;mode="map";
      ui.dialogue.textContent=kills===1?"✅ First Zombie Goth defeated. The route deeper into the cemetery opens.":"✅ Both Zombie Goths defeated. Now complete the two special events.";
    }else{
      mode="win";ui.win.classList.remove("hidden");
    }
    snapshotCombat();
  }

  function completeRelationship(){
    if(mode!=="relationship")return;
    relationshipStep++;
    const lines=[
      "“Would you...”",
      "“Would you... um...”",
      "“Would you... actually never mind.”"
    ];
    if(relationshipStep<3){
      ui.wouldDisplay.textContent=lines[relationshipStep];
      ui.wouldFeedback.textContent="You both start laughing.";
      return;
    }
    relationshipDone=true;mode="map";ui.relationship.classList.add("hidden");ui.dialogue.textContent="💕 Relationship Challenge complete. The cemetery approves.";stats();
  }

  function answerPuzzle(answer){
    if(mode!=="puzzle")return;
    if(answer==="correct"){
      puzzleSolved=true;mode="map";ui.puzzle.classList.add("hidden");ui.dialogue.textContent="🧩 CORRECT. Princess etiquette level: absolutely appalling. The boss gate is unlocked.";stats();
    }else ui.puzzleFeedback.textContent="❌ Wrong. Even the graveyard is disappointed in you.";
  }

  function startBoss(){ui.bossIntro.classList.add("hidden");target=null;beginCombat(true)}
  function interact(){checkTriggers()}
  function primaryAction(){if(mode==="encounter")startEncounterFight();else if(mode==="combat")combatAttack();else if(mode==="map")checkTriggers()}

  function start(){reveal();stats();startLoop();ui.canvas.focus()}
  return {start,move,primaryAction,interact,startEncounterFight,combatAttack,combatDodge,completeRelationship,answerPuzzle,startBoss};
}
