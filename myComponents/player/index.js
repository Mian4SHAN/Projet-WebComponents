import '../lib/webaudio-controls.js';

const getBaseURL = () => {
	return new URL('.', import.meta.url);
};

class myComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.src = this.getAttribute('src');

    this.playlist = ["./sounds/M1_mp3.mp3","./sounds/M2_mp3.mp3","./sounds/M3_mp3.mp3","./sounds/M4_mp3.mp3","./sounds/M5_mp3.mp3"];
    this.titre =["Your name","Shinzou wo Sasageyo","紅蓮華","Silhouette","We are"];
    this.artiste =["RADWIMPS","Linked Horizon","LiSA","KANA-BOON","Hiroshi Kitadani"];
    this.picture = ["./assets/yourname.jpg","./assets/attack.jpg","./assets/demonSlayer.jpg","./assets/naruto.jpg","./assets/onePiece.jpg"];
    this.index = 0;
    this.src = this.playlist[this.index];
    this.titreMusique = this.titre[this.index];
    this.nomArtiste = this.artiste[this.index];
    this.albumPhoto = this.picture[this.index];
  }

  connectedCallback() {
    // Do something
    this.shadowRoot.innerHTML = `
        <style>
            img {
              zoom: 3%;
            }
            .music-player{
              width: 350px;
              height: 500px;
              border-radius: 20px;
              background-color: rgba(255,255,255,0.08);
              box-shadow: 0 40px 100px rgba(255,255,255,0.1);
              padding: 30px;
              overflow: hidden;
              color: #d5eebb;
          }

          .titre,
          .artiste{
            text-align: center;
            text-transform: capitalize;
          }
          
          .titre{
            font-zise: 40px;
            font-weight: 500;
            margin-bottom: 10px;
          }

          .artiste{
            font-zise: 20px;
            border-bottom: 1px solid #d5eebb;
          }   

          .disque{
            position: relative;
            display: block;
            margin: 40px auto;
            width: 180px;
            height: 180px;
            border-radius: 50%;
            background-image: url("myComponents/assets/totoro.jpg");
            background-size: cover;
            box-shadow: 0 0 0 10px rgba(255, 255, 255, 0.08);
            animation: rotate 20s linear infinite;
          }

          .slider{
            width: 100%;
            position: relative;
          }

          .chargement{
            -webkit-appearance: none;
            width: 100%;
            height: 5px;
            border-radius: 10px;
            background-color: #6d55aa;
            overflow: hidden;
            cursor: pointer;
          }
          
          .chargement::-webkit-slider-thumb{
            -webkit-appearance: none;
            width: 10px;
            height: 20px;
            background-color: black;
            box-shadow: -400px 0 0 400px #4b28d7;
          }

          .debut,.fin{
            font-size: 14px;
          }
          .fin{
            position: absolute;
            right: 0;
          }

          @keyframes rotate{
            0%{
              transform: rotate(0);
            }
            100%{
              transform: rotate(360deg);
            }
          }

          .menu{
            position: relative;
            display: block;
            text-align: center;
          }

        </style>
        
        <audio id="player" src="${this.src}"></audio>

        <div class="music-player">
          <h1 class="titre">song : ${this.titreMusique}</h1>
          <p class="artiste">by artist : ${this.nomArtiste}</p>
          <div class="disque"></div>

          <br>
          <div class="slider">
              <input type="range" value="0" class="chargement">
              <br>
              <span class="debut">00:00</span> 
              <span class="fin">00:00</span> 
          </div>
          
          
          <br>
          <div class="menu">
          <button id="play"><img src="myComponents/assets/circle-play.png"></button>
          <button id="pause"><img src="myComponents/assets/circle-pause.png"></button>
          <button id="stop"><img src="myComponents/assets/circle-stop.png"></button>
          <button id="zero"><img src="myComponents/assets/reply.png"></button>
          <button id="moins"><img src="myComponents/assets/backward-fast.png"></button>
          <button id="plus"><img src="myComponents/assets/forward-fast.png"></button>
          <button id="pre"><img src="myComponents/assets/backward.png"></button>
          <button id="next"><img src="myComponents/assets/forward.png"></button>
          </div>
          <br>
          <br>
          <label>Volume 
            <input id="volumeSlider" 
            type="range" min=0 max=2 step=0.1 value="1">
          </label>
        </div>
        <br>
    `
    ;

    this.fixRelativeURLs();

    this.player = this.shadowRoot.querySelector('#player');
    this.volumeSlider = this.shadowRoot.querySelector('#volumeSlider');
    this.chargement = this.shadowRoot.querySelector('.chargement');
    this.titre = this.shadowRoot.querySelector('.titre');
    this.artiste = this.shadowRoot.querySelector('.artiste');
    this.disque = this.shadowRoot.querySelector('.disque');
    this.depart = this.shadowRoot.querySelector('.debut');
    this.fin =  this.shadowRoot.querySelector('.fin');


    this.defineListeners();
  }
  
  fixRelativeURLs() {
    const baseURL = getBaseURL();
    console.log('baseURL', baseURL);

    const knobs = this.shadowRoot.querySelectorAll('webaudio-knob');

    for (const knob of knobs) {
      console.log("fixing " + knob.getAttribute('src'));

      const src = knob.src;
      knob.src =  baseURL  + src;

      console.log("new value : " + knob.src);
    }
  }

  
  defineListeners() {
    this.shadowRoot.querySelector('#play').addEventListener('click', () => {
      this.player.play();
    });

    this.shadowRoot.querySelector('#pause').addEventListener('click', () => {
      this.player.pause();
      this.disque.pause();
    });
    this.shadowRoot.querySelector('#stop').addEventListener('click', () => {
      this.player.pause();
      this.player.currentTime = 0;
    });
    this.shadowRoot.querySelector('#zero').addEventListener('click', (evt) => {
      this.player.currentTime = 0;
    });
    this.shadowRoot.querySelector('#plus').addEventListener('click', (evt) => {
      this.player.currentTime = this.player.currentTime + 10;
    });
    this.shadowRoot.querySelector('#moins').addEventListener('click', (evt) => {
      this.player.currentTime = this.player.currentTime - 10;
    });

    //
    this.shadowRoot.querySelector('#pre').addEventListener('click', (evt) => {
      this.index--;
      if (this.index < 0) {
        this.index = this.playlist.length - 1;
      }
      this.player.src = this.playlist[this.index];
      this.src = this.playlist[this.index];
      this.player.play()
    });

    //passer à la musique suivante
    this.shadowRoot.querySelector('#next').addEventListener('click', (evt) => {
      this.index++
      if (this.index > this.playlist.length - 1) {
        this.index = 0;
      }
      this.player.src = this.playlist[this.index];
      this.src = this.playlist[this.index];
      this.player.play()
    });
    //input = value 
    // le player prend le volume 
    this.shadowRoot.querySelector('#volumeSlider').addEventListener('input', (evt) => {
      this.player.volume = evt.target.value;
    });  
    
  }
}

customElements.define("my-audio", myComponent);