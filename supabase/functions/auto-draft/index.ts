import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { name, url, description_en } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

    if (!name || !url) {
      throw new Error("Missing required fields: name, url");
    }

    // 1. Call Gemini to "Arabize" the content
    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert content editor for 'Nabd AI'. Convert the provided tool info into a structured JSON for an Arabic directory.

Tool: ${name}
URL: ${url}
Description: ${description_en || 'N/A'}

Instructions:
- **Title:** Translate to Arabic if generic, keep English if it's a brand name (e.g. ChatGPT). **STRICTLY NO EMOJIS (🚫 🤖 ✨)** in title.
- **Description:** Write a professional, engaging Arabic description (2 sentences). **STRICTLY NO EMOJIS (🚫 🤖 ✨)** in description.
- **Category:** Choose best fit from: 'نصوص', 'صور', 'برمجة', 'فيديو', 'إنتاجية', 'صوت', 'دراسة وطلاب'.
- **Pricing:** Guess based on context ('مجاني', 'مدفوع', 'تجربة مجانية').
- **Features:** Extract 3 key features as an array of strings in Arabic.

Output Format (JSON only, no markdown):
{
  "title": "Arabic or Brand Name",
  "description": "Professional Arabic description",
  "category": "One of the categories above",
  "pricing_type": "One of [مجاني, مدفوع, تجربة مجانية]",
  "features": ["Feature 1 in Arabic", "Feature 2", "Feature 3"]
}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Gemini API Error:", errorText);
      throw new Error(`Gemini API Error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let toolData;
    try {
      // Clean up markdown code blocks if Gemini sends them
      let rawText = aiData.candidates[0].content.parts[0].text;
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      toolData = JSON.parse(rawText);
    } catch (e) {
      console.error("Parse error:", e, aiData);
      throw new Error("Failed to parse AI response");
    }

    // 2. Insert into Supabase (as Draft) - Use SERVICE_ROLE_KEY to bypass RLS
    const supabase = createClient(SUPABASE_URL!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data, error } = await supabase.from('tools').insert({
      title: toolData.title,
      description: toolData.description,
      url: url,
      category: toolData.category,
      pricing_type: toolData.pricing_type,
      features: toolData.features,
      is_published: false, // Important: Draft mode
      is_featured: false,
    }).select();

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    return new Response(JSON.stringify({
      success: true,
      tool: data[0],
      message: "تم إنشاء مسودة الأداة بنجاح"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error("Auto-draft error:", error);
    const errMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({
      success: false,
      error: errMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
