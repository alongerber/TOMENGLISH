/**
 * Gemini Imagen Asset Generator
 *
 * Usage: GEMINI_API_KEY=... npx tsx scripts/generate-assets.ts [category]
 *
 * Categories: mascots, icons, backgrounds, badges, scenes, words, all
 * Default: all
 *
 * Generates images for the app using Gemini's Imagen API.
 * Run once during development — images are saved to public/assets/.
 * The app works WITHOUT these images (falls back to emoji).
 */

import * as fs from 'fs';
import * as path from 'path';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ Missing GEMINI_API_KEY environment variable');
  console.log('Usage: GEMINI_API_KEY=your-key npx tsx scripts/generate-assets.ts [category]');
  console.log('Categories: mascots, icons, backgrounds, badges, scenes, words, all');
  process.exit(1);
}

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'assets');

interface Asset {
  filename: string;
  prompt: string;
  category: string;
}

// ── Mascot images ─────────────────────────────
const MASCOT_ASSETS: Asset[] = [
  {
    filename: 'mascot-idle.png',
    prompt: 'Cute blue fox character with headphones, 3D cartoon style, friendly expression, waving, transparent background, children\'s app mascot, Pixar style, simple clean design',
    category: 'mascots',
  },
  {
    filename: 'mascot-celebrate.png',
    prompt: 'Cute blue fox character with headphones, 3D cartoon style, celebrating with confetti, jumping happily, transparent background, children\'s app mascot, Pixar style',
    category: 'mascots',
  },
  {
    filename: 'mascot-encourage.png',
    prompt: 'Cute blue fox character with headphones, 3D cartoon style, thumbs up encouraging expression, transparent background, children\'s app mascot, Pixar style',
    category: 'mascots',
  },
];

// ── Module icons ──────────────────────────────
const ICON_ASSETS: Asset[] = [
  {
    filename: 'icon-magice.png',
    prompt: '3D magic wand with sparkles and letter E, glossy cartoon style, children\'s education app icon, gradient purple-blue background, simple clean',
    category: 'icons',
  },
  {
    filename: 'icon-sentences.png',
    prompt: '3D colorful building blocks spelling ABC, glossy cartoon style, children\'s education app icon, gradient teal-green background, simple clean',
    category: 'icons',
  },
  {
    filename: 'icon-price.png',
    prompt: '3D golden price tag with dollar sign, glossy cartoon style, children\'s education app icon, gradient yellow-orange background, simple clean',
    category: 'icons',
  },
  {
    filename: 'icon-vocab.png',
    prompt: '3D magnifying glass with colorful letters, glossy cartoon style, children\'s education app icon, gradient orange-red background, simple clean',
    category: 'icons',
  },
];

// ── Category background images ────────────────
const BACKGROUND_ASSETS: Asset[] = [
  {
    filename: 'bg-magic-e.png',
    prompt: 'Magical laboratory background with floating glowing letters, sparkles, purple mist, whimsical children\'s illustration style, soft watercolor, 16:9 aspect ratio, dreamy atmosphere',
    category: 'backgrounds',
  },
  {
    filename: 'bg-sentences.png',
    prompt: 'Colorful classroom with building blocks and word bubbles floating in air, cheerful children\'s illustration style, soft watercolor, 16:9 aspect ratio, warm teal-green tones',
    category: 'backgrounds',
  },
  {
    filename: 'bg-prices.png',
    prompt: 'Fun cartoon shopping market with price tags and golden coins, children\'s illustration style, soft watercolor, 16:9 aspect ratio, warm yellow-orange tones',
    category: 'backgrounds',
  },
  {
    filename: 'bg-vocabulary.png',
    prompt: 'Cozy cartoon house interior with labeled objects, magnifying glass exploring, children\'s illustration style, soft watercolor, 16:9 aspect ratio, warm orange-coral tones',
    category: 'backgrounds',
  },
];

