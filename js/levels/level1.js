const MAP = [
  "#########################",
  "#########################",
  "#########################",
  "###############.....#####",
  "###############.....#####",
  "##.....#######.....######",
  "##.....#######.....######",
  "##.................######",
  "##.....#######.....######",
  "##.....#######.....######",
  "##########.....##########",
  "##########...........####",
  "##########.....#.....####",
  "#########################",
  "#########################"
];

const TILE = 40;
const ROWS = MAP.length;
const COLS = MAP[0].length;

function isFloor(x, y) {
  return x >= 0 && y >= 0 && x < COLS && y < ROWS && MAP[y][x] === ".";
}

function rectDistance(ax, ay, bx, by) {
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

function drawOlly(ctx, x, y, scale=0.62, t=0, attack=false, hurt=false) {
  ctx.save();
  ctx.translate(x * TILE + 20, y * TILE + 34 + (Math.sin(t * 7) * 1.4));
  if (hurt) ctx.translate((Math.random() - .5) * 5, 0);
  ctx.fillStyle = "#2d241f";
  ctx.beginPath(); ctx.ellipse(0, -38*scale, 25*scale, 25*scale, 0, Math.PI, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#d9b59d";
  ctx.beginPath(); ctx.arc(0, -33*scale, 15*scale, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#dfe4ea";
  ctx.fillRect(-18*scale, -18*scale, 36*scale, 31*scale);
  ctx.fillStyle = "#26222a";
  ctx.fillRect(-15*scale, 13*scale, 30*scale, 19*scale);
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 4*scale;
  ctx.beginPath();
  ctx.moveTo(-9*scale, 31*scale); ctx.lineTo(-10*scale, 49*scale);
  ctx.moveTo(9*scale, 31*scale); ctx.lineTo(10*scale, 49*scale);
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.fillRect(-18*scale, 48*scale, 12*scale, 5*scale);
  ctx.fillRect(6*scale, 48*scale, 12*scale, 5*scale);
  if (attack) {
    ctx.strokeStyle = "#f1edf4";
    ctx.lineWidth = 4*scale;
    ctx.beginPath(); ctx.moveTo(17*scale, 2*scale); ctx.lineTo(43*scale, -15*scale); ctx.stroke();
  }
  ctx.restore();
}

function drawGoth(ctx, x, y, scale=.6, t=0, attack=false, elite=false) {
  ctx.save();
  ctx.translate(x * TILE + 20, y * TILE + 31 + Math.sin(t * 5) * 1.8);
  ctx.fillStyle = "#07060a";
  ctx.beginPath(); ctx.ellipse(0, -38*scale, 25*scale, 38*scale, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#e1c3b8";
  ctx.beginPath(); ctx.arc(0, -35*scale, 14*scale, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = elite ? "#47304b" : "#332938";
  ctx.beginPath();
  ctx.moveTo(-17*scale, -16*scale); ctx.lineTo(-28*scale, 48*scale); ctx.lineTo(28*scale, 48*scale); ctx.lineTo(17*scale, -16*scale); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#151019";
  ctx.fillRect(-13*scale, -18*scale, 26*scale, 30*scale);
  ctx.fillStyle = "#d5b2cf";
  ctx.font = `${10*scale}px serif`; ctx.textAlign="center"; ctx.fillText("☾",0,2*scale);
  if (attack) {
    ctx.strokeStyle = "#e7d8ea"; ctx.lineWidth=4*scale;
    ctx.beginPath(); ctx.moveTo(19*scale, 2*scale); ctx.lineTo(42*scale, -18*scale); ctx.stroke();
  }
  ctx.restore();
}

export function createLevel1(ui) {
  const ctx = ui.canvas.getContext("2d");
  const cctx = ui.combatCanvas.getContext("2d");

  const revealed = Array.from({length: ROWS}, () => Array(COLS).fill(false));
  const enemies = [
    {x: 8, y: 7, hp: 3, maxHp: 3, dead: false, id: 1},
    {x: 16, y: 5, hp: 3, maxHp: 3, dead: false, id: 2},
  ];
  const puzzle = {x: 13, y: 12};
  const boss = {x: 20, y: 11};

  let x=3, y=7, hp=5, kills=0, puzzleSolved=false, mode="map";
  let combatEnemy=null, combatHp=0, combatMax=1, lastEnemyAttack=0, attackLocked=false, dodgeUntil=0;
  let raf=0, lastTime=performance.now();

  function snapshot() {
    ui.onUpdate?.({hp, maxHp:5, gothsDefeated:kills, puzzleSolved, phase:mode});
    ui.hpEl.textContent = hp;
    ui.killsEl.textContent = kills;
    ui.puzzleEl.textContent = puzzleSolved ? "Solved" : "Locked";
  }

  function reveal() {
    for(let yy=0;yy<ROWS;yy++) for(let xx=0;xx<COLS;xx++) {
      if (Math.hypot(xx-x, yy-y) <= 3.3) revealed[yy][xx] = true;
    }
  }

  function drawWorld(now) {
    ctx.clearRect(0,0,1000,600);
    const grad=ctx.createLinearGradient(0,0,0,600);
    grad.addColorStop(0,"#302238"); grad.addColorStop(1,"#111016");
    ctx.fillStyle=grad; ctx.fillRect(0,0,1000,600);
    ctx.fillStyle="#eee9df"; ctx.beginPath(); ctx.arc(790,90,38,0,Math.PI*2); ctx.fill();

    for(let yy=0;yy<ROWS;yy++) for(let xx=0;xx<COLS;xx++) {
      const visible=revealed[yy][xx];
      ctx.fillStyle = visible ? (isFloor(xx,yy) ? "#3b3340" : "#09080d") : "#07070a";
      ctx.fillRect(xx*TILE, yy*TILE, TILE, TILE);
      if (visible && isFloor(xx,yy)) {
        ctx.strokeStyle="#55485a"; ctx.strokeRect(xx*TILE+.5,yy*TILE+.5,TILE-1,TILE-1);
      }
    }

    // Cemetery decoration
    ctx.fillStyle="#554b57";
    for(let i=0;i<11;i++) {
      const xx=(i*97)%900, yy=250+(i%4)*40;
      if(revealed[Math.min(ROWS-1,Math.floor(yy/TILE))]?.[Math.floor(xx/TILE)]) {
        ctx.fillRect(xx,yy,24,35); ctx.beginPath();ctx.arc(xx+12,yy,12,Math.PI,0);ctx.fill();
      }
    }

    enemies.forEach(e => { if(!e.dead && revealed[e.y][e.x]) drawGoth(ctx,e.x,e.y,.55,now/1000); });
    if (!puzzleSolved && revealed[puzzle.y][puzzle.x]) {
      ctx.font="28px serif"; ctx.textAlign="center"; ctx.fillStyle="#e9b8d0";
      ctx.fillText("✣", puzzle.x*TILE+20, puzzle.y*TILE+30);
    }
    if (puzzleSolved && revealed[boss.y][boss.x]) {
      ctx.font="27px serif"; ctx.textAlign="center"; ctx.fillStyle="#f1d5e4";
      ctx.fillText("♛", boss.x*TILE+20, boss.y*TILE+30);
    }
    drawOlly(ctx,x,y,.55,now/1000);
  }

  function frame(now) {
    drawWorld(now);
    raf=requestAnimationFrame(frame);
  }

  function move(dir) {
    if (mode !== "map") return;
    const dx = dir==="left" ? -1 : dir==="right" ? 1 : 0;
    const dy = dir==="up" ? -1 : dir==="down" ? 1 : 0;
    const nx=x+dx, ny=y+dy;
    if (!isFloor(nx,ny)) return;
    x=nx; y=ny; reveal();
    ui.dialogue.textContent="The cemetery reveals more of the path...";
    checkTriggers();
  }

  function checkTriggers() {
    if (mode !== "map") return;
    const e=enemies.find(z=>!z.dead && rectDistance(x,y,z.x,z.y)<=1);
    if (e) {
      combatEnemy=e; mode="encounter";
      ui.encounterImage.src="assets/story/classic-goth.png";
      ui.encounterName.textContent=e.id===1 ? "THE CLASSIC GOTH" : "ANOTHER CLASSIC GOTH";
      ui.encounterText.innerHTML=e.id===1
        ? "<strong>Goth:</strong> “Do you hate the sun?”<br><strong>Olly:</strong> “A bit.”<br><br>She draws a blade. That seems less promising."
        : "<strong>Goth:</strong> “You are interrupting my atmosphere.”<br><strong>Olly:</strong> “Sorry.”<br><br>She attacks anyway.";
      ui.encounterEl.classList.remove("hidden");
    } else if (kills>=2 && !puzzleSolved && rectDistance(x,y,puzzle.x,puzzle.y)<=1) {
      mode="puzzle"; ui.puzzleOverlay.classList.remove("hidden");
    } else if (puzzleSolved && !ui.bossIntro.classList.contains("hidden")===false && rectDistance(x,y,boss.x,boss.y)<=1) {
      mode="bossintro"; ui.bossIntro.classList.remove("hidden");
    }
    snapshot();
  }

  function startCombat(isBoss) {
    mode="combat";
    combatHp = combatMax = isBoss ? 8 : 4;
    attackLocked=false; dodgeUntil=0;
    lastEnemyAttack = performance.now();
    ui.combatName.textContent = isBoss ? "THE CLASSIC GOTH • BOSS" : "THE CLASSIC GOTH";
    ui.enemyHp.style.width="100%";
    ui.combatStatus.textContent="Watch the telegraph. Dodge her attack, then strike.";
    ui.combatEl.classList.remove("hidden");
    drawCombat(false);
    snapshot();
  }

  function drawCombat(attack=false, hit=false) {
    const g=cctx.createLinearGradient(0,0,0,300);g.addColorStop(0,"#32243a");g.addColorStop(1,"#111016");
    cctx.fillStyle=g;cctx.fillRect(0,0,700,300);
    cctx.fillStyle="#17131a";cctx.fillRect(0,235,700,65);
    drawOlly(cctx,4.5,5.2,.95,performance.now()/1000,attack,hit);
    drawGoth(cctx,12.5,5.0,1.15,performance.now()/1000,attack);
    if (!attack) {
      cctx.fillStyle="#c8afc7";cctx.font="17px Georgia";cctx.textAlign="center";
      cctx.fillText("ATTACK",350,35);
    }
    if (dodgeUntil > performance.now()) {
      cctx.strokeStyle="#e98aa8";cctx.lineWidth=4;cctx.beginPath();cctx.arc(90,206,32,0,Math.PI*2);cctx.stroke();
    }
  }

  function combatLoop() {
    if (mode !== "combat") return;
    const now=performance.now();
    // Telegraph then attack. Player can dodge during the warning window.
    if (now-lastEnemyAttack > 1350) {
      ui.combatStatus.textContent = "⚠️ Incoming attack! Press DODGE now.";
      drawCombat(true,false);
      setTimeout(() => {
        if (mode!=="combat") return;
        if (dodgeUntil < performance.now()) {
          hp=Math.max(0,hp-1);
          ui.combatStatus.textContent = "💥 Hit! Dodge the next attack earlier.";
          drawCombat(false,true);
          if(hp<=0){ endCombat(false); return; }
        } else {
          ui.combatStatus.textContent = "↪ Dodged! Now attack.";
        }
        lastEnemyAttack=performance.now();
        snapshot();
      }, 320);
    } else {
      drawCombat(false,false);
    }
    requestAnimationFrame(combatLoop);
  }

  function playerAttack() {
    if(mode!=="combat" || attackLocked) return;
    attackLocked=true;
    drawCombat(true,false);
    setTimeout(()=>attackLocked=false,420);
    // attacks are only reliable when the player did not just dodge too late.
    const success = Math.random() < 0.84;
    if(success){
      combatHp=Math.max(0,combatHp-1);
      ui.enemyHp.style.width=(combatHp/combatMax*100)+"%";
      ui.combatStatus.textContent="⚔️ Hit! She is preparing another attack.";
      if(combatHp<=0){ setTimeout(()=>endCombat(true),220); }
    } else {
      ui.combatStatus.textContent="Miss! Her next attack is already coming.";
    }
  }

  function dodge() {
    if(mode!=="combat") return;
    dodgeUntil=performance.now()+650;
    ui.combatStatus.textContent="↪ Dodge window active.";
    drawCombat(false,false);
  }

  function endCombat(won) {
    mode="map";
    ui.combatEl.classList.add("hidden");
    if(!won){
      hp=5;x=3;y=7;reveal();
      ui.dialogue.textContent="Olly has been knocked out. He wakes back at the cemetery gate. Try again.";
    } else if(combatEnemy){
      combatEnemy.dead=true;combatEnemy=null;kills++;
      ui.dialogue.textContent = kills===1 ? "✅ First goth defeated. The way onward is open." : "✅ Both goths defeated. Find the puzzle.";
    } else {
      ui.winOverlay.classList.remove("hidden");
    }
    snapshot();
  }

  ui.encounterStart.addEventListener("click",()=>{ui.encounterEl.classList.add("hidden");startCombat(false);});
  ui.combatAttack.addEventListener("click",playerAttack);
  ui.combatDodge.addEventListener("click",dodge);
  ui.startBoss.addEventListener("click",()=>{ui.bossIntro.classList.add("hidden");combatEnemy=null;startCombat(true);});
  ui.restart.addEventListener("click",()=>window.location.reload());

  function answerPuzzle(answer) {
    if(mode!=="puzzle") return;
    if(answer==="correct"){
      puzzleSolved=true; mode="map"; ui.puzzleOverlay.classList.add("hidden");
      ui.dialogue.textContent="🧩 CORRECT. Princess etiquette level: appalling. The boss gate is open.";
    } else {
      ui.puzzleResult.textContent="❌ Wrong. Even the cemetery is disappointed in you.";
    }
    snapshot();
  }

  function interact(){ checkTriggers(); }

  function primaryAction(){
    if(mode==="encounter") ui.encounterStart.click();
    else if(mode==="combat") playerAttack();
    else checkTriggers();
  }

  function start(){
    reveal(); snapshot(); cancelAnimationFrame(raf); lastTime=performance.now(); raf=requestAnimationFrame(frame);
    const keyHandler=(e)=>{
      const k=e.key.toLowerCase();
      if(["arrowup","arrowdown","arrowleft","arrowright"," ","w","a","s","d"].includes(k)) e.preventDefault();
      if(k==="arrowup"||k==="w") move("up");
      if(k==="arrowdown"||k==="s") move("down");
      if(k==="arrowleft"||k==="a") move("left");
      if(k==="arrowright"||k==="d") move("right");
      if(k===" ") primaryAction();
    };
    window.addEventListener("keydown",keyHandler);
  }

  return {start, move, primaryAction, interact, answerPuzzle};
}
