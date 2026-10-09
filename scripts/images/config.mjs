// Central configuration for AI image generation.
// Change models, quality tiers or sizes here — the generator reads everything from this file.
// The API key is read server-side from process.env.OPENAI_API_KEY and is never bundled into the site.

export const MODELS = {
  flare: process.env.IMAGE_MODEL_FLARE || 'gpt-image-2.5-flare', // default: routine, fast, cost-efficient
  sunburst: process.env.IMAGE_MODEL_SUNBURST || 'gpt-image-2.5-sunburst', // premium: hero, people, complex scenes
};

export const QUALITY = {
  default: process.env.IMAGE_QUALITY_DEFAULT || 'medium',
  premium: process.env.IMAGE_QUALITY_PREMIUM || 'high',
};

export const SIZES = {
  square: '1024x1024',
  landscape: '1536x1024',
  portrait: '1024x1536',
};

export const GENERATION = {
  endpoint: 'https://api.openai.com/v1/images/generations',
  outputFormat: 'png',
  rawDir: 'assets-src/generated', // lossless originals (not published)
  concurrency: 3,
  timeoutMs: 240_000,
};

// Shared art direction so every asset belongs to one visual system.
const STYLE =
  'Editorial luxury travel photography, natural photorealistic detail, deep navy and warm champagne-gold colour palette, soft cinematic light, no text, no logos, no watermarks, no brand names, no signage lettering.';

/**
 * Every generated asset has a single, named placement on the site.
 * tier: 'flare' | 'sunburst'   quality: 'default' | 'premium'   orientation: key of SIZES
 */