// ── Achievement badge images ──────────────────
const BADGE_ASSETS: Asset[] = [
  {
    filename: 'badge-first-correct.png',
    prompt: '3D golden badge with a single glowing star, "first step" achievement medal, glossy cartoon style, transparent background, children\'s game reward',
    category: 'badges',
  },
  {
    filename: 'badge-combo-3.png',
    prompt: '3D flame badge with number 3, fire combo streak medal, glossy cartoon style, orange-red glow, transparent background, children\'s game reward',
    category: 'badges',
  },
  {
    filename: 'badge-combo-5.png',
    prompt: '3D explosive badge with lightning bolts and number 5, epic combo medal, glossy cartoon style, electric blue glow, transparent background, children\'s game reward',
    category: 'badges',
  },
  {
    filename: 'badge-combo-10.png',
    prompt: '3D rocket badge blasting off with number 10, unstoppable combo medal, glossy cartoon style, rainbow glow, transparent background, children\'s game reward',
    category: 'badges',
  },
  {
    filename: 'badge-score-100.png',
    prompt: '3D bronze trophy with "100" engraved, score milestone medal, glossy cartoon style, warm bronze glow, transparent background, children\'s game reward',
    category: 'badges',
  },
  {
    filename: 'badge-score-250.png',
    prompt: '3D silver trophy with star and "250" engraved, rising star medal, glossy cartoon style, silver glow, transparent background, children\'s game reward',
    category: 'badges',
  },
  {
    filename: 'badge-score-500.png',
    prompt: '3D golden trophy cup with "500" and crown, champion medal, glossy cartoon style, golden glow, transparent background, children\'s game reward',
    category: 'badges',
  },
  {
    filename: 'badge-first-boss.png',
    prompt: '3D purple shield with alien face defeated, boss victory medal, glossy cartoon style, purple glow, transparent background, children\'s game reward',
    category: 'badges',
  },
  {
    filename: 'badge-all-bosses.png',
    prompt: '3D royal crown with gems, master of all bosses medal, glossy cartoon style, rainbow glow, transparent background, children\'s game reward',
    category: 'badges',
  },
  {
    filename: 'badge-mock-test-pass.png',
    prompt: '3D scroll certificate with checkmark, test passed medal, glossy cartoon style, green glow, transparent background, children\'s game reward',
    category: 'badges',
  },
  {
    filename: 'badge-mock-test-ace.png',
    prompt: '3D rainbow ribbon award with "A+" and sparkles, perfect score medal, glossy cartoon style, rainbow glow, transparent background, children\'s game reward',
    category: 'badges',
  },
  {
    filename: 'badge-ten-words.png',
    prompt: '3D open book with 10 glowing words flying out, vocabulary master medal, glossy cartoon style, blue glow, transparent background, children\'s game reward',
    category: 'badges',
  },
];

// ── Scene images ──────────────────────────────
const SCENE_ASSETS: Asset[] = [
  {
    filename: 'scene-welcome.png',
    prompt: 'Magical English learning adventure landscape with rainbow, castle of words, friendly path, children\'s fantasy illustration, Pixar style, inviting warm colors, 16:9',
    category: 'scenes',
  },
  {
    filename: 'scene-celebration.png',
    prompt: 'Colorful celebration scene with fireworks, confetti, balloons and trophies, children\'s illustration style, joyful bright colors, 16:9 aspect ratio',
    category: 'scenes',
  },
  {
    filename: 'scene-boss-battle.png',
    prompt: 'Dramatic but fun boss battle arena with pixel-art alien boss, colorful energy, children\'s game illustration, purple and red dramatic lighting, 16:9',
    category: 'scenes',
  },
  {
    filename: 'scene-mock-test.png',
    prompt: 'Calm exam classroom with desk, pencil, and test paper, encouraging motivational atmosphere, children\'s illustration style, warm blue-purple tones, 16:9',
    category: 'scenes',
  },
];

