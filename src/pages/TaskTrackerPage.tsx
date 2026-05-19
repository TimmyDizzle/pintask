import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import RevealSection from "@/components/RevealSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Database, Store, Users, GitBranch, BarChart3, Bot, Eye } from "lucide-react";
import AdSlot from "@/components/AdSlot";

const specs = [
  { icon: Code, title: "JavaScript + Meteor API", desc: "Write extensions using the Meteor framework. Full access to board, list, card, and user data." },
  { icon: Database, title: "MongoDB Browser Access", desc: "Direct MongoDB access from the browser. Query your task data the way a developer expects." },
  { icon: Store, title: "Extensions Store", desc: "Install or publish extensions. Extensions are per-user — like an App Store for your workflow." },
  { icon: Users, title: "Spire Club", desc: "Propose features, co-fund builds, get lifelong access when they ship." },
];

const buildExamples = [
  { icon: GitBranch, desc: "A GitHub integration that auto-creates cards from issues and updates status when PRs merge." },
  { icon: BarChart3, desc: "A billing dashboard pulling time tracking data from all client boards into one exportable report." },
  { icon: Bot, desc: "An automated standup bot that emails each team member their cards due today at 9am." },
  { icon: Eye, desc: "A board mirroring system that gives clients a read-only project view without exposing team notes." },
];

const comparisonData = [
  { feature: "Full JavaScript API", pintask: "✅", trello: "❌", clickup: "Limited", asana: "Limited" },
  { feature: "MongoDB Browser Access", pintask: "✅", trello: "❌", clickup: "❌", asana: "❌" },
  { feature: "Build & Publish Extensions", pintask: "✅", trello: "❌", clickup: "❌", asana: "❌" },
  { feature: "Free Kanban Board", pintask: "✅ Unlimited", trello: "✅ Limited", clickup: "✅ Limited", asana: "✅ Limited" },
  { feature: "Nested Cards/Lists", pintask: "✅", trello: "❌", clickup: "✅", asana: "Limited" },
  { feature: "Card Mirroring", pintask: "✅", trello: "❌", clickup: "❌", asana: "❌" },
  { feature: "Starting Price", pintask: "Free", trello: "Free", clickup: "Free", asana: "Free" },
];

export default function TaskTrackerPage() {
  useDocumentTitle(
    "Task Tracker for Developers — Pintask",
    "A free task tracker with a full JavaScript + Meteor API and MongoDB browser access. Build exactly the workflow your team needs — no workarounds."
  );

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="px-6 py-20 md:py-28">
        <RevealSection className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            The Task Tracker for Developers Who Are Done Compromising
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            A free task tracker with a full JavaScript + Meteor API and MongoDB browser access. Build exactly the workflow your team needs — no workarounds.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="h-12 px-10 text-base" asChild>
              <Link to="/auth">Start Building Free <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <Link to="/features">Read the API Docs</Link>
            </Button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">✓ Full JS API  ✓ Free Kanban board  ✓ MongoDB browser access</p>
        </RevealSection>
      </section>

      {/* Problem */}
      <section className="border-t border-border/40 bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <RevealSection>
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl text-center">
              Every other task tool says "submit a feature request." We say "build it yourself."
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              You adopt a task tool. It almost works. There's one workflow it doesn't support. You submit a feature request. It sits there for 3 years. You build a workaround. The workaround breaks. You try a new tool. Repeat.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Pintask breaks the cycle. With a full JavaScript + Meteor API, MongoDB browser access, and an Extensions Store where you can publish your own extensions.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* Technical Specs */}
      <section className="border-t border-border/40 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <RevealSection><h2 className="text-center font-heading text-2xl font-bold tracking-tight sm:text-3xl">Technical Specs</h2></RevealSection>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {specs.map((s, i) => (
              <RevealSection key={s.title} delay={80 + i * 80}>
                <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><s.icon className="h-5 w-5" /></div>
                  <h3 className="mt-4 font-heading text-base font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* What You Can Build */}
      <section className="border-t border-border/40 bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <RevealSection><h2 className="text-center font-heading text-2xl font-bold tracking-tight sm:text-3xl">What You Can Build</h2></RevealSection>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {buildExamples.map((ex, i) => (
              <RevealSection key={i} delay={80 + i * 80}>
                <div className="flex items-start gap-4 rounded-xl border border-border/50 bg-card p-5 shadow-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><ex.icon className="h-4 w-4" /></div>
                  <p className="text-sm text-muted-foreground">{ex.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="border-t border-border/40 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <RevealSection><h2 className="text-center font-heading text-2xl font-bold tracking-tight sm:text-3xl mb-10">How Pintask Compares</h2></RevealSection>
          <RevealSection delay={100}>
            <div className="overflow-x-auto rounded-xl border border-border/50 bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/50">
                    <th className="px-4 py-3 text-left font-heading font-semibold">Capability</th>
                    <th className="px-4 py-3 text-center font-heading font-semibold text-primary">Pintask</th>
                    <th className="px-4 py-3 text-center font-heading font-semibold text-muted-foreground">Trello</th>
                    <th className="px-4 py-3 text-center font-heading font-semibold text-muted-foreground">ClickUp</th>
                    <th className="px-4 py-3 text-center font-heading font-semibold text-muted-foreground">Asana</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row) => (
                    <tr key={row.feature} className="border-b border-border/30 last:border-0">
                      <td className="px-4 py-3 font-medium">{row.feature}</td>
                      <td className="px-4 py-3 text-center text-primary font-medium">{row.pintask}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{row.trello}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{row.clickup}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{row.asana}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/40 bg-muted/30 px-6 py-16">
        <RevealSection className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight">Stop waiting for a feature request that will never ship.</h2>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="h-12 px-10 text-base" asChild>
              <Link to="/auth">Start Building Free <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <Link to="/features">View API Documentation</Link>
            </Button>
          </div>
        </RevealSection>
      </section>
    </MarketingLayout>
  );
}
