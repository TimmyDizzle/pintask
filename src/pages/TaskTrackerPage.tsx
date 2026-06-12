import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import RevealSection from "@/components/RevealSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Database, Store, Users, GitBranch, BarChart3, Bot, Eye } from "lucide-react";
import AdSlot from "@/components/AdSlot";
import { AD_SLOTS } from "@/config/adsense";

const specs = [
  { icon: Code, title: "AI Next Action", desc: "An ADHD-friendly assistant that surfaces the single most important task right now — so you stop staring at the board." },
  { icon: Database, title: "Open Data Export", desc: "Your boards live in an open Postgres schema. Export everything, anytime. No vendor lock-in." },
  { icon: Store, title: "Power-Ups Built In", desc: "Brain Dump, Voice Capture, Momentum Meter, and the AI Assistant — included, not bolted on." },
  { icon: Users, title: "Spire Club", desc: "Propose features, co-fund builds, get lifelong access when they ship." },
];

const buildExamples = [
  { icon: GitBranch, desc: "Wire GitHub up via webhooks — auto-create cards from issues and update status when PRs merge." },
  { icon: BarChart3, desc: "Export your boards to a billing dashboard pulling time tracking data into one report." },
  { icon: Bot, desc: "Schedule a daily standup email with each team member's cards due today via Edge Functions." },
  { icon: Eye, desc: "Build a read-only client view on top of your open Postgres schema — without exposing team notes." },
];

const comparisonData = [
  { feature: "AI Next Action", pintask: "✅", trello: "❌", clickup: "❌", asana: "❌" },
  { feature: "Brain Dump Capture", pintask: "✅", trello: "❌", clickup: "❌", asana: "❌" },
  { feature: "Open Data Export", pintask: "✅", trello: "Limited", clickup: "Limited", asana: "Limited" },
  { feature: "Free Kanban Board", pintask: "✅ Unlimited", trello: "✅ Limited", clickup: "✅ Limited", asana: "✅ Limited" },
  { feature: "Nested Subtasks", pintask: "✅", trello: "❌", clickup: "✅", asana: "Limited" },
  { feature: "Webhook Integrations", pintask: "✅", trello: "Limited", clickup: "Limited", asana: "Limited" },
  { feature: "Starting Price", pintask: "Free", trello: "Free", clickup: "Free", asana: "Free" },
];

export default function TaskTrackerPage() {
  useDocumentTitle(
    "ADHD-Friendly Task Tracker — Pintask",
    "A free task tracker built for brains that get stuck. AI Next Action, Brain Dump, and nested subtasks help you actually start work — no per-seat trap."
  );

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="px-6 py-20 md:py-28">
        <RevealSection className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            The Task Tracker for Brains That Get Stuck
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            A free task tracker with AI Next Action, Brain Dump capture, and nested subtasks. Built for ADHD brains — works for everyone.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="h-12 px-10 text-base" asChild>
              <Link to="/auth">Start Free <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <Link to="/features">See All Features</Link>
            </Button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">✓ AI Next Action  ✓ Free Kanban board  ✓ Open data export</p>
        </RevealSection>
      </section>

      {/* Problem */}
      <section className="border-t border-border/40 bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <RevealSection>
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl text-center">
              Every other task tool shows you a wall of tasks. We tell you which one to do next.
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              You open your board. Twenty cards stare back. You scroll, refresh, reorganize — and somehow it's 4pm and nothing shipped. Most task tools assume you already know what to do. ADHD brains don't always.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Pintask breaks the cycle. AI Next Action surfaces the single most important task right now. Break It Down splits it into doable steps. Brain Dump catches the rest before it floats away.
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

      <section className="px-6 pb-4">
        <div className="mx-auto max-w-4xl">
          <AdSlot slot={AD_SLOTS.taskTrackerPage} />
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
