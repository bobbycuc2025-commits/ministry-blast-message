const sharp = require('sharp');
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputIcon = 'build/icon.png'; // Your source icon (1024x1024)

async function generateIcons() {
  if (!fs.existsSync('apps/ui/public/icons')) {
    fs.mkdirSync('apps/ui/public/icons', { recursive: true });
  }

  for (const size of sizes) {
    await sharp(inputIcon)
      .resize(size, size)
      .toFile(`apps/ui/public/icons/icon-${size}x${size}.png`);
    console.log(`Generated ${size}x${size} icon`);
  }
}

generateIcons();