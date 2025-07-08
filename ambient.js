  const video = document.getElementById("video");
  const upload = document.getElementById("videoUpload");
  const canvas = document.getElementById("ambientCanvas");
  const ctx = canvas.getContext("2d");
  const toggleBtn = document.getElementById("toggleAmbient");

  let ambientOn = true;

  // 🌈 Ambient Glow Loop
  function updateAmbient() {
    if (video.paused || video.ended) return;
    try {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    } catch (err) {
      console.warn("Frame draw error:", err);
    }
    requestAnimationFrame(updateAmbient);
  }

  // 🎬 Auto play video
  video.addEventListener("play", () => {
    requestAnimationFrame(updateAmbient);
  });

  // 📁 Upload File Logic
  function handleVideoFile(file) {
    const url = URL.createObjectURL(file);
    localStorage.setItem("lastVideo", url); // 💾 Remember
    video.src = url;
    video.play();
  }

  upload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) handleVideoFile(file);
  });

  // 🌗 Toggle Ambient
  toggleBtn.addEventListener("click", () => {
    ambientOn = !ambientOn;
    canvas.style.opacity = ambientOn ? "1" : "0";
    toggleBtn.innerText = ambientOn ? "🌈 Toggle Ambient" : "❌ Ambient Off";
  });

  // 🧠 Restore Last Session
  const lastVideo = localStorage.getItem("lastVideo");
  if (lastVideo) {
    video.src = lastVideo;
    video.play();
  }

  // 🪄 Drag & Drop
  document.body.addEventListener("dragover", e => {
    e.preventDefault();
    document.body.style.border = "2px dashed white";
  });

  document.body.addEventListener("dragleave", () => {
    document.body.style.border = "none";
  });

  document.body.addEventListener("drop", e => {
    e.preventDefault();
    document.body.style.border = "none";
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      handleVideoFile(file);
    }
  });