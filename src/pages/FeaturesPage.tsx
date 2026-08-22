import { useState } from "react";
import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import RevealSection from "@/components/RevealSection";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, CheckSquare, Clock, Tags, Image, Keyboard, BarChart3,
  BrainCircuit, Layers, Vote, Settings, Paperclip, MessageSquare,
  Copy as CopyIcon, CalendarClock, FileSpreadsheet, Download,
  Import, Calendar, Mail, MessageCircle, Code, Database, Store, Rocket, Check, X,
} from "lucide-react";

const headlineVariants = [
  {
    id: "A",
    label: "A · Manage & Build",
    render: () => (
      <>
        Everything You Need to Manage Work —{" "}
        <span className="text-primary">Plus Everything You Want</span> to Build
      </>
    ),
  },
  {
    id: "B",
    label: "B · Works & Bends",
    render: () => (
      <>
        A Kanban Board That Works —{" "}
        <span className="text-primary">And Bends to Fit You</span>
      </>
    ),
  },
  {
    id: "C",
    label: "C · Today & Tomorrow",
    render: () => (
      <>
        Manage Today's Work.{" "}
        <span className="text-primary">Build Tomorrow's Workflow.</span>
      </>
    ),
  },
] as const;

const coreFeatures = [
  { icon: CheckSquare, title: "Kanban Boards, Lists & Cards", desc: "Drag-and-drop boards with unlimited lists and cards. Assign members, set due dates, attach files, add color labels, and leave comments — all on the free plan." },
  { icon: Layers, title: "Nested Lists Inside Cards", desc: "Go deeper than any other Kanban tool. Nest full lists inside cards, and cards inside those lists. Build real task hierarchies for complex projects without workarounds." },
  { icon: Vote, title: "Card Voting", desc: "Let your team vote up or down on cards directly. Built-in prioritization — no external polling tool needed." },
  { icon: Settings, title: "Board Customization", desc: "Set board backgrounds, invite members via email, and control permissions from the board settings panel." },
  { icon: Paperclip, title: "File Attachments", desc: "Attach files directly to any card. Share assets, documents, and deliverables right where the work lives." },
  { icon: MessageSquare, title: "Comments & Activity Feed", desc: "Leave comments, @mention teammates, and track every change in the card activity feed." },
];

const powerFeatures = [
  { icon: CopyIcon, title: "Card & List Mirroring", badge: "Paid Extension", desc: "Mirror any card or entire list to another board. One update reflects everywhere simultaneously." },
  { icon: CalendarClock, title: "Timeline View", desc: "Switch to Timeline to see all cards chronologically. Zoom out for a project-wide view." },
  { icon: Keyboard, title: "Quick Actions", desc: "One-click actions for cards and lists — duplicate, copy, archive, move, or delete instantly." },
];

const timeFeatures = [
  { icon: Clock, title: "Hands-Free Time Tracking", badge: "Paid Extension", desc: "Start working on a card and Pintask tracks time automatically. No manual start/stop." },
  { icon: FileSpreadsheet, title: "Timesheet Generation", desc: "Every time entry rolls up into clean, exportable timesheets." },
  { icon: Download, title: "CSV Export", desc: "Export timesheets to CSV for billing, payroll, or client reporting." },
];

const integrations = [
  { icon: Import, title: "Trello Import", desc: "2-click import" },
  { icon: Calendar, title: "Google Calendar", desc: "Sync deadlines" },
  { icon: Calendar, title: "Outlook & iCal", desc: "Calendar sync" },
  { icon: MessageCircle, title: "Slack", desc: "Real-time notifications" },
  { icon: Mail, title: "Board Email", desc: "Forward emails → cards" },
];

const devFeatures = [
  { icon: Code, title: "AI Next Action", desc: "An ADHD-friendly assistant that surfaces the single most important task right now — and helps you break it down." },
  { icon: Database, title: "Open Data, Open Export", desc: "Your boards live in an open Postgres schema. Export everything, anytime — your data is yours." },
  { icon: Store, title: "Power-Ups Built In", desc: "Brain Dump, Voice Capture, Momentum Meter, and the AI Assistant — included, not bolted on." },
  { icon: Rocket, title: "Webhook-Friendly", desc: "Edge Functions let you wire Pintask into the rest of your stack without a brittle plugin system." },
];

const comparisonData = [
  { feature: "Kanban Boards", pf: "✅ Unlimited", pp: "✅", tf: "✅ Limited", tp: "✅" },
  { feature: "Unlimited Cards", pf: "✅", pp: "✅", tf: "✅", tp: "✅" },
  { feature: "Nested Lists in Cards", pf: "✅", pp: "✅", tf: "❌", tp: "❌" },
  { feature: "Card & List Mirroring", pf: "❌", pp: "✅", tf: "❌", tp: "❌" },
  { feature: "Hands-Free Time Tracking", pf: "❌", pp: "✅", tf: "❌", tp: "❌" },
  { feature: "AI Next Action", pf: "✅", pp: "✅", tf: "❌", tp: "❌" },
  { feature: "Brain Dump Capture", pf: "✅", pp: "✅", tf: "❌", tp: "❌" },
  { feature: "Trello Import", pf: "✅ 2 clicks", pp: "✅", tf: "N/A", tp: "N/A" },
  { feature: "Google Calendar Sync", pf: "✅", pp: "✅", tf: "❌", tp: "✅" },
  { feature: "Slack Integration", pf: "✅", pp: "✅", tf: "❌", tp: "✅" },
  { feature: "Open Data Export", pf: "✅", pp: "✅", tf: "Limited", tp: "Limited" },
];

