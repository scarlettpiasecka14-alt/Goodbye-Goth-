export class StoryController {
  constructor(root, onComplete){
    this.root = root;
    this.onComplete = onComplete;
    this.step = 0;
    this.slides = [
      {image:'assets/story/intro-cartoon-goodnight.png', alt:'Scarlett and Olly saying goodnight together in bed.'},
      {image:'assets/story/intro-cartoon-huh.png', alt:'Olly waking up confused in bed.'},
      {image:'assets/story/intro-cartoon-awake.png', alt:'Olly looking around for Scarlett after waking up.'},
      {image:'assets/story/intro-cartoon-note.png', alt:'A pink ransom note from the Goths telling Olly to rescue Scarlett.'}
    ];
  }

  render(){
    const s = this.slides[this.step];
    this.root.innerHTML = `
      <section class="story-screen cartoon-story-screen" aria-label="Goodbye Goth story">
        <div class="cartoon-story-frame">
          <button id="story-panel-next" class="cartoon-story-panel" type="button" aria-label="Continue story">
            <img class="cartoon-story-image" src="${s.image}" alt="${s.alt}">
          </button>
          <div class="cartoon-story-footer">
            <span class="story-progress">${this.step + 1} / 4</span>
            <span class="story-hint">Click anywhere on the panel to continue</span>
          </div>
        </div>
      </section>`;

    document.getElementById('story-panel-next').addEventListener('click', () => {
      this.step += 1;
      if (this.step >= this.slides.length) this.onComplete();
      else this.render();
    });
  }
}
