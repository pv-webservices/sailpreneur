// Publish only what the site uses: client originals stay in /public for reference,
// but raw JPEG posters and unreferenced media variants are removed from dist/.
import { readdir, readFile, unlink } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const root = resolve('dist');

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)])));
  return files.flat();
}

for (const name of await readdir(root)) {
  if (/\.jpe?g$/i.test(name)) await unlink(resolve(root, name));
}

const files = await walk(root);
const pages = files.filter((f) => /\.(html|css|js)$/.test(f));
const referenced = new Set();
for (const page of pages) {
  for (const match of (await readFile(page, 'utf8')).matchAll(/\/media\/[\w.-]+\.webp/g)) referenced.add(match[0]);
}
let removed = 0;
for (const file of await readdir(join(root, 'media'))) {
  if (!referenced.has(`/media/${file}`)) { await unlink(join(root, 'media', file)); removed += 1; }
}
console.log(`curate-build: ${referenced.size} media files published, ${removed} unreferenced removed from dist`);
