import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const fallback = (title: string) => ({
  title,
  dueDate: null as string | null,
  label: "normal",
  priority: "medium",
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(JSON.stringify(fallback(text || "")), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(JSON.stringify(fallback(text.trim())), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date().toISOString().split("T")[0];

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
            content: `You are a task parser. Today is ${today}. Extract structured task data from the user's text. Interpret relative dates like "Friday", "tomorrow", "next week" relative to today. If no date is mentioned, set dueDate to null. If the text sounds urgent or uses words like "urgent", "ASAP", "immediately", set label to "urgent" and priority to "high". The title should be clean — strip date and priority words.`,
          },
          { role: "user", content: text.trim() },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "parse_task",
              description: "Extract structured task data from natural language text.",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Clean task title without date or priority info" },
                  dueDate: { type: ["string", "null"], description: "ISO date YYYY-MM-DD, or null" },
                  label: { type: "string", enum: ["urgent", "normal"] },
                  priority: { type: "string", enum: ["high", "medium", "low"] },
                },
                required: ["title", "label", "priority"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "parse_task" } },
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
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const errText = await aiResponse.text();
      console.error("Lovable AI error:", aiResponse.status, errText);
      return new Response(JSON.stringify(fallback(text.trim())), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const argsStr = toolCall?.function?.arguments;

    if (argsStr) {
      try {
        const parsed = typeof argsStr === "string" ? JSON.parse(argsStr) : argsStr;
        return new Response(
          JSON.stringify({
            title: parsed.title || text.trim(),
            dueDate: parsed.dueDate || null,
            label: parsed.label || "normal",
            priority: parsed.priority || "medium",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      } catch (e) {
        console.error("Failed to parse tool args:", e, argsStr);
      }
    }

    return new Response(JSON.stringify(fallback(text.trim())), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("parse-task error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
