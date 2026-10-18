import manifest from '../data/media.json';

interface Variant { width: number; height: number; file: string; avif?: string }
type Manifest = Record<string, Variant[] | { model: string; quality: string; alt: string }>;

export interface ResponsiveImage {
  src: string;
  srcset: string;
  /** AVIF srcset, when the pipeline produced AVIF variants. */
  avifSrcset?: string;
  width: number;
  height: number;
}

/** Look up an optimised image produced by scripts/optimize-images.py (AVIF + WebP). Throws at build time if missing. */
export function media(name: string): ResponsiveImage {
  const variants = (manifest as Manifest)[name];
  if (!Array.isArray(variants) || !variants.length) throw new Error(`Missing media asset: ${name}`);
  const sorted = [...variants].sort((a, b) => b.width - a.width);
  const largest = sorted[0];
  return {
    src: largest.file,
    srcset: sorted.map((v) => `${v.file} ${v.width}w`).join(', '),
    avifSrcset: sorted.every((v) => v.avif) ? sorted.map((v) => `${v.avif} ${v.width}w`).join(', ') : undefined,
    width: largest.width,
    height: largest.height,
  };
}

/** Alt text recorded with each generated image. */
export function generatedAlt(name: string): string {
  const meta = (manifest as Manifest)[`${name}:meta`];
  return meta && !Array.isArray(meta) ? meta.alt : '';
}

/** First of the given asset names that has been published, or null. Lets data reference images that are generated later. */
export function firstAvailable(...names: (string | null | undefined)[]): string | null {
  return names.find((name): name is string => !!name && Array.isArray((manifest as Manifest)[name])) ?? null;
}
