import { useEffect, useState, useCallback } from "react";
import AdminGuard from "@/components/AdminGuard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

type UsageRow = {
  function_name: string;
  provider: string;
  model: string;
  calls: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_micro_usd: number;
  avg_latency_ms: number | null;
};

const RANGES = [
  { label: "24h", hours: 24 },
  { label: "7d", hours: 24 * 7 },
  { label: "30d", hours: 24 * 30 },
];

function fmtUsd(microUsd: number) {
  const usd = microUsd / 1_000_000;
  if (usd < 0.01) return `$${usd.toFixed(6)}`;
  return `$${usd.toFixed(4)}`;
}


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

  const [usage, setUsage] = useState<UsageRow[]>([]);
  const [usageLoading, setUsageLoading] = useState(false);
  const [rangeHours, setRangeHours] = useState(24);

  const loadUsage = useCallback(async () => {
    setUsageLoading(true);
    try {
      const since = new Date(Date.now() - rangeHours * 3600 * 1000).toISOString();
      const { data, error } = await supabase
        .from("ai_usage" as any)
        .select("function_name, provider, model, prompt_tokens, completion_tokens, total_tokens, cost_micro_usd, latency_ms")
        .gte("created_at", since)
        .limit(1000);
      if (error) throw error;
      const groups = new Map<string, UsageRow>();
      for (const r of (data ?? []) as any[]) {
        const key = `${r.function_name}|${r.provider}|${r.model}`;
        const g = groups.get(key) ?? {
          function_name: r.function_name,
          provider: r.provider,
          model: r.model,
          calls: 0,
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
          cost_micro_usd: 0,
          avg_latency_ms: 0,
        };
        g.calls += 1;
        g.prompt_tokens += r.prompt_tokens ?? 0;
        g.completion_tokens += r.completion_tokens ?? 0;
        g.total_tokens += r.total_tokens ?? 0;
        g.cost_micro_usd += r.cost_micro_usd ?? 0;
        g.avg_latency_ms = (g.avg_latency_ms ?? 0) + (r.latency_ms ?? 0);
        groups.set(key, g);
      }
      const rows = Array.from(groups.values()).map((g) => ({
        ...g,
        avg_latency_ms: g.calls > 0 ? Math.round((g.avg_latency_ms ?? 0) / g.calls) : null,
      }));
      rows.sort((a, b) => b.cost_micro_usd - a.cost_micro_usd);
      setUsage(rows);
    } catch (e) {
      console.error(e);
    } finally {
      setUsageLoading(false);
    }
  }, [rangeHours]);

  useEffect(() => { loadUsage(); }, [loadUsage]);


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
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h2 className="text-xl font-semibold">Spend by function</h2>
            <div className="flex items-center gap-1">
              {RANGES.map((r) => (
                <Button
                  key={r.label}
                  size="sm"
                  variant={rangeHours === r.hours ? "default" : "outline"}
                  onClick={() => setRangeHours(r.hours)}
                >
                  {r.label}
                </Button>
              ))}
              <Button size="sm" variant="ghost" onClick={loadUsage} disabled={usageLoading}>
                <RefreshCw className={`h-3.5 w-3.5 ${usageLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="text-left px-3 py-2">Function</th>
                      <th className="text-left px-3 py-2">Model</th>
                      <th className="text-right px-3 py-2">Calls</th>
                      <th className="text-right px-3 py-2">Prompt</th>
                      <th className="text-right px-3 py-2">Completion</th>
                      <th className="text-right px-3 py-2">Total tok</th>
                      <th className="text-right px-3 py-2">Avg ms</th>
                      <th className="text-right px-3 py-2">Est. cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usage.length === 0 ? (
                      <tr><td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">
                        {usageLoading ? "Loading…" : "No usage recorded in this window yet."}
                      </td></tr>
                    ) : usage.map((r, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-3 py-2 font-medium">{r.function_name}</td>
                        <td className="px-3 py-2 text-muted-foreground text-xs">{r.model}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{r.calls}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{r.prompt_tokens.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{r.completion_tokens.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{r.total_tokens.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{r.avg_latency_ms ?? "—"}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{fmtUsd(r.cost_micro_usd)}</td>
                      </tr>
                    ))}
                    {usage.length > 0 && (
                      <tr className="border-t border-border bg-muted/30 font-medium">
                        <td className="px-3 py-2" colSpan={2}>Total</td>
                        <td className="px-3 py-2 text-right tabular-nums">{usage.reduce((s, r) => s + r.calls, 0)}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{usage.reduce((s, r) => s + r.prompt_tokens, 0).toLocaleString()}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{usage.reduce((s, r) => s + r.completion_tokens, 0).toLocaleString()}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{usage.reduce((s, r) => s + r.total_tokens, 0).toLocaleString()}</td>
                        <td className="px-3 py-2 text-right text-muted-foreground">—</td>
                        <td className="px-3 py-2 text-right tabular-nums">{fmtUsd(usage.reduce((s, r) => s + r.cost_micro_usd, 0))}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground">
            Costs are estimated from token counts × per-model pricing. Update pricing in each edge function's <code>PRICING</code> table.
          </p>
        </section>


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
