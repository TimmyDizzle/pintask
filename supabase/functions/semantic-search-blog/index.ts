import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { logUsage, getUserIdFromAuthHeader } from "../_shared/aiUsage.ts";

const EMBED_MODEL = "openai/text-embedding-3-small";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Require a valid Supabase JWT to prevent unauthenticated AI credit abuse.
  // verify_jwt = true in config.toml validates the signature; we just confirm presence.
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.toLowerCase().startsWith("bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const body = await req.json().catch(() => ({}));
    const query: string = typeof body?.query === "string" ? body.query.trim() : "";
    const matchCount: number = Math.min(Math.max(Number(body?.matchCount) || 6, 1), 20);

    if (!query || query.length < 2) {
      return new Response(JSON.stringify({ matches: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (query.length > 1000) {
      return new Response(JSON.stringify({ error: "Query too long (max 1000 chars)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const t0 = performance.now();
    const embedRes = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: EMBED_MODEL,
        input: query,
        dimensions: 1536,
      }),
    });
    const latencyMs = Math.round(performance.now() - t0);

    if (!embedRes.ok) {
      const status = embedRes.status;
      console.error("Embedding error", status, await embedRes.text());
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add credits to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(JSON.stringify({ error: "Embedding service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const embedJson = await embedRes.json();
    const queryEmbedding: number[] = embedJson.data[0].embedding;

    // Best-effort usage log (search is public — userId may be null)
    const userId = await getUserIdFromAuthHeader(req.headers.get("Authorization"));
    logUsage({
      userId,
      functionName: "semantic-search-blog",
      provider: "lovable",
      model: EMBED_MODEL,
      usage: embedJson.usage,
      latencyMs,
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: matches, error } = await supabase.rpc("match_blog_posts", {
      query_embedding: queryEmbedding as unknown as string,
      match_count: matchCount,
      similarity_threshold: 0.15,
    });
    if (error) {
      console.error("RPC error", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ matches: matches ?? [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("semantic-search-blog error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
