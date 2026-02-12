import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// تحميل متغيرات البيئة
dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
// نستخدم المفتاح الموجود في المتغيرات (VITE_SUPABASE_PUBLISHABLE_KEY)
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SITE_URL = "https://amiraq.org";

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Supabase URL or Key is missing!");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function generateSitemap() {
    console.log("⏳ Generating sitemap...");

    // 1. الروابط الثابتة
    const staticRoutes = [
        '/',
        '/tools',
        '/blog',
        '/contact',
        '/about',
        '/faq',
        '/agents',
        '/workflow/new',
        '/bookmarks'
    ];

    // 2. جلب الروابط الديناميكية من Supabase
    // ملاحظة: قاعدة البيانات تستخدم id وليس slug، وتستخدم created_at
    const { data: tools, error } = await supabase
        .from('tools')
        .select('id, created_at')
        .eq('is_published', true);

    if (error) {
        console.error("❌ Error fetching tools:", error);
        process.exit(1);
    }

    // جلب المقالات أيضاً
    const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, created_at')
        .eq('is_published', true);

    if (postsError) {
        console.error("❌ Error fetching posts:", postsError);
        // لن نوقف العملية، سنكمل
    }

    // دمج الروابط (XML Construction)
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // إضافة الروابط الثابتة
    staticRoutes.forEach(route => {
        sitemap += `
  <url>
    <loc>${SITE_URL}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`;
    });

    // 3) دمج أدوات الملف المحلي (public/data/tools.json) غير الموجودة في Supabase
    const localToolsPath = path.resolve(__dirname, "../public/data/tools.json");
    let mergedTools = [...tools];

    try {
        if (fs.existsSync(localToolsPath)) {
            const localToolsRaw = fs.readFileSync(localToolsPath, "utf8");
            const localTools = JSON.parse(localToolsRaw);

            if (Array.isArray(localTools)) {
                const supabaseIds = new Set((tools || []).map((t) => String(t.id)));
                const localOnlyTools = localTools
                    .filter((t) => t && t.is_published !== false && t.id !== undefined && !supabaseIds.has(String(t.id)))
                    .map((t) => ({
                        id: t.id,
                        created_at: t.created_at || new Date().toISOString()
                    }));

                mergedTools = [...tools, ...localOnlyTools];
            }
        }
    } catch (localReadError) {
        console.warn("⚠️ Could not merge local tools into sitemap:", localReadError?.message || localReadError);
    }

    // إضافة الأدوات (Tools)
    mergedTools.forEach(tool => {
        sitemap += `
  <url>
    <loc>${SITE_URL}/tool/${tool.id}</loc>
    <lastmod>${new Date(tool.created_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    });

    // إضافة المقالات (Posts)
    posts?.forEach(post => {
        sitemap += `
  <url>
    <loc>${SITE_URL}/blog/${post.id}</loc>
    <lastmod>${new Date(post.created_at).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    // 3. الحفظ في مجلد public
    const publicDir = path.resolve(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
    console.log(`✅ Sitemap generated successfully with ${mergedTools.length} tools and ${posts?.length || 0} posts.`);
    console.log(`📄 Saved to: ${path.join(publicDir, 'sitemap.xml')}`);
}

generateSitemap();
