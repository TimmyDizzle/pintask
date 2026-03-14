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
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import { Clock, TrendingUp, FolderKanban } from "lucide-react";

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

export default function Reports() {
  const [dateRange, setDateRange] = useState("7");

  const startDate = useMemo(
    () => startOfDay(subDays(new Date(), parseInt(dateRange))),
    [dateRange]
  );

  const { data: timeEntries = [] } = useQuery({
    queryKey: ["report-time-entries", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_entries")
        .select(
          "*, tasks!inner(title, columns!inner(boards!inner(projects!inner(id, name, color))))"
        )
        .gte("started_at", startDate.toISOString())
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

  const formatHours = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

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

  // Per-day data
  const dailyData = useMemo(() => {
    const days = eachDayOfInterval({ start: startDate, end: new Date() });
    const map = new Map<string, number>();
    days.forEach((d) => map.set(format(d, "yyyy-MM-dd"), 0));

    timeEntries.forEach((entry: any) => {
      const day = format(new Date(entry.started_at), "yyyy-MM-dd");
      map.set(day, (map.get(day) || 0) + (entry.duration_seconds || 0));
    });

    return Array.from(map.entries()).map(([date, seconds]) => ({
      date: format(new Date(date), "MMM d"),
      hours: +(seconds / 3600).toFixed(2),
      seconds,
    }));
  }, [timeEntries, startDate]);

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

  const avgPerDay =
    dailyData.length > 0
      ? totalSeconds / dailyData.filter((d) => d.seconds > 0).length || 0
      : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">
          {formatHours(payload[0].value * 3600)}
        </p>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Time Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track where your time goes
          </p>
        </div>
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

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatHours(totalSeconds)}</p>
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
              <p className="text-2xl font-bold">
                {formatHours(isFinite(avgPerDay) ? avgPerDay : 0)}
              </p>
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
              <p className="text-2xl font-bold">{projectData.length}</p>
              <p className="text-xs text-muted-foreground">Projects tracked</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily bar chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Time per Day</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dailyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
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
                    dataKey="hours"
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
                    {projectData.map((entry, i) => (
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
