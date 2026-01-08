import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 👇 هام جداً: استبدل هذا برابط موقعك الحقيقي
const BASE_URL = "https://amiraq.org";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // 1. جلب الأدوات المنشورة
    const { data: tools } = await supabaseClient
      .from('tools')
      .select('id, created_at')
      .eq('is_published', true);

    // 2. جلب المقالات المنشورة
    const { data: posts } = await supabaseClient
      .from('posts')
      .select('id, created_at')
      .eq('is_published', true);

    // 3. تعريف الصفحات الثابتة
    const staticPages = [
      '',          // الصفحة الرئيسية
      '/blog',     // المدونة
      '/compare',  // المقارنة
      '/auth',     // تسجيل الدخول
    ];

    // 4. بناء هيكل XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // أ) إضافة الصفحات الثابتة
    staticPages.forEach(page => {
      xml += `
      <url>
        <loc>${BASE_URL}${page}</loc>
        <changefreq>daily</changefreq>
        <priority>${page === '' ? '1.0' : '0.8'}</priority>
      </url>`;
    });

    // ب) إضافة الأدوات (Dynamic Tools)
    tools?.forEach(tool => {
      xml += `
      <url>
        <loc>${BASE_URL}/tool/${tool.id}</loc>
        <lastmod>${new Date(tool.created_at || new Date()).toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
      </url>`;
    });

    // ج) إضافة المقالات (Dynamic Posts)
    posts?.forEach(post => {
      xml += `
      <url>
        <loc>${BASE_URL}/blog/${post.id}</loc>
        <lastmod>${new Date(post.created_at).toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
      </url>`;
    });

    xml += `</urlset>`;

    // 5. إرجاع النتيجة كملف XML
    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        ...corsHeaders
      },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
