import { StoryController } from './story.js?v=9220';
import { createLevel1, resetRingTutorials } from './levels/level1.js?v=9220';
import { playMusic, setLoopSfx, playSfx, audioNeedsClick } from './audio.js?v=9220';
import { initSettings, openSettings } from './settings.js?v=9220';
import { actionForKey } from './controls.js?v=9220';
import { initCheats, registerCheats } from './cheats.js?v=9220';

const root = document.getElementById('game-root');

const SAVE_KEY = 'goodbyeGothSave_v6';

function hasSaveGame(){
  try { return !!localStorage.getItem(SAVE_KEY); } catch { return false; }
}

function startNewGame(){
  try { localStorage.removeItem(SAVE_KEY); } catch {}
  resetRingTutorials();   // a new game shows the pink / red / yellow ring tutorials again
  showIntro();
}

function loadSavedGame(){
  if(!hasSaveGame()){
    showTitleMessage('No saved game yet. Start a NEW GAME first.');
    return;
  }
  setLoopSfx('ambience', false);
  mountLevel1(true);
}

function quitGame(){
  // Browsers generally refuse window.close() unless this tab was script-opened.
  window.close();
  setTimeout(() => {
    root.innerHTML = `
      <section class="quit-screen" aria-label="Game quit">
        <div class="quit-card">
          <div class="quit-skull">☠</div>
          <h1>GOODBYE, GOTH</h1>
          <p>The game has been quit.</p>
          <p class="small">Your browser may not allow a webpage to close its own tab. You can close this tab normally.</p>
        </div>
      </section>`;
  }, 120);
}

function showTitleMessage(message){
  const existing=document.getElementById('title-message');
  if(existing) existing.textContent=message;
  else {
    const el=document.createElement('div');
    el.id='title-message';
    el.className='title-message';
    el.textContent=message;
    root.querySelector('.perfect-title-wrap')?.appendChild(el);
  }
}

function showTitle(){
  setLoopSfx('ambience', false);
  root.innerHTML = `
    <section id="title-screen" class="panel title-screen perfect-title-screen" aria-label="Goodbye Goth title screen">
      <div class="perfect-title-wrap">
        <img class="perfect-title-art" src="assets/story/title-screen-perfect.webp" alt="Goodbye Goth title screen">
        <button id="title-art-new" class="title-art-hit" type="button" aria-label="New game"></button>
        <div class="title-menu" role="menu" aria-label="Main menu">
          <button id="title-load" class="title-menu-btn" type="button">LOAD GAME</button>
          <button id="title-settings" class="title-menu-btn" type="button">SETTINGS</button>
          <button id="title-quit" class="title-menu-btn" type="button">QUIT</button>
        </div>
      </div>
    </section>`;

  let started = false;
  const begin = () => { if(started) return; started = true; document.getElementById('title-screen')?.classList.add('title-leaving'); setTimeout(startNewGame, 420); };   // glow + fade instead of an abrupt vanish
  document.getElementById('title-art-new').addEventListener('click', begin);
  document.getElementById('title-load').addEventListener('click', loadSavedGame, { once:true });
  document.getElementById('title-settings').addEventListener('click', openSettings);
  document.getElementById('title-quit').addEventListener('click', quitGame, { once:true });
}

function showIntro(){
  playMusic('', 2500);                        // title song fades out slowly as the intro begins
  setLoopSfx('ambience', true, .4);    // dark ambience under the intro; stops when the cutscene starts
  const story = new StoryController(root, showGothAbyss);
  story.render();
}

