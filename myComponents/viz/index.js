import './libs/webaudio-controls.js';

const getBaseURL = () => {
    return new URL('.', import.meta.url);
};

const template = document.createElement("template");
template.innerHTML = /*html*/`
  <style>
  canvas {
      border:1px solid black;
  }
  </style>
  <canvas id="myCanvas" width=400></canvas>
  <audio id="myPlayer" crossorigin="anonymous"></audio>
    <webaudio-knob id="volumeKnob" 
      src="./assets/imgs/LittlePhatty.png" 
      min=0 max=20 step=0.01 
      diameter="32" 
      tooltip="Volume: %d">
    </webaudio-knob>
    <br>
    Progression : <input id="progress" type="range" value=0>
    </br>
   
    <br>
  <button id="play">Play</button> 
  <button id="pause">Pause</button>
  <button id="avance10">+10s</button>
  <button id="replay">Play</button> 
  <button id="">Pause</button>
  <button id="avance10">-10s</button>
  <br>
  <label>Vitesse de lecture
     0 <input id="vitesseLecture" type="range" min=0.2 max=4 step=0.1 value=1> 4
  </label>
  `;

class MyAudioPlayer extends HTMLElement {
    constructor() {
        super();
        // Récupération des attributs HTML
        //this.value = this.getAttribute("value");

        // On crée un shadow DOM
        this.attachShadow({ mode: "open" });

        console.log("URL de base du composant : " + getBaseURL())
    }

    connectedCallback() {
        // Appelée automatiquement par le browser
        // quand il insère le web component dans le DOM
        // de la page du parent..

        // On clone le template HTML/CSS (la gui du wc)
        // et on l'ajoute dans le shadow DOM
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // fix relative URLs
        this.fixRelativeURLs();

        this.player = this.shadowRoot.querySelector("#myPlayer");
        this.player.src = this.getAttribute("src");

        // récupérer le canvas
        this.canvas = this.shadowRoot.querySelector("#myCanvas");
        this.ctx = this.canvas.getContext("2d");

        // Récupération du contexte WebAudio
        this.audioCtx = new AudioContext();

        // on définit les écouteurs etc.
        this.defineListeners();

        // On construit un graphe webaudio pour capturer
        // le son du lecteur et pouvoir le traiter
        // en insérant des "noeuds" webaudio dans le graphe
        this.buildAudioGraph();

        // on démarre l'animation
        requestAnimationFrame(() => {
            this.animationLoop();
        });
    }

    buildAudioGraph() {
        let audioContext = this.audioCtx;

        let playerNode = audioContext.createMediaElementSource(this.player);

        // Create an analyser node
        this.analyserNode = audioContext.createAnalyser();

        // Try changing for lower values: 512, 256, 128, 64...
        this.analyserNode.fftSize = 256;
        this.bufferLength = this.analyserNode.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);

        // lecteur audio -> analyser -> haut parleurs
        playerNode.connect(this.analyserNode);
        this.analyserNode.connect(audioContext.destination);
    }


animationLoop() {
    // 1 on efface le canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 2 on dessine les objets
    //this.ctx.fillRect(10+Math.random()*20, 10, 100, 100);
    // Get the analyser data
    this.analyserNode.getByteFrequencyData(this.dataArray);

    let barWidth = this.canvas.width / this.bufferLength;
    let barHeight;
    let x = 0;

    // values go from 0 to 256 and the canvas heigt is 100. Let's rescale
    // before drawing. This is the scale factor
    let heightScale = this.canvas.height / 128;

    for (let i = 0; i < this.bufferLength; i++) {
        barHeight = this.dataArray[i];

        this.ctx.fillStyle = 'rgb(' + (barHeight + 150) + ',50,50)';
        barHeight *= heightScale;
        this.ctx.fillRect(x, this.canvas.height - barHeight / 2, barWidth, barHeight / 2);

        // 2 is the number of pixels between bars
        x += barWidth + 1;
    }
    // 3 on deplace les objets

    // 4 On demande au navigateur de recommencer l'animation
    requestAnimationFrame(() => {
        this.animationLoop();
    });
}
fixRelativeURLs() {
    const elems = this.shadowRoot.querySelectorAll("webaudio-knob, webaudio-slider, webaudio-switch, img");
    elems.forEach(e => {
        const path = e.src;
        if (path.startsWith(".")) {
            e.src = getBaseURL() + path;
        }
    });
}
defineListeners() {
    this.shadowRoot.querySelector("#play").onclick = () => {
        this.player.play();
        this.audioCtx.resume();
    }

    this.shadowRoot.querySelector("#pause").onclick = () => {
        this.player.pause();
    }

    this.shadowRoot.querySelector("#avance10").onclick = () => {
        this.player.currentTime += 10;
    }
    

    this.shadowRoot.querySelector("#vitesseLecture").oninput = (event) => {
        this.player.playbackRate = parseFloat(event.target.value);
        console.log("vitesse =  " + this.player.playbackRate);
    }

    this.shadowRoot.querySelector("#progress").onchange = (event) => {
        this.player.currentTime = parseFloat(event.target.value);
    }

    this.shadowRoot.querySelector("#volumeKnob").oninput = (event) => {
        this.player.volume = event.target.value;  
    }
    /*this.shadowRoot.querySelector('#volumeKnob').addEventListener('input', (evt) => {
        this.player.volume = evt.target.value;
      });*/

    this.player.ontimeupdate = (event) => {
        let progressSlider = this.shadowRoot.querySelector("#progress");
        progressSlider.max = this.player.duration;
        progressSlider.min = 0;
        progressSlider.value = this.player.currentTime;
    }

    
}

    // L'API du Web Component

}

customElements.define("my-player", MyAudioPlayer);
