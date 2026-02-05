import { createClient } from 'jsr:@supabase/supabase-js@2'

const BASE_URL = 'https://amiraq.org';

Deno.serve(async (req) => {
  try {
    // 1. إعداد Supabase Client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // 2. جلب البيانات (الأدوات والمقالات) بشكل متوازي للسرعة
    const [toolsResult, blogsResult] = await Promise.all([
      supabase
        .from('tools')
        .select('id, updated_at, created_at')
        .eq('is_published', true), // فقط المنشور

      // افترضت وجود جدول للمدونة، إذا لم يوجد احذف هذا الجزء
      supabase
        .from('blogs') // تأكد من اسم الجدول لديك
        .select('id, slug, updated_at, created_at')
        .eq('is_published', true)
    ]);

    const tools = toolsResult.data ?? [];
    const blogs = blogsResult.data ?? [];

    // 3. تعريف الروابط الثابتة
    const staticUrls = [
      { loc: '', priority: '1.0', changefreq: 'weekly' },
      { loc: '/tools', priority: '0.9', changefreq: 'daily' },
      { loc: '/blog', priority: '0.8', changefreq: 'weekly' },
      { loc: '/agents', priority: '0.8', changefreq: 'weekly' },
      { loc: '/about', priority: '0.5', changefreq: 'monthly' },
      { loc: '/contact', priority: '0.5', changefreq: 'monthly' },
      { loc: '/faq', priority: '0.5', changefreq: 'monthly' },
    ];

    // 4. بناء XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // أ- إضافة الروابط الثابتة
    staticUrls.forEach((page) => {
      sitemap += `
  <url>
    <loc>${BASE_URL}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // ب- إضافة روابط الأدوات (Tools)
    tools.forEach((tool) => {
      const lastMod = tool.updated_at || tool.created_at;
      // تنسيق التاريخ ليكون YYYY-MM-DD (أفضل لمحركات البحث وأصغر حجماً)
      const date = lastMod ? new Date(lastMod).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

      sitemap += `
  <url>
    <loc>${BASE_URL}/tool/${tool.id}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    });

    // ج- إضافة روابط المدونة (Blogs)
    blogs.forEach((blog) => {
      const lastMod = blog.updated_at || blog.created_at;
      const date = lastMod ? new Date(lastMod).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const slug = blog.slug || blog.id; // استخدام Slug إذا وجد، أو ID

      sitemap += `
  <url>
    <loc>${BASE_URL}/blog/${slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    // 5. إرجاع الاستجابة بتنسيق XML
    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // تخزين مؤقت لمدة ساعة لتخفيف الضغط
      },
    });

  } catch (error) {
    console.error(error);
    return new Response('Error generating sitemap', { status: 500 });
  }
});
