/**
 * LIGHTNING ATI — Cinematic frame-sequence build step (dev/asset tooling only).
 *
 * Turns the supplied master video (`3D DESIGN FRONTEND/…mp4`) into the
 * scroll-scrubbable WebP frame sequences the cinematic sections render, plus a
 * manifest that carries the measured emblem track so the camera can physically
 * lock onto the emblem instead of approximating its position.
 *
 * This touches nothing but files under `public/assets/cinematic`.
 *
 *   node scripts/extract-cinematic-frames.mjs
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, copyFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FFMPEG = path.join(ROOT, 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
const FFMPEG_FALLBACK = path.join(ROOT, 'node_modules', 'ffmpeg-static', 'ffmpeg');

const SOURCE_DIR = path.resolve(ROOT, '..', '3D DESIGN FRONTEND');
const OUT_DIR = path.join(ROOT, 'public', 'assets', 'cinematic');

/** Full-fat desktop plate (native resolution) + art-directable mobile plate. */
const SETS = [
  { name: 'desktop', width: 1280, height: 720, quality: 90 },
  { name: 'mobile', width: 760, height: 428, quality: 82 },
];

/** Frame ranges (1-indexed, inclusive) for the two cinematic chapters. */
const SECTIONS = {
  // Dark stage · emblem centred · arc ignites · stage dissolves · emblem travels left.
  core: { start: 1, end: 153 },
  // Pure black · structured energy pathways · emblem awake at the left.
  structure: { start: 153, end: 240 },
};

const ffmpeg = existsSync(FFMPEG) ? FFMPEG : FFMPEG_FALLBACK;
if (!existsSync(ffmpeg)) {
  console.error('ffmpeg binary not found. Run: npm install ffmpeg-static --no-save');
  process.exit(1);
}

const source = readdirSync(SOURCE_DIR)
  .filter((f) => f.toLowerCase().endsWith('.mp4'))
  .sort((a, b) => statSync(path.join(SOURCE_DIR, b)).size - statSync(path.join(SOURCE_DIR, a)).size)[0];

if (!source) {
  console.error(`No .mp4 found in ${SOURCE_DIR}`);
  process.exit(1);
}
const SRC = path.join(SOURCE_DIR, source);
console.log(`source  → ${source} (${(statSync(SRC).size / 1048576).toFixed(1)} MB)`);

const run = (args) => execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { cwd: ROOT });

mkdirSync(OUT_DIR, { recursive: true });