function showGothAbyss() {
  playMusic('');   // the cutscene has its own sound
  setLoopSfx('ambience', false);
  root.innerHTML = `
    <section class="abyss-video-screen" id="abyss-video-screen" aria-label="Goth Abyss cutscene">
      <video
        id="abyss-video"
        class="abyss-video"
        src="assets/video/cutscene-intro.mp4"
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
    'assets/story/goth-abyss-welcome.webp',
    'Welcome to the Goth Abyss screen.',
    showAbyssObjective,
    'Welcome to the Goth Abyss'
  );
}

function showAbyssObjective(){
  showImageTransitionScreen(
    'assets/story/goth-abyss-objective.webp',
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
          <div class="control-item"><span class="control-key">RIGHT CLICK</span><span class="control-action">Dodge</span></div>
          <div class="control-item"><span class="control-key">LEFT CLICK</span><span class="control-action">Attack</span></div>
          <div class="control-item"><span class="control-key">LEFT CLICK / ENTER</span><span class="control-action">Pick up / interact</span></div>
          <div class="control-item"><span class="control-key">Y</span><span class="control-action">Open inventory</span></div>
          <div class="control-item"><span class="control-key">X</span><span class="control-action">Save game</span></div>
          <div class="control-item"><span class="control-key">O</span><span class="control-action">Settings (or the ⚙ bottom-left)</span></div>
        </div>
        <button id="controls-next" class="controls-next" type="button">CLICK TO CONTINUE →</button>
      </div>
    </section>`;
  document.getElementById('controls-next').addEventListener('click', showLevel1Intro, { once: true });
}

function showLevel1Intro(){
  showImageTransitionScreen(
    'assets/story/level1-entrance.webp?v=657',
    'Level 1: The Cemetery. Enter if you dare.',
    mountLevel1,
    'Level 1 entrance'
  );
}

