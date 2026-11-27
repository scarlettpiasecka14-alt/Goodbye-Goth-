import { StoryController } from './story.js?v=9820';
import { createLevel1, resetRingTutorials } from './levels/level1.js?v=10160';
import { LEVEL2 } from './levels/level2-config.js?v=10160';   // V9.94: Level 2 runs on the Level 1 engine
import { createLevel3 } from './levels/level3.js?v=9850';
import { playMusic, setLoopSfx, playSfx, audioNeedsClick, playVoiceLine, stopVoiceLine } from './audio.js?v=9820';
import { initSettings, openSettings } from './settings.js?v=9820';
import { actionForKey, hintHTML } from './controls.js?v=10160';
import { initCheats, registerCheats } from './cheats.js?v=9820';
import { initGamepad } from './gamepad.js?v=10160';
import { SLOT_COUNT, getActiveSlot, setActiveSlot, readSlot, clearSlot, slotSummary, anySave } from './saves.js?v=9820';

const root = document.getElementById('game-root');

function startNewGame(slot){
  setActiveSlot(slot);
  clearSlot(slot);        // only the slot you picked (and confirmed) is wiped
  resetRingTutorials();   // a new game shows the pink / red / yellow ring tutorials again
  showIntro();
}

function loadSavedGame(slot){
  if(!readSlot(slot)){
    showTitleMessage('That slot is empty.');
    return;
  }
  setActiveSlot(slot);
  setLoopSfx('ambience', false);
  mountLevel1(true, readSlot(slot)?.level === 2 ? 2 : 1);   // V9.94: a slot remembers which level it's on
}

