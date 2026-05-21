import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

type Range = 7 | 30 | 90;

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function formatUSD(cents: number) {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function AdAnalyticsPage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [range, setRange] = useState<Range>(30);

  useDocumentTitle("Ad analytics — Pintask", "Track ad impressions and revenue per page.");

  // Form state for revenue entry
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    date: today,
    page_path: "/blog",
    slot_id: "",
    revenue_dollars: "",
    clicks: "",
    impressions_reported: "",
  });

  const { data: impressions = [] } = useQuery({
    queryKey: ["ad_impressions", range],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_impressions")
        .select("slot_id, page_path, created_at, consent_state")
        .gte("created_at", daysAgo(range))
        .limit(10000);
      if (error) throw error;
      return data;
    },
  });

  const { data: revenue = [] } = useQuery({
    queryKey: ["ad_revenue_daily", range],
    enabled: !!user,
    queryFn: async () => {
      const since = daysAgo(range).slice(0, 10);
      const { data, error } = await supabase
        .from("ad_revenue_daily")
        .select("*")
        .gte("date", since)
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addRevenue = useMutation({
    mutationFn: async () => {
      const cents = Math.round(parseFloat(form.revenue_dollars || "0") * 100);
      const { error } = await supabase.from("ad_revenue_daily").insert({
        user_id: user!.id,
        date: form.date,
        page_path: form.page_path || "*",
        slot_id: form.slot_id || null,
        revenue_cents: cents,
        clicks: parseInt(form.clicks || "0", 10),
        impressions_reported: parseInt(form.impressions_reported || "0", 10),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Revenue entry saved" });
      qc.invalidateQueries({ queryKey: ["ad_revenue_daily"] });
      setForm((f) => ({ ...f, revenue_dollars: "", clicks: "", impressions_reported: "" }));
    },
    onError: (e: any) =>
      toast({ title: "Could not save", description: e.message, variant: "destructive" }),
  });

  const deleteRevenue = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ad_revenue_daily").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ad_revenue_daily"] }),
  });

  // Aggregate impressions by page, splitting served vs blocked-by-consent.
  const byPage = useMemo(() => {
    const map = new Map<string, { served: number; blocked: number; slots: Set<string> }>();
    for (const r of impressions) {
      const entry = map.get(r.page_path) ?? { served: 0, blocked: 0, slots: new Set() };
      if (r.consent_state === "accepted") entry.served += 1;
      else entry.blocked += 1;
      entry.slots.add(r.slot_id);
      map.set(r.page_path, entry);
    }
    return Array.from(map.entries())
      .map(([page_path, v]) => ({
        page_path,
        served: v.served,
        blocked: v.blocked,
        impressions: v.served + v.blocked,
        slots: v.slots.size,
      }))
      .sort((a, b) => b.impressions - a.impressions);
  }, [impressions]);

  // Revenue + RPM per page
  const revenueByPage = useMemo(() => {
    const map = new Map<string, { cents: number; clicks: number; reported: number }>();
    for (const r of revenue) {
      const entry = map.get(r.page_path) ?? { cents: 0, clicks: 0, reported: 0 };
      entry.cents += r.revenue_cents;
      entry.clicks += r.clicks;
      entry.reported += r.impressions_reported;
      map.set(r.page_path, entry);
    }
    return map;
  }, [revenue]);

  const totalServed = impressions.filter((i) => i.consent_state === "accepted").length;
  const totalBlocked = impressions.length - totalServed;
  const totalImpressions = impressions.length;
  const blockedPct = totalImpressions > 0 ? (totalBlocked / totalImpressions) * 100 : 0;
  const totalRevenueCents = revenue.reduce((s, r) => s + r.revenue_cents, 0);
  const totalClicks = revenue.reduce((s, r) => s + r.clicks, 0);
  const rpm = totalServed > 0 ? (totalRevenueCents / totalServed) * 1000 / 100 : 0;

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Ad analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Impressions are tracked automatically. Enter AdSense revenue daily to compute RPM per page.
            </p>
          </div>
          <div className="flex gap-1 rounded-md border border-border bg-card p-1">
            {([7, 30, 90] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 text-xs rounded ${
                  range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {r}d
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Served</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{totalServed.toLocaleString()}</CardContent></Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Blocked (no consent)</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBlocked.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{blockedPct.toFixed(1)}% of views deferred</div>
            </CardContent>
          </Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Revenue</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{formatUSD(totalRevenueCents)}</CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Clicks</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{totalClicks.toLocaleString()}</CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">RPM (served)</CardTitle></CardHeader><CardContent className="text-2xl font-bold">${rpm.toFixed(2)}</CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Per-page performance</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead className="text-right">Served</TableHead>
                  <TableHead className="text-right">Blocked</TableHead>
                  <TableHead className="text-right">Slots</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">RPM</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byPage.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No impressions in this range yet.
                    </TableCell>
                  </TableRow>
                )}
                {byPage.map((row) => {
                  const rev = revenueByPage.get(row.page_path)?.cents ?? 0;
                  const pageRpm = row.served > 0 ? (rev / row.served) * 1000 / 100 : 0;
                  const blockedPctRow = row.impressions > 0 ? (row.blocked / row.impressions) * 100 : 0;
                  return (
                    <TableRow key={row.page_path}>
                      <TableCell className="font-mono text-xs">{row.page_path}</TableCell>
                      <TableCell className="text-right">{row.served.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className={row.blocked > 0 ? "text-amber-600 dark:text-amber-400" : ""}>
                          {row.blocked.toLocaleString()}
                          {row.blocked > 0 && (
                            <span className="text-muted-foreground text-xs ml-1">
                              ({blockedPctRow.toFixed(0)}%)
                            </span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{row.slots}</TableCell>
                      <TableCell className="text-right">{formatUSD(rev)}</TableCell>
                      <TableCell className="text-right">${pageRpm.toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>


        <Card>
          <CardHeader><CardTitle className="text-base">Log AdSense revenue</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-6">
              <div className="sm:col-span-2"><Label className="text-xs">Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label className="text-xs">Page path</Label><Input placeholder="/blog or *" value={form.page_path} onChange={(e) => setForm({ ...form, page_path: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label className="text-xs">Slot ID (optional)</Label><Input value={form.slot_id} onChange={(e) => setForm({ ...form, slot_id: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label className="text-xs">Revenue (USD)</Label><Input type="number" step="0.01" value={form.revenue_dollars} onChange={(e) => setForm({ ...form, revenue_dollars: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label className="text-xs">Clicks</Label><Input type="number" value={form.clicks} onChange={(e) => setForm({ ...form, clicks: e.target.value })} /></div>
              <div className="sm:col-span-2"><Label className="text-xs">Impressions (reported)</Label><Input type="number" value={form.impressions_reported} onChange={(e) => setForm({ ...form, impressions_reported: e.target.value })} /></div>
            </div>
            <Button onClick={() => addRevenue.mutate()} disabled={addRevenue.isPending || !form.revenue_dollars}>
              {addRevenue.isPending ? "Saving..." : "Save entry"}
            </Button>

            {revenue.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Page</TableHead>
                    <TableHead>Slot</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenue.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.date}</TableCell>
                      <TableCell className="font-mono text-xs">{r.page_path}</TableCell>
                      <TableCell className="font-mono text-xs">{r.slot_id || "—"}</TableCell>
                      <TableCell className="text-right">{formatUSD(r.revenue_cents)}</TableCell>
                      <TableCell className="text-right">{r.clicks}</TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" onClick={() => deleteRevenue.mutate(r.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
