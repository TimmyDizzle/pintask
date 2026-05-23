import { useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

type RunState = {
  loading: boolean;
  ms?: number;
  result?: unknown;
  error?: string;
};

const initial: RunState = { loading: false };

async function timed<T>(fn: () => Promise<T>): Promise<{ ms: number; data?: T; error?: string }> {
  const t0 = performance.now();
  try {
    const data = await fn();
    return { ms: Math.round(performance.now() - t0), data };
  } catch (e) {
    return { ms: Math.round(performance.now() - t0), error: e instanceof Error ? e.message : String(e) };
  }
}

function Pretty({ value }: { value: unknown }) {
  return (
    <pre className="text-xs bg-muted/40 rounded-md p-3 overflow-auto max-h-80 whitespace-pre-wrap break-words">
      {typeof value === "string" ? value : JSON.stringify(value, null, 2)}
    </pre>
  );
}

function AdminAiEvalInner() {
  useDocumentTitle("AI Eval — Admin");

  const [text, setText] = useState("Call John on Friday urgent");
  const [parseA, setParseA] = useState<RunState>(initial);
  const [parseB, setParseB] = useState<RunState>(initial);

  const [briefA, setBriefA] = useState<RunState>(initial);
  const [briefB, setBriefB] = useState<RunState>(initial);

  const runParse = async () => {
    setParseA({ loading: true });
    setParseB({ loading: true });
    const [a, b] = await Promise.all([
      timed(async () => {
        const { data, error } = await supabase.functions.invoke("parse-task", { body: { text } });
        if (error) throw error;
        return data;
      }),
      timed(async () => {
        const { data, error } = await supabase.functions.invoke("parse-task", { body: { text } });
        if (error) throw error;
        return data;
      }),
    ]);
    setParseA({ loading: false, ms: a.ms, result: a.data, error: a.error });
    setParseB({ loading: false, ms: b.ms, result: b.data, error: b.error });
  };

  const runBriefing = async () => {
    setBriefA({ loading: true });
    setBriefB({ loading: true });
    const [a, b] = await Promise.all([
      timed(async () => {
        const { data, error } = await supabase.functions.invoke("daily-briefing", { body: {} });
        if (error) throw error;
        return data;
      }),
      timed(async () => {
        const { data, error } = await supabase.functions.invoke("daily-briefing", { body: {} });
        if (error) throw error;
        return data;
      }),
    ]);
    setBriefA({ loading: false, ms: a.ms, result: a.data, error: a.error });
    setBriefB({ loading: false, ms: b.ms, result: b.data, error: b.error });
  };

  const renderRun = (label: string, s: RunState) => (
    <Card className="flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <span>{label}</span>
          {s.loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : s.ms != null ? (
            <Badge variant="secondary">{s.ms} ms</Badge>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {s.error ? (
          <p className="text-sm text-destructive">{s.error}</p>
        ) : s.result !== undefined ? (
          <Pretty value={s.result} />
        ) : (
          <p className="text-sm text-muted-foreground">No run yet.</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold">AI Eval</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Run edge functions side-by-side and compare latency. Both runs hit the current
            Lovable AI–backed implementation; use this to spot variance, cold-starts, and regressions.
          </p>
        </header>

        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold">parse-task</h2>
            <span className="text-xs text-muted-foreground">Structured tool-call output</span>
          </div>
          <div className="flex gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder='e.g. "Email Sara tomorrow ASAP"'
            />
            <Button onClick={runParse} disabled={parseA.loading || parseB.loading || !text.trim()}>
              Run ×2
            </Button>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            {renderRun("Run A", parseA)}
            {renderRun("Run B", parseB)}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold">daily-briefing</h2>
            <span className="text-xs text-muted-foreground">Free-form markdown briefing</span>
          </div>
          <Button onClick={runBriefing} disabled={briefA.loading || briefB.loading}>
            Run ×2
          </Button>
          <div className="flex flex-col md:flex-row gap-3">
            {renderRun("Run A", briefA)}
            {renderRun("Run B", briefB)}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function AdminAiEval() {
  return (
    <AdminGuard>
      <AdminAiEvalInner />
    </AdminGuard>
  );
}
