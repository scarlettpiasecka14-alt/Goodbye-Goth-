import { createLevel1 } from "./levels/level1.js";
import { StoryController } from "./story.js";

const root = document.getElementById("game-root");

const state = {
  level: 1,
  hp: 5,
  maxHp: 5,
  gothsDefeated: 0,
  puzzleSolved: false,
  phase: "intro"
};

const story = new StoryController(root, {
  onComplete: () => startGame()
});
story.render();

function startGame() {
  root.innerHTML = `
    <section class="panel" style="position:relative">
      <div class="game-head">
        <div><strong>LEVEL 1</strong><div class="small">The Haunted Cemetery</div></div>
        <div class="stats">
          <span class="pill">❤️ <span id="hp">5</span></span>
          <span class="pill">⚔️ Goths <span id="kills">0</span>/2</span>
          <span class="pill">🧩 <span id="puzzle-state">Locked</span></span>
        </div>
      </div>
      <div id="world-wrap">
        <canvas id="world" width="1000" height="600" tabindex="0" aria-label="Level 1 cemetery"></canvas>
        <div class="help">Explore to reveal the cemetery. Arrow keys / WASD move. SPACE attacks.</div>
      </div>
      <div id="dialogue" class="dialogue" aria-live="polite">Find a way through the cemetery.</div>
      <div class="controls">
        <div class="dpad">
          <span></span><button data-dir="up">↑</button><span></span>
          <button data-dir="left">←</button><button data-dir="down">↓</button><button data-dir="right">→</button>
        </div>
        <button class="primary" id="attack">⚔️ ATTACK</button>
        <button id="interact">✦ INTERACT</button>
      </div>

      <div id="encounter" class="overlay hidden">
        <div class="overlay-box">
          <img class="story-art" id="encounter-image" alt="Classic Goth illustrated encounter">
          <div id="encounter-name" class="story-title">THE CLASSIC GOTH</div>
          <p id="encounter-text"></p>
          <div class="story-actions"><button class="primary" id="encounter-start">FIGHT</button></div>
        </div>
      </div>

      <div id="combat" class="overlay hidden">
        <div class="overlay-box">
          <div class="combat-top"><strong id="combat-name">THE CLASSIC GOTH</strong><span class="small">Bosses have their own attack patterns.</span></div>
          <div class="bar" style="margin-top:8px"><div id="enemy-hp"></div></div>
          <div class="combat-arena"><canvas id="combat-canvas" width="700" height="300"></canvas></div>
          <div class="small" id="combat-status">Watch the telegraph. Dodge, then attack.</div>
          <div class="story-actions">
            <button class="primary" id="combat-attack">⚔️ ATTACK</button>
            <button id="combat-dodge">↪ DODGE</button>
          </div>
        </div>
      </div>

      <div id="puzzle" class="overlay hidden">
        <div class="overlay-box center">
          <img class="story-art" src="assets/story/classic-goth.png" alt="Classic Goth illustration">
          <div class="story-title">PRINCESS ETIQUETTE</div>
          <p>What is the appropriate way to ask a princess to undress?</p>
          <div class="answer-grid">
            <button data-answer="wrong">“Your Highness, may I assist you with your attire?”</button>
            <button data-answer="correct">“Get your kit off, mate.”</button>
            <button data-answer="wrong">“Would you kindly remove your garments?”</button>
            <button data-answer="wrong">“Princess, the time has come to retire your dress.”</button>
          </div>
          <p id="puzzle-result" class="small"></p>
        </div>
      </div>

      <div id="boss-intro" class="overlay hidden">
        <div class="overlay-box center">
          <img class="story-art" src="assets/story/classic-goth-fight.png" alt="Classic Goth boss fight illustration">
          <div class="story-title">LEVEL 1 BOSS</div>
          <h2>THE CLASSIC GOTH</h2>
          <p>Black lace. Red wine. Existential dread.</p>
          <button class="primary" id="start-boss">ENTER BOSS FIGHT</button>
        </div>
      </div>

      <div id="win" class="overlay hidden">
        <div class="overlay-box center">
          <div class="win-title">LEVEL 1 COMPLETE</div>
          <p>You defeated the Classic Goth.</p>
          <p>The route to Level 2 is open.</p>
          <button class="primary" id="restart">PLAY LEVEL 1 AGAIN</button>
        </div>
      </div>
    </section>
  `;

  const game = createLevel1({
    canvas: document.getElementById("world"),
    dialogue: document.getElementById("dialogue"),
    hpEl: document.getElementById("hp"),
    killsEl: document.getElementById("kills"),
    puzzleEl: document.getElementById("puzzle-state"),
    encounterEl: document.getElementById("encounter"),
    encounterImage: document.getElementById("encounter-image"),
    encounterName: document.getElementById("encounter-name"),
    encounterText: document.getElementById("encounter-text"),
    encounterStart: document.getElementById("encounter-start"),
    combatEl: document.getElementById("combat"),
    combatCanvas: document.getElementById("combat-canvas"),
    combatName: document.getElementById("combat-name"),
    enemyHp: document.getElementById("enemy-hp"),
    combatStatus: document.getElementById("combat-status"),
    combatAttack: document.getElementById("combat-attack"),
    combatDodge: document.getElementById("combat-dodge"),
    puzzleOverlay: document.getElementById("puzzle"),
    puzzleResult: document.getElementById("puzzle-result"),
    bossIntro: document.getElementById("boss-intro"),
    startBoss: document.getElementById("start-boss"),
    winOverlay: document.getElementById("win"),
    restart: document.getElementById("restart"),
    onUpdate: (snapshot) => Object.assign(state, snapshot)
  });

  document.querySelectorAll("[data-dir]").forEach(btn => {
    btn.addEventListener("click", () => game.move(btn.dataset.dir));
  });

  document.getElementById("attack").addEventListener("click", () => game.primaryAction());

  document.getElementById("interact").addEventListener("click", () => game.interact());

  document.querySelectorAll("[data-answer]").forEach(btn => {
    btn.addEventListener("click", () => game.answerPuzzle(btn.dataset.answer));
  });

  document.addEventListener("keydown", (event) => {
    if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
    const k = event.key.toLowerCase();
    if (["arrowup","arrowdown","arrowleft","arrowright"," ","w","a","s","d"].includes(k)) event.preventDefault();
    if (k === "arrowup" || k === "w") game.move("up");
    if (k === "arrowdown" || k === "s") game.move("down");
    if (k === "arrowleft" || k === "a") game.move("left");
    if (k === "arrowright" || k === "d") game.move("right");
    if (k === " ") game.primaryAction();
  }, { once: true });

  game.start();
}
