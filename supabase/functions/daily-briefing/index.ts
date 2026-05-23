import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user's projects
    const { data: projects } = await supabase
      .from("projects")
      .select("id, name");

    if (!projects || projects.length === 0) {
      return new Response(
        JSON.stringify({ briefing: "You don't have any projects yet. Create a project and add some tasks to get your daily briefing!" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch boards for all projects
    const { data: boards } = await supabase
      .from("boards")
      .select("id, project_id")
      .in("project_id", projects.map((p) => p.id));

    if (!boards || boards.length === 0) {
      return new Response(
        JSON.stringify({ briefing: "No boards found. Add boards and tasks to get started!" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch columns
    const { data: columns } = await supabase
      .from("columns")
      .select("id, name, board_id")
      .in("board_id", boards.map((b) => b.id));

    if (!columns || columns.length === 0) {
      return new Response(
        JSON.stringify({ briefing: "No columns found. Set up your board columns to get started!" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch tasks
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, title, due_date, priority, column_id, color_label")
      .in("column_id", columns.map((c) => c.id));

    // Fetch labels for tasks
    let taskLabelsMap: Record<string, string[]> = {};
    if (tasks && tasks.length > 0) {
      const { data: taskLabels } = await supabase
        .from("task_labels")
        .select("task_id, label_id")
        .in("task_id", tasks.map((t) => t.id));

      if (taskLabels && taskLabels.length > 0) {
        const labelIds = [...new Set(taskLabels.map((tl) => tl.label_id))];
        const { data: labels } = await supabase
          .from("labels")
          .select("id, name")
          .in("id", labelIds);

        const labelNameMap: Record<string, string> = {};
        labels?.forEach((l) => (labelNameMap[l.id] = l.name));

        taskLabels.forEach((tl) => {
          if (!taskLabelsMap[tl.task_id]) taskLabelsMap[tl.task_id] = [];
          if (labelNameMap[tl.label_id]) taskLabelsMap[tl.task_id].push(labelNameMap[tl.label_id]);
        });
      }
    }

    // Build column lookup
    const columnMap: Record<string, { name: string; boardId: string }> = {};
    columns.forEach((c) => (columnMap[c.id] = { name: c.name, boardId: c.board_id }));

    const boardProjectMap: Record<string, string> = {};
    boards.forEach((b) => {
      const proj = projects.find((p) => p.id === b.project_id);
      boardProjectMap[b.id] = proj?.name || "Unknown";
    });

    // Format task summary for AI
    const taskSummary = (tasks || []).map((t) => {
      const col = columnMap[t.column_id];
      const projectName = col ? boardProjectMap[col.boardId] : "Unknown";
      const labels = taskLabelsMap[t.id]?.join(", ") || "none";
      return `- "${t.title}" | Project: ${projectName} | Status: ${col?.name || "Unknown"} | Priority: ${t.priority || "medium"} | Due: ${t.due_date || "no due date"} | Labels: ${labels}`;
    });

    const today = new Date().toISOString().split("T")[0];
    const userPrompt = `Today is ${today}. Here are my current tasks:\n\n${taskSummary.join("\n")}\n\nTotal tasks: ${taskSummary.length}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
            content:
              "You are a personal productivity assistant. Given the user's current task list, generate a concise morning briefing in 3 sections: TODAY'S TOP 3 PRIORITIES, OVERDUE OR URGENT ITEMS, and ONE THING TO FOCUS ON. Be direct and specific. Max 150 words total. Use markdown formatting with ## for section headers.",
          },
          { role: "user", content: userPrompt },
        ],
      }),
    });
    const latencyMs = Math.round(performance.now() - t0);

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: "Failed to generate briefing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const briefing = aiData.choices?.[0]?.message?.content || "Unable to generate briefing.";

    // Log usage (best-effort, fire-and-forget)
    try {
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (serviceKey) {
        const PRICING: Record<string, { in: number; out: number }> = {
          "google/gemini-3-flash-preview": { in: 0.075, out: 0.30 },
        };
        const p = PRICING[model] ?? { in: 0, out: 0 };
        const pt = aiData.usage?.prompt_tokens ?? 0;
        const ct = aiData.usage?.completion_tokens ?? 0;
        const admin = createClient(supabaseUrl, serviceKey);
        await admin.from("ai_usage").insert({
          user_id: user.id,
          function_name: "daily-briefing",
          provider: "lovable",
          model,
          prompt_tokens: pt,
          completion_tokens: ct,
          total_tokens: aiData.usage?.total_tokens ?? pt + ct,
          cost_micro_usd: Math.round(pt * p.in + ct * p.out),
          latency_ms: latencyMs,
        });
      }
    } catch (logErr) {
      console.error("ai_usage log failed:", logErr);
    }

    return new Response(JSON.stringify({ briefing }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("daily-briefing error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
