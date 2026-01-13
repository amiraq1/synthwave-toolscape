import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directory = path.join(__dirname, '../public'); // المجلد الذي يحتوي على الصور

console.log('🚀 Starting image conversion to WebP...\n');
console.log('📁 Looking for images in:', directory);

const files = fs.readdirSync(directory);
let converted = 0;

for (const file of files) {
    if (file.match(/\.(jpe?g|png)$/i)) {
        const filePath = path.join(directory, file);
        const outputPath = filePath.replace(/\.(jpe?g|png)$/i, '.webp');

        try {
            const originalSize = fs.statSync(filePath).size;
            const info = await sharp(filePath)
                .webp({ quality: 80 }) // جودة 80 تعطي توازناً ممتازاً
                .toFile(outputPath);

            const savings = ((1 - info.size / originalSize) * 100).toFixed(1);
            console.log(`✅ ${file} → ${path.basename(outputPath)} (${savings}% smaller, ${(info.size / 1024).toFixed(1)}KB)`);
            converted++;
        } catch (err) {
            console.error(`❌ Error converting ${file}:`, err.message);
        }
    }
}

console.log(`\n🎉 Done! Converted ${converted} images to WebP.`);