function mountLevel1(loadSaved=false){
  root.innerHTML = `
    <section class="panel game-screen" style="position:relative">
      <div class="game-head">
        <div><strong>LEVEL 1</strong><div class="small">THE HAUNTED CEMETERY</div></div>
        <div class="stats">
          <span class="pill">🧟 <span id="goth-count">0/2</span></span>
          <span class="pill">🧩 <span id="rel-state">Locked</span></span>
          <span class="pill">♥ <span id="puzzle-state">Locked</span></span>
        </div>
      </div>

      <div id="player-hud" class="player-hud" aria-label="Olly health">
        <div class="player-hud-name">OLLY</div>
        <div class="player-hud-bar"><div id="player-hp-fill" class="player-hp-fill"></div></div>
        <div id="player-hp-text" class="player-hp-text">100 / 100 HP</div>
        <div class="hud-btn-row">
          <button id="inventory-button" type="button" style="min-height:34px;padding:6px 10px;font-size:12px;">🎒 INVENTORY <span id="inventory-count">0/10</span></button>
          <button id="hud-gear" class="hud-gear" type="button" title="Settings (O)" aria-label="Settings">⚙</button>
        </div>
        <div id="combo-hud" class="combo-hud" style="display:none" aria-label="Punch combo"><span class="combo-pips"><i></i><i></i></span><span id="combo-text" class="combo-text"></span></div>
      </div>
      <div class="game-layout">
        <div class="play-column">
          <div class="world-wrap">
            <canvas id="world" width="1536" height="1024" tabindex="0" aria-label="Level 1 haunted cemetery"></canvas>
          </div>
          <div id="dialogue" class="dialogue" aria-live="polite">You wake up somewhere very dark...</div>
        </div>
      </div>

      <div id="inventory" class="overlay hidden" style="z-index:40">
        <div class="overlay-box center inventory-box">
          <div class="inventory-kicker">OLLY'S BAG</div>
          <div class="story-title">INVENTORY</div>
          <div class="inventory-capacity"><span id="inventory-count-large">0 / 10 ITEMS</span></div>
          <div class="inventory-slots" aria-label="Inventory slots">
            <div class="inventory-slot">01</div><div class="inventory-slot">02</div><div class="inventory-slot">03</div><div class="inventory-slot">04</div><div class="inventory-slot">05</div>
            <div class="inventory-slot">06</div><div class="inventory-slot">07</div><div class="inventory-slot">08</div><div class="inventory-slot">09</div><div class="inventory-slot">10</div>
          </div>
          <p class="inventory-empty-copy">Nothing in here yet. A suspiciously empty bag.</p>
          <button id="inventory-close" type="button" class="primary inventory-close-button">CLOSE</button>
        </div>
      </div>

      <div id="encounter" class="overlay hidden"><div class="overlay-box center encounter-box">
        <img id="encounter-image" class="encounter-art" alt="Encounter artwork">
        <div id="encounter-name" class="story-title">ENCOUNTER</div>
        <p id="encounter-text" class="encounter-copy"></p>
        <div class="encounter-actions">
          <button id="encounter-ready" class="primary" type="button">I'M READY</button>
          <button id="encounter-explore" type="button">KEEP EXPLORING</button>
        </div>
      </div></div>

      <div id="combat" class="overlay hidden"><div class="overlay-box combat-box">
        <div class="combat-topline">
          <strong id="combat-name">ZOMBIE GOTH</strong>
          <div class="combat-enemy-hp-wrap">
            <div class="combat-enemy-hp-label">HP <span id="enemy-hp-text">50 / 50</span></div>
            <div class="bar"><div id="enemy-hp"></div></div>
          </div>
          <div id="enemy-stun-wrap" class="combat-stun-wrap hidden">
            <div class="combat-enemy-hp-label"><span id="enemy-stun-label">STUN</span></div>
            <div class="bar stun-bar"><div id="enemy-stun"></div></div>
          </div>
        </div>

        <div class="combat-arena"><canvas id="combat-canvas" width="1440" height="810" aria-label="Combat arena"></canvas></div>

        <div id="combat-status" class="combat-note">The Goth is staring you down.</div>
      </div></div>

      <div id="death" class="overlay hidden"><div class="overlay-box center death-card">
        <div class="death-title">YOU DIED</div>
        <img id="death-image" class="completion-art death-art" src="assets/characters/combat/olly-after-knockout.webp?v=1" alt="Olly recovering after being knocked out">
        <p id="death-text">The Goths have won this round.</p>
        <div class="story-actions"><button id="retry-combat" class="primary">TRY AGAIN</button><button id="back-map">BACK TO MAP</button></div>
      </div></div>

      <div id="completion" class="overlay hidden"><div class="overlay-box center completion-card">
        <img id="completion-image" class="completion-art" alt="">
        <div id="completion-title" class="story-title completion-title"></div>
        <p id="completion-copy" class="completion-copy"></p>
        <div class="story-actions"><button id="completion-continue" class="primary">KEEP EXPLORING</button></div>
      </div></div>

      <div id="relationship" class="overlay hidden"><div class="overlay-box center relationship-box ironic-box">
        <canvas id="relationship-canvas" width="1" height="1" hidden></canvas>
        <img class="story-art relationship-image" src="assets/story/would-you.webp" alt="Scarlett and Olly in bed, with the words Would You?" />
        <div class="story-title">WOULD YOU...</div>
        <div class="ironic-copy">Sometimes princesses have far too much going on in their heads to get their words out right. In cases like these one can either 1. try to be helpful or 2. take the piss. You chose the latter. Press WOULD YOU? at the correct time to complete the puzzle.</div>
        <div class="timing-track"><div id="timing-zone" class="timing-zone"></div><div id="timing-cursor" class="timing-cursor"></div></div>
        <div id="would-display" class="minigame-display">“Can I ask you a question... have you ever...”</div>
        <button id="would-tap" class="primary timing-button">WOULD YOU?</button>
        <p id="would-feedback" class="small">Listen for the phrase. The timing gets quicker each round.</p>
      </div></div>

      <div id="puzzle" class="overlay hidden"><div class="overlay-box center quiz-box">
        <img class="story-art quiz-image" src="assets/story/princess-quiz.webp" alt="Scarlett, the kidnapped princess, with a warning about getting the answer right">
        
        <p class="quiz-question">What is the correct way to ask a princess to undress?</p>
        <div class="answers quiz-answers">
          <button data-answer="wrong"><strong>A.</strong> “Your Highness, may I assist you with your attire?”</button>
          <button data-answer="wrong"><strong>B.</strong> “Would you kindly remove your garments?”</button>
          <button data-answer="correct"><strong>C.</strong> “Get your kit off, mate.”</button>
          <button data-answer="wrong"><strong>D.</strong> “Princess, the time has come to retire your dress.”</button>
        </div>
        <p id="puzzle-feedback" class="small quiz-feedback" aria-live="polite"></p>
      </div></div>

      <div id="boss-intro" class="overlay hidden patricia-screen">
        <img class="patricia-art" src="assets/story/patricia-encounter.webp" alt="Patricia, the Classic Goth">
        <div class="patricia-card">
          <div class="patricia-title">You've encountered Patricia, The Classic Goth.</div>
          <p>She loves watching you squirm and thinks you're rather adorable. She's terribly bored, so she'll humour you with a fight. Not that you stand much chance of surviving.</p>
          <div class="patricia-btns"><button id="boss-start" class="primary" type="button">I'm Ready</button><button id="boss-save-quit" type="button">Save and Quit</button></div>
        </div>
      </div>

      <div id="win" class="overlay hidden"><div class="overlay-box center">
        <div class="win-title">LEVEL 1 COMPLETE 🖤</div><p>The Classic Goth has been defeated.</p><p><strong>Level 2 is unlocked.</strong></p><button id="replay" class="primary">PLAY LEVEL 1 AGAIN</button>
      </div></div>
    </section>`;

  const ui = {
    canvas:document.getElementById('world'), dialogue:document.getElementById('dialogue'),
    hpEl:document.getElementById('player-hp-text'), hpFill:document.getElementById('player-hp-fill'), gothEl:document.getElementById('goth-count'), relEl:document.getElementById('rel-state'), puzzleEl:document.getElementById('puzzle-state'),
    inventory:document.getElementById('inventory'), inventoryButton:document.getElementById('inventory-button'), inventoryClose:document.getElementById('inventory-close'),
    encounter:document.getElementById('encounter'), encounterImage:document.getElementById('encounter-image'), encounterName:document.getElementById('encounter-name'), encounterText:document.getElementById('encounter-text'), encounterReady:document.getElementById('encounter-ready'), encounterExplore:document.getElementById('encounter-explore'),
    combat:document.getElementById('combat'), combatCanvas:document.getElementById('combat-canvas'), combatName:document.getElementById('combat-name'), enemyHp:document.getElementById('enemy-hp'), enemyHpText:document.getElementById('enemy-hp-text'), enemyStunWrap:document.getElementById('enemy-stun-wrap'), enemyStun:document.getElementById('enemy-stun'), enemyStunLabel:document.getElementById('enemy-stun-label'), combatStatus:document.getElementById('combat-status'),
    death:document.getElementById('death'), deathText:document.getElementById('death-text'), retryCombat:document.getElementById('retry-combat'), backMap:document.getElementById('back-map'),
    completion:document.getElementById('completion'), completionImage:document.getElementById('completion-image'), completionTitle:document.getElementById('completion-title'), completionCopy:document.getElementById('completion-copy'), completionContinue:document.getElementById('completion-continue'),
    relationship:document.getElementById('relationship'), relationshipCanvas:document.getElementById('relationship-canvas'), wouldDisplay:document.getElementById('would-display'), wouldTap:document.getElementById('would-tap'), wouldFeedback:document.getElementById('would-feedback'), timingZone:document.getElementById('timing-zone'), timingCursor:document.getElementById('timing-cursor'),
    puzzle:document.getElementById('puzzle'), puzzleFeedback:document.getElementById('puzzle-feedback'), bossIntro:document.getElementById('boss-intro'), bossStart:document.getElementById('boss-start'), win:document.getElementById('win'), replay:document.getElementById('replay')
  };

  initSettings();
  playMusic('map');   // map + story music (assets/audio/music/map.mp3); starts after the first click
  const level = createLevel1(ui);
  ui.encounterReady.addEventListener('click',()=>level.confirmEncounter());
  ui.encounterExplore.addEventListener('click',()=>level.closeEncounter());
  ui.retryCombat.addEventListener('click',()=>level.retryCombat());
  ui.backMap.addEventListener('click',()=>level.backToMap());
  ui.completionContinue.addEventListener('click',()=>level.continueCompletion());
  ui.wouldTap.addEventListener('click',()=>level.completeRelationship());
  ui.bossStart.addEventListener('click',()=>level.startBoss());
  document.getElementById('boss-save-quit')?.addEventListener('click',()=>level.saveAndQuit());
  ui.replay.addEventListener('click',()=>mountLevel1());
  document.querySelectorAll('[data-answer]').forEach(b=>b.addEventListener('click',()=>level.answerPuzzle(b.dataset.answer)));
  ui.combatCanvas.addEventListener('mousedown',e=>{
    if(e.button!==0 && e.button!==2) return;
    e.preventDefault();
    e.stopPropagation();
    if(e.button===0){
      level.combatAttack();
    } else if(e.button===2){
      level.combatDodge();
    }
  });
  ui.combatCanvas.addEventListener('contextmenu',e=>e.preventDefault());
  ui.combatCanvas.addEventListener('auxclick',e=>e.preventDefault());
  function toggleInventory(){
    if(!ui.inventory) return;
    const open = ui.inventory.classList.toggle('hidden') === false;
    if(open){
      level.setMoveKey?.('w',false); level.setMoveKey?.('a',false); level.setMoveKey?.('s',false); level.setMoveKey?.('d',false);
      ui.inventory.setAttribute('aria-hidden','false');
    } else {
      ui.inventory.setAttribute('aria-hidden','true');
    }
  }
  ui.inventoryButton?.addEventListener('click',()=>toggleInventory(true));
  document.getElementById('hud-gear')?.addEventListener('click',e=>{ e.currentTarget.blur(); openSettings(); });
  ui.inventoryClose?.addEventListener('click',()=>toggleInventory(false));

  const MOVE_KEY = { up:'w', down:'s', left:'a', right:'d' };
  window.addEventListener('keydown',e=>{
    if(e.ctrlKey || e.metaKey || e.altKey) return;
    const act = actionForKey(e.key);
    if(!act) return;
    if(act==='inventory' && !e.repeat){ e.preventDefault(); toggleInventory(); return; }
    if(!ui.inventory?.classList.contains('hidden')) return;
    const inFight = !ui.combat.classList.contains('hidden');
    if(act==='dodge' && inFight){
      e.preventDefault();
      if(!e.repeat) level.combatDodge?.();
      return;
    }
    if(act==='heavy' && inFight){
      e.preventDefault();
      if(!e.repeat) level.combatHeavyAttack?.();
      return;
    }
    if(MOVE_KEY[act]){ e.preventDefault(); level.setMoveKey?.(MOVE_KEY[act],true); return; }
    if(act==='jump'){ e.preventDefault(); if(!e.repeat) level.primaryAction(); return; }
    if(act==='save'){
      e.preventDefault();
      const ok=level.saveGame();
      if(ui.saveStatus) ui.saveStatus.textContent=ok?'Saved ✓':'Save failed';
    }
  });
  window.addEventListener('keyup',e=>{
    const act = actionForKey(e.key);
    if(MOVE_KEY[act]) level.setMoveKey?.(MOVE_KEY[act],false);
  });
  registerCheats(level.cheat);
  level.start();
  if(loadSaved){
    requestAnimationFrame(() => {
      const ok = level.loadGame();
      if(!ok) showTitleMessage('No saved game found.');
    });
  }
}

// One click sound for every menu / story / dialogue button. Map icons, pickups and fights have their own sounds.
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('button, [role="button"]');
  if (b && !b.disabled && !b.closest('#combat .combat-arena')) playSfx('click');
}, true);
initSettings();
initCheats();
// Browsers will not play sound until the page has been clicked once. If Sound is remembered as ON, say so on the title screen.
if (audioNeedsClick()) {
  const hint = document.createElement('div');
  hint.textContent = '🔊 CLICK ANYWHERE TO START THE MUSIC';
  hint.style.cssText = 'position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:800;padding:6px 14px;border-radius:999px;background:rgba(20,12,24,.7);color:#e9c9d8;font:700 12px Georgia,serif;letter-spacing:.18em;pointer-events:none;animation:ggPulse 1.6s ease-in-out infinite';
  const st = document.createElement('style'); st.textContent = '@keyframes ggPulse{0%,100%{opacity:.45}50%{opacity:1}}';
  document.head.appendChild(st); document.body.appendChild(hint);
  window.addEventListener('pointerdown', () => hint.remove(), { once: true });
  window.addEventListener('keydown', () => hint.remove(), { once: true });
}
playMusic('menu');   // title song: assets/audio/music/menu.mp3 (starts after the first click)
showTitle();
