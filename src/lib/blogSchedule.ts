/** Weekly slots: Thursdays at 15:00 UTC (09:00 Chicago in winter). */
export function nextWeeklyPublishDate(dates: (string | null)[], now = new Date()): string {
  const slot = new Date(now);
  slot.setUTCHours(15, 0, 0, 0);
  slot.setUTCDate(slot.getUTCDate() + ((4 - slot.getUTCDay() + 7) % 7));
  if (slot <= now) slot.setUTCDate(slot.getUTCDate() + 7);
  const occupied = new Set(dates.filter((date): date is string => Boolean(date)).map(date => new Date(date).toISOString().slice(0, 10)));
  while (occupied.has(slot.toISOString().slice(0, 10))) slot.setUTCDate(slot.getUTCDate() + 7);
  return slot.toISOString();
}

export function validateScheduledPost(status: string, date: string | null, content: string): void {
  if (status !== "scheduled") return;
  if (!date || !Number.isFinite(new Date(date).getTime())) throw new Error("Choose a publish date before scheduling.");
  if (!content.trim()) throw new Error("Add the article content before scheduling.");
}