import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_URL = 'https://nabd.lovable.app';

// بسيط rate limiting بالذاكرة لكل IP
// الغرض: تقليل إساءة استخدام /sitemap مع بقاءه عامًا
const RATE_LIMIT_WINDOW_MS = 60_000; // دقيقة واحدة
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 طلبًا لكل IP لكل دقيقة

type RateEntry = {
  count: number;
  windowStart: number;
};

const rateLimitStore = new Map<string, RateEntry>();

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const existing = rateLimitStore.get(identifier);

  if (!existing || now - existing.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(identifier, { count: 1, windowStart: now });
    return true;
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  existing.count += 1;
  rateLimitStore.set(identifier, existing);
  return true;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIp = getClientIp(req);
  const clientIdentifier = `ip:${clientIp}`;

  // التحقق من معدل الطلبات قبل أي معالجة ثقيلة
  if (!checkRateLimit(clientIdentifier)) {
    console.warn('Sitemap rate limit exceeded', { clientIp });
    return new Response(
      JSON.stringify({ error: 'Too many requests' }),
      {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    console.log('Generating dynamic sitemap...', { clientIp });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all tools from the database
    const { data: tools, error } = await supabase
      .from('tools')
      .select('id, title, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tools for sitemap', { clientIp, error });
      throw error;
    }

    console.log(`Found ${tools?.length || 0} tools for sitemap`, { clientIp });

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

    console.log('Sitemap generated successfully', { clientIp });

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error generating sitemap', { clientIp, error: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
