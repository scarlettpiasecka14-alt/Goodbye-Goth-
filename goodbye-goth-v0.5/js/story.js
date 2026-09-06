export class StoryController {
  constructor(root, onComplete){
    this.root=root; this.onComplete=onComplete; this.step=0;
    this.slides=[
      {image:'assets/story/intro-goodnight.png',title:'GOODNIGHT',text:'You and Olly say goodnight. One last little kiss.',button:'CONTINUE'},
      {type:'black',title:'HUH?',text:'Everything goes black. Blink. Blink blink. ...huh?',button:'CONTINUE'},
      {image:'assets/story/intro-awake.png',title:"WHERE'S SCARLETT?",text:"You wake up. Scarlett is gone. You look around, confused.",button:'CONTINUE'},
      {image:'assets/story/intro-note.png',title:'THE NOTE',text:'The Goths have taken your princess.',button:'BEGIN QUEST'}
    ];
  }
  render(){
    const s=this.slides[this.step];
    const visual=s.type==='black'
      ? `<div class="story-black"><div>BLINK.<br>BLINK BLINK.<br><span style="letter-spacing:.04em;text-transform:none">...huh?</span></div></div>`
      : `<img class="story-image" src="${s.image}" alt="Goodbye Goth illustrated story scene">`;
    this.root.innerHTML=`
      <section class="panel story-screen">
        <div class="story-frame">
          ${visual}
          <div class="story-controls"><div class="story-progress">${this.step+1} / 4</div><button id="story-next" class="primary">${s.button}</button></div>
          <div class="story-caption"><div class="story-title">${s.title}</div><div>${s.text}</div></div>
        </div>
      </section>`;
    document.getElementById('story-next').addEventListener('click',()=>{
      this.step+=1;
      if(this.step>=this.slides.length)this.onComplete(); else this.render();
    });
  }
}
