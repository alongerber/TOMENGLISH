/**
 * Gemini Imagen Asset Generator
 *
 * Usage: GEMINI_API_KEY=... npx tsx scripts/generate-assets.ts
 *
 * Generates mascot and icon images for the app using Gemini's Imagen API.
 * Run once during development — images are saved to public/assets/.
 * The app works WITHOUT these images (falls back to emoji).
 */

import * as fs from 'fs';
import * as path from 'path';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ Missing GEMINI_API_KEY environment variable');
  console.log('Usage: GEMINI_API_KEY=your-key npx tsx scripts/generate-assets.ts');
  process.exit(1);
}

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'assets');

const ASSETS = [
  {
    filename: 'mascot-idle.png',
    prompt: 'Cute blue fox character with headphones, 3D cartoon style, friendly expression, waving, transparent background, children\'s app mascot, Pixar style, simple clean design',
  },
  {
    filename: 'mascot-celebrate.png',
    prompt: 'Cute blue fox character with headphones, 3D cartoon style, celebrating with confetti, jumping happily, transparent background, children\'s app mascot, Pixar style',
  },
  {
    filename: 'mascot-encourage.png',
    prompt: 'Cute blue fox character with headphones, 3D cartoon style, thumbs up encouraging expression, transparent background, children\'s app mascot, Pixar style',
  },
  {
    filename: 'icon-magice.png',
    prompt: '3D magic wand with sparkles and letter E, glossy cartoon style, children\'s education app icon, gradient purple-blue background, simple clean',
  },
  {
    filename: 'icon-sentences.png',
    prompt: '3D colorful building blocks spelling ABC, glossy cartoon style, children\'s education app icon, gradient teal-green background, simple clean',
  },
  {
    filename: 'icon-price.png',
    prompt: '3D golden price tag with dollar sign, glossy cartoon style, children\'s education app icon, gradient yellow-orange background, simple clean',
  },
  {
    filename: 'icon-vocab.png',
    prompt: '3D magnifying glass with colorful letters, glossy cartoon style, children\'s education app icon, gradient orange-red background, simple clean',
  },
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
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created directory: ${OUTPUT_DIR}`);
  }

  console.log(`\n🚀 Generating ${ASSETS.length} assets...\n`);

  for (const asset of ASSETS) {
    await generateImage(asset.prompt, asset.filename);
    // Small delay between requests to be polite to the API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n✨ Done! Assets saved to public/assets/');
  console.log('💡 The app works without these images (falls back to emoji).');
}

main();
