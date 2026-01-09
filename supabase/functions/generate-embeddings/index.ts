import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Tool {
    id: number;
    title: string;
    description: string;
    category: string;
    features: string[] | null;
}

interface EmbeddingResult {
    id: number;
    success: boolean;
    dimensions?: number;
    error?: string;
}

// Google Gemini Embedding API - text-embedding-004 (768 dimensions)
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "models/text-embedding-004",
                content: { parts: [{ text }] },
                taskType: "RETRIEVAL_DOCUMENT",
            }),
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();

    if (!data.embedding?.values) {
        throw new Error("No embedding values in response");
    }

    return data.embedding.values;
}

// Helper: Create rich searchable text from tool data
function createSearchableText(tool: Tool): string {
    // Combine title, description, category, and features for better semantic matching
    const parts = [
        tool.title,
        tool.description,
        tool.category,
        ...(tool.features || []),
    ].filter(Boolean);

    return parts.join(" ").trim();
}

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        console.log("--- Generate Embeddings Started ---");

        // SECURITY: Require authentication for this admin-only function
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            console.log("❌ No Authorization header provided.");
            return new Response(
                JSON.stringify({ error: 'Authentication required', message_ar: 'يجب تسجيل الدخول' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const googleApiKey = Deno.env.get("GEMINI_API_KEY");

        if (!googleApiKey) {
            throw new Error("GEMINI_API_KEY is not set");
        }

        // Create authenticated client to verify user
        const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } }
        });

        // Verify the user
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
        if (authError || !user) {
            console.log("❌ Auth failed:", authError?.message || "No user found");
            return new Response(
                JSON.stringify({ error: 'Invalid authentication', message_ar: 'فشل التحقق من الهوية' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log("✅ User authenticated:", user.id);

        // SECURITY: Check if user is admin before allowing database modifications
        const { data: isAdmin, error: roleError } = await supabaseAuth.rpc('has_role', {
            _user_id: user.id,
            _role: 'admin'
        });

        if (roleError) {
            console.error("❌ Role check failed:", roleError);
            return new Response(
                JSON.stringify({ error: 'Authorization check failed', message_ar: 'فشل التحقق من الصلاحيات' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        if (!isAdmin) {
            console.log("❌ User is not admin:", user.id);
            return new Response(
                JSON.stringify({ error: 'Admin access required', message_ar: 'صلاحيات المشرف مطلوبة' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log("✅ Admin access verified for user:", user.id);

        // Now use service role for database operations (after authorization)
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Parse request body
        let body: { tool_id?: number; batch_all?: boolean; force_regenerate?: boolean } = {};
        try {
            body = await req.json();
        } catch {
            // Empty body is OK for batch_all default behavior
        }

        const { tool_id, batch_all = true, force_regenerate = false } = body;

        // Input validation
        if (tool_id !== undefined && (typeof tool_id !== 'number' || tool_id < 1)) {
            return new Response(
                JSON.stringify({ error: "Invalid tool_id", message_ar: "معرف الأداة غير صالح" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Fetch tools to process
        let query = supabase
            .from("tools")
            .select("id, title, description, category, features");

        if (tool_id) {
            // Single tool - always regenerate
            query = query.eq("id", tool_id);
        } else if (batch_all) {
            // All tools without embeddings (or all if force_regenerate)
            if (!force_regenerate) {
                query = query.is("embedding", null);
            }
        } else {
            return new Response(
                JSON.stringify({ error: "Provide either tool_id or batch_all=true", message_ar: "يجب تحديد tool_id أو batch_all=true" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const { data: tools, error: fetchError } = await query;

        if (fetchError) {
            console.error("❌ Fetch error:", fetchError);
            throw fetchError;
        }

        if (!tools || tools.length === 0) {
            console.log("✅ All tools already have embeddings");
            return new Response(
                JSON.stringify({
                    message: "All tools already have embeddings",
                    message_ar: "كل الأدوات محدثة مسبقاً! ✅",
                    processed: 0
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        console.log(`📊 Found ${tools.length} tools to embed...`);

        const results: EmbeddingResult[] = [];
        let successCount = 0;

        for (const tool of tools as Tool[]) {
            try {
                // Generate rich searchable text
                const searchText = createSearchableText(tool);

                if (!searchText || searchText.length < 10) {
                    console.warn(`⚠️ Tool ${tool.id} has insufficient text for embedding`);
                    results.push({ id: tool.id, success: false, error: "Insufficient text" });
                    continue;
                }

                // Generate embedding using Google Gemini
                const embedding = await generateEmbedding(searchText, googleApiKey);

                // Update tool with embedding
                const { error: updateError } = await supabase
                    .from("tools")
                    .update({ embedding })
                    .eq("id", tool.id);

                if (updateError) {
                    console.error(`❌ Update error for tool ${tool.id}:`, updateError);
                    results.push({ id: tool.id, success: false, error: "Update failed" });
                } else {
                    console.log(`✅ Tool ${tool.id} embedded successfully (${embedding.length} dims)`);
                    results.push({ id: tool.id, success: true, dimensions: embedding.length });
                    successCount++;
                }

                // Small delay to avoid rate limiting
                if (tools.length > 10) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Processing failed";
                console.error(`❌ Error for tool ${tool.id}:`, errorMessage);
                results.push({ id: tool.id, success: false, error: errorMessage });
            }
        }

        const failedCount = results.length - successCount;

        console.log(`🎉 Completed: ${successCount} success, ${failedCount} failed`);

        return new Response(
            JSON.stringify({
                message: `Processed ${results.length} tools`,
                message_ar: `تم الانتهاء! تم تحديث ${successCount} أداة بنجاح 🚀`,
                model: "text-embedding-004",
                dimensions: 768,
                stats: {
                    total: results.length,
                    success: successCount,
                    failed: failedCount,
                },
                results,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("❌ Fatal Error:", errorMessage);
        return new Response(
            JSON.stringify({
                error: "Internal server error",
                message_ar: "حدث خطأ داخلي",
                details: errorMessage
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
