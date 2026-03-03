import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env.local");
dotenv.config({ path: envPath });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SITE_URL = "https://amiraq.org"; // Ensure this is your production URL

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("⚠️ Supabase URL or Key is missing — skipping sitemap generation.");
    process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false }
});

async function fetchAllTools() {
    let allTools = [];
    let page = 0;
    const pageSize = 1000;

    console.log("📥 Fetching tools from Supabase...");

    while (true) {
        const { data, error } = await supabase
            .from('tools')
            .select('id, created_at')
            .eq('is_published', true)
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
            console.error("❌ Error fetching tools:", error);
            break;
        }

        if (!data || data.length === 0) break;

        allTools = allTools.concat(data);
        console.log(`🔹 Fetched ${data.length} tools (Total: ${allTools.length})...`);

        if (data.length < pageSize) break;
        page++;
    }

    return allTools;
}

async function renderSitemap() {
    console.log("⏳ Generating sitemap...");

    const tools = await fetchAllTools();

    // Static Routes
    const staticRoutes = [
        { url: '/', changefreq: 'daily', priority: 1.0 },
        { url: '/tools', changefreq: 'daily', priority: 0.9 },
        { url: '/blog', changefreq: 'weekly', priority: 0.8 },
        { url: '/contact', changefreq: 'monthly', priority: 0.5 },
        { url: '/about', changefreq: 'monthly', priority: 0.6 },
        { url: '/terms', changefreq: 'yearly', priority: 0.3 },
        { url: '/privacy', changefreq: 'yearly', priority: 0.3 },
    ];

    let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add Static Routes
    staticRoutes.forEach(route => {
        sitemapContent += `
  <url>
    <loc>${SITE_URL}${route.url}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
    });

    // Add Tools Routes
    tools.forEach(tool => {
        const lastMod = tool.created_at || new Date().toISOString();
        sitemapContent += `
  <url>
    <loc>${SITE_URL}/tool/${tool.id}</loc>
    <lastmod>${new Date(lastMod).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    sitemapContent += `
</urlset>`;

    // Save to public directory
    const publicDir = path.resolve(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    const sitemapPath = path.join(publicDir, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemapContent);

    console.log(`✅ Sitemap generated successfully!`);
    console.log(`📊 Total URLs: ${staticRoutes.length + tools.length}`);
    console.log(`📄 Saved to: ${sitemapPath}`);
}

renderSitemap().catch(err => {
    console.error("❌ Fatal error:", err);
    process.exit(1);
});
