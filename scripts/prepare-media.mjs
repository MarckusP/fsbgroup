/**
 * FSB — pipeline de mídia.
 *
 * Lê os masters brutos (/logos, /hero, /events, /company — fora do git) e escreve
 * derivados prontos para web em /public/media, seguindo a estrutura do §12 do briefing.
 * Emite também content/media-pool.generated.ts com o inventário tipado.
 *
 * Idempotente: pula o que já existe. `node scripts/prepare-media.mjs --force` refaz tudo.
 *
 * Requer ffmpeg/ffprobe no PATH.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "media");
const FORCE = process.argv.includes("--force");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_WIDTH = 1400; // não faz upscale: só limita os poucos masters gigantes
const WEBP_QUALITY = "80";

/** Correções de grafia nos nomes dos masters (§13 pede nomes descritivos e corretos). */
const RENAME = {
  "events- photographer": "events-photographer-press",
  "company-brand-campaings": "company-brand-campaigns",
  "company-campanhas-publicitarioas": "company-campanhas-publicitarias",
};

function run(args, { capture = false } = {}) {
  const res = spawnSync(args[0], args.slice(1), {
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : ["ignore", "ignore", "pipe"],
  });
  if (res.error) throw res.error;
  if (res.status !== 0) {
    throw new Error(`${args[0]} falhou (${res.status})\n${res.stderr?.slice(-1500)}`);
  }
  return capture ? res.stdout.trim() : "";
}

function probeSize(file) {
  const out = run(
    ["ffprobe", "-v", "error", "-select_streams", "v:0",
     "-show_entries", "stream=width,height", "-of", "csv=p=0", file],
    { capture: true },
  );
  const [w, h] = out.split(",").map(Number);
  return { width: w, height: h };
}

/** Remove acentos, espaços e ruído do nome do arquivo. */
function slugify(name) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos, senão "publicitárias" viraria "publicit-rias"
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

function skip(target) {
  if (!FORCE && existsSync(target)) {
    console.log(`  · pula  ${path.relative(ROOT, target)}`);
    return true;
  }
  return false;
}

/* ------------------------------------------------------------------ logos */

/** Detecta o bounding box opaco via canal alpha (os masters são 1080×1080 com muito vazio). */
function detectAlphaCrop(src) {
  const res = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-i", src, "-vf",
     "format=rgba,alphaextract,cropdetect=limit=0.02:round=2:skip=0",
     "-frames:v", "1", "-f", "null", "-"],
    { encoding: "utf8" },
  );
  const match = [...(res.stderr ?? "").matchAll(/crop=(\d+):(\d+):(\d+):(\d+)/g)].pop();
  return match ? match[0].slice(5) : null;
}

function buildLogos() {
  console.log("\n▸ logos");
  const srcDir = path.join(ROOT, "logos");
  const outDir = path.join(OUT, "logo");
  ensureDir(outDir);

  for (const file of readdirSync(srcDir).filter((f) => f.endsWith(".png"))) {
    const src = path.join(srcDir, file);
    const base = slugify(path.parse(file).name).replace("logo-", "fsb-");
    const crop = detectAlphaCrop(src);
    if (!crop) console.warn(`  ! sem alpha detectável em ${file}, usando quadro inteiro`);

    // 2x é a master recortada; 1x sai dela por escala.
    for (const [suffix, scale] of [["", 1], ["@2x", 2]]) {
      const target = path.join(outDir, `${base}${suffix}.webp`);
      if (skip(target)) continue;
      const filters = [crop && `crop=${crop}`, `scale=w=iw/${2 / scale}:h=-1`]
        .filter(Boolean)
        .join(",");
      run(["ffmpeg", "-y", "-v", "error", "-i", src, "-vf", filters,
           "-frames:v", "1", "-c:v", "libwebp", "-lossless", "0",
           "-quality", "90", "-compression_level", "6", target]);
      console.log(`  ✓ ${path.relative(ROOT, target)}`);
    }
  }
}

/* ------------------------------------------------------------------- hero */