export const IMAGES = [
  {
    key: 'hero-ship', tier: 'sunburst', quality: 'premium', orientation: 'landscape',
    placement: 'Homepage hero (full-bleed background)',
    alt: 'A large white cruise ship sailing across calm open sea at golden sunset',
    prompt: `A majestic modern white cruise ship sailing on a calm open ocean at golden-hour sunset, seen from a low three-quarter angle on the right half of the frame, dramatic sky with violet, rose and amber clouds, sun low on the horizon reflecting on gentle waves, the left half of the frame is open sky and sea with calm negative space for headline text. ${STYLE}`,
  },
  {
    key: 'cta-deck', tier: 'sunburst', quality: 'premium', orientation: 'landscape',
    placement: 'Closing call-to-action banner (sitewide)',
    alt: 'A young professional standing at the railing of a cruise ship deck, looking out over the sea at sunset',
    prompt: `A young South Asian woman in smart navy professional attire seen from behind and slightly to the side, standing at the polished wooden railing of a cruise ship upper deck, looking out over a vast calm sea at sunset, warm golden backlight, a second cruise ship faintly visible on the horizon, hopeful aspirational mood, composition keeps the person on the left third with open sky on the right. ${STYLE}`,
  },
  {
    key: 'dehradun-valley', tier: 'flare', quality: 'default', orientation: 'landscape',
    placement: 'Homepage "From Dehradun to the World" section',
    alt: 'Sunrise over the Doon valley with the Himalayan foothills in the distance',
    prompt: `Early morning over the Doon valley in Uttarakhand, India: soft layered green Himalayan foothills and distant snow-capped peaks, a city of low-rise buildings and trees in the valley under light mist, warm sunrise glow, peaceful and hopeful. ${STYLE}`,
  },
  {
    key: 'journey-ocean', tier: 'flare', quality: 'default', orientation: 'landscape',
    placement: 'Seven-step journey section background',
    alt: 'Wide open ocean at dusk with a cruise ship on the distant horizon',
    prompt: `An ultra-wide calm ocean seascape at blue-hour dusk, deep navy water with soft gold reflections, a small illuminated cruise ship far away on the horizon, faint mountains on the far left edge, large areas of quiet sky and water suitable as a background behind text. ${STYLE}`,
  },
  {
    key: 'bridge-dusk', tier: 'flare', quality: 'default', orientation: 'landscape',
    placement: 'Expert panel section background',
    alt: 'The navigation bridge of a cruise ship looking out to sea at dusk',
    prompt: `Interior of a modern cruise ship navigation bridge at dusk, wide panoramic windows looking out to a calm sea and sunset sky, navigation consoles softly glowing, no people, calm premium atmosphere, slightly darker exposure suitable as a background. ${STYLE}`,
  },
  {
    key: 'dept-hotel', tier: 'sunburst', quality: 'default', orientation: 'portrait',
    placement: 'Career departments — Hotel & Guest Services card',
    alt: 'A smiling guest services crew member at the front desk of a cruise ship lobby',
    prompt: `A friendly young South Asian woman guest services officer in a tailored navy uniform with gold details standing at an elegant marble reception desk inside a luxurious cruise ship atrium, warm lighting, welcoming smile, waist-up portrait. ${STYLE}`,
  },
  {
    key: 'dept-fnb', tier: 'sunburst', quality: 'default', orientation: 'portrait',
    placement: 'Career departments — Food & Beverage card',
    alt: 'A bartender in a waistcoat preparing a drink at an elegant cruise ship bar',
    prompt: `A young South Asian male bartender in a black waistcoat and bow tie preparing a cocktail at an elegant wood-and-brass cruise ship bar, warm amber lighting, glassware shelves softly blurred behind, confident professional expression, waist-up portrait. ${STYLE}`,
  },
  {
    key: 'dept-housekeeping', tier: 'sunburst', quality: 'default', orientation: 'portrait',
    placement: 'Career departments — Housekeeping card',
    alt: 'A housekeeping attendant preparing a bright cruise ship stateroom with an ocean-view balcony',
    prompt: `A young South Asian woman housekeeping attendant in a neat navy uniform smoothing crisp white bedding in a bright luxury cruise ship stateroom with a balcony door showing the open sea, folded towels, calm daylight, professional and caring. ${STYLE}`,
  },
  {
    key: 'dept-galley', tier: 'sunburst', quality: 'default', orientation: 'portrait',
    placement: 'Career departments — Galley & Culinary card',
    alt: 'A chef plating a dish in a professional stainless-steel cruise ship galley',
    prompt: `A young South Asian male chef in a white chef jacket and toque carefully plating a refined dish in a spotless professional stainless-steel cruise ship galley, other cooks softly blurred in the background, focused expression, warm and cool lighting mix. ${STYLE}`,
  },
  {
    key: 'dept-deck', tier: 'sunburst', quality: 'default', orientation: 'portrait',
    placement: 'Career departments — Deck card',
    alt: 'A deck officer in a white uniform on the open deck of a cruise ship at sea',
    prompt: `A South Asian male deck officer in a crisp white uniform with epaulettes and a peaked cap standing on the open deck of a large cruise ship, binoculars in hand, looking toward the sea, ropes and railings around, bright late-afternoon sun, authoritative and calm. ${STYLE}`,
  },
  {
    key: 'mentorship-session', tier: 'sunburst', quality: 'default', orientation: 'landscape',
    placement: 'Homepage programs intro & Mentorship Program page',
    alt: 'A mentor guiding young candidates through a mock interview in a classroom',
    prompt: `A small professional training room in India: an experienced male mentor in a smart suit conducting a mock job interview with a young South Asian candidate in formal attire across a table, two other young trainees with notebooks observing, a framed cruise ship photograph on the wall, warm daylight, encouraging and focused atmosphere. ${STYLE}`,
  },
  {
    key: 'ship-atrium', tier: 'sunburst', quality: 'default', orientation: 'landscape',
    placement: 'About page editorial image & "Life onboard" storytelling',
    alt: 'The grand multi-deck atrium of a modern cruise ship with sweeping staircases',
    prompt: `The grand multi-deck atrium of a modern luxury cruise ship, sweeping curved staircases with brass railings, glass balconies, warm chandelier light, a few crew members in navy uniforms in the distance, elegant and spacious, architectural interior photography. ${STYLE}`,
  },
];
