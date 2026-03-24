import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, X } from "lucide-react";

const comparisons = [
  { feature: "Free plan", pintask: true, trello: true },
  { feature: "Built-in time tracking", pintask: true, trello: false },
  { feature: "Keyboard-first navigation", pintask: true, trello: false },
  { feature: "AI assistant", pintask: "Coming Soon", trello: false },
  { feature: "Custom column colors", pintask: true, trello: false },
  { feature: "Image attachments", pintask: true, trello: true },
  { feature: "No Power-Up limits", pintask: true, trello: false },
  { feature: "Reports & analytics", pintask: true, trello: "Paid only" },
  { feature: "Offline PWA support", pintask: true, trello: false },
  { feature: "Open Beta pricing", pintask: "Free", trello: "N/A" },
];

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="h-5 w-5 text-primary" />;
  if (value === false) return <X className="h-5 w-5 text-muted-foreground/40" />;
  return <span className="text-sm text-muted-foreground">{value}</span>;
}

export default function TrelloAlternativePage() {
  useDocumentTitle("Trello Alternative — Pintask");

  return (
    <MarketingLayout>
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            The Trello alternative built for speed
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Love Kanban boards but frustrated by Trello's limitations? Pintask gives you the simplicity you want with the power features you need — no Power-Ups required.
          </p>
        </div>
      </section>

      <section className="border-t border-border/40 bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-heading text-2xl font-bold tracking-tight mb-10">Pintask vs Trello</h2>
          <div className="overflow-x-auto rounded-xl border border-border/50 bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-6 py-4 text-left font-heading font-semibold">Feature</th>
                  <th className="px-6 py-4 text-center font-heading font-semibold text-primary">Pintask</th>
                  <th className="px-6 py-4 text-center font-heading font-semibold text-muted-foreground">Trello</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row) => (
                  <tr key={row.feature} className="border-b border-border/30 last:border-0">
                    <td className="px-6 py-3">{row.feature}</td>
                    <td className="px-6 py-3 text-center"><div className="flex justify-center"><CellValue value={row.pintask} /></div></td>
                    <td className="px-6 py-3 text-center"><div className="flex justify-center"><CellValue value={row.trello} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-t border-border/40 px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight">Switch to Pintask today</h2>
          <p className="mt-4 text-muted-foreground">No credit card. No commitment. Just better task management.</p>
          <div className="mt-8">
            <Button size="lg" className="h-12 px-10 text-base" asChild>
              <Link to="/auth">Try Pintask Free <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
