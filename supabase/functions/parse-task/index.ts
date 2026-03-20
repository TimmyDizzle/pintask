import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ title: text || "", dueDate: null, label: "normal", priority: "medium" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY not configured");
      return new Response(
        JSON.stringify({ title: text.trim(), dueDate: null, label: "normal", priority: "medium" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const today = new Date().toISOString().split("T")[0];

    const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 256,
        tools: [
          {
            name: "parse_task",
            description: "Extract structured task data from natural language text.",
            input_schema: {
              type: "object",
              properties: {
                title: { type: "string", description: "Clean task title without date or priority info" },
                dueDate: { type: "string", description: "ISO date string (YYYY-MM-DD) or null if no date mentioned" },
                label: { type: "string", enum: ["urgent", "normal"], description: "urgent if the text implies urgency, otherwise normal" },
                priority: { type: "string", enum: ["high", "medium", "low"], description: "Task priority inferred from text" },
              },
              required: ["title", "label", "priority"],
            },
          },
        ],
        tool_choice: { type: "tool", name: "parse_task" },
        messages: [
          {
            role: "user",
            content: `You are a task parser. Today is ${today}. Extract structured task data from this text. Interpret relative dates like "Friday", "tomorrow", "next week" relative to today. If no date is mentioned, set dueDate to null. If the text sounds urgent or uses words like "urgent", "ASAP", "immediately", set label to "urgent" and priority to "high".\n\nText: ${text.trim()}`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("Anthropic API error:", aiResponse.status, errText);
      return new Response(
        JSON.stringify({ title: text.trim(), dueDate: null, label: "normal", priority: "medium" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const toolUse = aiData.content?.find((block: any) => block.type === "tool_use");

    if (toolUse?.input) {
      const parsed = toolUse.input;
      return new Response(
        JSON.stringify({
          title: parsed.title || text.trim(),
          dueDate: parsed.dueDate || null,
          label: parsed.label || "normal",
          priority: parsed.priority || "medium",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ title: text.trim(), dueDate: null, label: "normal", priority: "medium" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("parse-task error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
