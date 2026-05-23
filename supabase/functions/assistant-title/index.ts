// Generates a short 3–5 word title for an assistant conversation.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { estimateMicroUsd } from "../_shared/aiUsage.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODEL = "google/gemini-3-flash-preview";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "AI not configured" }, 500);

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims } = await userClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (!claims?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claims.claims.sub as string;

    const { conversationId } = await req.json();
    if (!conversationId) return json({ error: "conversationId required" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE);
    const { data: conv } = await admin
      .from("assistant_conversations")
      .select("id, user_id, title")
      .eq("id", conversationId)
      .maybeSingle();
    if (!conv || conv.user_id !== userId) return json({ error: "not found" }, 404);

    const { data: msgs } = await admin
      .from("assistant_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(4);

    const transcript = (msgs ?? [])
      .map((m: any) => `${m.role}: ${m.content.slice(0, 400)}`)
      .join("\n");

    const t0 = performance.now();
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "Return a 3-5 word title for this chat. Plain text, no quotes, no trailing punctuation.",
          },
          { role: "user", content: transcript },
        ],
      }),
    });
    const latencyMs = Math.round(performance.now() - t0);
    if (!resp.ok) return json({ error: "title gen failed" }, 500);
    const data = await resp.json();
    const raw = (data.choices?.[0]?.message?.content ?? "").toString().trim();
    const title = raw.replace(/^["'`]+|["'`.!?]+$/g, "").slice(0, 80) || "New chat";

    await admin.from("assistant_conversations").update({ title }).eq("id", conversationId);

    const u = data.usage ?? {};
    await admin.from("ai_usage").insert({
      user_id: userId,
      function_name: "assistant-title",
      provider: "lovable",
      model: MODEL,
      prompt_tokens: u.prompt_tokens ?? 0,
      completion_tokens: u.completion_tokens ?? 0,
      total_tokens: u.total_tokens ?? 0,
      cost_micro_usd: estimateMicroUsd(MODEL, u.prompt_tokens ?? 0, u.completion_tokens ?? 0),
      latency_ms: latencyMs,
    });

    return json({ title });
  } catch (e) {
    console.error("assistant-title error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