// ── Word illustration images ──────────────────
const WORD_ASSETS: Asset[] = [
  // Clothing
  { filename: 'word-shirt.png', prompt: '3D cute cartoon t-shirt, colorful fabric, children\'s illustration, glossy style, transparent background, simple', category: 'words' },
  { filename: 'word-hat.png', prompt: '3D cute cartoon baseball hat, colorful, children\'s illustration, glossy style, transparent background, simple', category: 'words' },
  { filename: 'word-shoes.png', prompt: '3D cute cartoon pair of sneaker shoes, colorful, children\'s illustration, glossy style, transparent background, simple', category: 'words' },
  { filename: 'word-pants.png', prompt: '3D cute cartoon blue jeans pants, children\'s illustration, glossy style, transparent background, simple', category: 'words' },
  { filename: 'word-dress.png', prompt: '3D cute cartoon girl dress with flowers, children\'s illustration, glossy style, transparent background, simple', category: 'words' },
  { filename: 'word-coat.png', prompt: '3D cute cartoon warm winter coat, children\'s illustration, glossy style, transparent background, simple', category: 'words' },
  { filename: 'word-socks.png', prompt: '3D cute cartoon pair of colorful socks, children\'s illustration, glossy style, transparent background, simple', category: 'words' },
  { filename: 'word-skirt.png', prompt: '3D cute cartoon pleated skirt, children\'s illustration, glossy style, transparent background, simple', category: 'words' },
  // House
  { filename: 'word-door.png', prompt: '3D cute cartoon wooden door with round handle, children\'s illustration, glossy style, transparent background, simple', category: 'words' },
  { filename: 'word-window.png', prompt: '3D cute cartoon window with curtains, children\'s illustration, glossy style, transparent background, simple', category: 'words' },
  { filename: 'word-bed.png', prompt: '3D cute cartoon cozy bed with pillow and blanket, children\'s illustration, glossy style, transparent background, simple', category: 'words' },
  { filename: 'word-table.png', prompt: '3D cute cartoon wooden dining table, children\'s illustration, glossy style, transparent background, simple', category: 'words' },
  { filename: 'word-chair.png', prompt: '3D cute cartoon wooden chair, children\'s illustration, glossy style, transparent background, simple', category: 'words' },
  { filename: 'word-kitchen.png', prompt: '3D cute cartoon kitchen with stove and fridge, children\'s illustration, glossy style, transparent background, simple', category: 'words' },
  { filename: 'word-bathroom.png', prompt: '3D cute cartoon bathroom with bathtub, children\'s illustration, glossy style, transparent background, simple', category: 'words' },
  // Magic E words
  { filename: 'word-cake.png', prompt: '3D cute cartoon birthday cake with candles, children\'s illustration, glossy style, transparent background, simple', category: 'words' },
  { filename: 'word-bike.png', prompt: '3D cute cartoon red bicycle, children\'s illustration, glossy style, transparent background, simple', category: 'words' },
  { filename: 'word-kite.png', prompt: '3D cute cartoon flying kite with tail, children\'s illustration, glossy style, transparent background, simple', category: 'words' },
  { filename: 'word-bone.png', prompt: '3D cute cartoon dog bone, children\'s illustration, glossy style, transparent background, simple', category: 'words' },
  { filename: 'word-rose.png', prompt: '3D cute cartoon red rose flower, children\'s illustration, glossy style, transparent background, simple', category: 'words' },
  { filename: 'word-home.png', prompt: '3D cute cartoon small cozy house, children\'s illustration, glossy style, transparent background, simple', category: 'words' },
];

const ALL_ASSETS: Asset[] = [
  ...MASCOT_ASSETS,
  ...ICON_ASSETS,
  ...BACKGROUND_ASSETS,
  ...BADGE_ASSETS,
  ...SCENE_ASSETS,
  ...WORD_ASSETS,
];

async function generateImage(prompt: string, filename: string): Promise<void> {
  console.log(`🎨 Generating: ${filename}...`);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: '1:1',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Failed to generate ${filename}: ${response.status} ${errorText}`);
      return;
    }

    const data = await response.json();
    const imageData = data.predictions?.[0]?.bytesBase64Encoded;

    if (!imageData) {
      console.error(`❌ No image data returned for ${filename}`);
      return;
    }

    const outputPath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(outputPath, Buffer.from(imageData, 'base64'));
    console.log(`✅ Saved: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Error generating ${filename}:`, error);
  }
}

async function main() {
  const category = process.argv[2] || 'all';

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created directory: ${OUTPUT_DIR}`);
  }

  let assets: Asset[];
  if (category === 'all') {
    assets = ALL_ASSETS;
  } else {
    assets = ALL_ASSETS.filter(a => a.category === category);
    if (assets.length === 0) {
      console.error(`❌ Unknown category: ${category}`);
      console.log('Available: mascots, icons, backgrounds, badges, scenes, words, all');
      process.exit(1);
    }
  }

  // Skip assets that already exist
  const existing = assets.filter(a => fs.existsSync(path.join(OUTPUT_DIR, a.filename)));
  const toGenerate = assets.filter(a => !fs.existsSync(path.join(OUTPUT_DIR, a.filename)));

  if (existing.length > 0) {
    console.log(`⏭️  Skipping ${existing.length} existing assets`);
  }

  console.log(`\n🚀 Generating ${toGenerate.length} new assets (category: ${category})...\n`);

  for (const asset of toGenerate) {
    await generateImage(asset.prompt, asset.filename);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n✨ Done! ${toGenerate.length} assets saved to public/assets/`);
  console.log('💡 The app works without these images (falls back to emoji).');
  console.log(`📊 Total assets: ${ALL_ASSETS.length} (${MASCOT_ASSETS.length} mascots, ${ICON_ASSETS.length} icons, ${BACKGROUND_ASSETS.length} backgrounds, ${BADGE_ASSETS.length} badges, ${SCENE_ASSETS.length} scenes, ${WORD_ASSETS.length} words)`);
}

main();
