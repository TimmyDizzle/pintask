import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

export default function FounderLTDBanner({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Link
        to="/pricing#founder"
        className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
      >
        <Sparkles className="h-3 w-3" />
        Founder Lifetime — $39 (limited)
        <ArrowRight className="h-3 w-3" />
      </Link>
    );
  }
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 md:p-10">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3 w-3" /> Founding Member Offer
          </div>
          <h3 className="mt-3 font-heading text-2xl font-bold tracking-tight md:text-3xl">
            $39 lifetime. Everything we ever ship.
          </h3>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            One payment. Forever access to every current and future extension.
            First 500 spots only — then this offer is gone.
          </p>
        </div>
        <Link
          to="/pricing#founder"
          className="inline-flex h-12 items-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors whitespace-nowrap"
        >
          Claim Founder Spot <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
