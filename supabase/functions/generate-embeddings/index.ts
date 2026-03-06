import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Tool {
    id: number;
    title: string;
    title_en?: string;
    description: string;
    description_en?: string;
    category: string;
    features: string[] | null;
}

interface EmbeddingResult {
    id: number;
    success: boolean;
    dimensions?: number;
    error?: string;
}

interface GenerateEmbeddingsRequest {
    tool_id?: number;
    batch_all?: boolean;
    force_regenerate?: boolean;
    after_id?: number;
    batch_limit?: number;
}

const NVIDIA_EMBEDDING_MODEL = "nvidia/llama-nemotron-embed-1b-v2";

async function generateGeminiEmbedding(text: string, apiKey: string): Promise<number[]> {
    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey,
            },
            body: JSON.stringify({
                model: "models/gemini-embedding-001",
                content: { parts: [{ text }] },
                taskType: "RETRIEVAL_DOCUMENT",
                outputDimensionality: 768,
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

async function generateNvidiaEmbedding(text: string, apiKey: string): Promise<number[]> {
    const response = await fetch("https://integrate.api.nvidia.com/v1/embeddings", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            input: [text],
            input_type: "passage",
            model: NVIDIA_EMBEDDING_MODEL,
            dimensions: 768,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`NVIDIA API error: ${error}`);
    }

    const data = await response.json();
    const embedding = data.data?.[0]?.embedding;

    if (!embedding) {
        throw new Error("No NVIDIA embedding values in response");
    }

    return embedding;
}

async function generateEmbedding(text: string, geminiApiKey?: string | null, nvidiaApiKey?: string | null): Promise<number[]> {
    if (nvidiaApiKey) {
        try {
            return await generateNvidiaEmbedding(text, nvidiaApiKey);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (!geminiApiKey) {
                throw error;
            }
            console.warn("NVIDIA unavailable, falling back to Gemini:", message);
        }
    }

    if (!geminiApiKey) {
        throw new Error("No embedding provider configured");
    }

    return generateGeminiEmbedding(text, geminiApiKey);
}

// Helper: Create rich searchable text from tool data
function createSearchableText(tool: Tool): string {
    // Combine title, description, category, and features for better semantic matching
    const parts = [
        tool.title,
        tool.title_en,
        tool.description,
        tool.description_en,
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

        // 1. Allow Manual Trigger via Special Header (Simple Bypass)
        const manualTriggerKey = req.headers.get('x-admin-trigger');
        const isManualTrigger = manualTriggerKey === 'nabdh-ai-secret-trigger-2026';

        // 2. Or Standard Auth
        const authHeader = req.headers.get('Authorization');

        if (!authHeader && !isManualTrigger) {
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
        const nvidiaApiKey = Deno.env.get("NVIDIA_API_KEY");

        if (!googleApiKey && !nvidiaApiKey) {
            throw new Error("No embedding provider is configured");
        }

        if (isManualTrigger) {
            console.log("✅ Manual Trigger detected. Bypassing all auth checks.");
        } else {
            // Check Service Role or Admin User (Original Logic)
            const isServiceRole = authHeader && authHeader.includes(supabaseServiceKey);

            if (!isServiceRole) {
                // Normal User Flow: Verify Admin Role
                const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
                    global: { headers: { Authorization: authHeader! } } // authHeader is checked above
                });

                // ... (User verification logic remains same)
                const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
                if (authError || !user) {
                    return new Response(JSON.stringify({ error: 'Invalid Auth' }), { status: 401, headers: corsHeaders });
                }

                const { data: isAdmin } = await supabaseAuth.rpc('has_role', { _user_id: user.id, _role: 'admin' });
                if (!isAdmin) {
                    return new Response(JSON.stringify({ error: 'Not Admin' }), { status: 403, headers: corsHeaders });
                }
            } else {
                console.log("✅ Service Role Key detected.");
            }
        }

        // Use Service Role for operations
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Parse request body
        let body: GenerateEmbeddingsRequest = {};
        try {
            body = await req.json();
        } catch {
            // Empty body is OK for batch_all default behavior
        }

        const {
            tool_id,
            batch_all = true,
            force_regenerate = false,
            after_id = 0,
            batch_limit = 25,
        } = body;
        const safeBatchLimit = Math.min(Math.max(1, Number(batch_limit) || 25), 100);

        // Input validation
        if (tool_id !== undefined && (typeof tool_id !== 'number' || tool_id < 1)) {
            return new Response(
                JSON.stringify({ error: "Invalid tool_id", message_ar: "معرف الأداة غير صالح" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (after_id !== undefined && (typeof after_id !== 'number' || after_id < 0)) {
            return new Response(
                JSON.stringify({ error: "Invalid after_id", message_ar: "after_id غير صالح" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Fetch tools to process
        let query = supabase
            .from("tools")
            .select("id, title, title_en, description, description_en, category, features")
            .order("id", { ascending: true });

        if (tool_id) {
            // Single tool - always regenerate
            query = query.eq("id", tool_id);
        } else if (batch_all) {
            // All tools without embeddings (or all if force_regenerate)
            if (!force_regenerate) {
                query = query.is("embedding", null);
            }
            if (after_id > 0) {
                query = query.gt("id", after_id);
            }
            query = query.limit(safeBatchLimit);
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
                const embedding = await generateEmbedding(searchText, googleApiKey, nvidiaApiKey);

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
        const lastProcessedId = results.length > 0 ? results[results.length - 1].id : after_id;
        let remaining = 0;

        if (!tool_id && batch_all) {
            let remainingQuery = supabase
                .from("tools")
                .select("id", { count: "exact", head: true })
                .gt("id", lastProcessedId);

            if (!force_regenerate) {
                remainingQuery = remainingQuery.is("embedding", null);
            }

            const { count } = await remainingQuery;
            remaining = count ?? 0;
        }

        console.log(`🎉 Completed: ${successCount} success, ${failedCount} failed`);

        return new Response(
            JSON.stringify({
                message: `Processed ${results.length} tools`,
                message_ar: `تم الانتهاء! تم تحديث ${successCount} أداة بنجاح 🚀`,
                model: `gemini-embedding-001 | ${NVIDIA_EMBEDDING_MODEL}`,
                dimensions: 768,
                stats: {
                    total: results.length,
                    success: successCount,
                    failed: failedCount,
                },
                batch: {
                    requested_limit: safeBatchLimit,
                    after_id,
                    last_processed_id: lastProcessedId,
                    remaining,
                    has_more: remaining > 0,
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
