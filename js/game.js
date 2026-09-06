
import { StoryController } from "./story.js";
import { createLevel1 } from "./levels/level1.js";

const root=document.getElementById("game-root");
function mountLevel(){
  root.innerHTML=`
    <section class="panel" style="position:relative">
      <div class="game-head">
        <div><strong>LEVEL 1</strong><div class="small">THE HAUNTED CEMETERY</div></div>
        <div class="stats">
          <span class="pill">❤️ <span id="hp">5</span></span>
          <span class="pill">🧟 <span id="goth-count">0/2</span></span>
          <span class="pill">💕 <span id="rel-state">Locked</span></span>
          <span class="pill">🧩 <span id="puzzle-state">Locked</span></span>
        </div>
      </div>
      <div id="world-wrap">
        <canvas id="world" width="1000" height="600" tabindex="0" aria-label="Level 1 haunted cemetery"></canvas>
        <div class="help">Explore to reveal the cemetery • WASD / arrow keys move • SPACE / ATTACK fires an arrow</div>
      </div>
      <div id="dialogue" class="dialogue" aria-live="polite">You wake up somewhere very dark...</div>
      <div class="controls">
        <div class="dpad">
          <span></span><button data-dir="up">↑</button><span></span>
          <button data-dir="left">←</button><button data-dir="down">↓</button><button data-dir="right">→</button>
        </div>
        <button id="attack" class="primary">🏹 ATTACK</button>
        <button id="interact">✦ INTERACT</button>
      </div>
      <div class="checklist">
        <div id="goal-goths">○ Defeat the required Zombie Goths</div>
        <div id="goal-rel">○ Complete the Relationship Challenge</div>
        <div id="goal-puzzle">○ Solve the Puzzle</div>
        <div id="goal-boss">🔒 Boss gate locked</div>
      </div>

      <div id="encounter" class="overlay hidden">
        <div class="overlay-box center">
          <img id="encounter-image" class="story-art" alt="Zombie Goth encounter">
          <div id="encounter-name" class="story-title">ZOMBIE GOTH</div>
          <p id="encounter-text"></p>
          <div class="story-actions"><button id="encounter-fight" class="primary">FIGHT</button></div>
        </div>
      </div>

      <div id="combat" class="overlay hidden">
        <div class="overlay-box">
          <div class="combat-top"><strong id="combat-name">ZOMBIE GOTH</strong><span class="small" id="combat-pattern">Incoming attack...</span></div>
          <div class="health"><div id="enemy-hp"></div></div>
          <div class="combat-arena"><canvas id="combat-canvas" width="700" height="300"></canvas></div>
          <div id="combat-status" class="small">Watch the warning. Dodge the attack, then fire.</div>
          <div class="combat-actions" style="margin-top:10px">
            <button id="combat-attack" class="primary">🏹 FIRE ARROW</button>
            <button id="combat-dodge">↪ DODGE</button>
          </div>
        </div>
      </div>

      <div id="relationship" class="overlay hidden">
        <div class="overlay-box center">
          <img class="story-art" src="assets/story/level1-entry-unique.png" alt="Level 1 cemetery scene">
          <div class="story-title">WOULD YOU...</div>
          <p>Olly is trying to ask you something.</p>
          <div id="would-display" class="minigame-display">“Would you...”</div>
          <button id="would-tap" class="primary">LET HIM FINISH</button>
          <p id="would-feedback" class="small"></p>
        </div>
      </div>

      <div id="puzzle" class="overlay hidden">
        <div class="overlay-box center">
          <img class="story-art" src="assets/story/princess-puzzle-unique.png" alt="Princess-themed cemetery puzzle">
          <div class="story-title">PRINCESS ETIQUETTE</div>
          <p>What is the appropriate way to ask a princess to undress?</p>
          <div class="answer-grid">
            <button data-answer="wrong">“Your Highness, may I assist you with your attire?”</button>
            <button data-answer="correct">“Get your kit off, mate.”</button>
            <button data-answer="wrong">“Would you kindly remove your garments?”</button>
            <button data-answer="wrong">“Princess, the time has come to retire your dress.”</button>
          </div>
          <p id="puzzle-feedback" class="small"></p>
        </div>
      </div>

      <div id="boss-intro" class="overlay hidden">
        <div class="overlay-box center">
          <img class="story-art" src="assets/story/classic-goth-fight.png" alt="Classic Goth boss">
          <div class="story-title">THE CLASSIC GOTH</div>
          <p>Black lace. Red wine. Existential dread.</p>
          <p><strong>“You really thought it would be that easy?”</strong></p>
          <button id="boss-start" class="primary">ENTER BOSS FIGHT</button>
        </div>
      </div>

      <div id="win" class="overlay hidden">
        <div class="overlay-box center">
          <div class="win-title">LEVEL 1 COMPLETE 🖤</div>
          <p>You defeated the Classic Goth.</p>
          <p><strong>Level 2 is unlocked.</strong></p>
          <button id="replay" class="primary">PLAY LEVEL 1 AGAIN</button>
        </div>
      </div>
    </section>
  `;

  const ui={
    canvas:document.getElementById("world"),
    dialogue:document.getElementById("dialogue"),
    hpEl:document.getElementById("hp"),
    gothEl:document.getElementById("goth-count"),
    relEl:document.getElementById("rel-state"),
    puzzleEl:document.getElementById("puzzle-state"),
    goalGoths:document.getElementById("goal-goths"),
    goalRel:document.getElementById("goal-rel"),
    goalPuzzle:document.getElementById("goal-puzzle"),
    goalBoss:document.getElementById("goal-boss"),
    encounter:document.getElementById("encounter"),
    encounterImage:document.getElementById("encounter-image"),
    encounterName:document.getElementById("encounter-name"),
    encounterText:document.getElementById("encounter-text"),
    encounterFight:document.getElementById("encounter-fight"),
    combat:document.getElementById("combat"),
    combatCanvas:document.getElementById("combat-canvas"),
    combatName:document.getElementById("combat-name"),
    combatPattern:document.getElementById("combat-pattern"),
    combatHp:document.getElementById("enemy-hp"),
    combatStatus:document.getElementById("combat-status"),
    combatAttack:document.getElementById("combat-attack"),
    combatDodge:document.getElementById("combat-dodge"),
    relationship:document.getElementById("relationship"),
    wouldDisplay:document.getElementById("would-display"),
    wouldTap:document.getElementById("would-tap"),
    wouldFeedback:document.getElementById("would-feedback"),
    puzzle:document.getElementById("puzzle"),
    puzzleFeedback:document.getElementById("puzzle-feedback"),
    bossIntro:document.getElementById("boss-intro"),
    bossStart:document.getElementById("boss-start"),
    win:document.getElementById("win"),
    replay:document.getElementById("replay")
  };

  const level=createLevel1(ui);
  document.querySelectorAll("[data-dir]").forEach(b=>b.addEventListener("click",()=>level.move(b.dataset.dir)));
  document.getElementById("attack").addEventListener("click",()=>level.primaryAction());
  document.getElementById("interact").addEventListener("click",()=>level.interact());
  ui.encounterFight.addEventListener("click",()=>level.startEncounterFight());
  ui.combatAttack.addEventListener("click",()=>level.combatAttack());
  ui.combatDodge.addEventListener("click",()=>level.combatDodge());
  ui.wouldTap.addEventListener("click",()=>level.completeRelationship());
  ui.bossStart.addEventListener("click",()=>level.startBoss());
  ui.replay.addEventListener("click",()=>mountLevel());
  document.querySelectorAll("[data-answer]").forEach(b=>b.addEventListener("click",()=>level.answerPuzzle(b.dataset.answer)));

  window.addEventListener("keydown",(e)=>{
    const k=e.key.toLowerCase();
    if(["arrowup","arrowdown","arrowleft","arrowright"," ","w","a","s","d"].includes(k))e.preventDefault();
    if(k==="arrowup"||k==="w")level.move("up");
    if(k==="arrowdown"||k==="s")level.move("down");
    if(k==="arrowleft"||k==="a")level.move("left");
    if(k==="arrowright"||k==="d")level.move("right");
    if(k===" ")level.primaryAction();
  });
  level.start();
}

const story=new StoryController(root,mountLevel);
story.render();
