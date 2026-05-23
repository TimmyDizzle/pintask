import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Validate caller is an admin.
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const ids: string[] | undefined = Array.isArray(body?.ids) ? body.ids : undefined;
    const singleId: string | undefined = typeof body?.id === "string" ? body.id : undefined;
    const all: boolean = body?.all === true;

    let query = admin
      .from("blog_posts")
      .select("id, title, excerpt, content, category");

    if (singleId) query = query.eq("id", singleId);
    else if (ids?.length) query = query.in("id", ids);
    else if (all) {
      // Embed all rows — used for backfill.
    } else {
      return new Response(JSON.stringify({ error: "Provide id, ids, or all:true" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: posts, error: fetchError } = await query;
    if (fetchError) throw fetchError;
    if (!posts?.length) {
      return new Response(JSON.stringify({ embedded: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build the text we embed for each post.
    const inputs = posts.map((p: any) => {
      const text = [
        p.title ?? "",
        p.category ?? "",
        p.excerpt ?? "",
        stripMarkdown(p.content ?? ""),
      ]
        .join("\n\n")
        .slice(0, 25000); // stay well under the 32KB per-string cap
      return text || (p.title ?? "Untitled");
    });

    const embedRes = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/text-embedding-3-small",
        input: inputs,
        dimensions: 1536,
      }),
    });

    if (!embedRes.ok) {
      const status = embedRes.status;
      const bodyText = await embedRes.text();
      console.error("Embedding error", status, bodyText);
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
    const vectors: number[][] = embedJson.data.map((d: any) => d.embedding);

    // Update each row with its embedding.
    let embedded = 0;
    for (let i = 0; i < posts.length; i++) {
      const { error: updateError } = await admin
        .from("blog_posts")
        .update({ embedding: vectors[i] as unknown as string })
        .eq("id", posts[i].id);
      if (updateError) {
        console.error("Update failed for", posts[i].id, updateError);
        continue;
      }
      embedded += 1;
    }

    return new Response(JSON.stringify({ embedded }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("embed-blog-post error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
