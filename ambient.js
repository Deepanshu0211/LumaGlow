const video = document.getElementById('video');
const ambient = document.getElementById('ambient');

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 16;
canvas.height = 9;

function getAverageColor() {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const length = frame.data.length;

  let r = 0, g = 0, b = 0;
  const step = 4 * 4; // skip some pixels for performance

  for (let i = 0; i < length; i += step) {
    r += frame.data[i];
    g += frame.data[i + 1];
    b += frame.data[i + 2];
  }

  const count = length / step;
  r = Math.floor(r / count);
  g = Math.floor(g / count);
  b = Math.floor(b / count);

  return `rgb(${r}, ${g}, ${b})`;
}

function updateAmbient() {
  if (video.paused || video.ended) return;

  const color = getAverageColor();
  ambient.style.background = `radial-gradient(circle, ${color} 20%, #000000 80%)`;

  requestAnimationFrame(updateAmbient);
}

// Start updating when the video plays
video.addEventListener('play', () => {
  requestAnimationFrame(updateAmbient);
});
