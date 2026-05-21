import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import RevealSection from "@/components/RevealSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, X, Shield, Zap, Code, Clock } from "lucide-react";
import AdSlot from "@/components/AdSlot";
import { AD_SLOTS } from "@/config/adsense";

const comparisonData = [
  { feature: "Kanban Boards", pintask: "✅ Free", trelloFree: "✅ Free", trelloPaid: "✅" },
  { feature: "Unlimited Cards & Lists", pintask: "✅ Free", trelloFree: "✅ Free", trelloPaid: "✅" },
  { feature: "Nested Lists Inside Cards", pintask: "✅ Free", trelloFree: "❌", trelloPaid: "❌" },
  { feature: "Card & List Mirroring", pintask: "✅ Paid ext", trelloFree: "❌", trelloPaid: "❌" },
  { feature: "Custom JS Extensions", pintask: "✅ Full API", trelloFree: "❌", trelloPaid: "❌" },
  { feature: "Hands-Free Time Tracking", pintask: "✅ Paid ext", trelloFree: "❌", trelloPaid: "❌" },
  { feature: "Trello Import", pintask: "✅ 2 clicks", trelloFree: "N/A", trelloPaid: "N/A" },
  { feature: "Google Calendar Sync", pintask: "✅ Free", trelloFree: "❌", trelloPaid: "✅" },
  { feature: "Slack Integration", pintask: "✅ Free", trelloFree: "❌", trelloPaid: "✅" },
  { feature: "Build Your Own Features", pintask: "✅ Full JS API", trelloFree: "❌", trelloPaid: "❌" },
  { feature: "Starting Price", pintask: "Free", trelloFree: "Free", trelloPaid: "$5/user/mo" },
];

const switchReasons = [
  { icon: Shield, title: "Trello Hit a Wall", desc: "The moment your project gets complex, Trello runs out of road. Pintask starts where Trello stops." },
  { icon: Zap, title: "You're Paying for Things That Should Be Free", desc: "Trello's Power-Ups are features gated behind a paywall. Pintask's core is free. Extensions are optional." },
  { icon: Code, title: "Pintask Gives You API Access", desc: "Trello gives you a limited API. Pintask gives you full JavaScript + Meteor API with MongoDB browser access." },
  { icon: Clock, title: "The Switch Takes 2 Minutes", desc: "Import your entire Trello workspace — all boards, all lists, all cards — in exactly 2 clicks." },
];

const switchSteps = [
  "Create your free Pintask account at pintask.online",
  "Click 'Import' and select Trello as your source",
  "Authorize your Trello account — boards transfer instantly",
  "Invite your team and keep moving",
];

export default function TrelloAlternativePage() {
  useDocumentTitle(
    "Best Trello Alternative 2026 — Pintask",
    "Everything Trello does — plus nested cards, board mirroring, custom extensions, and time tracking. Free forever. Import your Trello boards in 2 clicks."
  );

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="px-6 py-20 md:py-28">
        <RevealSection className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            The Best Trello Alternative in 2026
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Everything Trello does — plus nested cards, board mirroring, custom extensions, and time tracking. Free forever. Import your Trello boards in 2 clicks.
          </p>
          <div className="mt-8">
            <Button size="lg" className="h-12 px-10 text-base" asChild>
              <Link to="/auth">Import My Trello Boards Free <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">✓ 2-click import  ✓ No card required  ✓ Free forever</p>
        </RevealSection>
      </section>

      {/* Comparison */}
      <section className="border-t border-border/40 bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <RevealSection><h2 className="text-center font-heading text-2xl font-bold tracking-tight sm:text-3xl mb-10">Pintask vs. Trello — Side by Side</h2></RevealSection>
          <RevealSection delay={100}>
            <div className="overflow-x-auto rounded-xl border border-border/50 bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/50">
                    <th className="px-4 py-3 text-left font-heading font-semibold">Feature</th>
                    <th className="px-4 py-3 text-center font-heading font-semibold text-primary">Pintask</th>
                    <th className="px-4 py-3 text-center font-heading font-semibold text-muted-foreground">Trello Free</th>
                    <th className="px-4 py-3 text-center font-heading font-semibold text-muted-foreground">Trello Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row) => (
                    <tr key={row.feature} className="border-b border-border/30 last:border-0">
                      <td className="px-4 py-3 font-medium">{row.feature}</td>
                      <td className="px-4 py-3 text-center text-primary font-medium">{row.pintask}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{row.trelloFree}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{row.trelloPaid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Why Switch */}
      <section className="border-t border-border/40 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <RevealSection><h2 className="text-center font-heading text-2xl font-bold tracking-tight sm:text-3xl">Why Teams Switch to Pintask</h2></RevealSection>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {switchReasons.map((r, i) => (
              <RevealSection key={r.title} delay={100 + i * 80}>
                <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-md transition-shadow h-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <r.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-heading text-base font-semibold">{r.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{r.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* How to Switch */}
      <section className="border-t border-border/40 bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <RevealSection><h2 className="text-center font-heading text-2xl font-bold tracking-tight sm:text-3xl">How to Switch in 4 Steps</h2></RevealSection>
          <div className="mt-10 space-y-4">
            {switchSteps.map((step, i) => (
              <RevealSection key={i} delay={100 + i * 80}>
                <div className="flex items-start gap-4 rounded-xl border border-border/50 bg-card p-5 shadow-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">{i + 1}</div>
                  <p className="text-sm pt-1">{step}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-4">
        <div className="mx-auto max-w-4xl">
          <AdSlot slot={AD_SLOTS.trelloPage} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/40 px-6 py-16">
        <RevealSection className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight">Ready to build a better workflow than Trello ever gave you?</h2>
          <div className="mt-8">
            <Button size="lg" className="h-12 px-10 text-base" asChild>
              <Link to="/auth">Start Your Free Pintask Board <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">No credit card. Trello import takes 2 clicks.</p>
        </RevealSection>
      </section>
    </MarketingLayout>
  );
}