function CellIcon({ val }: { val: string }) {
  if (val.startsWith("✅")) return <span className="text-primary font-medium">{val.replace("✅ ", "").replace("✅", "✓")}</span>;
  if (val.startsWith("❌")) return <span className="text-muted-foreground/40">✗</span>;
  return <span className="text-sm text-muted-foreground">{val}</span>;
}

function FeatureGrid({ items, cols = 3 }: { items: typeof coreFeatures; cols?: number }) {
  const colClass = cols === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2";
  return (
    <div className={`grid gap-6 ${colClass}`}>
      {items.map((f, i) => (
        <RevealSection key={f.title} delay={80 + i * 60}>
          <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-md transition-shadow h-full">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              {"badge" in f && f.badge && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{(f as any).badge}</span>
              )}
            </div>
            <h3 className="mt-4 font-heading text-base font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        </RevealSection>
      ))}
    </div>
  );
}

export default function FeaturesPage() {
  useDocumentTitle(
    "Pintask Features — Customizable Kanban Board with Extensions",
    "Explore every Pintask feature: nested cards, board mirroring, hands-free time tracking, JavaScript extensions, Trello import, calendar sync, and more. Free to start."
  );

  const [variant, setVariant] = useState<(typeof headlineVariants)[number]["id"]>("A");
  const active = headlineVariants.find((v) => v.id === variant) ?? headlineVariants[0];

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="px-6 py-20 md:py-28">
        <RevealSection className="mx-auto max-w-3xl text-center">
          {/* Headline variant toggle */}
          <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Headline preview
            </span>
            {headlineVariants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariant(v.id)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  variant === v.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
          <h1 className="font-heading text-[2.25rem] font-extrabold tracking-tight sm:text-5xl md:text-6xl leading-[1.08]">
            {active.render()}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Pintask ships with a powerful free Kanban board out of the box. Then it hands you the keys to extend, customize, and automate anything you need.
          </p>
          <div className="mt-8">
            <Button size="lg" className="h-12 px-10 text-base" asChild>
              <Link to="/auth">Start Free <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
        </RevealSection>
      </section>

      {/* Core Features */}
      <section className="border-t border-border/40 bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <RevealSection><h2 className="text-center font-heading text-2xl font-bold tracking-tight sm:text-3xl">Core Kanban Features (Free)</h2></RevealSection>
          <div className="mt-12"><FeatureGrid items={coreFeatures} /></div>
        </div>
      </section>

      {/* Power Features */}
      <section className="border-t border-border/40 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <RevealSection><h2 className="text-center font-heading text-2xl font-bold tracking-tight sm:text-3xl">Power Features</h2></RevealSection>
          <div className="mt-12"><FeatureGrid items={powerFeatures} /></div>
        </div>
      </section>

      {/* Time Tracking */}
      <section className="border-t border-border/40 bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <RevealSection><h2 className="text-center font-heading text-2xl font-bold tracking-tight sm:text-3xl">Time Tracking</h2></RevealSection>
          <div className="mt-12"><FeatureGrid items={timeFeatures} /></div>
        </div>
      </section>

      {/* Integrations */}
      <section className="border-t border-border/40 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <RevealSection><h2 className="text-center font-heading text-2xl font-bold tracking-tight sm:text-3xl">Integrations</h2></RevealSection>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {integrations.map((item, i) => (
              <RevealSection key={item.title} delay={80 + i * 60}>
                <div className="flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-card p-5 text-center shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><item.icon className="h-5 w-5" /></div>
                  <span className="text-sm font-medium">{item.title}</span>
                  <span className="text-xs text-muted-foreground">{item.desc}</span>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Features */}
      <section className="border-t border-border/40 bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <RevealSection><h2 className="text-center font-heading text-2xl font-bold tracking-tight sm:text-3xl">Developer Features</h2></RevealSection>
          <div className="mt-12"><FeatureGrid items={devFeatures} cols={2} /></div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="border-t border-border/40 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <RevealSection><h2 className="text-center font-heading text-2xl font-bold tracking-tight sm:text-3xl mb-10">Feature Comparison</h2></RevealSection>
          <RevealSection delay={100}>
            <div className="overflow-x-auto rounded-xl border border-border/50 bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/50">
                    <th className="px-4 py-3 text-left font-heading font-semibold">Feature</th>
                    <th className="px-4 py-3 text-center font-heading font-semibold text-primary">Pintask Free</th>
                    <th className="px-4 py-3 text-center font-heading font-semibold text-primary">Pintask Paid</th>
                    <th className="px-4 py-3 text-center font-heading font-semibold text-muted-foreground">Trello Free</th>
                    <th className="px-4 py-3 text-center font-heading font-semibold text-muted-foreground">Trello Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row) => (
                    <tr key={row.feature} className="border-b border-border/30 last:border-0">
                      <td className="px-4 py-3 font-medium">{row.feature}</td>
                      <td className="px-4 py-3 text-center"><CellIcon val={row.pf} /></td>
                      <td className="px-4 py-3 text-center"><CellIcon val={row.pp} /></td>
                      <td className="px-4 py-3 text-center"><CellIcon val={row.tf} /></td>
                      <td className="px-4 py-3 text-center"><CellIcon val={row.tp} /></td>
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
          <h2 className="font-heading text-3xl font-bold tracking-tight">Ready to use a task tracker that grows with you?</h2>
          <p className="mt-4 text-muted-foreground">Start free. Extend when you're ready. Build what you need.</p>
          <div className="mt-8">
            <Button size="lg" className="h-12 px-10 text-base" asChild>
              <Link to="/auth">Create Your Free Board <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">No credit card required. Extensions available with free trials.</p>
        </RevealSection>
      </section>
    </MarketingLayout>
  );
}
