import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// USD per 1M tokens. Update as Lovable AI gateway pricing changes.
const PRICING: Record<string, { in: number; out: number }> = {
  "google/gemini-3-flash-preview": { in: 0.075, out: 0.30 },
  "google/gemini-2.5-flash": { in: 0.075, out: 0.30 },
  "google/gemini-2.5-flash-lite": { in: 0.04, out: 0.15 },
  "google/gemini-2.5-pro": { in: 1.25, out: 5.00 },
  "openai/gpt-5-mini": { in: 0.25, out: 2.00 },
  "openai/gpt-5": { in: 1.25, out: 10.00 },
};

function estimateMicroUsd(model: string, promptTokens: number, completionTokens: number) {
  const p = PRICING[model];
  if (!p) return 0;
  // micro-USD = (tokens / 1_000_000) * pricePerM * 1_000_000 = tokens * pricePerM
  return Math.round(promptTokens * p.in + completionTokens * p.out);
}

async function logUsage(opts: {
  userId: string | null;
  functionName: string;
  provider: string;
  model: string;
  usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | undefined;
  latencyMs: number;
}) {
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return;
    const promptTokens = opts.usage?.prompt_tokens ?? 0;
    const completionTokens = opts.usage?.completion_tokens ?? 0;
    const totalTokens = opts.usage?.total_tokens ?? promptTokens + completionTokens;
    const admin = createClient(url, key);
    await admin.from("ai_usage").insert({
      user_id: opts.userId,
      function_name: opts.functionName,
      provider: opts.provider,
      model: opts.model,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: totalTokens,
      cost_micro_usd: estimateMicroUsd(opts.model, promptTokens, completionTokens),
      latency_ms: opts.latencyMs,
    });
  } catch (e) {
    console.error("logUsage failed:", e);
  }
}

const fallback = (title: string) => ({
  title,
  dueDate: null as string | null,
  label: "normal",
  priority: "medium",
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(JSON.stringify(fallback(text || "")), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Best-effort user id for usage log
    let userId: string | null = null;
    try {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          { global: { headers: { Authorization: authHeader } } },
        );
        const { data } = await supabase.auth.getUser();
        userId = data?.user?.id ?? null;
      }
    } catch { /* ignore */ }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(JSON.stringify(fallback(text.trim())), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date().toISOString().split("T")[0];
    const model = "google/gemini-3-flash-preview";
    const t0 = performance.now();

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `You are a task parser. Today is ${today}. Extract structured task data from the user's text. Interpret relative dates like "Friday", "tomorrow", "next week" relative to today. If no date is mentioned, set dueDate to null. If the text sounds urgent or uses words like "urgent", "ASAP", "immediately", set label to "urgent" and priority to "high". The title should be clean — strip date and priority words.`,
          },
          { role: "user", content: text.trim() },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "parse_task",
              description: "Extract structured task data from natural language text.",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  dueDate: { type: ["string", "null"] },
                  label: { type: "string", enum: ["urgent", "normal"] },
                  priority: { type: "string", enum: ["high", "medium", "low"] },
                },
                required: ["title", "label", "priority"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "parse_task" } },
      }),
    });

    const latencyMs = Math.round(performance.now() - t0);

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const errText = await aiResponse.text();
      console.error("Lovable AI error:", aiResponse.status, errText);
      return new Response(JSON.stringify(fallback(text.trim())), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    await logUsage({
      userId,
      functionName: "parse-task",
      provider: "lovable",
      model,
      usage: aiData.usage,
      latencyMs,
    });

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const argsStr = toolCall?.function?.arguments;

    if (argsStr) {
      try {
        const parsed = typeof argsStr === "string" ? JSON.parse(argsStr) : argsStr;
        return new Response(
          JSON.stringify({
            title: parsed.title || text.trim(),
            dueDate: parsed.dueDate || null,
            label: parsed.label || "normal",
            priority: parsed.priority || "medium",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      } catch (e) {
        console.error("Failed to parse tool args:", e, argsStr);
      }
    }

    return new Response(JSON.stringify(fallback(text.trim())), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("parse-task error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
