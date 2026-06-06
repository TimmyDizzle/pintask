// AI Next Action Engine — deterministic scoring of open tasks.
// Picks the single highest-value task to start next.

export type ScoredTask = {
  id: string;
  title: string;
  description: string | null;
  priority: string | null;
  due_date: string | null;
  column_id: string;
  column_name: string;
  project_name: string;
  score: number;
  breakdown: {
    due: number;
    priority: number;
    size: number;
    momentum: number;
    anxiety: number;
  };
  reasons: string[];
  estimatedMinutes: number;
};

type RawTask = {
  id: string;
  title: string;
  description: string | null;
  priority: string | null;
  due_date: string | null;
  column_id: string;
  tags?: string[] | null;
};

type ColumnMeta = { id: string; name: string; project_name: string };

export type ScoreContext = {
  adhdMode: boolean;
  momentumScore: number;
  completedLast24h: number;
  doneColumnIds: Set<string>;
  // task ids referenced by another task description/title — proxy for "unblocks others"
  unblockerIds: Set<string>;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function daysUntil(due: string | null): number | null {
  if (!due) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(due + "T00:00:00");
  return Math.round((d.getTime() - today.getTime()) / DAY_MS);
}

function dueScore(due: string | null): { score: number; reason?: string } {
  const d = daysUntil(due);
  if (d === null) return { score: 0 };
  if (d < 0) return { score: 40, reason: "It's overdue" };
  if (d === 0) return { score: 30, reason: "Due today" };
  if (d === 1) return { score: 20, reason: "Due tomorrow" };
  if (d <= 7) return { score: 10, reason: "Due this week" };
  return { score: 0 };
}

function priorityScore(p: string | null): { score: number; reason?: string } {
  switch (p) {
    case "urgent":
      return { score: 40, reason: "Marked urgent" };
    case "high":
      return { score: 30, reason: "High priority" };
    case "medium":
      return { score: 15 };
    case "low":
      return { score: 5 };
    default:
      return { score: 10 };
  }
}

// Heuristic task-size from title + description length.
function sizeScore(task: RawTask): { score: number; estMin: number; reason?: string } {
  const len = (task.description || "").length + task.title.length;
  // quick-win hints baked in title
  if (/\b(\d+)\s*(m|min|mins|minutes)\b/i.test(task.title)) {
    const m = task.title.match(/\b(\d+)\s*(m|min|mins|minutes)\b/i);
    const est = m ? Math.min(60, parseInt(m[1], 10)) : 10;
    return { score: 20, estMin: est, reason: "Quick win" };
  }
  if (len < 80) return { score: 20, estMin: 10, reason: "Small task" };
  if (len < 280) return { score: 10, estMin: 25 };
  return { score: 0, estMin: 60 };
}

function momentumScoreFor(ctx: ScoreContext, size: number): { score: number; reason?: string } {
  if (ctx.momentumScore >= 60 && size > 0) return { score: 10, reason: "You're on a roll" };
  if (ctx.completedLast24h === 0 && size >= 20) {
    // bias toward easy wins when stalled
    return { score: 20, reason: "An easy win to get unstuck" };
  }
  return { score: 0 };
}

function anxietyScore(task: RawTask, ctx: ScoreContext, sizeEstMin: number): { score: number; reason?: string } {
  const tags = (task.tags || []).map((t) => t.toLowerCase());
  const isQuick = sizeEstMin <= 15;
  const tagged = tags.includes("quick") || tags.includes("easy");
  const unblocks = ctx.unblockerIds.has(task.id);
  if (unblocks) return { score: 20, reason: "Unblocks other work" };
  if (isQuick || tagged) return { score: 20, reason: "Takes under 15 minutes" };
  return { score: 0 };
}

export function buildContext(
  preferences: { adhd_mode?: boolean; momentum_score?: number } | null,
  completedLast24h: number,
  doneColumnIds: string[],
  allTasks: { id: string; title: string; description: string | null }[],
): ScoreContext {
  // very simple "unblocker" detection: if any other task's description/title
  // contains "after X" or quotes another task's title, mark X as an unblocker.
  const titleToId = new Map<string, string>();
  for (const t of allTasks) titleToId.set(t.title.toLowerCase().trim(), t.id);
  const unblockerIds = new Set<string>();
  for (const t of allTasks) {
    const haystack = `${t.title} ${t.description || ""}`.toLowerCase();
    for (const [title, id] of titleToId) {
      if (id === t.id || title.length < 6) continue;
      if (haystack.includes(`after ${title}`) || haystack.includes(`blocked by ${title}`)) {
        unblockerIds.add(id);
      }
    }
  }
  return {
    adhdMode: !!preferences?.adhd_mode,
    momentumScore: preferences?.momentum_score ?? 0,
    completedLast24h,
    doneColumnIds: new Set(doneColumnIds),
    unblockerIds,
  };
}

export function scoreTasks(
  tasks: RawTask[],
  columns: Map<string, ColumnMeta>,
  ctx: ScoreContext,
): ScoredTask[] {
  const out: ScoredTask[] = [];
  for (const t of tasks) {
    // Skip tasks already in a Done column.
    if (ctx.doneColumnIds.has(t.column_id)) continue;
    const col = columns.get(t.column_id);
    if (!col) continue;

    const due = dueScore(t.due_date);
    const prio = priorityScore(t.priority);
    const size = sizeScore(t);
    const mom = momentumScoreFor(ctx, size.score);
    const anx = anxietyScore(t, ctx, size.estMin);

    // ADHD-mode reweighting: amplify quick wins, penalize large tasks.
    let sizeAdj = size.score;
    if (ctx.adhdMode) {
      if (size.estMin <= 15) sizeAdj += 10;
      if (size.estMin >= 60) sizeAdj -= 10;
    }

    const total = due.score + prio.score + sizeAdj + mom.score + anx.score;

    const reasons = [due.reason, prio.reason, size.reason, mom.reason, anx.reason]
      .filter(Boolean) as string[];

    out.push({
      id: t.id,
      title: t.title,
      description: t.description,
      priority: t.priority,
      due_date: t.due_date,
      column_id: t.column_id,
      column_name: col.name,
      project_name: col.project_name,
      score: total,
      breakdown: {
        due: due.score,
        priority: prio.score,
        size: sizeAdj,
        momentum: mom.score,
        anxiety: anx.score,
      },
      reasons,
      estimatedMinutes: size.estMin,
    });
  }
  return out.sort((a, b) => b.score - a.score);
}

export function impactLabel(score: number): "low" | "medium" | "high" {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

/**
 * "Done" column heuristic — name contains done / complete / shipped / closed.
 */
export function isDoneColumnName(name: string): boolean {
  return /\b(done|complete|completed|shipped|closed|archive|archived)\b/i.test(name);
}
