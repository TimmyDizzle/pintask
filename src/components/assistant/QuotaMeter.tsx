import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useAssistantQuota } from "@/hooks/useAssistantQuota";

export function QuotaMeter() {
  const { data, isLoading } = useAssistantQuota();
  if (isLoading || !data) {
    return <div className="h-2 w-full rounded bg-muted animate-pulse" />;
  }
  const pct = Math.min(100, Math.round((data.tokens_used / Math.max(data.tokens_limit, 1)) * 100));
  const resetDate = new Date(data.period_end).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const over = data.tokens_used >= data.tokens_limit;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {data.tokens_used.toLocaleString()} / {data.tokens_limit.toLocaleString()} tokens
        </span>
        <span className="text-muted-foreground">resets {resetDate}</span>
      </div>
      <Progress value={pct} className={over ? "[&>div]:bg-destructive" : ""} />
      {over && (
        <p className="text-xs text-destructive">
          Monthly quota reached.{" "}
          <Link to="/billing" className="underline font-medium">
            Upgrade
          </Link>{" "}
          for more.
        </p>
      )}
    </div>
  );
}
