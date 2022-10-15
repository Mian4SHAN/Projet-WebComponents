import '../lib/webaudio-controls.js';

const getBaseURL = () => {
	return new URL('.', import.meta.url);
};

class myComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.src = this.getAttribute('src');

    //la playliste
    this.playlist = ["./sounds/M1_mp3.mp3","./sounds/M2_mp3.mp3","./sounds/M3_mp3.mp3","./sounds/M4_mp3.mp3","./sounds/M5_mp3.mp3"];
    this.titre =["Your name","Shinzou wo Sasageyo","紅蓮華","Silhouette","We are"];
    this.artiste =["RADWIMPS","Linked Horizon","LISA","KANA-BOON","Hiroshi Kitadani"];
    this.picture = ["./assets/your_name.jpg","./assets/attack.jpg","./assets/demonSlayer.jpg","./assets/naruto.jpg","./assets/one_piece.jpg"];

    
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
              height: 600px;
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
            background-image: url("myComponents/assets/your_name.jpg");
            background-size: cover;
            box-shadow: 0 0 0 10px rgba(255, 255, 255, 0.08);
            animation: rotate 20s linear infinite;
            animation-play-state: paused;
          }

          .disque play{
            aniamtion-play-state: running;
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

          .volume{
            position: relative;
            display: block;
            text-align: center;
            accent-color: rgba(255,255,255,0.08);
          }

          .balance{
            position: relative;
            display: block;
            accent-color: rgba(255,255,255,0.08);
            margin-left: 50px;
          }

          .myCanva{
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
              <span class="fin">3:01</span> 
          </div>
      
          <label class="volume"> 
            <input id="volumeSlider" 
            type="range" min=0 max=20 step=0.1 value="1">
          </label>
          <br>
          <div class="menu">
          <button id="pre"><img src="myComponents/assets/backward.png"></button>
          <button id="moins"><img src="myComponents/assets/backward-fast.png"></button>
          <button id="play"><img src="myComponents/assets/circle-play.png"></button>
          <button id="pause"><img src="myComponents/assets/circle-pause.png"></button>
          <button id="stop"><img src="myComponents/assets/circle-stop.png"></button>
          <button id="zero"><img src="myComponents/assets/reply.png"></button>
          <button id="plus"><img src="myComponents/assets/forward-fast.png"></button> 
          <button id="next"><img src="myComponents/assets/forward.png"></button>
          </div>
          <br>
          <canvas id="myCanvas" width=350 height= 80></canvas>
          <br>
          <div class="balance">
          <label for="pannerSlider">Balance</label>
          <input type="range" min="-1" max="1" step="0.1" value="0" class="pannerSlider" />
          </div>
        </div>
        <br>
    `
    ;

    this.fixRelativeURLs();

    this.player = this.shadowRoot.querySelector('#player');
    this.volumeSlider = this.shadowRoot.querySelector('#volumeSlider');
    this.chargement = this.shadowRoot.querySelector('.chargement');
    this.depart = this.shadowRoot.querySelector('.debut');
    this.pannerSlider = this.shadowRoot.querySelector('#pannerSlider');
    
    //Canvas
    this.canvas = this.shadowRoot.querySelector("#myCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.audioCtx = new AudioContext();
    this.buildAudioGraph();

    // on démarre l'animation
    requestAnimationFrame(() => {
        this.animationLoop();
    });

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

  buildAudioGraph() {
    let audioContext = this.audioCtx;

    let playerNode = audioContext.createMediaElementSource(this.player);
    
    this.analyserNode = audioContext.createAnalyser();
    this.analyserNode.fftSize = 256;
    this.bufferLength = this.analyserNode.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);

    // lecteur audio -> analyser -> haut parleurs
    playerNode.connect(this.analyserNode);
    this.analyserNode.connect(audioContext.destination);

    //balance
    this.pannerNode = audioContext.createStereoPanner();
    
    playerNode.connect(this.pannerNode);
    this.pannerNode.connect(audioContext.destination);
  
}

animationLoop() {
 
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.analyserNode.getByteFrequencyData(this.dataArray);
  let barWidth = this.canvas.width / this.bufferLength + 2;
  let barHeight;
  let x = 0;

  let heightScale = this.canvas.height / 128;

  for (let i = 0; i < this.bufferLength; i++) {
      barHeight = this.dataArray[i];
      this.ctx.fillStyle = 'rgb(255,255,255)';
      barHeight *= heightScale;
      this.ctx.fillRect(x, this.canvas.height - barHeight / 3, barWidth, barHeight / 2);
      x += barWidth + 1;
  }
  requestAnimationFrame(() => {
      this.animationLoop();
  });
}

  //convertir le temps en secondes en minutes
  modification(time){
    let min = Math.floor(time/60);
      if(min < 10){
      min = "0" + min;
    }
    let sec = Math.floor(time%60); 
    if(sec < 10){
      sec = "0" + sec;
    }
    return min + ":" + sec;
  }

  defineListeners() {
    this.shadowRoot.querySelector('#play').addEventListener('click', () => {
      this.player.play();
      this.shadowRoot.querySelector('.fin').innerHTML = this.modification(this.player.duration);
      this.shadowRoot.querySelector('.disque').style.animationPlayState = "running";
      this.audioCtx.resume();
    });

    this.shadowRoot.querySelector('#pause').addEventListener('click', () => {
      this.player.pause();
      this.shadowRoot.querySelector('.disque').style.animationPlayState = "paused";
    });

    this.shadowRoot.querySelector('#stop').addEventListener('click', () => {
      this.player.pause();
      this.shadowRoot.querySelector('.disque').style.animationPlayState = "paused";
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

    //bouton précedent 
    this.shadowRoot.querySelector('#pre').addEventListener('click', (evt) => {
      this.index--;
      if (this.index < 0) {
        this.index = this.playlist.length - 1;
      }
      this.player.src = this.playlist[this.index];
      this.src = this.playlist[this.index];
      this.titreMusique = this.titre[this.index];
      this.shadowRoot.querySelector('.titre').innerHTML = this.titreMusique;
      this.shadowRoot.querySelector('.fin').innerHTML = this.modification(this.player.duration);
      this.nomArtiste = this.artiste[this.index];
      this.shadowRoot.querySelector('.artiste').innerHTML = this.nomArtiste;
      this.albumPhoto = this.picture[this.index];
      this.shadowRoot.querySelector('.disque').style.backgroundImage = `url(myComponents/${this.albumPhoto})`;
      this.shadowRoot.querySelector('.disque').style.animationPlayState = "running";
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
      this.titreMusique = this.titre[this.index];
      this.shadowRoot.querySelector('.fin').innerHTML = this.modification(this.player.duration);
      this.shadowRoot.querySelector('.titre').innerHTML = this.titreMusique;
      this.nomArtiste = this.artiste[this.index];
      this.shadowRoot.querySelector('.artiste').innerHTML = this.nomArtiste;
      this.albumPhoto = this.picture[this.index];
      this.shadowRoot.querySelector('.disque').style.backgroundImage = `url(myComponents/${this.albumPhoto})`;
      this.shadowRoot.querySelector('.disque').style.animationPlayState = "running";
      this.player.play()
    });

    
    //volume
    this.shadowRoot.querySelector('#volumeSlider').addEventListener('input', (evt) => {
      this.player.volume = evt.target.value / 100;
    });  

    //barre de progression
    this.shadowRoot.querySelector('.chargement').addEventListener('input', () => {
      this.player.currentTime = this.shadowRoot.querySelector('.chargement').value;
    });

    //balance 
    this.shadowRoot.querySelector('.pannerSlider').addEventListener('input', (evt) => {
      //this.player.pan.value = evt.target.value;
      this.pannerNode.pan.value = evt.target.value;
      console.log(this.player.pan);
    });

    //afficher le temps écoulé
    this.player.addEventListener('timeupdate', () => {
    let sec = this.player.currentTime;
    this.shadowRoot.querySelector('.debut').innerHTML = this.modification(this.player.currentTime);
    this.shadowRoot.querySelector('.chargement').value = sec;
    if (this.player.duration == this.player.currentTime) {
      this.index++
      if (this.index > this.playlist.length - 1) {
        this.index = 0;
      }
      this.player.src = this.playlist[this.index];
      this.src = this.playlist[this.index];
      this.titreMusique = this.titre[this.index];
      this.shadowRoot.querySelector('.fin').innerHTML = this.modification(this.player.duration);
      this.shadowRoot.querySelector('.titre').innerHTML = this.titreMusique;
      this.nomArtiste = this.artiste[this.index];
      this.shadowRoot.querySelector('.artiste').innerHTML = this.nomArtiste;
      this.albumPhoto = this.picture[this.index];
      this.shadowRoot.querySelector('.disque').style.backgroundImage = `url(myComponents/${this.albumPhoto})`;
      this.shadowRoot.querySelector('.disque').style.animationPlayState = "running";
      this.player.play()
    }
    });

  //afficher le temps restant
  this.player.onloadedmetadata = () => {
    this.shadowRoot.querySelector('.fin').innerHTML = this.modification(this.player.duration);
    this.shadowRoot.querySelector('.chargement').max = this.player.duration; 
  }

  

  
  }
  
}

customElements.define("my-audio", myComponent);