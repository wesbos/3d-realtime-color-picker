// Get the canvas element and context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions to accommodate all RGB colors
// 256^3 = 16,777,216 colors, arranged in a 4096 x 4096 grid
const CANVAS_SIZE = 4096;
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

// Create ImageData object to manipulate pixels directly
const imageData = ctx.createImageData(CANVAS_SIZE, CANVAS_SIZE);
const data = imageData.data;

// Function to convert RGB values to pixel index in ImageData
function setPixel(x, y, r, g, b) {
  const index = (y * CANVAS_SIZE + x) * 4;
  data[index] = r;     // Red
  data[index + 1] = g; // Green
  data[index + 2] = b; // Blue
  data[index + 3] = 255; // Alpha (fully opaque)
}

// Function to convert RGB to HSV for smooth gradient sorting
function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = max === 0 ? 0 : delta / max;
  let v = max;

  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
  }

  h = h * 60;
  if (h < 0) h += 360;

  return [h, s * 100, v * 100];
}

// Generate all RGB colors with HSV values for smooth gradient sorting
console.log('Generating all RGB colors...');
console.log('Total colors to generate: 16,777,216');

const colors = [];

// Generate all RGB combinations and convert to HSV
for (let r = 0; r < 256; r++) {
  for (let g = 0; g < 256; g++) {
    for (let b = 0; b < 256; b++) {
      const [h, s, v] = rgbToHsv(r, g, b);
      colors.push({
        r, g, b, h, s, v
      });
    }
  }

  // Log progress every 32 red values
  if (r % 32 === 0) {
    console.log(`Generated: ${((r / 255) * 100).toFixed(1)}% complete`);
  }
}

console.log('Sorting colors for beautiful rainbow gradients...');

// Sort colors for smooth gradients: hue → value → saturation
colors.sort((a, b) => {
  // Primary sort by hue (creates rainbow bands)
  if (Math.abs(a.h - b.h) > 1) {
    return a.h - b.h;
  }
  // Secondary sort by brightness (light to dark within each hue)
  if (Math.abs(a.v - b.v) > 1) {
    return b.v - a.v;
  }
  // Tertiary sort by saturation (vibrant to muted)
  return b.s - a.s;
});

console.log('Rendering colors in gradient order...');

// Render colors in sorted order
colors.forEach((color, index) => {
  const x = index % CANVAS_SIZE;
  const y = Math.floor(index / CANVAS_SIZE);

  setPixel(x, y, color.r, color.g, color.b);

  // Progress logging
  if (index % 1000000 === 0) {
    console.log(`Rendered: ${((index / colors.length) * 100).toFixed(1)}% complete`);
  }
});

console.log('Rendering to canvas...');

// Draw the ImageData to the canvas
ctx.putImageData(imageData, 0, 0);

console.log('All RGB colors have been rendered!');
