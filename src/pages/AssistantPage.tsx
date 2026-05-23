import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { MessageList, type ChatMessage } from "@/components/assistant/MessageList";
import { Composer } from "@/components/assistant/Composer";
import { QuotaMeter } from "@/components/assistant/QuotaMeter";
import { streamAssistant } from "@/hooks/useAssistantStream";
import { Plus, Sparkles, Trash2 } from "lucide-react";

const SUGGESTIONS = [
  "Summarize my top priorities for today",
  "Draft a friendly follow-up email about a delayed project",
  "Brainstorm 5 names for a new productivity feature",
];

interface ConversationRow {
  id: string;
  title: string;
  updated_at: string;
}

function AssistantInner() {
  useDocumentTitle("Assistant — Pintask");
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const conversationId = params.get("c") ?? undefined;
  const qc = useQueryClient();
  const { toast } = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);

  const { data: conversations = [] } = useQuery({
    queryKey: ["assistant-conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assistant_conversations")
        .select("id, title, updated_at")
        .order("updated_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as ConversationRow[];
    },
  });

  const { data: convMessages = [] } = useQuery({
    queryKey: ["assistant-messages", conversationId],
    enabled: !!conversationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assistant_messages")
        .select("id, role, content")
        .eq("conversation_id", conversationId!)
        .in("role", ["user", "assistant"])
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as ChatMessage[];
    },
  });

  // Sync server messages → local view when switching conversations.
  useEffect(() => {
    if (conversationId) setMessages(convMessages);
    else setMessages([]);
  }, [conversationId, convMessages]);

  const isEmpty = useMemo(() => messages.length === 0 && !streaming, [messages, streaming]);

  const handleSend = async (text: string) => {
    setStreaming(true);
    const userMsg: ChatMessage = { role: "user", content: text };
    const assistantMsg: ChatMessage = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    let assistantSoFar = "";
    let createdConvId: string | undefined;
    const wasNewConversation = !conversationId;

    await streamAssistant(
      { conversationId, message: text },
      {
        onMeta: (meta) => {
          createdConvId = meta.conversationId;
          if (wasNewConversation && meta.conversationId) {
            setParams({ c: meta.conversationId }, { replace: true });
          }
        },
        onDelta: (chunk) => {
          assistantSoFar += chunk;
          setMessages((prev) =>
            prev.map((m, i) =>
              i === prev.length - 1 && m.role === "assistant"
                ? { ...m, content: assistantSoFar }
                : m,
            ),
          );
        },
        onDone: () => {
          setStreaming(false);
          qc.invalidateQueries({ queryKey: ["assistant-conversations"] });
          qc.invalidateQueries({ queryKey: ["assistant-usage"] });
          if (wasNewConversation && createdConvId) {
            // Fire-and-forget title generation
            supabase.functions
              .invoke("assistant-title", { body: { conversationId: createdConvId } })
              .then(() => qc.invalidateQueries({ queryKey: ["assistant-conversations"] }))
              .catch(() => { /* non-fatal */ });
          }
        },
        onError: (err) => {
          setStreaming(false);
          setMessages((prev) => prev.slice(0, -1));
          toast({
            title:
              err.status === 402
                ? "Monthly quota reached"
                : err.status === 429
                ? "Slow down"
                : "Assistant error",
            description: err.message,
            variant: "destructive",
          });
          qc.invalidateQueries({ queryKey: ["assistant-usage"] });
        },
      },
    );
  };

  const newChat = () => {
    setMessages([]);
    setParams({}, { replace: true });
  };

  const deleteConv = async (id: string) => {
    if (!confirm("Delete this conversation?")) return;
    const { error } = await supabase.from("assistant_conversations").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    qc.invalidateQueries({ queryKey: ["assistant-conversations"] });
    if (conversationId === id) newChat();
  };

  return (
    <div className="flex h-full">
      {/* Conversation rail */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-muted/30">
        <div className="p-3 border-b border-border">
          <Button onClick={newChat} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-1" /> New chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.length === 0 && (
              <p className="text-xs text-muted-foreground px-2 py-4 text-center">
                No conversations yet.
              </p>
            )}
            {conversations.map((c) => {
              const active = c.id === conversationId;
              return (
                <div
                  key={c.id}
                  className={`group flex items-center gap-1 rounded-md px-2 py-1.5 cursor-pointer transition-colors ${
                    active ? "bg-accent" : "hover:bg-accent/50"
                  }`}
                  onClick={() => setParams({ c: c.id })}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{c.title}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(c.updated_at), { addSuffix: true })}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConv(c.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        <div className="border-t border-border p-3">
          <QuotaMeter />
        </div>
      </aside>

      {/* Chat area */}
      <section className="flex-1 flex flex-col min-w-0">
        <div className="border-b border-border px-4 py-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h1 className="font-heading text-base font-semibold">Personal Assistant</h1>
          <span className="ml-auto md:hidden flex-1 max-w-[180px]">
            <QuotaMeter />
          </span>
        </div>

        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="font-heading text-2xl font-bold mb-2">How can I help?</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Ask anything — brainstorm, summarize, draft, plan. Your conversations are private to you.
            </p>
            <div className="grid gap-2 w-full max-w-lg">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-left text-sm rounded-lg border border-border bg-card px-4 py-3 hover:bg-accent transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <MessageList messages={messages} streaming={streaming} />
        )}

        <Composer onSend={handleSend} disabled={streaming} />
      </section>
    </div>
  );
}

export default function AssistantPage() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return (
    <AppLayout>
      <AssistantInner />
    </AppLayout>
  );
}
