// Personal AI Assistant — streaming chat with per-user monthly quota.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODEL = "google/gemini-3-flash-preview";
const SYSTEM_PROMPT =
  "You are Pintask Assistant, a concise and friendly productivity helper. " +
  "You help the user think through tasks, draft text, summarize ideas, and brainstorm. " +
  "Use markdown when helpful. Keep answers tight unless the user asks for depth.";

// Same pricing table used elsewhere — keep in sync.
const PRICING: Record<string, { in: number; out: number }> = {
  "google/gemini-3-flash-preview": { in: 0.075, out: 0.30 },
  "google/gemini-2.5-flash": { in: 0.075, out: 0.30 },
  "google/gemini-2.5-pro": { in: 1.25, out: 5.00 },
};

function microUsd(model: string, prompt: number, completion: number) {
  const p = PRICING[model];
  if (!p) return 0;
  return Math.round(prompt * p.in + completion * p.out);
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return jsonResponse({ error: "Unauthorized" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return jsonResponse({ error: "AI not configured" }, 500);

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims, error: cErr } = await userClient.auth.getClaims(
      authHeader.replace("Bearer ", ""),
    );
    if (cErr || !claims?.claims) return jsonResponse({ error: "Unauthorized" }, 401);
    const userId = claims.claims.sub as string;

    const body = await req.json();
    const conversationId: string | undefined = body.conversationId;
    const userMessage: string = (body.message ?? "").toString().trim();
    if (!userMessage) return jsonResponse({ error: "message is required" }, 400);
    if (userMessage.length > 8000) return jsonResponse({ error: "message too long" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE);

    // Quota check
    const { data: usageRow, error: usageErr } = await admin.rpc("get_user_assistant_usage", {
      _user_id: userId,
    });
    if (usageErr) console.error("usage rpc err", usageErr);
    const row = Array.isArray(usageRow) ? usageRow[0] : usageRow;
    const used = Number(row?.tokens_used ?? 0);
    const limit = Number(row?.tokens_limit ?? 50000);
    if (used >= limit) {
      return jsonResponse(
        {
          error: "quota_exceeded",
          message:
            "You've used your free monthly AI assistant tokens. Upgrade for more.",
          tokens_used: used,
          tokens_limit: limit,
        },
        402,
      );
    }

    // Ensure conversation exists & belongs to user
    let convId = conversationId;
    if (!convId) {
      const { data: newConv, error: convErr } = await admin
        .from("assistant_conversations")
        .insert({ user_id: userId, title: userMessage.slice(0, 60) })
        .select("id")
        .single();
      if (convErr) return jsonResponse({ error: convErr.message }, 500);
      convId = newConv.id;
    } else {
      const { data: existing } = await admin
        .from("assistant_conversations")
        .select("id, user_id")
        .eq("id", convId)
        .maybeSingle();
      if (!existing || existing.user_id !== userId) {
        return jsonResponse({ error: "conversation not found" }, 404);
      }
    }

    // Load prior messages (cap to last 30 for context window safety)
    const { data: priorMsgs } = await admin
      .from("assistant_messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(30);

    // Persist user message
    await admin.from("assistant_messages").insert({
      conversation_id: convId,
      user_id: userId,
      role: "user",
      content: userMessage,
    });

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(priorMsgs ?? []).map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: userMessage },
    ];

    const t0 = performance.now();
    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: MODEL, messages, stream: true }),
    });

    if (!upstream.ok || !upstream.body) {
      if (upstream.status === 429) return jsonResponse({ error: "Rate limit. Try again shortly." }, 429);
      if (upstream.status === 402) return jsonResponse({ error: "AI credits exhausted." }, 402);
      const txt = await upstream.text();
      console.error("gateway error", upstream.status, txt);
      return jsonResponse({ error: "AI gateway error" }, 500);
    }

    // Tee the stream: forward to client, accumulate full text & usage server-side.
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = "";
    let assistantText = "";
    let usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | undefined;

    const out = new ReadableStream({
      async start(controller) {
        // First chunk: send conversationId as metadata event so client can update its URL/state.
        controller.enqueue(encoder.encode(`event: meta\ndata: ${JSON.stringify({ conversationId: convId })}\n\n`));

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            controller.enqueue(value);

            let idx: number;
            while ((idx = buffer.indexOf("\n")) !== -1) {
              let line = buffer.slice(0, idx);
              buffer = buffer.slice(idx + 1);
              if (line.endsWith("\r")) line = line.slice(0, -1);
              if (!line.startsWith("data: ")) continue;
              const payload = line.slice(6).trim();
              if (payload === "[DONE]") continue;
              try {
                const obj = JSON.parse(payload);
                const delta = obj.choices?.[0]?.delta?.content;
                if (typeof delta === "string") assistantText += delta;
                if (obj.usage) usage = obj.usage;
              } catch { /* partial JSON: ignore */ }
            }
          }
        } catch (e) {
          console.error("stream relay error", e);
        } finally {
          const latencyMs = Math.round(performance.now() - t0);
          // Persist assistant reply + usage row.
          try {
            const pt = usage?.prompt_tokens ?? 0;
            const ct = usage?.completion_tokens ?? 0;
            const tt = usage?.total_tokens ?? pt + ct;
            await admin.from("assistant_messages").insert({
              conversation_id: convId,
              user_id: userId,
              role: "assistant",
              content: assistantText,
              prompt_tokens: pt,
              completion_tokens: ct,
            });
            await admin.from("ai_usage").insert({
              user_id: userId,
              function_name: "assistant-chat",
              provider: "lovable",
              model: MODEL,
              prompt_tokens: pt,
              completion_tokens: ct,
              total_tokens: tt,
              cost_micro_usd: microUsd(MODEL, pt, ct),
              latency_ms: latencyMs,
            });
            await admin
              .from("assistant_conversations")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", convId);
            // Ensure quota row exists so admins can bump tier later.
            await admin.from("assistant_quotas").upsert(
              { user_id: userId },
              { onConflict: "user_id", ignoreDuplicates: true },
            );
          } catch (e) {
            console.error("persist failed", e);
          }
          controller.close();
        }
      },
    });

    return new Response(out, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  } catch (e) {
    console.error("assistant-chat error", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});
