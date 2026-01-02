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

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { tool_id, batch_all } = await req.json();

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
      throw new Error("Provide either tool_id or batch_all=true");
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
      // Generate searchable text
      const searchText = [
        tool.title,
        tool.description,
        tool.category,
        ...(tool.features || []),
      ]
        .filter(Boolean)
        .join(" ");

      // Call OpenAI Embeddings API
      const embeddingResponse = await fetch(
        "https://api.openai.com/v1/embeddings",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "text-embedding-3-small",
            input: searchText,
          }),
        }
      );

      if (!embeddingResponse.ok) {
        const error = await embeddingResponse.text();
        console.error(`OpenAI error for tool ${tool.id}:`, error);
        results.push({ id: tool.id, success: false, error });
        continue;
      }

      const embeddingData = await embeddingResponse.json();
      const embedding = embeddingData.data[0].embedding;

      // Update tool with embedding
      const { error: updateError } = await supabase
        .from("tools")
        .update({ embedding })
        .eq("id", tool.id);

      if (updateError) {
        console.error(`Update error for tool ${tool.id}:`, updateError);
        results.push({ id: tool.id, success: false, error: updateError.message });
      } else {
        results.push({ id: tool.id, success: true });
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${results.length} tools`,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