// V9.31: three save slots. mode 'new' = pick where a new game goes (asks before replacing a save), 'load' = pick a save to continue.
function showSlotPicker(mode){
  const wrap = root.querySelector('.perfect-title-wrap') || root;
  wrap.querySelector('.slot-picker')?.remove();
  const box = document.createElement('div');
  box.className = 'slot-picker';
  const cards = [];
  for(let n=1;n<=SLOT_COUNT;n++){
    const info = slotSummary(n);
    const label = info ? `Level ${info.level || 1} · ${info.kills}/2 Goths beaten · ${info.hp}/${info.maxHp} HP${info.when ? ' · ' + info.when : ''}` : 'Empty';
    cards.push(`<button type="button" class="slot-card${info?'':' empty'}" data-slot="${n}" ${mode==='load'&&!info?'disabled':''}><span class="slot-n">SLOT ${n}</span><span class="slot-info">${label}</span></button>`);
  }
  box.innerHTML = `<div class="slot-box"><div class="slot-title">${mode==='new'?'♥ NEW GAME — PICK A SLOT ♥':'♥ LOAD GAME ♥'}</div>${cards.join('')}<div class="slot-confirm" hidden></div><button type="button" class="slot-back">BACK</button></div>`;
  wrap.appendChild(box);
  const confirmBox = box.querySelector('.slot-confirm');
  box.querySelector('.slot-back').addEventListener('click', () => box.remove());
  box.querySelectorAll('.slot-card').forEach(b => b.addEventListener('click', () => {
    const n = +b.dataset.slot;
    if(mode==='load'){ box.remove(); loadSavedGame(n); return; }
    const go = () => { document.getElementById('title-screen')?.classList.add('title-leaving'); box.remove(); setTimeout(() => startNewGame(n), 420); };
    if(!readSlot(n)){ go(); return; }
    confirmBox.hidden = false;
    confirmBox.innerHTML = `<div>Slot ${n} already has a saved game. Start over and <b>delete it</b>?</div><div class="slot-confirm-btns"><button type="button" class="slot-yes">YES, REPLACE IT</button><button type="button" class="slot-no">NO, KEEP IT</button></div>`;
    confirmBox.querySelector('.slot-yes').addEventListener('click', go);
    confirmBox.querySelector('.slot-no').addEventListener('click', () => { confirmBox.hidden = true; });
  }));
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

// V9.80: new boot flow -> loading bat -> funny disclaimer/credits -> title screen
function showBoot(){
  // V9.80: only show the loading bat + disclaimer on the first load of the session.
  // Save & Quit reloads the page, and should drop straight to the title screen.
  try { if (sessionStorage.getItem('gg_booted')) { playMusic('menu'); showTitle(); return; } sessionStorage.setItem('gg_booted', '1'); } catch (e) {}
  setLoopSfx('ambience', false);
  root.innerHTML = `
    <section class="gg-boot" aria-label="Loading">
      <img class="gg-boot-bat" src="assets/story/loading-bat.webp" alt="">
      <p class="gg-boot-loading">loading the abyss...</p>
    </section>`;
  let done = false;
  const go = () => { if (done) return; done = true; showDisclaimer(); };
  // advance once the key art is ready (or after a short beat, whichever comes first)
  const bat = root.querySelector('.gg-boot-bat');
  if (bat && bat.complete) setTimeout(go, 1300); else { bat?.addEventListener('load', () => setTimeout(go, 900)); setTimeout(go, 2600); }
}

function showDisclaimer(){
  // V9.81: no more boxed card - full-screen rolling credits (the lines scroll up like a film's),
  // and the closing line no longer says "go find your princess" (it was spoiling the later kidnap reveal).
  // V9.82: it now rolls up and SETTLES centered instead of continuing to scroll off the top, so there's time to read it.
  // V9.84: Scarlett's own voice reading the disclaimer plays over a vintage-jazz bed; both
  // fade out into the title screen's menu music once the person moves on.
  // V9.86: the voice used to start the instant this screen rendered - before the credits text had
  // even scrolled up into view - and the button let you skip past it while it was still talking
  // (or, if it had overlapped itself, while TWO copies were talking). Now it waits for the text to
  // arrive, and "ENTER THE ABYSS" / Enter / Space are locked out until the line has genuinely finished.
  root.innerHTML = `
    <section class="gg-boot gg-disclaimer" aria-label="Disclaimer">
      <div class="gg-credits-roll" id="gg-credits-roll">
        <h1 class="gg-disclaimer-title">A Few Solemn Words</h1>
        <p>Goodbye Goth is a work of fiction. Any resemblance to real goths, people or puffles is purely coincidental.</p>
        <p>No eyeliner was wasted in the making of this game. Side effects may include an unexpected urge to listen to The Cure, mild fishnet envy, and a seemingly irrational fear of pale women. Play responsibly.</p>
        <p class="gg-disclaimer-credit">Lovingly handcrafted for Olly.</p>
      </div>
      <button id="gg-disclaimer-go" class="primary gg-disclaimer-skip" type="button" disabled>ENTER THE ABYSS &#9654;</button>
    </section>`;
  playMusic('disclaimer');
  const btn = document.getElementById('gg-disclaimer-go');
  let voiceDone = false;
  const markVoiceDone = () => { if (voiceDone) return; voiceDone = true; btn.disabled = false; };
  // .gg-credits-roll rolls up from below the screen over 4.6s (see css/game.css); with its
  // ease-out curve the text is already readable well before that settles, so 1.5s is a beat
  // after render but still well ahead of the full roll finishing.
  const TEXT_APPEAR_MS = 1500;
  const voiceTimer = setTimeout(() => playVoiceLine('disclaimer-voice', 1, markVoiceDone), TEXT_APPEAR_MS);
  // Safety net: the real clip is ~19.4s. If it's blocked outright (or missing) and never actually
  // plays, don't leave the player stuck forever unable to continue - unlock anyway after a
  // generous ceiling.
  const safetyTimer = setTimeout(markVoiceDone, TEXT_APPEAR_MS + 22000);
  const go = () => {
    if (!voiceDone) return;   // can't enter the abyss until she's finished speaking
    clearTimeout(voiceTimer); clearTimeout(safetyTimer);
    window.removeEventListener('keydown', onKey);
    stopVoiceLine(); playMusic('menu', 1200); showTitle();
  };
  const onKey = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } };
  btn.addEventListener('click', go, { once:true });
  window.addEventListener('keydown', onKey);
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

  document.getElementById('title-art-new').addEventListener('click', () => showSlotPicker('new'));
  document.getElementById('title-load').addEventListener('click', () => showSlotPicker('load'));
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
  playMusic('map');   // V9.23: the map music starts as the cutscene ends and the Welcome screen appears
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
          <div class="control-item"><span class="control-key">${hintHTML('move')}</span><span class="control-action">Move</span></div>
          <div class="control-item"><span class="control-key">${hintHTML('jump')}</span><span class="control-action">Jump</span></div>
          <div class="control-item"><span class="control-key">${hintHTML('dodge')}</span><span class="control-action">Dodge</span></div>
          <div class="control-item"><span class="control-key">${hintHTML('crouch')}</span><span class="control-action">Crouch (hold)</span></div>
          <div class="control-item"><span class="control-key">${hintHTML('attack')}</span><span class="control-action">Punch (tap) / Heavy attack (hold, once earned)</span></div>
          <div class="control-item"><span class="control-key">${hintHTML('up')}</span><span class="control-action">Potion (in a fight)</span></div>
          <div class="control-item"><span class="control-key">${hintHTML('interact')}</span><span class="control-action">Pick up / interact</span></div>
          <div class="control-item"><span class="control-key">${hintHTML('inventory')}</span><span class="control-action">Open inventory (backpack)</span></div>
          <div class="control-item"><span class="control-key">${hintHTML('settings')}</span><span class="control-action">Settings (or the ⚙ button)</span></div>
        </div>
        <p class="controls-note">Keys and controller buttons can be changed in Settings, under Controls. Saving your game is in Settings too.</p>
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

