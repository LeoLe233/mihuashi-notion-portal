import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const inputFile = 'artist.json';

function cleanJson(obj) {
  if (Array.isArray(obj)) {
    return obj.map(cleanJson);
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, cleanJson(value)])
    );
  } else {
    // Return empty version based on type
    if (typeof obj === 'string') return '';
    if (typeof obj === 'number') return 0;
    if (typeof obj === 'boolean') return false;
    return null;
  }
}

const inputPath = path.join(__dirname, 'jsons', inputFile);
const originalFilename = path.basename(inputPath);
const outputPath = path.join(
  __dirname,
  'outputs',
  `clean_${originalFilename}`
);

// Ensure output directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read, clean, and save
const original = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
const cleaned = cleanJson(original);
fs.writeFileSync(outputPath, JSON.stringify(cleaned, null, 2));
console.log(`Cleaned structure saved to: ${outputPath}`);
