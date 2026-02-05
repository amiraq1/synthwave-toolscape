import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
        if (!GEMINI_API_KEY) {
            console.error("Missing GEMINI_API_KEY");
            return new Response(JSON.stringify({ error: "Server Configuration Error: Missing API Key" }), {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const { messages } = await req.json();

        const lastMessage = messages?.[messages.length - 1]?.content || "";

        // Call Gemini
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are 'Nabd AI', a specifically helpful and friendly assistant for the 'Nabd' platform.
                            Your goal is to help users navigate the site and find AI tools.
                            Respond in Arabic.
                            
                            User said: ${lastMessage}`
                        }]
                    }]
                }),
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            console.error("Gemini API Error:", errText);
            return new Response(JSON.stringify({ error: "AI Service Error", details: errText }), {
                status: 502, // Bad Gateway
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، لم أتمكن من معالجة طلبك حالياً.";

        return new Response(JSON.stringify({ reply }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Edge Fx Error:", error);
        return new Response(JSON.stringify({ error: error.message || "Unknown Error" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
