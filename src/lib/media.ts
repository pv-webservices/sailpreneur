import manifest from '../data/media.json';

interface Variant { width: number; height: number; file: string }
type Manifest = Record<string, Variant[] | { model: string; quality: string; alt: string }>;

export interface ResponsiveImage {
  src: string;
  srcset: string;
  width: number;
  height: number;
}

/** Look up an optimised image produced by scripts/optimize-images.py. Throws at build time if missing. */
export function media(name: string): ResponsiveImage {
  const variants = (manifest as Manifest)[name];
  if (!Array.isArray(variants) || !variants.length) throw new Error(`Missing media asset: ${name}`);
  const sorted = [...variants].sort((a, b) => b.width - a.width);
  const largest = sorted[0];
  return {
    src: largest.file,
    srcset: sorted.map((v) => `${v.file} ${v.width}w`).join(', '),
    width: largest.width,
    height: largest.height,
  };
}

/** Alt text recorded with each generated image. */
export function generatedAlt(name: string): string {
  const meta = (manifest as Manifest)[`${name}:meta`];
  return meta && !Array.isArray(meta) ? meta.alt : '';
}
