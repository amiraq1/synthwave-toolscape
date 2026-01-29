
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.join('d:', 'synthwave-toolscape', 'tools_rows.csv');
const outputDir = path.join('d:', 'synthwave-toolscape', 'sql_batches');
const BATCH_SIZE = 15; // Small batch size to ensure it works

console.log('Reading CSV from:', csvPath);

try {
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');

    if (lines.length < 2) {
        console.error('CSV file is empty');
        process.exit(1);
    }

    // Headers processing
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const idIndex = headers.indexOf('id');
    const pricingIndex = headers.indexOf('pricing_details');
    // We keep target headers list
    const targetHeaders = headers.filter((_, i) => i !== idIndex && i !== pricingIndex);
    const columnsStr = targetHeaders.map(h => `"${h}"`).join(', ');

    // Helper to parse CSV line safely
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"'; i++;
                } else { inQuotes = !inQuotes; }
            } else if (char === ',' && !inQuotes) {
                result.push(current); current = '';
            } else { current += char; }
        }
        result.push(current);
        return result;
    }

    // Process all data rows
    const allDataRows = [];
    for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        if (cols.length !== headers.length) continue;

        const filteredCols = cols.filter((_, idx) => idx !== idIndex && idx !== pricingIndex);
        const rowValues = filteredCols.map(val => {
            let v = val.trim();
            if (v.startsWith('"') && v.endsWith('"')) v = v.substring(1, v.length - 1).replace(/""/g, '"');
            if (v === '' || v === 'null' || v.toLowerCase() === 'null') return 'NULL';
            if (v.toLowerCase() === 'true') return 'true';
            if (v.toLowerCase() === 'false') return 'false';
            return `'${v.replace(/'/g, "''")}'`;
        });
        allDataRows.push(`(${rowValues.join(', ')})`);
    }

    // Split and Write Batches
    let batchCount = 0;
    for (let i = 0; i < allDataRows.length; i += BATCH_SIZE) {
        const batchRows = allDataRows.slice(i, i + BATCH_SIZE);
        batchCount++;

        const fileContent = `
-- Batch ${batchCount} (${batchRows.length} items)
INSERT INTO public.tools (${columnsStr})
VALUES 
${batchRows.join(',\n')}
ON CONFLICT (url) DO UPDATE SET
    embedding = EXCLUDED.embedding,
    description = EXCLUDED.description,
    features = EXCLUDED.features;
`;
        const fileName = `batch_${String(batchCount).padStart(2, '0')}.sql`;
        fs.writeFileSync(path.join(outputDir, fileName), fileContent);
        console.log(`Created ${fileName} with ${batchRows.length} rows`);
    }

} catch (err) {
    console.error(err);
}
