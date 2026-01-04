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

// Google Gemini Embedding API
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
    return data.embedding.values;
}

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // SECURITY FIX: Require authentication for this admin-only function
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            console.log("No Authorization header provided.");
            return new Response(
                JSON.stringify({ error: 'Authentication required' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

        // Create authenticated client to verify user
        const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } }
        });

        // Verify the user
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
        if (authError || !user) {
            console.log("Auth failed:", authError?.message || "No user found");
            return new Response(
                JSON.stringify({ error: 'Invalid authentication' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log("User authenticated:", user.id);

        // SECURITY FIX: Check if user is admin before allowing database modifications
        const { data: isAdmin, error: roleError } = await supabaseAuth.rpc('has_role', {
            _user_id: user.id,
            _role: 'admin'
        });

        if (roleError) {
            console.error("Role check failed:", roleError);
            return new Response(
                JSON.stringify({ error: 'Authorization check failed' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        if (!isAdmin) {
            console.log("User is not admin:", user.id);
            return new Response(
                JSON.stringify({ error: 'Admin access required' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log("Admin access verified for user:", user.id);

        // Now use service role for database operations (after authorization)
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const googleApiKey = Deno.env.get("GEMINI_API_KEY");
        if (!googleApiKey) {
            throw new Error("GEMINI_API_KEY is not set");
        }

        const { tool_id, batch_all } = await req.json();

        // Input validation
        if (tool_id !== undefined && (typeof tool_id !== 'number' || tool_id < 1)) {
            return new Response(
                JSON.stringify({ error: "Invalid tool_id" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Fetch tools to process
        let query = supabase
            .from("tools")
            .select("id, title, description, category, features");

        if (tool_id) {
            // Single tool
            query = query.eq("id", tool_id);
        } else if (batch_all) {
            // All tools without embeddings
            query = query.is("embedding", null);
        } else {
            return new Response(
                JSON.stringify({ error: "Provide either tool_id or batch_all=true" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const { data: tools, error: fetchError } = await query;
        if (fetchError) throw fetchError;
        if (!tools || tools.length === 0) {
            return new Response(
                JSON.stringify({ message: "No tools to process" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const results = [];

        for (const tool of tools as Tool[]) {
            try {
                // Generate searchable text
                const searchText = [
                    tool.title,
                    tool.description,
                    tool.category,
                    ...(tool.features || []),
                ]
                    .filter(Boolean)
                    .join(" ");

                // Generate embedding using Google Gemini
                const embedding = await generateEmbedding(searchText, googleApiKey);

                // Update tool with embedding
                const { error: updateError } = await supabase
                    .from("tools")
                    .update({ embedding })
                    .eq("id", tool.id);

                if (updateError) {
                    console.error(`Update error for tool ${tool.id}:`, updateError);
                    results.push({ id: tool.id, success: false, error: "Update failed" });
                } else {
                    results.push({ id: tool.id, success: true, dimensions: embedding.length });
                }
            } catch (err) {
                console.error(`Error for tool ${tool.id}:`, err);
                results.push({ id: tool.id, success: false, error: "Processing failed" });
            }
        }

        return new Response(
            JSON.stringify({
                message: `Processed ${results.length} tools`,
                model: "text-embedding-004",
                results,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
