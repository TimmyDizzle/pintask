import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const tools = [
  {
    type: "function",
    function: {
      name: "list_tasks",
      description: "List the user's tasks on the current board, optionally filtered.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", description: "Optional column name filter (e.g. 'To Do', 'Done')." },
          limit: { type: "number", description: "Max tasks (default 25, max 100)." },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_task",
      description: "Create a new task on the current board.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          column: { type: "string", description: "Target column name. Defaults to first column." },
          priority: { type: "string", enum: ["low", "medium", "high"] },
          due_date: { type: "string", description: "ISO date YYYY-MM-DD." },
        },
        required: ["title"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_task",
      description: "Update a task's title, priority, due date, or move it to a different column.",
      parameters: {
        type: "object",
        properties: {
          task_id: { type: "string" },
          title: { type: "string" },
          priority: { type: "string", enum: ["low", "medium", "high"] },
          due_date: { type: "string", description: "ISO date YYYY-MM-DD or empty to clear." },
          column: { type: "string", description: "Move to this column name." },
        },
        required: ["task_id"],
        additionalProperties: false,
      },
    },
  },
];

async function execTool(
  name: string,
  args: any,
  ctx: { sb: any; boardId: string; userId: string },
): Promise<unknown> {
  const { sb, boardId, userId } = ctx;

  // Pre-fetch columns for the board (user_id scoped via RLS)
  const { data: columns } = await sb
    .from("columns")
    .select("id, name, position")
    .eq("board_id", boardId)
    .order("position");
  const cols = columns ?? [];
  const findCol = (n?: string) => {
    if (!n) return cols[0];
    return cols.find((c: any) => c.name.toLowerCase() === n.toLowerCase()) ?? cols[0];
  };

  if (name === "list_tasks") {
    const limit = Math.min(args?.limit ?? 25, 100);
    let q = sb
      .from("tasks")
      .select("id, title, priority, due_date, column_id")
      .in("column_id", cols.map((c: any) => c.id))
      .limit(limit);
    if (args?.status) {
      const c = findCol(args.status);
      if (c) q = q.eq("column_id", c.id);
    }
    const { data, error } = await q;
    if (error) return { error: error.message };
    return (data ?? []).map((t: any) => ({
      ...t,
      status: cols.find((c: any) => c.id === t.column_id)?.name,
    }));
  }

  if (name === "create_task") {
    const col = findCol(args?.column);
    if (!col) return { error: "No columns on this board" };
    const { data, error } = await sb
      .from("tasks")
      .insert({
        title: String(args.title).slice(0, 200),
        description: args.description ?? null,
        priority: args.priority ?? "medium",
        due_date: args.due_date || null,
        column_id: col.id,
        user_id: userId,
        position: 0,
      })
      .select("id, title")
      .single();
    if (error) return { error: error.message };
    return { created: data, column: col.name };
  }

  if (name === "update_task") {
    const patch: Record<string, unknown> = {};
    if (args.title) patch.title = args.title;
    if (args.priority) patch.priority = args.priority;
    if ("due_date" in args) patch.due_date = args.due_date || null;
    if (args.column) {
      const c = findCol(args.column);
      if (c) patch.column_id = c.id;
    }
    const { data, error } = await sb
      .from("tasks")
      .update(patch)
      .eq("id", args.task_id)
      .select("id, title, column_id, priority, due_date")
      .single();
    if (error) return { error: error.message };
    return { updated: data, status: cols.find((c: any) => c.id === data.column_id)?.name };
  }

  return { error: `Unknown tool: ${name}` };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, boardId } = await req.json();
    if (!boardId || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "boardId and messages required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: userErr } = await sb.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user owns the board
    const { data: board } = await sb.from("boards").select("id").eq("id", boardId).maybeSingle();
    if (!board) {
      return new Response(JSON.stringify({ error: "Board not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const system = {
      role: "system",
      content:
        "You are Pin, the assistant inside a Pintask Kanban board. Help the user plan, create, and move tasks. " +
        "Always use the provided tools to read or change board data — never invent task IDs or statuses. " +
        "After tool calls, give a short, friendly markdown summary. Be concise.",
    };

    const ctx = { sb, boardId, userId: user.id };
    const convo: any[] = [system, ...messages];

    // Tool-call loop (non-streamed) — when the model wants final text, switch to streaming.
    for (let i = 0; i < 5; i++) {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: convo,
          tools,
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded, try again shortly." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (resp.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const t = await resp.text();
        console.error("AI error", resp.status, t);
        return new Response(JSON.stringify({ error: "AI gateway error" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await resp.json();
      const msg = data.choices?.[0]?.message;
      if (!msg) break;

      const toolCalls = msg.tool_calls;
      if (!toolCalls || toolCalls.length === 0) {
        // No more tools — stream the final answer
        const finalResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [...convo, { role: "system", content: "Now reply to the user in markdown. Keep it short." }],
            stream: true,
          }),
        });
        return new Response(finalResp.body, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }

      // Execute tools and append results
      convo.push(msg);
      for (const tc of toolCalls) {
        let args: any = {};
        try { args = JSON.parse(tc.function.arguments || "{}"); } catch { /* ignore */ }
        const result = await execTool(tc.function.name, args, ctx);
        convo.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify(result),
        });
      }
    }

    return new Response(JSON.stringify({ error: "Too many tool iterations" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("board-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
