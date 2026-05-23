import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import RevealSection from "@/components/RevealSection";
import BlogSemanticSearch from "@/components/BlogSemanticSearch";
import { Button } from "@/components/ui/button";
import { ArrowRight, Store, Code, Users, Copy as CopyIcon, Clock, CheckSquare, Zap, ArrowDown } from "lucide-react";

const steps = [
  { icon: Store, title: "Install from Store", desc: "Browse pre-built extensions and install in one click" },
  { icon: Code, title: "Build Your Own", desc: "Write extensions in JavaScript using the Meteor API + MongoDB" },
  { icon: Users, title: "Co-Fund via Spire Club", desc: "Propose or back a feature, share build cost, get lifelong access" },
];

const spireSteps = [
  { num: "1", title: "Propose", desc: "Submit your feature idea" },
  { num: "2", title: "Evaluate", desc: "Developers set the price" },
  { num: "3", title: "Co-fund", desc: "Others who need it contribute" },
  { num: "4", title: "Ship", desc: "Extension gets built" },
  { num: "5", title: "Lifelong Access", desc: "All backers get permanent subscriptions" },
];

export default function ExtensionsPage() {
  useDocumentTitle(
    "Pintask Extensions Store — Build, Install & Customize Your Workflow",
    "Browse Pintask's Extensions Store. Install card mirroring, time tracking, and more — or build your own with JavaScript. Every extension has a free trial."
  );

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="px-6 py-20 md:py-28">
        <RevealSection className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            Your Workflow. Your Extensions. Your Rules.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Install pre-built extensions, build your own with JavaScript, or co-fund new features with the community.
          </p>
          <div className="mt-8">
            <Button size="lg" className="h-12 px-10 text-base" asChild>
              <Link to="/auth">Browse Extensions <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
        </RevealSection>
      </section>

      {/* How It Works */}
      <section className="border-t border-border/40 bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <RevealSection><h2 className="text-center font-heading text-2xl font-bold tracking-tight sm:text-3xl">How Extensions Work</h2>
          <p className="mt-4 text-center text-muted-foreground">Extensions install per user — each person installs what they need. Every paid extension comes with a free trial.</p></RevealSection>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <RevealSection key={s.title} delay={100 + i * 100}>
                <div className="flex flex-col items-center gap-3 rounded-xl border border-border/50 bg-card p-6 text-center shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-base font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Extensions */}
      <section className="border-t border-border/40 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <RevealSection><h2 className="text-center font-heading text-2xl font-bold tracking-tight sm:text-3xl">Featured Extensions</h2></RevealSection>
          <div className="mt-12 space-y-8">
            <RevealSection delay={100}>
              <div className="rounded-xl border border-border/50 bg-card p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <CopyIcon className="h-6 w-6 text-primary" />
                  <h3 className="font-heading text-lg font-semibold">Card & List Mirroring</h3>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">Paid — Free Trial</span>
                </div>
                <p className="mt-3 text-muted-foreground">Mirror any card or entire list across multiple boards. One update, reflected everywhere instantly.</p>
                <div className="mt-4">
                  <p className="text-sm font-medium text-foreground">Use cases:</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
                    <li>Cross-team boards and aggregate dashboards</li>
                    <li>Client-facing board from one source</li>
                    <li>Dependency mapping across departments</li>
                  </ul>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button asChild><Link to="/auth">Start Free Trial</Link></Button>
                  <Button variant="outline">Learn More</Button>
                </div>
              </div>
            </RevealSection>

            <RevealSection delay={200}>
              <div className="rounded-xl border border-border/50 bg-card p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-primary" />
                  <h3 className="font-heading text-lg font-semibold">Hands-Free Time Tracking</h3>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">Paid — Free Trial</span>
                </div>
                <p className="mt-3 text-muted-foreground">Automatic time tracking with timesheet generation and CSV export. No manual timers.</p>
                <div className="mt-4">
                  <p className="text-sm font-medium text-foreground">Use cases:</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
                    <li>Freelancers billing clients by the hour</li>
                    <li>Agencies generating project time reports</li>
                    <li>Teams analyzing where hours go</li>
                  </ul>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button asChild><Link to="/auth">Start Free Trial</Link></Button>
                  <Button variant="outline">Learn More</Button>
                </div>
              </div>
            </RevealSection>
          </div>

          {/* Free Extensions */}
          <div className="mt-12">
            <RevealSection><h3 className="text-center font-heading text-xl font-bold">Free Extensions</h3></RevealSection>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <RevealSection delay={100}>
                <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-card p-5 shadow-sm">
                  <CheckSquare className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <h4 className="font-heading text-sm font-semibold">Checklist Boards</h4>
                    <p className="text-xs text-muted-foreground">Turn any list into a checklist.</p>
                  </div>
                  <Button size="sm" variant="outline" className="ml-auto shrink-0">Install Free</Button>
                </div>
              </RevealSection>
              <RevealSection delay={150}>
                <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-card p-5 shadow-sm">
                  <Zap className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <h4 className="font-heading text-sm font-semibold">Quick Card Actions</h4>
                    <p className="text-xs text-muted-foreground">One-click shortcuts for common operations.</p>
                  </div>
                  <Button size="sm" variant="outline" className="ml-auto shrink-0">Install Free</Button>
                </div>
              </RevealSection>
            </div>
          </div>
        </div>
      </section>

      {/* Build Your Own */}
      <section className="border-t border-border/40 bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <RevealSection>
            <h2 className="text-center font-heading text-2xl font-bold tracking-tight sm:text-3xl">For Developers: Full API Access Included</h2>
            <p className="mt-4 text-center text-muted-foreground">Pintask is the only task tracker that gives you a public JavaScript + Meteor API with MongoDB browser access to build whatever your team needs.</p>
          </RevealSection>
          <RevealSection delay={100}>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                "Custom integrations with any third-party tool",
                "Automated workflows triggered by card actions",
                "Custom views, reports, and dashboards",
                "Bots, notifications, and scheduled actions",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-lg border border-border/50 bg-card p-4">
                  <Code className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Spire Club */}
      <section id="spire-club" className="border-t border-border/40 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <RevealSection>
            <h2 className="text-center font-heading text-2xl font-bold tracking-tight sm:text-3xl">Spire Club — Community-Funded Extensions</h2>
            <p className="mt-4 text-center text-muted-foreground">The crowdfunding model for task tracker features. Don't see what you need? Propose it.</p>
          </RevealSection>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            {spireSteps.map((s, i) => (
              <RevealSection key={s.num} delay={80 + i * 80}>
                <div className="flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-card p-5 text-center shadow-sm min-w-[140px]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">{s.num}</div>
                  <h4 className="font-heading text-sm font-semibold">{s.title}</h4>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/40 bg-muted/30 px-6 py-16">
        <RevealSection className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight">The right extension is waiting. Start with a free trial.</h2>
          <div className="mt-8">
            <Button size="lg" className="h-12 px-10 text-base" asChild>
              <Link to="/auth">Browse the Extensions Store <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">All paid extensions include a free trial. Install, test, subscribe only if you love it.</p>
        </RevealSection>
      </section>
    </MarketingLayout>
  );
}
