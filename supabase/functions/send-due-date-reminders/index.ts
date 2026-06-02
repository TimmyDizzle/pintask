import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function parseJwtClaims(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = parts[1]
      .replaceAll("-", "+")
      .replaceAll("_", "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");
    return JSON.parse(atob(payload)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow service-role callers (cron / internal). Anon JWT is rejected.
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const claims = parseJwtClaims(token);
  if (!claims || claims.role !== "service_role") {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get all tasks due within 3 days or overdue
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + 3);
    const cutoff = cutoffDate.toISOString().split("T")[0];

    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select(
        "id, title, due_date, priority, user_id, columns!inner(boards!inner(projects!inner(name)))"
      )
      .not("due_date", "is", null)
      .lte("due_date", cutoff)
      .order("due_date", { ascending: true });

    if (tasksError) throw tasksError;
    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({ message: "No tasks due soon" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Group tasks by user_id
    const tasksByUser: Record<string, typeof tasks> = {};
    for (const task of tasks) {
      if (!tasksByUser[task.user_id]) tasksByUser[task.user_id] = [];
      tasksByUser[task.user_id].push(task);
    }

    // Get user emails
    const userIds = Object.keys(tasksByUser);
    const { data: authData } = await supabase.auth.admin.listUsers();
    const userEmails: Record<string, string> = {};
    for (const u of authData?.users || []) {
      if (userIds.includes(u.id) && u.email) {
        userEmails[u.id] = u.email;
      }
    }

    let emailsSent = 0;
    const today = new Date().toISOString().split("T")[0];

    for (const [userId, userTasks] of Object.entries(tasksByUser)) {
      const email = userEmails[userId];
      if (!email) continue;

      const overdue = userTasks.filter((t: any) => t.due_date < today);
      const dueToday = userTasks.filter((t: any) => t.due_date === today);
      const upcoming = userTasks.filter(
        (t: any) => t.due_date > today && t.due_date <= cutoff
      );

      const formatTask = (t: any) => {
        const project = (t as any).columns?.boards?.projects?.name || "Unknown";
        const priority = t.priority ? ` [${t.priority}]` : "";
        return `• ${t.title} (${project})${priority} — due ${t.due_date}`;
      };

      let body = `Hi there,\n\nHere's your task reminder:\n\n`;

      if (overdue.length > 0) {
        body += `🔴 OVERDUE (${overdue.length}):\n`;
        body += overdue.map(formatTask).join("\n") + "\n\n";
      }
      if (dueToday.length > 0) {
        body += `🟡 DUE TODAY (${dueToday.length}):\n`;
        body += dueToday.map(formatTask).join("\n") + "\n\n";
      }
      if (upcoming.length > 0) {
        body += `🔵 COMING UP (${upcoming.length}):\n`;
        body += upcoming.map(formatTask).join("\n") + "\n\n";
      }

      body += `Stay on track!\n— Pintask`;

      // Send via Supabase Auth's built-in email (using admin API)
      // We'll use a simple approach: insert into email_send_log if available,
      // or use the Resend-compatible approach via fetch
      const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
      if (lovableApiKey) {
        const res = await fetch("https://api.lovable.dev/v1/email/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${lovableApiKey}`,
          },
          body: JSON.stringify({
            to: email,
            subject: `⏰ Pintask: ${overdue.length + dueToday.length + upcoming.length} task${userTasks.length !== 1 ? "s" : ""} need attention`,
            text: body,
          }),
        });

        if (res.ok) emailsSent++;
      }
    }

    return new Response(
      JSON.stringify({ message: `Sent ${emailsSent} reminder emails` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
