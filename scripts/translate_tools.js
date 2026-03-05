import { translate } from '@vitalets/google-translate-api';
import fs from 'fs';
import path from 'path';
import pLimit from 'p-limit';

// Configuration
const BATCH_SIZE = 10;
const DELAY_BETWEEN_BATCHES_MS = 2000;
const FILE_PATHS = [
    path.join(process.cwd(), 'public', 'data', 'massive_tools_import.json'),
    path.join(process.cwd(), 'public', 'data', 'real_tools.json')
];

// Limit concurrency to avoid IP bans
const limit = pLimit(5);

// Arabic character check
const isArabic = (text) => /[\u0600-\u06FF]/.test(text);

async function translateText(text) {
    if (!text || isArabic(text)) return text; // Skip if empty or already contains Arabic

    try {
        const { text: translated } = await translate(text, { to: 'ar' });
        return translated;
    } catch (error) {
        console.error(`❌ Translation failed for "${text.substring(0, 30)}...":`, error.message);
        return text; // Return original if failed
    }
}

async function processBatch(toolsBatch, startIndex) {
    const promises = toolsBatch.map(async (tool, i) => {
        return limit(async () => {
            const index = startIndex + i;
            if (tool.description && !isArabic(tool.description)) {
                try {
                    const originalDesc = tool.description;
                    tool.description = await translateText(originalDesc);
                    console.log(`✅ [${index}] Translated: ${tool.title}`);
                } catch (e) {
                    console.error(`❌ [${index}] Error on ${tool.title}`);
                }
            } else {
                console.log(`⏭️ [${index}] Skipped: ${tool.title} (Already Arabic or no description)`);
            }
            return tool;
        });
    });

    return Promise.all(promises);
}

async function run() {
    console.log('🚀 Starting Translation Script...');

    for (const filePath of FILE_PATHS) {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️ File not found: ${filePath}`);
            continue;
        }

        console.log(`\n📄 Processing File: ${filePath}`);
        const rawData = fs.readFileSync(filePath, 'utf8');
        let tools = JSON.parse(rawData);
        console.log(`Total tools to check: ${tools.length}`);

        // Process in batches
        for (let i = 0; i < tools.length; i += BATCH_SIZE) {
            const batch = tools.slice(i, i + BATCH_SIZE);
            const processedBatch = await processBatch(batch, i);

            // Re-integrate processed batch
            for (let j = 0; j < processedBatch.length; j++) {
                tools[i + j] = processedBatch[j];
            }

            // Save progress every batch to prevent data loss
            fs.writeFileSync(filePath, JSON.stringify(tools, null, 2));

            // Small delay to respect API limits
            if (i + BATCH_SIZE < tools.length) {
                console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES_MS}ms before next batch...`);
                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES_MS));
            }
        }

        console.log(`\n🎉 Finished processing file: ${filePath}`);
    }
}

run().catch(console.error);