/* ── 1. Frame sequences ─────────────────────────────────────────────── */
for (const set of SETS) {
  const dir = path.join(OUT_DIR, set.name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  run([
    '-i', SRC,
    '-vf', `scale=${set.width}:-2:flags=lanczos`,
    '-c:v', 'libwebp', '-quality', String(set.quality), '-compression_level', '6', '-preset', 'picture',
    '-an', path.join(dir, 'f%04d.webp'),
  ]);
  const files = readdirSync(dir);
  const bytes = files.reduce((n, f) => n + statSync(path.join(dir, f)).size, 0);
  console.log(`${set.name.padEnd(8)}→ ${files.length} frames · ${(bytes / 1048576).toFixed(2)} MB · ${(bytes / files.length / 1024).toFixed(1)} KB/frame`);
}

const frameCount = readdirSync(path.join(OUT_DIR, 'desktop')).length;

/* ── 2. Emblem track (so the camera can lock onto the real emblem) ──── */
const GW = 128;
const GH = 72;
const rawPath = path.join(OUT_DIR, '.emblem-track.raw');
run(['-i', SRC, '-vf', `scale=${GW}:${GH},format=gray`, '-f', 'rawvideo', rawPath]);
const gray = readFileSync(rawPath);
rmSync(rawPath, { force: true });

const samples = [];
for (let f = 0; f < frameCount; f++) {
  const off = f * GW * GH;
  let mass = 0;
  let wx = 0;
  let wy = 0;
  for (let y = 0; y < GH; y++) {
    for (let x = 0; x < GW; x++) {
      const w = Math.max(0, gray[off + y * GW + x] - 90); // the emblem + arc dominate above this floor
      if (w > 0) {
        mass += w;
        wx += w * x;
        wy += w * y;
      }
    }
  }
  samples.push({ mass: mass / 1000, x: mass ? wx / mass / GW : null, y: mass ? wy / mass / GH : null });
}

// Frames where the arc is still dormant carry too little mass to localise; borrow
// from the nearest confident frame, then smooth so the track reads as one move.
const confident = samples.map((s) => (s.mass >= 5 ? s : null));
const firstConfident = confident.find(Boolean) ?? { x: 0.487, y: 0.45 };
const filled = samples.map((s, i) => {
  if (confident[i]) return { x: s.x, y: s.y };
  for (let d = 1; d < frameCount; d++) {
    if (confident[i - d]) return { x: confident[i - d].x, y: confident[i - d].y };
    if (confident[i + d]) return { x: confident[i + d].x, y: confident[i + d].y };
  }
  return { x: firstConfident.x, y: firstConfident.y };
});
const smooth = (key) =>
  filled.map((_, i) => {
    let sum = 0;
    let n = 0;
    for (let d = -4; d <= 4; d++) {
      const j = i + d;
      if (j >= 0 && j < filled.length) {
        sum += filled[j][key];
        n++;
      }
    }
    return Math.round((sum / n) * 10000) / 10000;
  });

const emblemX = smooth('x');
const emblemY = smooth('y');

/* ── 3. Static brand mark + poster plates ───────────────────────────── */
const BRAND_DIR = path.join(ROOT, 'public', 'assets', 'brand');
mkdirSync(BRAND_DIR, { recursive: true });
// Measured emblem bbox on the settled end frame: x 310–540, y 160–550 @1280×720.
run(['-i', SRC, '-vf', "select='eq(n\\,239)',crop=268:428:294:146", '-frames:v', '1', '-c:v', 'libwebp', '-quality', '95', path.join(BRAND_DIR, 'emblem.webp')]);
run(['-i', SRC, '-vf', "select='eq(n\\,239)',crop=268:428:294:146,scale=-1:180,pad=180:180:(ow-iw)/2:(oh-ih)/2:black", '-frames:v', '1', path.join(BRAND_DIR, 'emblem-180.png')]);
// Low-motion / reduced-motion plates + social card.
run(['-i', SRC, '-vf', "select='eq(n\\,0)'", '-frames:v', '1', '-c:v', 'libwebp', '-quality', '92', path.join(OUT_DIR, 'plate-start.webp')]);
run(['-i', SRC, '-vf', "select='eq(n\\,152)'", '-frames:v', '1', '-c:v', 'libwebp', '-quality', '92', path.join(OUT_DIR, 'plate-core.webp')]);
run(['-i', SRC, '-vf', "select='eq(n\\,239)'", '-frames:v', '1', '-c:v', 'libwebp', '-quality', '92', path.join(OUT_DIR, 'plate-end.webp')]);
run(['-i', SRC, '-vf', "select='eq(n\\,239)',scale=1200:-2", '-frames:v', '1', '-q:v', '3', path.join(BRAND_DIR, 'og-card.jpg')]);

/* ── 4. Master video, kept alongside as provenance + graceful fallback ─ */
copyFileSync(SRC, path.join(OUT_DIR, 'lightning-ati-core.mp4'));

/* ── 5. Manifest ────────────────────────────────────────────────────── */
writeFileSync(
  path.join(OUT_DIR, 'manifest.json'),
  `${JSON.stringify(
    {
      source,
      fps: 24,
      frameCount,
      pad: 4,
      ext: 'webp',
      sets: SETS.reduce((acc, s) => ({ ...acc, [s.name]: { dir: s.name, width: s.width, height: s.height } }), {}),
      sections: SECTIONS,
      emblemX,
      emblemY,
    },
    null,
    2
  )}\n`
);

console.log(`manifest→ ${frameCount} frames · emblem x ${emblemX[0]} → ${emblemX[frameCount - 1]}`);
