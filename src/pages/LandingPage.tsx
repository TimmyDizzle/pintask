import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  CheckSquare,
  Clock,
  Tags,
  Image,
  Keyboard,
  BarChart3,
  ArrowRight,
  Sparkles,
  BrainCircuit,
  X,
} from "lucide-react";
import kanbanDragGif from "@/assets/kanban-drag.gif";
import tourScreensGif from "@/assets/tour-screens.gif";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const features = [
  {
    icon: CheckSquare,
    title: "Kanban Boards",
    desc: "Drag-and-drop task management with customizable columns and priorities.",
  },
  {
    icon: Clock,
    title: "Time Tracking",
    desc: "Built-in timer on every task. Know exactly where your hours go.",
  },
  {
    icon: Tags,
    title: "Labels & Comments",
    desc: "Organize with color-coded labels and collaborate through task comments.",
  },
  {
    icon: Image,
    title: "Image Attachments",
    desc: "Attach screenshots and reference images directly to tasks or projects.",
  },
  {
    icon: Keyboard,
    title: "Keyboard Shortcuts",
    desc: "Navigate and manage everything without touching your mouse.",
  },
  {
    icon: BarChart3,
    title: "Reports & Insights",
    desc: "Visualize productivity with time and task completion reports.",
  },
];

const revealBase = "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]";
const revealHidden = "opacity-0 translate-y-5 blur-[4px]";
const revealVisible = "opacity-100 translate-y-0 blur-0";

function RevealSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });
  return (
    <div
      ref={ref}
      className={`${revealBase} ${isVisible ? revealVisible : revealHidden} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const testimonials = [
  {
    quote:
      "I used the original Pintask.me for years. When it went away I tried everything — Trello, ClickUp, Notion. Nothing felt this clean again until now. This is exactly what I needed.",
    name: "James R.",
    role: "Freelance Developer",
  },
  {
    quote:
      "The keyboard shortcuts alone make this worth it. I can add, move, and close tasks without ever touching my mouse. No other tool I've tried does this as well.",
    name: "Priya M.",
    role: "Product Designer",
  },
  {
    quote:
      "I manage 4 client projects and my personal life in one place. The custom columns are a game changer — I have a 'Bills to Pay' board right next to my client work. No other app lets me do that this simply.",
    name: "Derek T.",
    role: "Independent Consultant",
  },
];

export default function LandingPage() {
  const [showAiBanner, setShowAiBanner] = useState(true);
  const heroReveal = useScrollReveal({ threshold: 0.1 });
  const shotReveal = useScrollReveal({ threshold: 0.1 });
  const featuresReveal = useScrollReveal({ threshold: 0.1 });
  const pricingReveal = useScrollReveal({ threshold: 0.1 });
  const comparisonReveal = useScrollReveal({ threshold: 0.1 });
  const proofReveal = useScrollReveal({ threshold: 0.15 });
  const ctaReveal = useScrollReveal({ threshold: 0.2 });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2 font-heading text-xl font-bold text-primary">
            <CheckSquare className="h-6 w-6" />
            Pintask
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <a href="#features">Features</a>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">
                Try it Free <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-16 pt-20 md:pt-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div
          ref={heroReveal.ref}
          className={`mx-auto max-w-3xl text-center ${revealBase} duration-1000 ${heroReveal.isVisible ? revealVisible : revealHidden}`}
        >
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary ${revealBase} ${heroReveal.isVisible ? revealVisible : revealHidden}`}
            style={{ transitionDelay: "100ms" }}
          >
            🔁 Pintask is back — and it brought AI with it
          </div>
          <h1
            className={`mt-6 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl leading-[1.08] ${revealBase} ${heroReveal.isVisible ? revealVisible : revealHidden}`}
            style={{ transitionDelay: "200ms" }}
          >
            Organize your work.
            <br />
            <span className="text-primary">Track your time.</span>
            <br />
            Ship faster.
          </h1>
          <p
            className={`mx-auto mt-6 max-w-xl text-lg text-muted-foreground ${revealBase} ${heroReveal.isVisible ? revealVisible : revealHidden}`}
            style={{ transitionDelay: "350ms" }}
          >
            Same clean simplicity you loved, rebuilt from the ground up — now with
            an AI assistant that writes your daily briefing, breaks down your tasks,
            and keeps you moving.
          </p>
          <div
            className={`mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center ${revealBase} ${heroReveal.isVisible ? revealVisible : revealHidden}`}
            style={{ transitionDelay: "500ms" }}
          >
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link to="/auth">
                Try Pintask Free <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <a href="#features">See Features</a>
            </Button>
          </div>
          <p
            className={`mt-3 text-sm text-muted-foreground ${revealBase} ${heroReveal.isVisible ? revealVisible : revealHidden}`}
            style={{ transitionDelay: "600ms" }}
          >
            No credit card required. Free during beta.
          </p>
          <p
            className={`mt-2 text-xs text-muted-foreground ${revealBase} ${heroReveal.isVisible ? revealVisible : revealHidden}`}
            style={{ transitionDelay: "650ms" }}
          >
            Join <span className="font-bold text-primary">847</span> people already on the waitlist
          </p>
        </div>
      </section>

      {/* Product GIFs */}
      <section className="px-6 pb-20">
        <div
          ref={shotReveal.ref}
          className={`mx-auto max-w-6xl ${revealBase} duration-1000 ${shotReveal.isVisible ? "opacity-100 translate-y-0 blur-0 scale-100" : "opacity-0 translate-y-8 blur-[6px] scale-[0.97]"}`}
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-center text-sm font-medium text-muted-foreground">
                Drag & drop task management
              </p>
              <img
                src={kanbanDragGif}
                alt="Animated demo showing a task card being dragged between Kanban columns"
                className="w-full rounded-lg shadow-2xl shadow-primary/10"
                loading="lazy"
              />
            </div>
            <div className="space-y-3">
              <p className="text-center text-sm font-medium text-muted-foreground">
                Dashboard, boards & reports
              </p>
              <img
                src={tourScreensGif}
                alt="Animated tour cycling through dashboard stats, Kanban board, and reports views"
                className="w-full rounded-lg shadow-2xl shadow-primary/10"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* AI Banner */}
      {showAiBanner && (
        <div className="relative bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 px-6 py-3">
          <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 text-center text-sm text-foreground">
            <span>✨ AI-powered features now in development — smart task breakdowns, daily briefings, and natural language task entry. Built right into your board.</span>
            <a href="#features" className="ml-1 whitespace-nowrap font-medium text-primary underline underline-offset-2 hover:text-primary/80">Learn more</a>
            <button
              onClick={() => setShowAiBanner(false)}
              className="ml-3 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Features */}
      <section id="features" className="border-t border-border/40 bg-muted/30 px-6 py-20">
        <div ref={featuresReveal.ref} className="mx-auto max-w-6xl">
          <h2
            className={`text-center font-heading text-3xl font-bold tracking-tight sm:text-4xl ${revealBase} ${featuresReveal.isVisible ? revealVisible : revealHidden}`}
          >
            Everything you need to stay productive
          </h2>
          <p
            className={`mx-auto mt-4 max-w-xl text-center text-muted-foreground ${revealBase} ${featuresReveal.isVisible ? revealVisible : revealHidden}`}
            style={{ transitionDelay: "80ms" }}
          >
            No bloat. Just the tools that matter.
          </p>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`rounded-xl border border-border/50 bg-card p-6 shadow-sm transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-md ${
                  featuresReveal.isVisible ? revealVisible : revealHidden
                }`}
                style={{ transitionDelay: `${150 + i * 80}ms` }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
            {/* AI Assistant card */}
            <div
              className={`relative rounded-xl border border-primary/30 bg-card p-6 shadow-sm transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-md ${
                featuresReveal.isVisible ? revealVisible : revealHidden
              }`}
              style={{ transitionDelay: `${150 + 6 * 80}ms` }}
            >
              <div className="absolute right-4 top-4 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                Coming Soon
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold">AI Assistant</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Let AI write your daily briefing, break tasks into subtasks, and help you prioritize — all inside your board.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-border/40 px-6 py-20">
        <div ref={pricingReveal.ref} className="mx-auto max-w-6xl">
          <h2
            className={`text-center font-heading text-3xl font-bold tracking-tight sm:text-4xl ${revealBase} ${pricingReveal.isVisible ? revealVisible : revealHidden}`}
          >
            Simple, honest pricing
          </h2>
          <p
            className={`mx-auto mt-4 max-w-xl text-center text-muted-foreground ${revealBase} ${pricingReveal.isVisible ? revealVisible : revealHidden}`}
            style={{ transitionDelay: "80ms" }}
          >
            Free while we're in beta. Upgrade when you're ready.
          </p>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {/* Personal */}
            <div
              className={`flex flex-col rounded-xl border border-border/50 bg-card p-8 shadow-sm ${revealBase} ${pricingReveal.isVisible ? revealVisible : revealHidden}`}
              style={{ transitionDelay: "150ms" }}
            >
              <h3 className="font-heading text-lg font-semibold">Personal</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-heading text-4xl font-extrabold">$0</span>
                <span className="text-sm text-muted-foreground">/ forever</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Perfect for individuals</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {["Up to 3 boards", "Unlimited tasks", "Kanban boards", "Labels & due dates", "Mobile access"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="mt-8 w-full" asChild>
                <Link to="/auth">Get Started Free</Link>
              </Button>
            </div>

            {/* Pro */}
            <div
              className={`relative flex flex-col rounded-xl border-2 border-primary bg-primary p-8 text-primary-foreground shadow-lg shadow-primary/20 ${revealBase} ${pricingReveal.isVisible ? revealVisible : revealHidden}`}
              style={{ transitionDelay: "250ms" }}
            >
              <div className="absolute right-4 top-4 rounded-full bg-primary-foreground/20 px-2.5 py-0.5 text-xs font-semibold">
                Most Popular
              </div>
              <h3 className="font-heading text-lg font-semibold">Pro</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-heading text-4xl font-extrabold">$8</span>
                <span className="text-sm opacity-80">/ month</span>
              </div>
              <p className="mt-2 text-sm opacity-80">For power users and freelancers</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {[
                  "Unlimited boards",
                  "Everything in Free",
                  "Built-in time tracking",
                  "Reports & insights",
                  "AI Daily Briefing (coming soon)",
                  "AI Task Breakdown (coming soon)",
                  "Priority support",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-8 w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90" asChild>
                <Link to="/auth">Start Free Trial</Link>
              </Button>
            </div>

            {/* Team */}
            <div
              className={`flex flex-col rounded-xl border border-border/50 bg-card p-8 shadow-sm ${revealBase} ${pricingReveal.isVisible ? revealVisible : revealHidden}`}
              style={{ transitionDelay: "350ms" }}
            >
              <h3 className="font-heading text-lg font-semibold">Team</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-heading text-4xl font-extrabold">$15</span>
                <span className="text-sm text-muted-foreground">/ user / month</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">For small teams (min. 3 users)</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {[
                  "Everything in Pro",
                  "Multi-user boards",
                  "Shared workspaces",
                  "Team activity feed",
                  "Admin controls",
                  "Weekly AI team report (coming soon)",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="mt-8 w-full" asChild>
                <Link to="/auth">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="border-t border-border/40 bg-muted/30 px-6 py-20">
        <div ref={comparisonReveal.ref} className="mx-auto max-w-4xl">
          <h2
            className={`text-center font-heading text-3xl font-bold tracking-tight sm:text-4xl ${revealBase} ${comparisonReveal.isVisible ? revealVisible : revealHidden}`}
          >
            Why teams switch to Pintask
          </h2>
          <p
            className={`mx-auto mt-4 max-w-xl text-center text-muted-foreground ${revealBase} ${comparisonReveal.isVisible ? revealVisible : revealHidden}`}
            style={{ transitionDelay: "80ms" }}
          >
            You don't need 200 features. You need the right 6.
          </p>
          <div
            className={`mt-12 overflow-x-auto ${revealBase} ${comparisonReveal.isVisible ? revealVisible : revealHidden}`}
            style={{ transitionDelay: "160ms" }}
          >
            <table className="w-full min-w-[500px] text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="pb-3 pr-4 text-left font-medium text-muted-foreground">Feature</th>
                  <th className="pb-3 px-4 text-center font-semibold text-primary bg-primary/5 rounded-t-lg">Pintask</th>
                  <th className="pb-3 px-4 text-center font-medium text-muted-foreground">Trello</th>
                  <th className="pb-3 px-4 text-center font-medium text-muted-foreground">Monday.com</th>
                  <th className="pb-3 pl-4 text-center font-medium text-muted-foreground">Notion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {[
                  ["Setup time", "2 mins", "10 mins", "30+ mins", "1 hour"],
                  ["Free boards", "3", "5", "1", "Unlimited"],
                  ["Built-in timer", "✅", "❌", "✅ (paid)", "❌"],
                  ["Keyboard shortcuts", "✅", "❌", "❌", "✅"],
                  ["AI assistant", "✅", "❌", "❌", "❌"],
                  ["Monthly cost (Pro)", "$8", "$5", "$9", "$8"],
                ].map(([feature, ...vals]) => (
                  <tr key={feature}>
                    <td className="py-3 pr-4 font-medium">{feature}</td>
                    <td className="py-3 px-4 text-center font-semibold bg-primary/5">{vals[0]}</td>
                    <td className="py-3 px-4 text-center text-muted-foreground">{vals[1]}</td>
                    <td className="py-3 px-4 text-center text-muted-foreground">{vals[2]}</td>
                    <td className="py-3 pl-4 text-center text-muted-foreground">{vals[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p
            className={`mt-6 text-center text-xs text-muted-foreground ${revealBase} ${comparisonReveal.isVisible ? revealVisible : revealHidden}`}
            style={{ transitionDelay: "240ms" }}
          >
            Prices accurate as of 2026. Competitor features based on their free/starter plans.
          </p>
        </div>
      </section>

      <section className="border-t border-border/40 px-6 py-20">
        <div ref={proofReveal.ref} className="mx-auto max-w-6xl">
          <p
            className={`text-center text-sm font-medium uppercase tracking-widest text-muted-foreground ${revealBase} ${proofReveal.isVisible ? revealVisible : revealHidden}`}
          >
            What our beta users are saying
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <blockquote
                key={t.name}
                className={`flex flex-col justify-between rounded-xl border border-border/50 bg-card p-6 shadow-sm ${revealBase} ${
                  proofReveal.isVisible ? revealVisible : revealHidden
                }`}
                style={{ transitionDelay: `${100 + i * 100}ms` }}
              >
                <p className="text-sm leading-relaxed text-muted-foreground">
                  "{t.quote}"
                </p>
                <footer className="mt-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-border/40 bg-muted/30 px-6 py-20">
        <div
          ref={ctaReveal.ref}
          className={`mx-auto max-w-2xl text-center ${revealBase} duration-700 ${ctaReveal.isVisible ? revealVisible : revealHidden}`}
        >
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to take control of your workflow?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Sign up in seconds. Free while we're in beta — no strings attached.
          </p>
          <div className="mt-8">
            <Button size="lg" className="h-12 px-10 text-base" asChild>
              <Link to="/auth">
                Get Started Free <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-heading font-semibold text-foreground">
            <CheckSquare className="h-4 w-4 text-primary" />
            Pintask
          </div>
          <span>© {new Date().getFullYear()} Pintask. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
