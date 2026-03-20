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

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all projects, boards, columns
    const { data: projects } = await supabase.from("projects").select("id, name");
    if (!projects?.length) {
      return new Response(
        JSON.stringify({ report: "No projects found. Create a project to start tracking!" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: boards } = await supabase
      .from("boards")
      .select("id, project_id")
      .in("project_id", projects.map((p) => p.id));

    if (!boards?.length) {
      return new Response(
        JSON.stringify({ report: "No boards found." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: columns } = await supabase
      .from("columns")
      .select("id, name, board_id")
      .in("board_id", boards.map((b) => b.id));

    if (!columns?.length) {
      return new Response(
        JSON.stringify({ report: "No columns found." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch all tasks in these columns
    const { data: allTasks } = await supabase
      .from("tasks")
      .select("id, title, due_date, priority, column_id, updated_at")
      .in("column_id", columns.map((c) => c.id));

    const tasks = allTasks || [];

    // Build lookups
    const colMap: Record<string, { name: string; boardId: string }> = {};
    columns.forEach((c) => (colMap[c.id] = { name: c.name, boardId: c.board_id }));

    const boardProjMap: Record<string, string> = {};
    boards.forEach((b) => {
      const proj = projects.find((p) => p.id === b.project_id);
      boardProjMap[b.id] = proj?.name || "Unknown";
    });

    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const todayStr = today.toISOString().split("T")[0];

    // Categorize tasks
    const completed: string[] = [];
    const inProgress: string[] = [];
    const todo: string[] = [];
    const overdue: string[] = [];

    for (const t of tasks) {
      const col = colMap[t.column_id];
      const colName = col?.name?.toLowerCase() || "";
      const proj = col ? boardProjMap[col.boardId] : "Unknown";
      const label = `"${t.title}" (${proj}) [${t.priority || "medium"}]`;

      if (colName.includes("done")) {
        // Check if completed in last 7 days
        const updatedAt = new Date(t.updated_at);
        if (updatedAt >= weekAgo) {
          completed.push(label);
        }
      } else if (colName.includes("progress")) {
        inProgress.push(label);
        if (t.due_date && t.due_date < todayStr) {
          overdue.push(`${label} — due ${t.due_date}`);
        }
      } else {
        todo.push(label);
        if (t.due_date && t.due_date < todayStr) {
          overdue.push(`${label} — due ${t.due_date}`);
        }
      }
    }

    const summary = [
      `COMPLETED THIS WEEK (${completed.length}):`,
      completed.length ? completed.map((t) => `- ${t}`).join("\n") : "- None",
      "",
      `IN PROGRESS (${inProgress.length}):`,
      inProgress.length ? inProgress.map((t) => `- ${t}`).join("\n") : "- None",
      "",
      `TO DO (${todo.length}):`,
      todo.length ? todo.map((t) => `- ${t}`).join("\n") : "- None",
      "",
      `OVERDUE (${overdue.length}):`,
      overdue.length ? overdue.map((t) => `- ${t}`).join("\n") : "- None",
    ].join("\n");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are a productivity analyst. Given this week's task data, write a brief weekly performance report with 4 sections: WINS (what got done), GAPS (what didn't move), BLOCKERS (anything overdue), and NEXT WEEK FOCUS (top recommendation). Be direct, specific, and encouraging. Max 200 words. Use markdown with ## for section headers.",
          },
          {
            role: "user",
            content: `Today is ${todayStr}. Here is my weekly task data:\n\n${summary}`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: "Failed to generate report" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const report = aiData.choices?.[0]?.message?.content || "Unable to generate report.";

    return new Response(
      JSON.stringify({
        report,
        stats: {
          completed: completed.length,
          inProgress: inProgress.length,
          todo: todo.length,
          overdue: overdue.length,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("weekly-report error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
