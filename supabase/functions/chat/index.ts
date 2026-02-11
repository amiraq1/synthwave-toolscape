const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // 1. Check if GEMINI_API_KEY exists
        const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

        if (!GEMINI_API_KEY) {
            return new Response(
                JSON.stringify({
                    reply: "عذراً، المساعد الذكي غير متاح حالياً. مفتاح API غير مُعيَّن. ⚙️"
                }),
                {
                    status: 200,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        // 2. Parse request body safely
        let messages: Array<{ role: string; content: string }> = [];
        try {
            const body = await req.json();
            messages = body?.messages || [];
        } catch {
            return new Response(
                JSON.stringify({ reply: "يرجى إرسال رسالة صالحة." }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (messages.length === 0) {
            return new Response(
                JSON.stringify({ reply: "يرجى إرسال رسالة." }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const lastMessage = messages[messages.length - 1]?.content || "";

        // 3. Call Gemini API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        role: "user",
                        parts: [{
                            text: `أنت "نبض AI"، مساعد ذكي ودود متخصص في منصة "نبض" لأدوات الذكاء الاصطناعي. أجب دائماً بالعربية وبشكل مختصر ومفيد.\n\nالمستخدم يقول: ${lastMessage}`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1024,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            console.error("Gemini Error:", response.status, errText);
            return new Response(
                JSON.stringify({ reply: `عذراً، حدث خطأ (${response.status}). حاول مرة أخرى لاحقاً. 🔄` }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const data = await response.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
            || "عذراً، لم أتمكن من معالجة طلبك. 🔄";

        return new Response(JSON.stringify({ reply }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ reply: "حدث خطأ غير متوقع. حاول مرة أخرى. 🔄" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
