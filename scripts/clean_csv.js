
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.join('d:', 'synthwave-toolscape', 'tools_rows.csv');
const sqlPath = path.join('d:', 'synthwave-toolscape', 'cleaned_tools.sql');

console.log('Reading CSV from:', csvPath);

try {
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');

    if (lines.length < 2) {
        console.error('CSV file is empty or has no data');
        process.exit(1);
    }

    // 1. Get Headers
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

    // Identify columns to remove
    const idIndex = headers.indexOf('id');
    const pricingIndex = headers.indexOf('pricing_details');

    console.log(`Found columns to filter: id (index ${idIndex}), pricing_details (index ${pricingIndex})`);

    // Filter headers
    const targetHeaders = headers.filter((_, i) => i !== idIndex && i !== pricingIndex);

    // 2. Parse Rows Helper
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"'; // Unescape double quotes
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    }

    // 3. Build SQL
    const sqlValues = [];

    for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);

        // Basic validation
        if (cols.length !== headers.length) {
            console.warn(`Skipping line ${i + 1}: Expected ${headers.length} columns, got ${cols.length}`);
            continue;
        }

        const filteredCols = cols.filter((_, idx) => idx !== idIndex && idx !== pricingIndex);

        const rowValues = filteredCols.map(val => {
            let v = val.trim();

            // Remove wrapping quotes from CSV parsing if they persist (my parser handles inner content, but let's be sure)
            if (v.startsWith('"') && v.endsWith('"')) {
                v = v.substring(1, v.length - 1).replace(/""/g, '"');
            }

            // Handle NULLs
            if (v === '' || v === 'null' || v.toLowerCase() === 'null') return 'NULL';

            // Boolean normalization
            if (v.toLowerCase() === 'true') return 'true';
            if (v.toLowerCase() === 'false') return 'false';

            // Escape single quotes for SQL
            return `'${v.replace(/'/g, "''")}'`;
        });

        sqlValues.push(`(${rowValues.join(', ')})`);
    }

    // Construct Final SQL
    const finalSQL = `
-- Cleaned Tools Restore Script generated from CSV
-- Generated on: ${new Date().toISOString()}

-- 2. Insert Data
INSERT INTO public.tools (${targetHeaders.map(h => `"${h}"`).join(', ')})
VALUES 
${sqlValues.join(',\n')}
ON CONFLICT (url) DO UPDATE SET
    embedding = EXCLUDED.embedding,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    features = EXCLUDED.features,
    image_url = EXCLUDED.image_url,
    category = EXCLUDED.category,
    pricing_type = EXCLUDED.pricing_type,
    is_featured = EXCLUDED.is_featured,
    is_published = EXCLUDED.is_published;
`;

    fs.writeFileSync(sqlPath, finalSQL);
    console.log(`Successfully generated SQL file at: ${sqlPath}`);
    console.log(`Processed ${sqlValues.length} rows.`);

} catch (err) {
    console.error('Error processing CSV:', err);
}
