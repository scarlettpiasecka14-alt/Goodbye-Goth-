import { StoryController } from './story.js';
import { createLevel1 } from './levels/level1.js';

const root = document.getElementById('game-root');

function showTitle(){
  root.innerHTML = `
    <section id="title-screen" class="panel title-screen perfect-title-screen" aria-label="Goodbye Goth title screen">
      <div class="perfect-title-wrap">
        <img class="perfect-title-art" src="assets/story/title-screen-perfect.png" alt="Goodbye Goth title screen">
        <button id="title-start" class="perfect-title-hit" aria-label="Start New Game"></button>
        <button id="title-skip" class="title-skip-intro" type="button">SKIP INTRO →</button>
      </div>
    </section>`;
  document.getElementById('title-start').addEventListener('click', showIntro, { once:true });
  document.getElementById('title-skip').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); showGothAbyss(); }, { once:true });
}

function showIntro(){
  const story = new StoryController(root, showGothAbyss);
  story.render();
}

function showGothAbyss() {
  root.innerHTML = `
    <section class="abyss-video-screen" id="abyss-video-screen">
      <video
        id="abyss-video"
        class="abyss-video"
        src="assets/video/cutscene 720p.mov"
        playsinline
        preload="auto"
      ></video>
      <button class="skip-cutscene-btn" id="skip-cutscene-btn">SKIP CUTSCENE →</button>
      <button class="video-play-btn" id="video-play-btn" hidden>▶ PLAY CUTSCENE</button>
    </section>
  `;

  const video = document.getElementById("abyss-video");
  const skipButton = document.getElementById("skip-cutscene-btn");
  const playButton = document.getElementById("video-play-btn");

  const finishCutscene = () => {
    if (video) {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
    showAbyssRules();
  };

  skipButton.addEventListener("click", finishCutscene);

  video.addEventListener("ended", finishCutscene);

  video.play().catch(() => {
    // Some browsers may block autoplay. Show a play button instead.
    playButton.hidden = false;
  });

  playButton.addEventListener("click", () => {
    playButton.hidden = true;
    video.play().catch(() => {
      playButton.hidden = false;
    });
  });
}

function showAbyssRules(){
  root.innerHTML = `
    <section class="abyss-rules-screen" aria-label="Welcome to the Goth Abyss">
      <div class="abyss-rules-card">
        <div class="abyss-rules-skull">☠</div>
        <div class="abyss-rules-kicker">WELCOME TO</div>
        <h1>THE GOTH ABYSS</h1>
        <p class="abyss-rules-intro">Scarlett has been taken. The Goths have hidden her somewhere beyond this place.</p>
        <div class="abyss-rules-grid">
          <div><span>🧭</span><strong>EXPLORE</strong><p>Search each level and uncover the path forward.</p></div>
          <div><span>🏹</span><strong>FIGHT</strong><p>Defeat the Zombie Goths and survive their attacks.</p></div>
          <div><span>💕</span><strong>LOVE</strong><p>Complete one relationship challenge on every level.</p></div>
          <div><span>🧩</span><strong>THINK</strong><p>Solve the puzzle to unlock the boss gate.</p></div>
        </div>
        <div class="abyss-rule-line">DEFEAT THE QUEEN GOTH → FIND SCARLETT → ESCAPE THE ABYSS</div>
        <button id="enter-abyss" class="primary abyss-enter" type="button">ENTER THE GOTH ABYSS ♥</button>
      </div>
    </section>`;
  document.getElementById('enter-abyss').addEventListener('click', mountLevel1, { once:true });
}

function mountLevel1(){
  root.innerHTML = `
    <section class="panel game-screen" style="position:relative">
      <div class="game-head">
        <div><strong>LEVEL 1</strong><div class="small">THE HAUNTED CEMETERY</div></div>
        <div class="stats">
          <span class="pill">❤️ <span id="hp">5</span></span>
          <span class="pill">🧟 <span id="goth-count">0/2</span></span>
          <span class="pill">💕 <span id="rel-state">Locked</span></span>
          <span class="pill">🧩 <span id="puzzle-state">Locked</span></span>
        </div>
      </div>
      <div class="game-layout">
        <div class="play-column">
          <div class="world-wrap">
            <canvas id="world" width="1000" height="600" tabindex="0" aria-label="Level 1 haunted cemetery"></canvas>
            <div class="help">Explore to reveal the cemetery • WASD / arrow keys move • Find the ♥, ✣ and the Zombie Goths</div>
          </div>
          <div id="dialogue" class="dialogue" aria-live="polite">You wake up somewhere very dark...</div>
          <div class="control-row">
            <div class="dpad">
              <span></span><button data-dir="up">↑</button><span></span>
              <button data-dir="left">←</button><button data-dir="down">↓</button><button data-dir="right">→</button>
            </div>
            <button id="attack" class="primary">🏹 ATTACK</button>
            <button id="interact">✦ INTERACT</button>
          </div>
        </div>
        <aside class="side-column">
          <div class="side-card">
            <strong>LEVEL 1 OBJECTIVES</strong>
            <div class="objective-list">
              <div id="goal-goths">○ Defeat the required Zombie Goths (0/2)</div>
              <div id="goal-rel">○ Complete the Relationship Challenge</div>
              <div id="goal-puzzle">○ Solve the Puzzle</div>
              <div id="goal-boss">🔒 Boss gate locked</div>
            </div>
          </div>
          <div class="side-card">
            <strong>MAP</strong>
            <canvas id="mini-map" class="mini-map" width="250" height="180"></canvas>
            <div class="legend"><span>○ You</span><span>♥ challenge</span><span>✣ puzzle</span><span>♛ boss</span></div>
          </div>
          <div class="side-card"><strong>Checkpoint</strong><div id="checkpoint" class="small">Cemetery entrance</div></div>
        </aside>
      </div>

      <div id="encounter" class="overlay hidden"><div class="overlay-box center">
        <canvas id="encounter-canvas" class="story-art" width="720" height="300"></canvas>
        <div id="encounter-name" class="story-title">ZOMBIE GOTH</div>
        <p id="encounter-text"></p><button id="encounter-fight" class="primary">FIGHT</button>
      </div></div>

      <div id="combat" class="overlay hidden"><div class="overlay-box">
        <div class="combat-ui"><strong id="combat-name">ZOMBIE GOTH</strong><span id="combat-pattern" class="small">Watch the warning • DODGE • FIRE ARROWS</span></div>
        <div class="bar" style="margin-top:7px"><div id="enemy-hp"></div></div>
        <div class="combat-arena"><canvas id="combat-canvas" width="900" height="450"></canvas></div>
        <div id="combat-status" class="combat-note"><strong>HOW TO FIGHT:</strong> Click the enemy or the arena to fire an arrow. When a red warning appears, press <strong>DODGE</strong>. You can also use ← → ↑ ↓ to move Olly.</div>
        <div class="combat-actions"><button id="combat-attack" class="primary">🏹 FIRE ARROW</button><button id="combat-dodge">↪ DODGE</button></div>
      </div></div>

      <div id="death" class="overlay hidden"><div class="overlay-box center death-card">
        <div class="death-title">YOU DIED</div><p id="death-text">The Goths have won this round.</p>
        <div class="story-actions"><button id="retry-combat" class="primary">TRY AGAIN</button><button id="back-map">BACK TO MAP</button></div>
      </div></div>

      <div id="relationship" class="overlay hidden"><div class="overlay-box center relationship-box">
        <canvas id="relationship-canvas" class="story-art relationship-art" width="720" height="250"></canvas>
        <div class="story-title">WOULD YOU...</div>
        <p>Scarlett is talking. Press <strong>WOULD YOU?</strong> at exactly the right moment.</p>
        <div class="timing-track"><div id="timing-zone" class="timing-zone"></div><div id="timing-cursor" class="timing-cursor"></div></div>
        <div id="would-display" class="minigame-display">“Can I ask you a question... have you ever...”</div>
        <button id="would-tap" class="primary timing-button">WOULD YOU?</button>
        <p id="would-feedback" class="small">Listen for the phrase. The timing gets quicker each round.</p>
      </div></div>

      <div id="puzzle" class="overlay hidden"><div class="overlay-box center">
        <img class="story-art" src="assets/story/princess-puzzle-unique.png" alt="Princess-themed puzzle">
        <div class="story-title">PRINCESS ETIQUETTE</div><p>What is the appropriate way to ask a princess to undress?</p>
        <div class="answers">
          <button data-answer="wrong">“Your Highness, may I assist you with your attire?”</button>
          <button data-answer="correct">“Get your kit off, mate.”</button>
          <button data-answer="wrong">“Would you kindly remove your garments?”</button>
          <button data-answer="wrong">“Princess, the time has come to retire your dress.”</button>
        </div>
        <p id="puzzle-feedback" class="small"></p>
      </div></div>

      <div id="boss-intro" class="overlay hidden"><div class="overlay-box center">
        <img class="story-art" src="assets/story/classic-goth-fight.png" alt="Classic Goth boss">
        <div class="story-title">THE CLASSIC GOTH</div><p>Black lace. Red wine. Existential dread.</p>
        <p><strong>“You really thought it would be that easy?”</strong></p><button id="boss-start" class="primary">ENTER BOSS FIGHT</button>
      </div></div>

      <div id="win" class="overlay hidden"><div class="overlay-box center">
        <div class="win-title">LEVEL 1 COMPLETE 🖤</div><p>The Classic Goth has been defeated.</p><p><strong>Level 2 is unlocked.</strong></p><button id="replay" class="primary">PLAY LEVEL 1 AGAIN</button>
      </div></div>
    </section>`;

  const ui = {
    canvas:document.getElementById('world'), miniMap:document.getElementById('mini-map'), dialogue:document.getElementById('dialogue'),
    hpEl:document.getElementById('hp'), gothEl:document.getElementById('goth-count'), relEl:document.getElementById('rel-state'), puzzleEl:document.getElementById('puzzle-state'),
    goalGoths:document.getElementById('goal-goths'), goalRel:document.getElementById('goal-rel'), goalPuzzle:document.getElementById('goal-puzzle'), goalBoss:document.getElementById('goal-boss'), checkpoint:document.getElementById('checkpoint'),
    encounter:document.getElementById('encounter'), encounterCanvas:document.getElementById('encounter-canvas'), encounterName:document.getElementById('encounter-name'), encounterText:document.getElementById('encounter-text'), encounterFight:document.getElementById('encounter-fight'),
    combat:document.getElementById('combat'), combatCanvas:document.getElementById('combat-canvas'), combatName:document.getElementById('combat-name'), combatPattern:document.getElementById('combat-pattern'), enemyHp:document.getElementById('enemy-hp'), combatStatus:document.getElementById('combat-status'), combatAttack:document.getElementById('combat-attack'), combatDodge:document.getElementById('combat-dodge'),
    death:document.getElementById('death'), deathText:document.getElementById('death-text'), retryCombat:document.getElementById('retry-combat'), backMap:document.getElementById('back-map'),
    relationship:document.getElementById('relationship'), relationshipCanvas:document.getElementById('relationship-canvas'), wouldDisplay:document.getElementById('would-display'), wouldTap:document.getElementById('would-tap'), wouldFeedback:document.getElementById('would-feedback'), timingZone:document.getElementById('timing-zone'), timingCursor:document.getElementById('timing-cursor'),
    puzzle:document.getElementById('puzzle'), puzzleFeedback:document.getElementById('puzzle-feedback'), bossIntro:document.getElementById('boss-intro'), bossStart:document.getElementById('boss-start'), win:document.getElementById('win'), replay:document.getElementById('replay')
  };

  const level = createLevel1(ui);
  document.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('click',()=>level.move(b.dataset.dir)));
  document.getElementById('attack').addEventListener('click',()=>level.primaryAction());
  document.getElementById('interact').addEventListener('click',()=>level.interact());
  ui.encounterFight.addEventListener('click',()=>level.startEncounterFight());
  ui.combatAttack.addEventListener('click',()=>level.combatAttack());
  ui.combatDodge.addEventListener('click',()=>level.combatDodge());
  ui.retryCombat.addEventListener('click',()=>level.retryCombat());
  ui.backMap.addEventListener('click',()=>level.backToMap());
  ui.wouldTap.addEventListener('click',()=>level.completeRelationship());
  ui.bossStart.addEventListener('click',()=>level.startBoss());
  ui.replay.addEventListener('click',()=>mountLevel1());
  document.querySelectorAll('[data-answer]').forEach(b=>b.addEventListener('click',()=>level.answerPuzzle(b.dataset.answer)));
  ui.combatCanvas.addEventListener('pointerdown',e=>level.shootAtPointer(e));
  window.addEventListener('keydown',e=>{
    const k=e.key.toLowerCase();
    if(['arrowup','arrowdown','arrowleft','arrowright',' ','w','a','s','d'].includes(k))e.preventDefault();
    if(k==='arrowup'||k==='w')level.move('up'); if(k==='arrowdown'||k==='s')level.move('down');
    if(k==='arrowleft'||k==='a')level.move('left'); if(k==='arrowright'||k==='d')level.move('right');
    if(k===' ')level.primaryAction();
  });
  level.start();
}

showTitle();
