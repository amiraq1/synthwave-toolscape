import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_URL = 'https://nabd.lovable.app';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating dynamic sitemap...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all tools from the database
    const { data: tools, error } = await supabase
      .from('tools')
      .select('id, title, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tools:', error);
      throw error;
    }

    console.log(`Found ${tools?.length || 0} tools`);

    const today = new Date().toISOString().split('T')[0];

    // Generate XML sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  
  <!-- الصفحة الرئيسية - Homepage -->
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${SITE_URL}/"/>
  </url>
  
  <!-- صفحة التثبيت - Install Page -->
  <url>
    <loc>${SITE_URL}/install</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;

    // Add all tools to sitemap
    if (tools && tools.length > 0) {
      sitemap += `
  <!-- صفحات الأدوات - Tool Pages -->`;
      
      for (const tool of tools) {
        const lastmod = tool.created_at 
          ? new Date(tool.created_at).toISOString().split('T')[0] 
          : today;
        
        sitemap += `
  <url>
    <loc>${SITE_URL}/tool/${tool.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
    }

    sitemap += `
</urlset>`;

    console.log('Sitemap generated successfully');

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error generating sitemap:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
