// Resizes the licensed Envato originals in docs/envato-downloads/ into web-sized
// sources in src/assets/photos/. Originals stay out of git; Astro's <Image> then
// generates responsive AVIF/WebP variants at build time.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'docs/envato-downloads';
const OUT = 'src/assets/photos';
const MAX = 2000;

fs.mkdirSync(OUT, { recursive: true });
if (!fs.existsSync(SRC)) process.exit(0); // fresh clone: committed web copies are used as-is
const files = fs.readdirSync(SRC).filter(f => /\.(jpe?g|png|webp)$/i.test(f) && !f.startsWith('_'));
for (const f of files) {
  const name = path.parse(f).name + '.jpg';
  const dest = path.join(OUT, name);
  if (fs.existsSync(dest) && fs.statSync(dest).mtimeMs > fs.statSync(path.join(SRC, f)).mtimeMs) continue;
  await sharp(path.join(SRC, f))
    .rotate()
    .resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(dest);
  console.log('photo', name);
}