// V9.96: the Level 2 title card - shown once, straight after Level 1's Ready button,
// before the Mystical Forest map itself mounts. Mirrors showLevel1Intro's pattern.
function showLevel2Intro(carryOver){
  playMusic('');
  showImageTransitionScreen(
    'assets/story/level2-entrance.webp',
    'Level 2: The Mystical Forest. Enter if you dare.',
    () => { playMusic('map'); mountLevel1(false, 2, carryOver); },
    'Level 2 entrance'
  );
}

// V9.94: listeners from the previous level are removed when the next one mounts.
let levelListeners = null;
function mountLevel1(loadSaved=false, levelNum=1, carry=null){
  levelListeners?.abort();
  levelListeners = new AbortController();
  const listen = { signal: levelListeners.signal };
  const L2 = levelNum === 2 ? LEVEL2 : null;
  root.innerHTML = `
    <section class="panel game-screen" style="position:relative">
      <div class="game-head">
        <div><strong>LEVEL ${L2 ? 2 : 1}</strong><div class="small">${L2 ? L2.name : 'THE HAUNTED CEMETERY'}</div></div>
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
          <button id="inventory-button" type="button" style="min-height:34px;padding:6px 10px;font-size:12px;">🎒 BACKPACK <span id="inventory-count">0/10</span></button>
          <button id="journal-button" type="button" class="hidden" style="min-height:34px;padding:6px 10px;font-size:12px;">📖 TOM'S JOURNAL</button>
          <button id="hud-gear" class="hud-gear" type="button" title="Settings (O)" aria-label="Settings">⚙</button>
        </div>
        <div id="combo-hud" class="combo-hud" style="display:none" aria-label="Punch combo"><span class="combo-pips"><i></i><i></i><i></i></span><span id="combo-text" class="combo-text"></span></div>
      </div>
      <div class="game-layout">
        <div class="play-column">
          <div class="world-wrap">
            <canvas id="world" width="1536" height="1024" tabindex="0" aria-label="${L2 ? 'Level 2 mystical forest' : 'Level 1 haunted cemetery'}"></canvas>
          </div>
          <div id="dialogue" class="dialogue" aria-live="polite">${L2 ? L2.dialogue.start : 'You wake up somewhere very dark...'}</div>
        </div>
      </div>

      <div id="inventory" class="overlay hidden" style="z-index:40">
        <div class="overlay-box center inventory-box">
          <div class="story-title">OLLY'S BACKPACK</div>
          <div class="inventory-slots" aria-label="Inventory slots">
            <div class="inventory-slot">01</div><div class="inventory-slot">02</div><div class="inventory-slot">03</div><div class="inventory-slot">04</div><div class="inventory-slot">05</div>
            <div class="inventory-slot">06</div><div class="inventory-slot">07</div><div class="inventory-slot">08</div><div class="inventory-slot">09</div><div class="inventory-slot">10</div>
          </div>
          <p class="inventory-empty-copy">Nothing in here yet. A suspiciously empty bag.</p>
          <button id="inventory-close" type="button" class="primary inventory-close-button">CLOSE</button>
        </div>
      </div>

      <div id="journal" class="overlay hidden" style="z-index:40">
        <div class="overlay-box center journal-box">
          <div class="story-title">TOM'S JOURNAL</div>
          <div class="journal-intro">Notes from Tom, reluctant travelling companion and even more reluctant biographer.</div>
          <div id="journal-list" class="journal-list"></div>
          <button id="journal-close" type="button" class="primary inventory-close-button">CLOSE</button>
        </div>
      </div>

      <div id="encounter" class="overlay hidden"><div class="overlay-box center encounter-box">
        <img id="encounter-image" class="encounter-art" alt="Encounter artwork">
        <div id="encounter-name" class="story-title">ENCOUNTER</div>
        <div id="encounter-species" class="encounter-species"></div>
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
        <div id="would-display" class="minigame-display">“Can I ask you a question... have you ever...”</div>
        <div class="timing-track"><div id="timing-zone" class="timing-zone"></div><div id="timing-cursor" class="timing-cursor"></div></div>
        <button id="would-tap" class="primary timing-button">WOULD YOU?</button>
        <p id="would-feedback" class="small">Listen for the phrase. The timing gets quicker each round.</p>
        <div id="would-pips" class="would-pips" aria-label="Rounds completed"></div>
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
          <div class="patricia-title">You've encountered Patricia, The Classic Goth <span class="patricia-species">(Gothicus Tradicionalis)</span>.</div>
          <p>She loves watching you squirm and thinks you're rather adorable. She's terribly bored, so she'll humour you with a fight. Not that you stand much chance of surviving.</p>
          <div class="patricia-btns"><button id="boss-start" class="primary" type="button">I'm Ready</button><button id="boss-save-quit" type="button">Save and Quit</button></div>
        </div>
      </div>

      <div id="win" class="overlay hidden" style="z-index:60;background:#07040a;align-items:center;justify-content:center;overflow:auto"><div class="level-complete">
        <img class="level-complete-art" src="assets/story/level1-complete.webp?v=9820" alt="Level 1 complete: Olly stands victorious while Patricia sits defeated on the cobbles.">
        <div class="level-complete-text" id="win-text"><h2 class="lc-big">Congratulations</h2><p class="lc-sub">You've defeated 1 (one) absolutely terrifying, fishnet-clad, eyeliner-obsessed menace of a woman. At least she didn't make you listen to The Cure. You're one step closer to finding your princess... maybe.</p><p class="lc-ask">Ready for Level 2?</p></div>
        <div class="level-complete-btns"><button id="win-ready" class="primary" type="button">Ready</button><button id="win-save-quit" type="button">Save and Quit</button></div>
      </div></div>
    </section>`;

  if(L2){   // V9.94: Level 2's boss screen (Sophia) and its end-of-level screen
    const bi = document.getElementById('boss-intro');
    const art = bi?.querySelector('.patricia-art');
    if(art){ art.src = L2.boss.image; art.alt = L2.boss.name; }
    const bt = bi?.querySelector('.patricia-title');
    if(bt) bt.innerHTML = `You've encountered ${L2.boss.name} <span class="patricia-species">(${L2.boss.species})</span>.`;
    const bp = bi?.querySelector('.patricia-card p');
    if(bp) bp.innerHTML = L2.boss.text.split('\n\n').map(line => line.replace(/\n/g, '<br>')).join('<br><br>');
    const win = document.getElementById('win');
    const wa = win?.querySelector('.level-complete-art');
    if(wa){ wa.src = L2.complete.image; wa.alt = 'Level 2 complete'; }
    const set = (sel, txt) => { const el = win?.querySelector(sel); if(el) el.textContent = txt; };
    set('.lc-big', L2.complete.big); set('.lc-sub', L2.complete.sub); set('.lc-ask', L2.complete.ask);
  }

  const ui = {
    canvas:document.getElementById('world'), dialogue:document.getElementById('dialogue'),
    hpEl:document.getElementById('player-hp-text'), hpFill:document.getElementById('player-hp-fill'), gothEl:document.getElementById('goth-count'), relEl:document.getElementById('rel-state'), puzzleEl:document.getElementById('puzzle-state'),
    inventory:document.getElementById('inventory'), inventoryButton:document.getElementById('inventory-button'), inventoryClose:document.getElementById('inventory-close'),
    journal:document.getElementById('journal'), journalButton:document.getElementById('journal-button'), journalClose:document.getElementById('journal-close'), journalList:document.getElementById('journal-list'),
    encounter:document.getElementById('encounter'), encounterImage:document.getElementById('encounter-image'), encounterName:document.getElementById('encounter-name'), encounterSpecies:document.getElementById('encounter-species'), encounterText:document.getElementById('encounter-text'), encounterReady:document.getElementById('encounter-ready'), encounterExplore:document.getElementById('encounter-explore'),
    combat:document.getElementById('combat'), combatCanvas:document.getElementById('combat-canvas'), combatName:document.getElementById('combat-name'), enemyHp:document.getElementById('enemy-hp'), enemyHpText:document.getElementById('enemy-hp-text'), enemyStunWrap:document.getElementById('enemy-stun-wrap'), enemyStun:document.getElementById('enemy-stun'), enemyStunLabel:document.getElementById('enemy-stun-label'), combatStatus:document.getElementById('combat-status'),
    death:document.getElementById('death'), deathText:document.getElementById('death-text'), retryCombat:document.getElementById('retry-combat'), backMap:document.getElementById('back-map'),
    completion:document.getElementById('completion'), completionImage:document.getElementById('completion-image'), completionTitle:document.getElementById('completion-title'), completionCopy:document.getElementById('completion-copy'), completionContinue:document.getElementById('completion-continue'),
    relationship:document.getElementById('relationship'), relationshipCanvas:document.getElementById('relationship-canvas'), wouldDisplay:document.getElementById('would-display'), wouldTap:document.getElementById('would-tap'), wouldFeedback:document.getElementById('would-feedback'), timingZone:document.getElementById('timing-zone'), timingCursor:document.getElementById('timing-cursor'),
    puzzle:document.getElementById('puzzle'), puzzleFeedback:document.getElementById('puzzle-feedback'), bossIntro:document.getElementById('boss-intro'), bossStart:document.getElementById('boss-start'), win:document.getElementById('win'), replay:document.getElementById('replay')
  };

  initSettings();
  playMusic('map');   // map + story music (assets/audio/music/map.mp3); starts after the first click
  const level = createLevel1(ui, { level: levelNum, carry });
  ui.encounterReady.addEventListener('click',()=>level.confirmEncounter());
  ui.encounterExplore.addEventListener('click',()=>level.closeEncounter());
  ui.retryCombat.addEventListener('click',()=>level.retryCombat());
  ui.backMap.addEventListener('click',()=>{ if(ui.backMap.dataset.mode==='quit') level.saveAndQuit(); else level.backToMap(); });
  ui.completionContinue.addEventListener('click',()=>level.continueCompletion());
  ui.wouldTap.addEventListener('click',()=>level.completeRelationship());
  ui.bossStart.addEventListener('click',()=>level.startBoss());
  document.getElementById('boss-save-quit')?.addEventListener('click',()=>level.saveAndQuit());
  document.getElementById('win-save-quit')?.addEventListener('click',()=>level.saveAndQuit());
  // V9.84-preview: Ready now genuinely progresses into the Level 2 preview (mountLevel2,
  // same screen the ?level=2 debug entry point shows) instead of the old "Coming Soon"
  // stub - Scarlett asked to test the real end-of-Level-1 handoff itself, cheat-triggered
  // via "level2" in the cheat console rather than only reachable by beating Patricia.
  // Note this swaps the REAL win-ready button too, not just the cheat path, since they're
  // the same button - so actually finishing Level 1 for real now leads here as well.
  // V9.94: Level 1's Ready goes into the real Level 2 (same engine), carrying Olly's rewards over.
  // Level 2's Ready: Level 3 isn't built yet.
  document.getElementById('win-ready')?.addEventListener('click',()=>{
    if(L2){ const a = document.querySelector('#win .lc-ask'); if(a) a.textContent = 'Level 3 is still being built. Save and Quit for now - your progress is kept.'; return; }
    const carryOver = level.carryState?.();
    level.stop();
    showLevel2Intro(carryOver);   // V9.96: title card plays before the Level 2 map mounts
  });
  // V9.85: pass which wrong button this is (0,1,2 in DOM order) so each one gets its own stable
  // voice line for the life of one Princess Question, instead of a fresh random pick every click.
  // V9.94: worked out at click time, because Level 2 relabels the answers when its question opens.
  document.querySelectorAll('[data-answer]').forEach(b=>b.addEventListener('click',()=>{
    const wrongBtns = [...document.querySelectorAll('#puzzle [data-answer="wrong"]')];
    level.answerPuzzle(b.dataset.answer, b.dataset.answer==='wrong' ? Math.max(0, wrongBtns.indexOf(b)) : undefined);
  }));
  ui.combatCanvas.addEventListener('mousedown',e=>{
    if(e.button!==2) return;   // V9.31: punching is the X key only (left-click is kept free for shooting arrows later)
    e.preventDefault();
    e.stopPropagation();
    if(e.button===2){
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

  // V10.15: Tom's Journal - the in-game compendium, built fresh from L2.journal + level.journalStatus()
  // every time it opens, so it always reflects what's actually been uncovered/defeated so far.
  function renderJournal(){
    if(!ui.journalList || !L2?.journal) return;
    const status = level.journalStatus?.() || {};
    ui.journalList.innerHTML = L2.journal.map(entry => {
      const unlocked = !!entry.always || (!entry.future && !!status.seen?.[entry.key]);
      const defeated = !unlocked ? false
        : entry.defeated !== undefined ? entry.defeated
        : entry.key === 'sophia' ? !!status.bossDefeated
        : entry.enemyType ? !!status.enemyDead?.[entry.enemyType]
        : false;
      const img = unlocked && entry.image ? `<img class="journal-entry-img" src="${entry.image}" alt="${entry.name}">` : '<div class="journal-entry-img journal-entry-mystery">❔</div>';
      const name = unlocked ? entry.name : '???';
      const species = unlocked && entry.species ? `<div class="journal-entry-species">(${entry.species})</div>` : '';
      const status2 = unlocked ? `<div class="journal-entry-status">${defeated ? 'DEFEATED' : 'AT LARGE'}</div>` : '';
      const text = unlocked ? entry.lore : entry.teaser;
      return `<div class="journal-entry ${unlocked ? 'journal-unlocked' : 'journal-locked'}">${img}<div class="journal-entry-body"><div class="journal-entry-name">${name}</div>${species}${status2}<p class="journal-entry-text">${text}</p></div></div>`;
    }).join('');
  }
  function toggleJournal(forceOpen){
    if(!ui.journal) return;
    const willOpen = forceOpen !== undefined ? forceOpen : ui.journal.classList.contains('hidden');
    if(willOpen){
      renderJournal();
      level.setMoveKey?.('w',false); level.setMoveKey?.('a',false); level.setMoveKey?.('s',false); level.setMoveKey?.('d',false);
      ui.journal.classList.remove('hidden');
      ui.journal.setAttribute('aria-hidden','false');
    } else {
      ui.journal.classList.add('hidden');
      ui.journal.setAttribute('aria-hidden','true');
    }
  }
  ui.journalButton?.addEventListener('click',()=>toggleJournal(true));
  ui.journalClose?.addEventListener('click',()=>toggleJournal(false));

  const MOVE_KEY = { up:'w', down:'s', left:'a', right:'d' };
  // V10.16: Punch and Heavy share one key now - tap it for a punch, hold it past HEAVY_HOLD_MS
  // for Heavy (fires the instant the hold crosses the threshold, rather than waiting for release,
  // so it feels responsive). If Heavy isn't unlocked yet, combatHeavyAttack() itself shows the
  // "locked" message and does nothing, same as it always has - that one held press just doesn't
  // land a punch, which only ever happens before both Level 1 Goths are beaten.
  const HEAVY_HOLD_MS = 350;
  let attackTimer = 0, attackFiredHeavy = false, attackIsDown = false;
  function isInFight(){ return !ui.combat.classList.contains('hidden') || !!level.inExtraFight?.(); }   // V9.94: Devil's Fingers / Sophia have their own arena
  window.ggIsInFight = isInFight;   // so gamepad.js (a separate, DOM-only module) can gate D-pad-Up potion quick-deploy to fights only
  window.addEventListener('keydown',e=>{
    if(e.ctrlKey || e.metaKey || e.altKey) return;
    const act = actionForKey(e.key);
    if(!act) return;
    if(act==='inventory' && !e.repeat){ e.preventDefault(); toggleInventory(); return; }
    if(!ui.journal?.classList.contains('hidden')){ if(e.key==='Escape') toggleJournal(false); return; }   // V10.15: Tom's Journal - no map/combat input while it's open
    if(!ui.inventory?.classList.contains('hidden')) return;
    const inFight = isInFight();
    if(act==='dodge' && inFight){
      e.preventDefault();
      if(!e.repeat) level.combatDodge?.();
      return;
    }
    if(act==='crouch'){
      e.preventDefault();
      if(!e.repeat) level.setCrouch?.(true);
      return;
    }
    if(act==='attack' && inFight){
      e.preventDefault();
      if(!e.repeat){
        attackIsDown = true; attackFiredHeavy = false;
        clearTimeout(attackTimer);
        attackTimer = setTimeout(()=>{ if(attackIsDown){ attackFiredHeavy = true; level.combatHeavyAttack?.(); } }, HEAVY_HOLD_MS);
      }
      return;
    }
    if(act==='veil' && inFight){
      e.preventDefault();
      if(!e.repeat) level.combatVeil?.();
      return;
    }
    if(act==='up' && inFight){
      e.preventDefault();
      if(!e.repeat) level.combatPotionQuick?.();
      return;
    }
    if(MOVE_KEY[act]){ e.preventDefault(); level.setMoveKey?.(MOVE_KEY[act],true); return; }
    if(act==='jump'){ e.preventDefault(); if(!e.repeat) level.primaryAction(); return; }
  }, listen);
  // Save lives in Settings now: the Settings window calls this.
  window.ggSaveGame = () => { try { return !!level.saveGame(); } catch(e) { return false; } };
  window.ggSaveAndQuit = () => { try { level.saveAndQuit(); } catch(e) {} };
  window.addEventListener('keyup',e=>{
    const act = actionForKey(e.key);
    if(act==='crouch') level.setCrouch?.(false);
    if(act==='attack' && attackIsDown){
      attackIsDown = false;
      clearTimeout(attackTimer);
      if(!attackFiredHeavy) level.combatAttack?.();   // released before the hold threshold - a plain punch
    }
    if(MOVE_KEY[act]) level.setMoveKey?.(MOVE_KEY[act],false);
  }, listen);
  // V10.3: "stuck walking in place" bug - if the window/tab loses focus while a direction is
  // held (switching apps, clicking another window, a held modifier combo swallowing the
  // keyup), the browser never sends that key's keyup and setMoveKey never hears about it, so
  // Olly reads as permanently "moving" in that direction until the same key happens to be
  // pressed and released again. Clear every direction whenever the window loses focus or the
  // tab is hidden, so a missed keyup can never leave him walking against nothing.
  // V10.16: the same missed-keyup risk applies to crouch (he'd be stuck crouched) and to the
  // attack hold-timer (a stale timeout could fire Heavy well after the key was actually let go).
  const clearAllMoveKeys = () => {
    for (const k of Object.values(MOVE_KEY)) level.setMoveKey?.(k, false);
    level.setCrouch?.(false);
    attackIsDown = false; attackFiredHeavy = false; clearTimeout(attackTimer);
  };
  window.addEventListener('blur', clearAllMoveKeys);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearAllMoveKeys(); });
  registerCheats(level.cheat);
  level.start();
  if(loadSaved){
    requestAnimationFrame(() => {
      const ok = level.loadGame();
      if(!ok) showTitleMessage('No saved game found.');
    });
  }
}

// V9.85-preview: Level 3 has no theme/map of its own yet, so this is just the relocated
// "Princess Burrito" minigame (see level3.js) shown full-screen, reachable the same
// debug-only way as Level 2 (?level=3). Not reachable from normal play, nothing here is
// committed/pushed until reviewed.
function mountLevel3(){
  root.innerHTML = `
    <section class="panel game-screen" style="position:relative">
      <div class="game-head">
        <div><strong>LEVEL 3 (PREVIEW)</strong><div class="small">THEME TBD - the relocated Princess Burrito minigame, work in progress</div></div>
      </div>
      <div class="game-layout">
        <div class="play-column">
          <div class="world-wrap">
            <canvas id="world3" width="1536" height="1024" tabindex="0" aria-label="Level 3 preview minigame"></canvas>
          </div>
        </div>
      </div>
      <div style="position:absolute;top:10px;right:10px;z-index:50">
        <button id="l3-exit" type="button" style="min-height:34px;padding:6px 10px;font-size:12px;">EXIT PREVIEW</button>
      </div>
    </section>`;

  const ui3 = { canvas: document.getElementById('world3'), onExit: () => exitLevel3() };
  const level3 = createLevel3(ui3);

  function exitLevel3(){
    level3.stop();
    document.getElementById('l3-exit')?.removeEventListener('click', exitLevel3);
    showBoot();
  }
  document.getElementById('l3-exit')?.addEventListener('click', exitLevel3);

  level3.start();
}

// One click sound for every menu / story / dialogue button. Map icons, pickups and fights have their own sounds.
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('button, [role="button"]');
  if (b && !b.disabled && !b.closest('#combat .combat-arena')) playSfx('click');
}, true);
initSettings();
initCheats();
initGamepad();
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
// V9.84: menu music used to start here unconditionally, underneath the loading bat AND
// the disclaimer screen, which left the disclaimer with no music bed of its own. Now the
// disclaimer starts its own jazz bed (see showDisclaimer) and fades into 'menu' itself
// when the person moves on, so this only needs to kick off music for the debug previews
// below, which skip the boot flow (and its music) entirely.
// V9.84-preview: debug-only entry straight into the Level 2 scaffolding via ?level=2 in
// the URL, so Scarlett can look at it without this touching the real title -> Level 1 ->
// "Coming Soon" flow at all. Remove this (and mountLevel2/level2.js) once Level 2 is ready
// to be the real handoff target.
{
  const debugLevel = new URLSearchParams(location.search).get('level');
  if (debugLevel === '2') { playMusic('map'); mountLevel1(false, 2); }   // V9.94: straight into the real Level 2 (for testing)
  else if (debugLevel === '3') { playMusic('menu'); mountLevel3(); }
  else showBoot();   // V9.80: loading bat -> disclaimer (own music) -> title
}
