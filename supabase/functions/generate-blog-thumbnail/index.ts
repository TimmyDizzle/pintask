import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { logUsage } from "../_shared/aiUsage.ts";

const IMAGE_MODEL = "google/gemini-2.5-flash-image";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorization" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    // Admin check
    const { data: isAdmin } = await userClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "Forbidden: admin only" }, 403);

    const body = await req.json().catch(() => ({}));
    const prompt = String(body?.prompt ?? "").trim();
    const slug = String(body?.slug ?? "post").trim().toLowerCase().replace(/[^a-z0-9-]/g, "-") || "post";
    if (!prompt || prompt.length < 3 || prompt.length > 1000) {
      return json({ error: "Prompt must be 3-1000 characters" }, 400);
    }

    const t0 = performance.now();
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        messages: [
          {
            role: "user",
            content:
              `Generate a wide 1200x630 social card / blog hero image. Editorial, clean, no text overlay. Subject: ${prompt}`,
          },
        ],
        modalities: ["image", "text"],
      }),
    });
    const latencyMs = Math.round(performance.now() - t0);

    if (!aiResp.ok) {
      if (aiResp.status === 429) return json({ error: "Rate limit exceeded, try again shortly." }, 429);
      if (aiResp.status === 402) return json({ error: "AI credits exhausted. Add credits in Settings." }, 402);
      const t = await aiResp.text();
      console.error("AI gateway error", aiResp.status, t);
      return json({ error: "AI gateway error" }, 500);
    }

    const aiData = await aiResp.json();
    const dataUrl: string | undefined = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!dataUrl?.startsWith("data:image/")) {
      console.error("No image in AI response", JSON.stringify(aiData).slice(0, 500));
      return json({ error: "No image returned by AI" }, 500);
    }

    // Log image generation cost (per-image pricing, tokens not relevant)
    logUsage({
      userId: user.id,
      functionName: "generate-blog-thumbnail",
      provider: "lovable",
      model: IMAGE_MODEL,
      usage: aiData.usage,
      latencyMs,
      images: 1,
    });

    const m = dataUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
    if (!m) return json({ error: "Bad image payload" }, 500);
    const contentType = m[1];
    const ext = contentType.split("/")[1].split("+")[0] || "png";
    const b64 = m[2];
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

    const path = `${slug}/${Date.now()}.${ext}`;

    // Use service role to bypass storage RLS (we already validated admin above)
    const admin = createClient(supabaseUrl, serviceKey);
    const { error: upErr } = await admin.storage.from("blog-images").upload(path, bytes, {
      contentType,
      upsert: false,
    });
    if (upErr) {
      console.error("Upload error", upErr);
      return json({ error: `Upload failed: ${upErr.message}` }, 500);
    }

    const { data: pub } = admin.storage.from("blog-images").getPublicUrl(path);
    return json({ url: pub.publicUrl, path });
  } catch (e) {
    console.error("generate-blog-thumbnail error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
