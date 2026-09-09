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
    <section class="abyss-video-screen" id="abyss-video-screen" aria-label="Goth Abyss cutscene">
      <video
        id="abyss-video"
        class="abyss-video"
        src="assets/video/cutscene 720p.mov"
        playsinline
        preload="auto"
      ></video>
      <button class="skip-cutscene-btn" id="skip-cutscene-btn" type="button">SKIP CUTSCENE →</button>
      <button class="video-play-btn" id="video-play-btn" hidden type="button">▶ PLAY CUTSCENE</button>
    </section>
  `;

  const video = document.getElementById('abyss-video');
  const skipButton = document.getElementById('skip-cutscene-btn');
  const playButton = document.getElementById('video-play-btn');

  const finishCutscene = () => {
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    showAbyssWelcome();
  };

  skipButton.addEventListener('click', finishCutscene, { once: true });
  video.addEventListener('ended', finishCutscene, { once: true });

  video.play().catch(() => {
    playButton.hidden = false;
  });

  playButton.addEventListener('click', () => {
    playButton.hidden = true;
    video.play().catch(() => {
      playButton.hidden = false;
    });
  }, { once: true });
}

function showImageTransitionScreen(image, alt, onContinue, label) {
  root.innerHTML = `
    <section class="full-art-screen" aria-label="${label}">
      <button class="full-art-button" id="full-art-continue" type="button" aria-label="Continue">
        <img class="full-art-image" src="${image}" alt="${alt}">
      </button>
    </section>`;
  document.getElementById('full-art-continue').addEventListener('click', onContinue, { once: true });
}

function showAbyssWelcome(){
  showImageTransitionScreen(
    'assets/story/goth-abyss-welcome.png',
    'Welcome to the Goth Abyss screen.',
    showAbyssObjective,
    'Welcome to the Goth Abyss'
  );
}

function showAbyssObjective(){
  showImageTransitionScreen(
    'assets/story/goth-abyss-objective.png',
    'The Goths have stolen Scarlett. Explore, defeat and solve to rescue her.',
    showControls,
    'Game objective'
  );
}

function showControls(){
  root.innerHTML = `
    <section class="controls-screen" aria-label="Controls">
      <div class="controls-card">
        <div class="controls-decor" aria-hidden="true">☠ ♥ ☠</div>
        <h1>CONTROLS</h1>
        <div class="controls-list">
          <div class="control-item"><span class="control-key">WASD / ARROWS</span><span class="control-action">Move</span></div>
          <div class="control-item"><span class="control-key">SPACE</span><span class="control-action">Jump</span></div>
          <div class="control-item"><span class="control-key">RIGHT CLICK</span><span class="control-action">Roll</span></div>
          <div class="control-item"><span class="control-key">LEFT CLICK</span><span class="control-action">Attack</span></div>
          <div class="control-item"><span class="control-key">LEFT CLICK / ENTER</span><span class="control-action">Pick up / interact</span></div>
        </div>
        <button id="controls-next" class="controls-next" type="button">CLICK TO CONTINUE →</button>
      </div>
    </section>`;
  document.getElementById('controls-next').addEventListener('click', showLevel1Intro, { once: true });
}

function showLevel1Intro(){
  showImageTransitionScreen(
    'assets/story/level1-entrance.png',
    'Level 1: The Cemetery. Enter if you dare.',
    mountLevel1,
    'Level 1 entrance'
  );
}

function mountLevel1(){
  root.innerHTML = `
    <section class="panel game-screen" style="position:relative">
      <div class="game-head">
        <div><strong>LEVEL 1</strong><div class="small">THE HAUNTED CEMETERY</div></div>
        <div class="stats">
          <span class="pill">❤️ <span id="hp">5</span></span>
          <span class="pill">🧟 <span id="goth-count">0/2</span></span>
          <span class="pill">🧩 <span id="rel-state">Locked</span></span>
          <span class="pill">❤️ <span id="puzzle-state">Locked</span></span>
        </div>
      </div>
      <div class="game-layout">
        <div class="play-column">
          <div class="world-wrap">
            <canvas id="world" width="1000" height="600" tabindex="0" aria-label="Level 1 haunted cemetery"></canvas>
            <div class="help">Explore to reveal the cemetery • WASD / arrow keys move • Find the ♥, ✣ and the Zombie Goths</div>
          </div>
          <div id="dialogue" class="dialogue" aria-live="polite">You wake up somewhere very dark...</div>
        </div>
        <aside class="side-column">
          <div class="side-card">
            <strong>LEVEL 1 OBJECTIVES</strong>
            <div class="objective-list">
              <div id="goal-goths">○ Defeat the required Zombie Goths (0/2)</div>
              <div id="goal-rel">○ Complete the WOULD YOU? Puzzle</div>
              <div id="goal-puzzle">○ Answer the Princess Question</div>
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

      <div id="relationship" class="overlay hidden"><div class="overlay-box center relationship-box ironic-box">
        <canvas id="relationship-canvas" width="1" height="1" hidden></canvas>
        <img class="story-art relationship-image" src="assets/story/would-you.png" alt="Scarlett and Olly in bed, with the words Would You?" />
        <div class="story-title">WOULD YOU...</div>
        <div class="ironic-copy">Sometimes princesses have far too much going on in their heads to get their words out right. In cases like these one can either 1. try to be helpful or 2. take the piss. You chose the latter. Press WOULD YOU? at the correct time to complete the puzzle.</div>
        <div class="timing-track"><div id="timing-zone" class="timing-zone"></div><div id="timing-cursor" class="timing-cursor"></div></div>
        <div id="would-display" class="minigame-display">“Can I ask you a question... have you ever...”</div>
        <button id="would-tap" class="primary timing-button">WOULD YOU?</button>
        <p id="would-feedback" class="small">Listen for the phrase. The timing gets quicker each round.</p>
      </div></div>

      <div id="puzzle" class="overlay hidden"><div class="overlay-box center quiz-box">
        <img class="story-art quiz-image" src="assets/story/princess-quiz.png" alt="Scarlett, the kidnapped princess, with a warning about getting the answer right">
        <div class="story-title">THE PRINCESS QUESTION</div>
        <div class="ironic-copy quiz-copy">A simple question, apparently. The fate of your princess rests on your ability to demonstrate absolutely normal communication skills.</div>
        <p class="quiz-question">What is the correct way to ask a princess to undress?</p>
        <div class="answers quiz-answers">
          <button data-answer="wrong"><strong>A.</strong> “Your Highness, may I assist you with your attire?”</button>
          <button data-answer="wrong"><strong>B.</strong> “Would you kindly remove your garments?”</button>
          <button data-answer="correct"><strong>C.</strong> “Get your kit off, mate.”</button>
          <button data-answer="wrong"><strong>D.</strong> “Princess, the time has come to retire your dress.”</button>
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