function buildHero() {
  console.log("\n▸ hero");
  const src = path.join(ROOT, "hero", "fsb-hero.mp4");
  const outDir = path.join(OUT, "hero");
  ensureDir(outDir);

  const { width, height } = probeSize(src);
  // 9:16 a partir do 16:9 — descarta ~68% dos pixels que o object-fit cortaria de qualquer jeito.
  const mobileW = Math.round((height * 9) / 16 / 2) * 2;
  const mobileX = Math.round((width - mobileW) / 2 / 2) * 2;

  // O master saiu do Veo com a marca d'água ✨ fixa no canto inferior direito, presente em
  // todos os frames. delogo interpola a partir das bordas da caixa; a região é escura e sem
  // detalhe no clipe inteiro, então não sobra artefato. Se o hero for regerado sem marca,
  // basta remover esta constante.
  const DELOGO = "delogo=x=1134:y=566:w=60:h=70";
  const vf = (...extra) => [DELOGO, ...extra].filter(Boolean).join(",");
  const mobileVf = vf(`crop=${mobileW}:${height}:${mobileX}:0`);

  const jobs = [
    { name: "fsb-hero-poster.webp",
      args: ["-ss", "0.3", "-i", src, "-vf", vf(), "-frames:v", "1", "-c:v", "libwebp",
             "-quality", "82", "-compression_level", "6"] },
    { name: "fsb-hero-mobile-poster.webp",
      args: ["-ss", "0.3", "-i", src, "-vf", mobileVf, "-frames:v", "1",
             "-c:v", "libwebp", "-quality", "82", "-compression_level", "6"] },
    { name: "fsb-hero.webm",
      args: ["-i", src, "-vf", vf(), "-c:v", "libvpx-vp9", "-crf", "34", "-b:v", "0",
             "-row-mt", "1", "-deadline", "good", "-cpu-used", "2",
             "-pix_fmt", "yuv420p", "-c:a", "libopus", "-b:a", "96k"] },
    { name: "fsb-hero.mp4",
      args: ["-i", src, "-vf", vf(), "-c:v", "libx264", "-crf", "25", "-preset", "slow",
             "-profile:v", "high", "-pix_fmt", "yuv420p",
             "-movflags", "+faststart", "-c:a", "aac", "-b:a", "128k"] },
    { name: "fsb-hero-mobile.mp4",
      args: ["-i", src, "-vf", mobileVf, "-c:v", "libx264", "-crf", "26",
             "-preset", "slow", "-profile:v", "high", "-pix_fmt", "yuv420p",
             "-movflags", "+faststart", "-c:a", "aac", "-b:a", "96k"] },
  ];

  for (const job of jobs) {
    const target = path.join(outDir, job.name);
    if (skip(target)) continue;
    process.stdout.write(`  … ${job.name}\r`);
    run(["ffmpeg", "-y", "-v", "error", ...job.args, target]);
    console.log(`  ✓ ${path.relative(ROOT, target)}`);
  }
}

/* ----------------------------------------------------------------- stills */

function buildStills(universe) {
  console.log(`\n▸ ${universe}`);
  const srcDir = path.join(ROOT, universe);
  const outDir = path.join(OUT, universe);
  ensureDir(outDir);

  const entries = [];
  const files = readdirSync(srcDir)
    .filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()))
    .sort();

  for (const file of files) {
    const src = path.join(srcDir, file);
    const raw = path.parse(file).name;
    const base = RENAME[raw.trim()] ?? slugify(raw);
    const target = path.join(outDir, `${base}.webp`);

    if (!skip(target)) {
      run(["ffmpeg", "-y", "-v", "error", "-i", src,
           "-vf", `scale=w=min(${MAX_WIDTH}\\,iw):h=-1:flags=lanczos`,
           "-frames:v", "1", "-c:v", "libwebp", "-quality", WEBP_QUALITY,
           "-compression_level", "6", target]);
      console.log(`  ✓ ${base}.webp`);
    }

    const { width, height } = probeSize(target);
    entries.push({ src: `/media/${universe}/${base}.webp`, width, height });
  }
  return entries;
}

/* --------------------------------------------------------------- manifest */

function writeManifest(pools) {
  const target = path.join(ROOT, "content", "media-pool.generated.ts");
  ensureDir(path.dirname(target));

  const body = Object.entries(pools)
    .map(([universe, items]) => {
      const rows = items
        .map((i) => `  { src: "${i.src}", width: ${i.width}, height: ${i.height} },`)
        .join("\n");
      return `export const ${universe}Pool: PoolImage[] = [\n${rows}\n];`;
    })
    .join("\n\n");

  writeFileSync(
    target,
    `// GERADO por scripts/prepare-media.mjs — não editar à mão.
// As dimensões vêm do arquivo real e alimentam width/height no <img>, evitando CLS.

export type PoolImage = {
  readonly src: string;
  readonly width: number;
  readonly height: number;
};

${body}
`,
    "utf8",
  );
  console.log(`\n✓ manifesto: ${path.relative(ROOT, target)}`);
}

/* ------------------------------------------------------------------- main */

ensureDir(OUT);
buildLogos();
buildHero();
const pools = {
  events: buildStills("events"),
  company: buildStills("company"),
};
writeManifest(pools);
console.log(
  `\nPools: events ${pools.events.length} · company ${pools.company.length}\n`,
);
