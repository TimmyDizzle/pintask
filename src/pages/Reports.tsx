import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  format,
  subDays,
  subWeeks,
  subMonths,
  startOfDay,
  startOfWeek,
  startOfMonth,
  endOfWeek,
  endOfMonth,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  isSameWeek,
  isSameMonth,
} from "date-fns";
import { Clock, TrendingUp, TrendingDown, FolderKanban, ArrowUpRight, ArrowDownRight, Minus, Sparkles, Loader2, Copy, Check as CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const COLORS = [
  "hsl(250, 65%, 55%)",
  "hsl(170, 60%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 72%, 55%)",
  "hsl(200, 70%, 50%)",
  "hsl(280, 60%, 55%)",
  "hsl(150, 60%, 40%)",
  "hsl(20, 80%, 55%)",
];

type ViewMode = "daily" | "weekly" | "monthly";

const formatHours = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

function ComparisonBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-500">
      <ArrowUpRight className="h-3 w-3" /> New
    </span>
  );
  const pctChange = Math.round(((current - previous) / previous) * 100);
  if (pctChange === 0) return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground">
      <Minus className="h-3 w-3" /> 0%
    </span>
  );
  const isUp = pctChange > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${isUp ? "text-emerald-500" : "text-destructive"}`}>
      {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {isUp ? "+" : ""}{pctChange}%
    </span>
  );
}

export default function Reports() {
  const [dateRange, setDateRange] = useState("7");
  const [viewMode, setViewMode] = useState<ViewMode>("daily");

  const rangeDays = parseInt(dateRange);
  const currentStart = useMemo(() => startOfDay(subDays(new Date(), rangeDays)), [rangeDays]);
  const previousStart = useMemo(() => startOfDay(subDays(currentStart, rangeDays)), [currentStart, rangeDays]);

  // Fetch current period
  const { data: timeEntries = [] } = useQuery({
    queryKey: ["report-time-entries", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_entries")
        .select(
          "*, tasks!inner(title, columns!inner(boards!inner(projects!inner(id, name, color))))"
        )
        .gte("started_at", currentStart.toISOString())
        .not("duration_seconds", "is", null)
        .order("started_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch previous period for comparison
  const { data: prevTimeEntries = [] } = useQuery({
    queryKey: ["report-time-entries-prev", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_entries")
        .select(
          "*, tasks!inner(title, columns!inner(boards!inner(projects!inner(id, name, color))))"
        )
        .gte("started_at", previousStart.toISOString())
        .lt("started_at", currentStart.toISOString())
        .not("duration_seconds", "is", null)
        .order("started_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const totalSeconds = timeEntries.reduce(
    (sum: number, e: any) => sum + (e.duration_seconds || 0),
    0
  );
  const prevTotalSeconds = prevTimeEntries.reduce(
    (sum: number, e: any) => sum + (e.duration_seconds || 0),
    0
  );

  // Per-project data
  const projectData = useMemo(() => {
    const map = new Map<string, { name: string; color: string; seconds: number }>();
    timeEntries.forEach((entry: any) => {
      const project = entry.tasks?.columns?.boards?.projects;
      if (!project) return;
      const existing = map.get(project.id) || {
        name: project.name,
        color: project.color || "#6366f1",
        seconds: 0,
      };
      existing.seconds += entry.duration_seconds || 0;
      map.set(project.id, existing);
    });
    return Array.from(map.values())
      .map((p) => ({ ...p, hours: +(p.seconds / 3600).toFixed(2) }))
      .sort((a, b) => b.seconds - a.seconds);
  }, [timeEntries]);

  const prevProjectCount = useMemo(() => {
    const set = new Set<string>();
    prevTimeEntries.forEach((entry: any) => {
      const project = entry.tasks?.columns?.boards?.projects;
      if (project) set.add(project.id);
    });
    return set.size;
  }, [prevTimeEntries]);

  // Aggregated chart data based on view mode
  const chartData = useMemo(() => {
    const now = new Date();

    if (viewMode === "daily") {
      const days = eachDayOfInterval({ start: currentStart, end: now });
      const map = new Map<string, { current: number; previous: number }>();
      days.forEach((d) => map.set(format(d, "yyyy-MM-dd"), { current: 0, previous: 0 }));

      timeEntries.forEach((entry: any) => {
        const day = format(new Date(entry.started_at), "yyyy-MM-dd");
        const item = map.get(day);
        if (item) item.current += entry.duration_seconds || 0;
      });

      // Map previous entries to equivalent offset days
      const prevDays = eachDayOfInterval({ start: previousStart, end: subDays(currentStart, 1) });
      prevTimeEntries.forEach((entry: any) => {
        const entryDate = new Date(entry.started_at);
        const dayIndex = prevDays.findIndex(d => format(d, "yyyy-MM-dd") === format(entryDate, "yyyy-MM-dd"));
        if (dayIndex >= 0 && dayIndex < days.length) {
          const targetKey = format(days[dayIndex], "yyyy-MM-dd");
          const item = map.get(targetKey);
          if (item) item.previous += entry.duration_seconds || 0;
        }
      });

      return Array.from(map.entries()).map(([date, vals]) => ({
        label: format(new Date(date), "MMM d"),
        current: +(vals.current / 3600).toFixed(2),
        previous: +(vals.previous / 3600).toFixed(2),
      }));
    }

    if (viewMode === "weekly") {
      const weeks = eachWeekOfInterval({ start: currentStart, end: now }, { weekStartsOn: 1 });
      return weeks.map((weekStart, i) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const current = timeEntries
          .filter((e: any) => {
            const d = new Date(e.started_at);
            return d >= weekStart && d <= weekEnd;
          })
          .reduce((sum: number, e: any) => sum + (e.duration_seconds || 0), 0);

        // Previous period equivalent week
        const prevWeekStart = subDays(weekStart, rangeDays);
        const prevWeekEnd = endOfWeek(prevWeekStart, { weekStartsOn: 1 });
        const previous = prevTimeEntries
          .filter((e: any) => {
            const d = new Date(e.started_at);
            return d >= prevWeekStart && d <= prevWeekEnd;
          })
          .reduce((sum: number, e: any) => sum + (e.duration_seconds || 0), 0);

        return {
          label: `W${format(weekStart, "w")}`,
          current: +(current / 3600).toFixed(2),
          previous: +(previous / 3600).toFixed(2),
        };
      });
    }

    // Monthly
    const months = eachMonthOfInterval({ start: currentStart, end: now });
    return months.map((monthStart) => {
      const monthEnd = endOfMonth(monthStart);
      const current = timeEntries
        .filter((e: any) => {
          const d = new Date(e.started_at);
          return d >= monthStart && d <= monthEnd;
        })
        .reduce((sum: number, e: any) => sum + (e.duration_seconds || 0), 0);

      const prevMonthStart = subDays(monthStart, rangeDays);
      const prevMonthEnd = endOfMonth(prevMonthStart);
      const previous = prevTimeEntries
        .filter((e: any) => {
          const d = new Date(e.started_at);
          return d >= prevMonthStart && d <= prevMonthEnd;
        })
        .reduce((sum: number, e: any) => sum + (e.duration_seconds || 0), 0);

      return {
        label: format(monthStart, "MMM yyyy"),
        current: +(current / 3600).toFixed(2),
        previous: +(previous / 3600).toFixed(2),
      };
    });
  }, [timeEntries, prevTimeEntries, currentStart, previousStart, viewMode, rangeDays]);

  // Top tasks
  const taskData = useMemo(() => {
    const map = new Map<string, { title: string; project: string; seconds: number }>();
    timeEntries.forEach((entry: any) => {
      const taskId = entry.task_id;
      const title = entry.tasks?.title || "Unknown";
      const project = entry.tasks?.columns?.boards?.projects?.name || "";
      const existing = map.get(taskId) || { title, project, seconds: 0 };
      existing.seconds += entry.duration_seconds || 0;
      map.set(taskId, existing);
    });
    return Array.from(map.values())
      .sort((a, b) => b.seconds - a.seconds)
      .slice(0, 10);
  }, [timeEntries]);

  const activeDays = chartData.filter((d) => d.current > 0).length || 1;
  const avgPerDay = totalSeconds / activeDays;
  const prevActiveDays = useMemo(() => {
    if (viewMode !== "daily") return 1;
    const days = eachDayOfInterval({ start: previousStart, end: subDays(currentStart, 1) });
    const map = new Map<string, number>();
    days.forEach(d => map.set(format(d, "yyyy-MM-dd"), 0));
    prevTimeEntries.forEach((e: any) => {
      const day = format(new Date(e.started_at), "yyyy-MM-dd");
      map.set(day, (map.get(day) || 0) + (e.duration_seconds || 0));
    });
    return Array.from(map.values()).filter(v => v > 0).length || 1;
  }, [prevTimeEntries, previousStart, currentStart, viewMode]);
  const prevAvgPerDay = prevTotalSeconds / prevActiveDays;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} className="text-sm text-muted-foreground">
            {p.dataKey === "current" ? "Current" : "Previous"}: {formatHours(p.value * 3600)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Time Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track where your time goes — with period comparison
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList className="h-9">
              <TabsTrigger value="daily" className="text-xs px-3">Daily</TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs px-3">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs px-3">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary cards with comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{formatHours(totalSeconds)}</p>
                <ComparisonBadge current={totalSeconds} previous={prevTotalSeconds} />
              </div>
              <p className="text-xs text-muted-foreground">Total tracked</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">
                  {formatHours(isFinite(avgPerDay) ? avgPerDay : 0)}
                </p>
                <ComparisonBadge
                  current={isFinite(avgPerDay) ? avgPerDay : 0}
                  previous={isFinite(prevAvgPerDay) ? prevAvgPerDay : 0}
                />
              </div>
              <p className="text-xs text-muted-foreground">Avg per active day</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderKanban className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{projectData.length}</p>
                <ComparisonBadge current={projectData.length} previous={prevProjectCount} />
              </div>
              <p className="text-xs text-muted-foreground">Projects tracked</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart with comparison */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Time per {viewMode === "daily" ? "Day" : viewMode === "weekly" ? "Week" : "Month"}
              </CardTitle>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-sm bg-primary inline-block" />
                  Current
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-sm bg-muted-foreground/30 inline-block" />
                  Previous
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}h`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="previous"
                    fill="hsl(var(--muted-foreground) / 0.2)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="current"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
                No time entries for this period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project pie chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">By Project</CardTitle>
          </CardHeader>
          <CardContent>
            {projectData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={projectData}
                    dataKey="hours"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {projectData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatHours(value * 3600)}
                  />
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
                No data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top tasks table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top Tasks by Time</CardTitle>
        </CardHeader>
        <CardContent>
          {taskData.length > 0 ? (
            <div className="space-y-2">
              {taskData.map((task, i) => {
                const pct =
                  totalSeconds > 0
                    ? Math.round((task.seconds / totalSeconds) * 100)
                    : 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">
                          {task.title}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">
                          {formatHours(task.seconds)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground w-8 text-right">
                          {pct}%
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {task.project}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No time entries for this period
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
