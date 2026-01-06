import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AutoDraftRequest {
    name: string;
    description_en: string;
    url: string;
    pricing_en?: string;
}

interface GeminiToolResponse {
    title: string;
    description: string;
    category: string;
    pricing_type: string;
    features: string[];
}

// Valid categories for the Nabd directory
const VALID_CATEGORIES = ['نصوص', 'صور', 'فيديو', 'برمجة', 'إنتاجية', 'صوت', 'دراسة وطلاب'];
const VALID_PRICING = ['مجاني', 'مدفوع', 'تجربة مجانية'];

async function generateToolContent(
    name: string,
    description: string,
    pricing: string,
    apiKey: string
): Promise<GeminiToolResponse> {
    const prompt = `You are an AI content editor for 'Nabd AI' (نبض), an Arabic AI tools directory. 
Take this English tool information and convert it into a structured JSON for the Arabic directory.

**Input:**
- Tool Name: ${name}
- Description: ${description}
- Pricing Info: ${pricing || 'Unknown'}

**Instructions:**
1. **title**: Translate the tool name to Arabic if it makes sense, otherwise keep the English name.
2. **description**: Write a professional Arabic description (2-3 sentences) explaining what the tool does and its benefits.
3. **category**: Choose ONE from: ${VALID_CATEGORIES.join(', ')}
4. **pricing_type**: Choose ONE from: ${VALID_PRICING.join(', ')}
5. **features**: Extract 3-4 key features as Arabic bullet points (array of strings).

**Output ONLY pure JSON, no markdown, no explanation:**
{
  "title": "...",
  "description": "...",
  "category": "...",
  "pricing_type": "...",
  "features": ["...", "...", "..."]
}`;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.9,
                    maxOutputTokens: 1024,
                },
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API Error: ${response.status}`, errorText);
        throw new Error(`Gemini API Error: ${response.status}`);
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
        throw new Error("No content returned from Gemini");
    }

    // Extract JSON from response (handle potential markdown wrapping)
    let jsonStr = textContent.trim();
    if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.slice(7);
    }
    if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith("```")) {
        jsonStr = jsonStr.slice(0, -3);
    }
    jsonStr = jsonStr.trim();

    const parsed: GeminiToolResponse = JSON.parse(jsonStr);

    // Validate and sanitize category
    if (!VALID_CATEGORIES.includes(parsed.category)) {
        parsed.category = 'إنتاجية'; // Default fallback
    }

    // Validate and sanitize pricing_type
    if (!VALID_PRICING.includes(parsed.pricing_type)) {
        parsed.pricing_type = 'تجربة مجانية'; // Default fallback
    }

    // Ensure features is an array
    if (!Array.isArray(parsed.features)) {
        parsed.features = [];
    }

    return parsed;
}

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        console.log("--- Auto-Draft Function Started ---");

        // 1. Environment Check
        const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
        if (!geminiApiKey) {
            throw new Error("GEMINI_API_KEY is not configured");
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        
        // Use service role key for inserting (bypasses RLS)
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 2. Parse and Validate Request
        const body: AutoDraftRequest = await req.json();
        
        if (!body.name || !body.description_en || !body.url) {
            return new Response(
                JSON.stringify({ 
                    error: "Missing required fields: name, description_en, url" 
                }),
                { 
                    status: 400, 
                    headers: { ...corsHeaders, "Content-Type": "application/json" } 
                }
            );
        }

        // Validate URL format
        try {
            new URL(body.url);
        } catch {
            return new Response(
                JSON.stringify({ error: "Invalid URL format" }),
                { 
                    status: 400, 
                    headers: { ...corsHeaders, "Content-Type": "application/json" } 
                }
            );
        }

        console.log(`Processing tool: ${body.name}`);

        // 3. Generate Arabic content using Gemini
        const aiContent = await generateToolContent(
            body.name,
            body.description_en,
            body.pricing_en || "",
            geminiApiKey
        );

        console.log("AI Content Generated:", JSON.stringify(aiContent, null, 2));

        // 4. Insert into database as unpublished draft
        const { data: insertedTool, error: insertError } = await supabase
            .from("tools")
            .insert({
                title: aiContent.title,
                description: aiContent.description,
                category: aiContent.category,
                pricing_type: aiContent.pricing_type,
                features: aiContent.features,
                url: body.url,
                is_featured: false,
                is_published: false, // Draft mode - requires admin review
            })
            .select("id")
            .single();

        if (insertError) {
            console.error("Database insert error:", insertError);
            throw new Error(`Database error: ${insertError.message}`);
        }

        console.log(`Tool created with ID: ${insertedTool.id}`);

        // 5. Return success response
        return new Response(
            JSON.stringify({
                success: true,
                tool_id: insertedTool.id,
                title: aiContent.title,
                message: "تم إنشاء مسودة الأداة بنجاح. تحتاج لمراجعة المدير قبل النشر.",
            }),
            { 
                status: 201, 
                headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
        );

    } catch (error) {
        console.error("Auto-draft error:", error);
        
        return new Response(
            JSON.stringify({ 
                error: error instanceof Error ? error.message : "Unknown error occurred",
                success: false 
            }),
            { 
                status: 500, 
                headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
        );
    }
});
