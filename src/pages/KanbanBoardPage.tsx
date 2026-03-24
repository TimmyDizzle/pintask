import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import RevealSection from "@/components/RevealSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, Layers, Palette, Vote, Settings, Copy as CopyIcon, CheckSquare, CalendarClock, Code, Briefcase, Target, Users, Wrench } from "lucide-react";

const coreFeatures = [
  { icon: Layers, title: "Boards, Lists & Cards", desc: "Full drag-and-drop Kanban. Assign members, set deadlines, attach files, add comments." },
  { icon: Palette, title: "Color Labels & Filters", desc: "Organize at a glance. Filter by member, label, or due date." },
  { icon: Vote, title: "Card Voting", desc: "Built-in team prioritization — no third-party poll tool needed." },
  { icon: Settings, title: "Board-Level Permissions", desc: "Invite members, set backgrounds, control access." },
];

const advancedFeatures = [
  { icon: Layers, title: "Nested Lists Inside Cards", desc: "A card can contain full lists. Those lists contain cards. True task hierarchy for complex projects." },
  { icon: CopyIcon, title: "Card & List Mirroring", desc: "Mirror any card or list to another board. One update reflects everywhere. Perfect for cross-team visibility." },
  { icon: CheckSquare, title: "Checklist Boards", desc: "Turn any list into a checklist. Track completion progress visually." },
  { icon: CalendarClock, title: "Timeline View", desc: "Switch to Timeline to see all cards chronologically." },
];

const useCases = [
  { icon: Code, title: "Development Teams", desc: "Sprint planning, bug tracking, feature queues. Nest acceptance criteria. Mirror stories to your team lead's board." },
  { icon: Target, title: "Marketing Teams", desc: "Campaign boards, content calendars, launch checklists. Mirror your pipeline to a client board." },
  { icon: Briefcase, title: "Agencies & Freelancers", desc: "Client boards + master dashboard. Track billable hours hands-free. Export CSV timesheets." },
  { icon: Wrench, title: "Operations Teams", desc: "Process boards, SOP checklists. Build custom automations with the JS API." },
];

export default function KanbanBoardPage() {
  useDocumentTitle(
    "The Most Customizable Kanban Board — Pintask",
    "A free, powerful Kanban board that adapts to your workflow. Extend with JavaScript, nest cards, mirror lists. Make it yours."
  );

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="px-6 py-20 md:py-28">
        <RevealSection className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            The Most Customizable Kanban Board on the Web
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            A free, powerful Kanban board that adapts to your workflow — not the other way around. Extend it with JavaScript. Nest it. Mirror it. Make it yours.
          </p>
          <div className="mt-8">
            <Button size="lg" className="h-12 px-10 text-base" asChild>
              <Link to="/auth">Create Your Free Board <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
        </RevealSection>
      </section>

      {/* Core */}
      <section className="border-t border-border/40 bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <RevealSection><h2 className="text-center font-heading text-2xl font-bold tracking-tight sm:text-3xl">Core Features</h2></RevealSection>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {coreFeatures.map((f, i) => (
              <RevealSection key={f.title} delay={80 + i * 80}>
                <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><f.icon className="h-5 w-5" /></div>
                  <h3 className="mt-4 font-heading text-base font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced */}
      <section className="border-t border-border/40 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <RevealSection><h2 className="text-center font-heading text-2xl font-bold tracking-tight sm:text-3xl">Advanced Features</h2></RevealSection>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {advancedFeatures.map((f, i) => (
              <RevealSection key={f.title} delay={80 + i * 80}>
                <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><f.icon className="h-5 w-5" /></div>
                  <h3 className="mt-4 font-heading text-base font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Extensions */}
      <section className="border-t border-border/40 bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <RevealSection>
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">Extend Your Kanban Board Like a Developer</h2>
            <p className="mt-4 text-muted-foreground">Pintask is the only Kanban board with a public JavaScript + Meteor API and MongoDB browser access.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary">Card & List Mirroring (Paid)</span>
              <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary">Hands-Free Time Tracking (Paid)</span>
              <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary">Custom Extensions (Free)</span>
            </div>
            <div className="mt-6">
              <Button variant="outline" asChild><Link to="/extensions">Explore the Extensions Store <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Use Cases */}
      <section className="border-t border-border/40 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <RevealSection><h2 className="text-center font-heading text-2xl font-bold tracking-tight sm:text-3xl">Built For Every Team</h2></RevealSection>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {useCases.map((c, i) => (
              <RevealSection key={c.title} delay={80 + i * 80}>
                <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><c.icon className="h-5 w-5" /></div>
                  <h3 className="mt-4 font-heading text-base font-semibold">{c.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/40 bg-muted/30 px-6 py-16">
        <RevealSection className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight">Your workflow is unique. Your Kanban board should be too.</h2>
          <div className="mt-8">
            <Button size="lg" className="h-12 px-10 text-base" asChild>
              <Link to="/auth">Build Your Free Kanban Board <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
        </RevealSection>
      </section>
    </MarketingLayout>
  );
}
