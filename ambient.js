window.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("video");
  const upload = document.getElementById("videoUpload");
  const ambientCanvas = document.getElementById("ambientCanvas");
  const ambientCtx = ambientCanvas.getContext("2d");
  const visualizerCanvas = document.getElementById("visualizerCanvas");
  const vCtx = visualizerCanvas.getContext("2d");
  const audioControls = document.getElementById("audioControls");
  const playPauseBtn = document.getElementById("audioPlayPause");
  const toggleBtn = document.getElementById("toggleAmbient");

  let ambientOn = true;
  let audioContext, analyser, sourceNode, dataArray;

  ambientCanvas.width = visualizerCanvas.width = window.innerWidth;
  ambientCanvas.height = visualizerCanvas.height = window.innerHeight;

  function updateAmbient() {
    if (!ambientOn || video.paused || video.ended) return;
    try {
      ambientCtx.drawImage(video, 0, 0, ambientCanvas.width, ambientCanvas.height);
    } catch {}
    requestAnimationFrame(updateAmbient);
  }

  function startVisualizer(audioElement) {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      sourceNode = audioContext.createMediaElementSource(audioElement);
      sourceNode.connect(analyser);
      analyser.connect(audioContext.destination);
      dataArray = new Uint8Array(analyser.frequencyBinCount);
    }
    function draw() {
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      vCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
      const grd = vCtx.createLinearGradient(0, 0, visualizerCanvas.width, visualizerCanvas.height);
      grd.addColorStop(0, '#00f5d4');
      grd.addColorStop(0.5, '#9b5de5');
      grd.addColorStop(1, '#f15bb5');
      const barWidth = (visualizerCanvas.width / dataArray.length) * 2.5;
      let x = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const h = dataArray[i];
        vCtx.fillStyle = grd;
        vCtx.fillRect(x, visualizerCanvas.height - h, barWidth, h);
        x += barWidth + 2;
      }
    }
    draw();
  }

  upload.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    video.src = url;
    video.load();
    video.play().catch(() => console.log("Autoplay blocked"));
    if (file.type.startsWith("audio/")) {
      visualizerCanvas.style.display = "block";
      audioControls.style.display = "flex";
      startVisualizer(video);
    } else {
      visualizerCanvas.style.display = "none";
      audioControls.style.display = "none";
      requestAnimationFrame(updateAmbient);
    }
    localStorage.setItem("lastMedia", url);
  });

  toggleBtn.addEventListener("click", () => {
    ambientOn = !ambientOn;
    ambientCanvas.style.opacity = ambientOn ? "1" : "0";
    toggleBtn.textContent = ambientOn ? "🌈 Toggle Ambient" : "❌ Ambient Off";
  });

  video.addEventListener("play", () => {
    playPauseBtn.textContent = "⏸️";
    if (visualizerCanvas.style.display !== "block") requestAnimationFrame(updateAmbient);
  });
  video.addEventListener("pause", () => playPauseBtn.textContent = "▶️");
  playPauseBtn.addEventListener("click", () => video.paused ? video.play() : video.pause());

  const lastMedia = localStorage.getItem("lastMedia");
  if (lastMedia) {
    video.src = lastMedia;
    video.play().catch(() => {});
  }

  document.body.addEventListener("dragover", e => e.preventDefault());
  document.body.addEventListener("drop", e => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      upload.files = e.dataTransfer.files;
      upload.dispatchEvent(new Event("change"));
    }
  });
});
