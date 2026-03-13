import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  agentSlug?: string;
  message?: string;
  messages?: ChatMessage[];
  query?: string;
}

interface MatchedTool {
  category: string | null;
  description: string | null;
  pricing_type: string | null;
  similarity: number | null;
  supports_arabic: boolean | null;
  title: string;
  url: string | null;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NVIDIA_EMBEDDING_MODEL = "nvidia/llama-nemotron-embed-1b-v2";
const NVIDIA_CHAT_MODEL = Deno.env.get("NVIDIA_CHAT_MODEL") || "meta/llama-3.1-8b-instruct";

const friendlyFailureReply =
  "عذرًا، لم أتمكن من الوصول إلى خدمة المساعد الآن. جرّب مرة أخرى بعد قليل.";

const sanitizeMessages = (messages?: ChatMessage[]) =>
  (messages ?? [])
    .filter(
      (message): message is ChatMessage =>
        !!message &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim().length > 0,
    )
    .slice(-6);

const serializeHistory = (messages: ChatMessage[]) => {
  if (messages.length === 0) {
    return "لا يوجد سجل سابق.";
  }

  return messages
    .map((message) => `${message.role === "assistant" ? "المساعد" : "المستخدم"}: ${message.content.trim()}`)
    .join("\n");
};

const formatToolContext = (tools: MatchedTool[]) => {
  if (tools.length === 0) {
    return "لم أجد أدوات مطابقة بشكل قوي في المكتبة الحالية.";
  }

  return tools
    .map((tool, index) => {
      const metadata = [
        tool.category ? `الفئة: ${tool.category}` : null,
        tool.pricing_type ? `التسعير: ${tool.pricing_type}` : null,
        tool.supports_arabic ? "يدعم العربية" : null,
        typeof tool.similarity === "number" ? `الملاءمة: ${tool.similarity.toFixed(2)}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      return [
        `${index + 1}. ${tool.title}${metadata ? ` — ${metadata}` : ""}`,
        tool.description ? `الوصف: ${tool.description}` : null,
        tool.url ? `الرابط: ${tool.url}` : null,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
};

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
        taskType: "RETRIEVAL_QUERY",
        outputDimensionality: 768,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini embedding failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.embedding?.values ?? [];
}

async function generateNvidiaEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch("https://integrate.api.nvidia.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: [text],
      input_type: "query",
      model: NVIDIA_EMBEDDING_MODEL,
      dimensions: 768,
    }),
  });

  if (!response.ok) {
    throw new Error(`NVIDIA embedding failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.data?.[0]?.embedding ?? [];
}

async function generateEmbedding(text: string, geminiApiKey?: string | null, nvidiaApiKey?: string | null) {
  if (nvidiaApiKey) {
    try {
      const embedding = await generateNvidiaEmbedding(text, nvidiaApiKey);
      if (embedding.length > 0) {
        return embedding;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!geminiApiKey) {
        throw error;
      }
      console.warn("NVIDIA embedding unavailable, falling back to Gemini:", message);
    }
  }

  if (!geminiApiKey) {
    throw new Error("No embedding provider configured");
  }

  const embedding = await generateGeminiEmbedding(text, geminiApiKey);
  if (embedding.length === 0) {
    throw new Error("Embedding provider returned an empty vector");
  }

  return embedding;
}

async function generateGeminiReply(prompt: string, apiKey: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.45,
          maxOutputTokens: 768,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini chat failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim?.() ?? "";
}

async function generateNvidiaReply(systemPrompt: string, userPrompt: string, apiKey: string) {
  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: NVIDIA_CHAT_MODEL,
      temperature: 0.45,
      max_tokens: 768,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`NVIDIA chat failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content;
  return typeof reply === "string" ? reply.trim() : "";
}

async function generateReply(
  systemPrompt: string,
  userPrompt: string,
  geminiApiKey?: string | null,
  nvidiaApiKey?: string | null,
) {
  if (nvidiaApiKey) {
    try {
      const reply = await generateNvidiaReply(systemPrompt, userPrompt, nvidiaApiKey);
      if (reply) {
        return reply;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!geminiApiKey) {
        throw error;
      }
      console.warn("NVIDIA chat unavailable, falling back to Gemini:", message);
    }
  }

  if (!geminiApiKey) {
    throw new Error("No chat provider configured");
  }

  return generateGeminiReply(`${systemPrompt}\n\n${userPrompt}`, geminiApiKey);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    const nvidiaApiKey = Deno.env.get("NVIDIA_API_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase environment variables are missing");
    }

    if (!geminiApiKey && !nvidiaApiKey) {
      return new Response(JSON.stringify({ reply: friendlyFailureReply }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: ChatRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ reply: "يرجى إرسال سؤال صالح." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const conversationMessages = sanitizeMessages(body.messages);
    const lastUserMessage =
      conversationMessages
        .filter((message) => message.role === "user")
        .at(-1)?.content
        ?.trim() || body.query?.trim() || body.message?.trim();

    if (!lastUserMessage) {
      return new Response(JSON.stringify({ reply: "يرجى كتابة سؤالك أولًا." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const agentSlug = body.agentSlug?.trim() || "tool-advisor";

    const { data: agentData, error: agentError } = await supabase
      .from("agents")
      .select("system_prompt")
      .eq("slug", agentSlug)
      .maybeSingle();

    if (agentError) {
      console.warn("Failed to load agent prompt:", agentError.message);
    }

    const systemPrompt =
      agentData?.system_prompt ||
      "أنت مساعد ذكي متخصص في ترشيح أدوات الذكاء الاصطناعي. أجب بالعربية الواضحة وبشكل مختصر وعملي.";

    const queryEmbedding = await generateEmbedding(lastUserMessage, geminiApiKey, nvidiaApiKey);

    const { data: matchedTools, error: rpcError } = await supabase.rpc("match_tools", {
      query_embedding: queryEmbedding,
      match_threshold: 0.28,
      match_count: 4,
    });

    if (rpcError) {
      console.error("match_tools RPC error:", rpcError);
      throw new Error("Tool matching failed");
    }

    const tools = ((matchedTools as MatchedTool[] | null) ?? []).slice(0, 4);
    const prompt = [
      "التزم بالتالي:",
      "- أجب بالعربية الواضحة فقط.",
      "- عندما يكون السؤال متعلقًا بالأدوات، رشّح من 2 إلى 4 أدوات كحد أقصى من السياق فقط.",
      "- اذكر سببًا عمليًا مختصرًا لكل ترشيح.",
      "- إذا كان الطلب غير واضح فاسأل سؤال متابعة واحدًا فقط.",
      "- لا تدّع وجود ميزات أو أسعار غير موجودة في السياق.",
      "",
      "سجل المحادثة:",
      serializeHistory(conversationMessages),
      "",
      "سياق الأدوات:",
      formatToolContext(tools),
      "",
      `آخر سؤال من المستخدم: ${lastUserMessage}`,
    ].join("\n");

    const reply = await generateReply(systemPrompt, prompt, geminiApiKey, nvidiaApiKey);

    return new Response(
      JSON.stringify({
        reply: reply || friendlyFailureReply,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("chat-agent fatal error:", message);

    return new Response(JSON.stringify({ reply: friendlyFailureReply }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
