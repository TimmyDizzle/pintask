import { supabase } from "@/integrations/supabase/client";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assistant-chat`;

export interface StreamHandlers {
  onDelta: (text: string) => void;
  onMeta?: (meta: { conversationId: string }) => void;
  onDone: () => void;
  onError: (err: { status?: number; message: string }) => void;
}

export async function streamAssistant(
  params: { conversationId?: string; message: string },
  h: StreamHandlers,
) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) {
    h.onError({ status: 401, message: "Not signed in" });
    return;
  }

  let resp: Response;
  try {
    resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(params),
    });
  } catch (e) {
    h.onError({ message: e instanceof Error ? e.message : "Network error" });
    return;
  }

  if (!resp.ok || !resp.body) {
    let msg = `Request failed (${resp.status})`;
    try {
      const j = await resp.json();
      if (j?.message) msg = j.message;
      else if (j?.error) msg = j.error;
    } catch { /* ignore */ }
    h.onError({ status: resp.status, message: msg });
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let currentEvent: string | null = null;

  const processLine = (raw: string) => {
    let line = raw.endsWith("\r") ? raw.slice(0, -1) : raw;
    if (line === "") {
      currentEvent = null;
      return;
    }
    if (line.startsWith(":")) return;
    if (line.startsWith("event: ")) {
      currentEvent = line.slice(7).trim();
      return;
    }
    if (!line.startsWith("data: ")) return;
    const payload = line.slice(6).trim();
    if (payload === "[DONE]") return;
    if (currentEvent === "meta") {
      try {
        h.onMeta?.(JSON.parse(payload));
      } catch { /* ignore */ }
      return;
    }
    try {
      const obj = JSON.parse(payload);
      const delta = obj.choices?.[0]?.delta?.content;
      if (typeof delta === "string") h.onDelta(delta);
    } catch {
      /* incomplete JSON: requeue */
      buffer = raw + "\n" + buffer;
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      processLine(line);
    }
  }
  if (buffer.trim()) processLine(buffer);
  h.onDone();
}
