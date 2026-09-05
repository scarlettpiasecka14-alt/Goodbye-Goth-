\
export class StoryController {
  constructor(root, { onComplete }) {
    this.root = root;
    this.onComplete = onComplete;
    this.step = 0;
    this.slides = [
      {
        image: "assets/story/opening-title.png",
        title: "GOODBYE GOTH",
        text: "An anniversary adventure for Olly.",
        button: "BEGIN"
      },
      {
        image: "assets/story/opening-olly-note.png",
        title: "BLINK... BLINK...",
        text: "Olly wakes up. Scarlett is gone. There is only a mysterious note.",
        button: "LOOK CLOSER"
      },
      {
        image: "assets/story/opening-olly-note.png",
        title: "THE NOTE",
        text: "Dear Olly, We’ve taken your princess. Come and get her. xoxo, The Goths ♡",
        button: "TAKE THE QUEST"
      },
      {
        image: "assets/story/opening-title.png",
        title: "LEVEL 1 BEGINS...",
        text: "The Haunted Cemetery. Fight the goths. Solve the puzzle. Reach the boss.",
        button: "ENTER CEMETERY"
      }
    ];
  }
  render() {
    const s = this.slides[this.step];
    this.root.innerHTML = `
      <section class="panel intro">
        <div class="story-frame">
          <img class="story-image" src="${s.image}" alt="Goodbye Goth illustrated story panel">
          <div class="story-caption">
            <div class="story-title">${s.title}</div>
            <div>${s.text}</div>
            <div class="story-actions">
              <button class="primary" id="story-next">${s.button}</button>
            </div>
          </div>
        </div>
      </section>
    `;
    document.getElementById("story-next").addEventListener("click", () => {
      this.step += 1;
      if (this.step >= this.slides.length) this.onComplete();
      else this.render();
    });
  }
}
