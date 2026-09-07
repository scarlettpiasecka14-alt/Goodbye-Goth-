export class StoryController {
  constructor(root, onComplete){
    this.root = root;
    this.onComplete = onComplete;
    this.step = 0;
    this.typingTimer = null;
    this.isTyping = false;
    this.typeSpeed = 58;
    this.steps = [
      {
        type:'text',
        text:'It\'s 3:52 AM. Scarlett and Olly are just about to go to sleep...'
      },
      {
        type:'image',
        image:'assets/story/intro-cartoon-goodnight.png',
        alt:'Scarlett and Olly saying goodnight together in bed.'
      },
      {
        type:'text',
        text:'At 4:35 AM, a strange rustling wakes Olly from a dream about watching The Weeknd live...'
      },
      {
        type:'image',
        image:'assets/story/intro-cartoon-huh.png',
        alt:'Olly waking up confused in bed.'
      },
      {
        type:'text',
        text:'He looks around, and notices... Scarlett is GONE.'
      },
      {
        type:'image',
        image:'assets/story/intro-cartoon-awake.png',
        alt:'Olly looking around for Scarlett after waking up.'
      },
      {
        type:'text-note',
        text:'And in her place lies a simple note...'
      },
      {
        type:'image',
        image:'assets/story/intro-cartoon-note.png',
        alt:'A pink ransom note from the Goths telling Olly to rescue Scarlett.'
      }
    ];
  }

  cleanupTyping(){
    if(this.typingTimer){
      clearInterval(this.typingTimer);
      this.typingTimer = null;
    }
    this.isTyping = false;
  }

  render(){
    this.cleanupTyping();
    const s = this.steps[this.step];

    if(s.type === 'image'){
      this.renderImage(s);
      return;
    }

    const isNoteLead = s.type === 'text-note';
    this.root.innerHTML = `
      <section class="story-screen typing-story-screen" aria-label="Goodbye Goth story narration">
        <div class="typing-story-panel ${isNoteLead ? 'note-lead-panel' : ''}">
          <div class="typing-story-text" id="typing-story-text" aria-live="polite"></div>
          <div class="typing-story-cursor" id="typing-story-cursor" aria-hidden="true"></div>
          <button id="typing-story-next" class="typing-story-next ${isNoteLead ? 'note-icon-button' : ''}" type="button" aria-label="Continue story">
            ${isNoteLead ? '<span class="note-icon" aria-hidden="true">💌</span><span class="note-icon-label">Click the note</span>' : 'Click to continue →'}
          </button>
        </div>
      </section>`;

    const textEl = document.getElementById('typing-story-text');
    const nextBtn = document.getElementById('typing-story-next');
    let index = 0;
    this.isTyping = true;
    nextBtn.disabled = true;
    nextBtn.setAttribute('aria-disabled','true');

    const finishTyping = () => {
      this.cleanupTyping();
      textEl.textContent = s.text;
      nextBtn.disabled = false;
      nextBtn.removeAttribute('aria-disabled');
      nextBtn.focus();
    };

    this.typingTimer = setInterval(() => {
      index += 1;
      textEl.textContent = s.text.slice(0,index);
      if(index >= s.text.length) finishTyping();
    }, this.typeSpeed);

    const advance = () => {
      if(this.isTyping){
        finishTyping();
        return;
      }
      this.step += 1;
      if(this.step >= this.steps.length) this.onComplete();
      else this.render();
    };

    nextBtn.addEventListener('click', advance);
    this.root.querySelector('.typing-story-panel').addEventListener('click', (e) => {
      if(e.target.closest('#typing-story-next')) return;
      if(!this.isTyping) advance();
    });
  }

  renderImage(s){
    this.root.innerHTML = `
      <section class="story-screen cartoon-story-screen" aria-label="Goodbye Goth story">
        <div class="cartoon-story-frame">
          <button id="story-panel-next" class="cartoon-story-panel" type="button" aria-label="Continue story">
            <img class="cartoon-story-image" src="${s.image}" alt="${s.alt}">
          </button>
          <div class="cartoon-story-footer">
            <span class="story-progress">${this.imageProgress()} / 4</span>
            <span class="story-hint">Click anywhere on the panel to continue</span>
          </div>
        </div>
      </section>`;

    document.getElementById('story-panel-next').addEventListener('click', () => {
      this.step += 1;
      if(this.step >= this.steps.length) this.onComplete();
      else this.render();
    });
  }

  imageProgress(){
    const imageNumber = this.steps.slice(0,this.step + 1).filter(s => s.type === 'image').length;
    return Math.max(1, Math.min(4, imageNumber));
  }
}
