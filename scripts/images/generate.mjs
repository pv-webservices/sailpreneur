// Server-side AI image generation (run locally / in CI — never in the browser).
// Usage:
//   node --env-file=.env scripts/images/generate.mjs            # generate missing images
//   node --env-file=.env scripts/images/generate.mjs --only=hero-ship,cta-deck
//   node --env-file=.env scripts/images/generate.mjs --force    # regenerate everything
//   node --env-file=.env scripts/images/generate.mjs --upgrade=hero-ship   # retry an asset on the premium model
// Afterwards run `python scripts/optimize-images.py` to publish WebP derivatives.
import { mkdir, writeFile, access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { MODELS, QUALITY, SIZES, GENERATION, IMAGES } from './config.mjs';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('OPENAI_API_KEY is not set. Add it to .env (never commit it).');
  process.exit(1);
}

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const [k, v = 'true'] = a.replace(/^--/, '').split('=');
  return [k, v];
}));
const only = args.only ? new Set(args.only.split(',')) : null;
const upgrade = new Set((args.upgrade || '').split(',').filter(Boolean));
const force = args.force === 'true';

const rawDir = resolve(GENERATION.rawDir);
const manifestPath = resolve(rawDir, 'manifest.json');
await mkdir(rawDir, { recursive: true });

const exists = (p) => access(p).then(() => true, () => false);
const manifest = (await exists(manifestPath)) ? JSON.parse(await readFile(manifestPath, 'utf8')) : {};

/** Resolve model + quality for an asset. Sunburst is used only when the asset calls for it or Flare fell short. */
function route(image) {
  const tier = upgrade.has(image.key) ? 'sunburst' : image.tier;
  const quality = upgrade.has(image.key) ? QUALITY.premium : QUALITY[image.quality];
  return { model: MODELS[tier], quality, size: SIZES[image.orientation] };
}

async function generate(image) {
  const file = resolve(rawDir, `${image.key}.${GENERATION.outputFormat}`);
  if (!force && !upgrade.has(image.key) && (await exists(file))) return { key: image.key, skipped: true };
  const { model, quality, size } = route(image);
  const started = Date.now();
  const response = await fetch(GENERATION.endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt: image.prompt, size, quality, n: 1, output_format: GENERATION.outputFormat }),
    signal: AbortSignal.timeout(GENERATION.timeoutMs),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok || !json.data?.[0]?.b64_json) {
    throw new Error(`${image.key}: ${response.status} ${json.error?.message || 'no image returned'}`);
  }
  await writeFile(file, Buffer.from(json.data[0].b64_json, 'base64'));
  manifest[image.key] = { model, quality, size, placement: image.placement, alt: image.alt, generatedAt: new Date().toISOString() };
  return { key: image.key, model, quality, size, seconds: Math.round((Date.now() - started) / 1000) };
}

const queue = IMAGES.filter((img) => !only || only.has(img.key));
const results = [];
async function worker() {
  while (queue.length) {
    const image = queue.shift();
    try {
      const result = await generate(image);
      results.push(result);
      console.log(result.skipped ? `skip  ${result.key}` : `done  ${result.key}  ${result.model} / ${result.quality} / ${result.size}  ${result.seconds}s`);
    } catch (error) {
      results.push({ key: image.key, error: String(error.message || error) });
      console.error(`fail  ${error.message || error}`);
    }
  }
}
await Promise.all(Array.from({ length: GENERATION.concurrency }, worker));
await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
const failed = results.filter((r) => r.error);
console.log(`\n${results.length - failed.length} ok, ${failed.length} failed`);
process.exit(failed.length ? 1 : 0);
