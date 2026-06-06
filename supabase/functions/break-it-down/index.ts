// break-it-down — splits a large task into 3–7 tiny actionable steps,
// or (when "blocker" is provided) acts as Anxiety Rescue ("I'm Stuck") mode.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { logUsage } from "../_shared/aiUsage.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You help adults with ADHD, anxiety, and overwhelm START tasks.
You break a single task into 3 to 7 tiny, concrete, actionable micro-steps.

Rules:
- Each step starts with a verb (Open, Write, Email, Find, Save, Decide, Call...).
- Each step is small enough to finish in under 10 minutes.
- The FIRST step must be absurdly small — something the user can do RIGHT NOW
  with zero setup (e.g. "Open the document", "Find the phone number").
- Plain text, no markdown, no numbering in the text itself.
- Never guilt-trip or shame. Warm, calm, encouraging.
- If a blocker is given, address it directly in the steps.

Return JSON only, matching: { "steps": ["step1", "step2", ...] }`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { task, blocker, firstStepOnly } = body || {};
    if (!task?.title) {
      return new Response(JSON.stringify({ error: "Missing task" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = [
      `Task title: ${task.title}`,
      task.description ? `Description: ${task.description}` : "",
      blocker ? `What's blocking the user right now: ${blocker}` : "",
      firstStepOnly
        ? `Return ONLY ONE step — the smallest possible thing to do right now to build momentum.`
        : `Return 3 to 7 micro-steps as JSON.`,
    ].filter(Boolean).join("\n");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const model = "google/gemini-3-flash-preview";
    const t0 = performance.now();
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });
    const latencyMs = Math.round(performance.now() - t0);

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const txt = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, txt);
      return new Response(JSON.stringify({ error: "AI failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const raw = data.choices?.[0]?.message?.content || "{}";
    let steps: string[] = [];
    try {
      const parsed = JSON.parse(raw);
      steps = Array.isArray(parsed.steps) ? parsed.steps.filter((s: unknown) => typeof s === "string") : [];
    } catch {
      steps = [];
    }
    if (firstStepOnly) steps = steps.slice(0, 1);
    steps = steps.slice(0, 7);

    await logUsage({
      userId: user.id,
      functionName: "break-it-down",
      provider: "lovable",
      model,
      usage: data.usage,
      latencyMs,
    });

    return new Response(JSON.stringify({ steps }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("break-it-down error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
