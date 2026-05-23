import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, User as UserIcon } from "lucide-react";

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

export function MessageList({ messages, streaming }: { messages: ChatMessage[]; streaming: boolean }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streaming]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {messages.map((m, i) => (
        <div key={m.id ?? i} className="flex gap-3">
          <div className="shrink-0 mt-0.5">
            {m.role === "assistant" ? (
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                <UserIcon className="h-4 w-4" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-muted-foreground mb-1">
              {m.role === "assistant" ? "Assistant" : "You"}
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none break-words">
              {m.content ? (
                <ReactMarkdown>{m.content}</ReactMarkdown>
              ) : streaming && m.role === "assistant" && i === messages.length - 1 ? (
                <span className="inline-block h-4 w-2 bg-primary animate-pulse rounded-sm" />
              ) : null}
            </div>
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
