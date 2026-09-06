import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Briefcase,
  User,
  Users,
  Menu,
  Target,
  Split,
  Lightbulb,
  TrendingUp,
  Mic,
} from "lucide-react";
import kanbanDragGif from "@/assets/kanban-drag.gif";
import tourScreensGif from "@/assets/tour-screens.gif";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import WaitlistForm from "@/components/WaitlistForm";
import FounderLTDBanner from "@/components/FounderLTDBanner";
import AnimatedHeroBackground from "@/components/AnimatedHeroBackground";

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
  {
    icon: Target,
    title: "AI Next Action Engine",
    desc: "One click tells you the single best task to work on right now — scored by urgency, impact, and your energy.",
  },
  {
    icon: Split,
    title: "Break It Down",
    desc: "Staring at a big task? AI splits it into tiny, actionable steps you can actually start.",
  },
  {
    icon: Lightbulb,
    title: "Brain Dump → Tasks",
    desc: "Drop a wall of text, a note, or a voice ramble and convert it into clean, structured tasks instantly.",
  },
  {
    icon: TrendingUp,
    title: "Momentum Meter",
    desc: "Track your daily productivity streak and see when you're building flow — or when to take a break.",
  },
  {
    icon: Mic,
    title: "Voice Capture",
    desc: "Speak naturally. Say tasks out loud and watch them appear on your board, parsed and prioritized.",
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
      "I used the original Pintask for years. When it went away I tried everything — Trello, ClickUp, Notion. Nothing felt this clean again until now. This is exactly what I needed.",
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
  useDocumentTitle();
  const [showAiBanner, setShowAiBanner] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const heroReveal = useScrollReveal({ threshold: 0.1, initialVisible: true });
  const shotReveal = useScrollReveal({ threshold: 0.1 });
  const featuresReveal = useScrollReveal({ threshold: 0.1 });
  const pricingReveal = useScrollReveal({ threshold: 0.1 });
  const comparisonReveal = useScrollReveal({ threshold: 0.1 });
  const proofReveal = useScrollReveal({ threshold: 0.15 });
  const ctaReveal = useScrollReveal({ threshold: 0.2 });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className={`sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md transition-shadow duration-300 ${scrolled ? "shadow-sm" : ""}`}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2 font-heading text-xl font-bold text-primary">
            <CheckSquare className="h-6 w-6" />
            Pintask
          </div>
          {/* Desktop nav */}
          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" asChild>
              <a href="#features">Features</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="#pricing">Pricing</a>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/blog">Blog</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">
                Start Free — No Card Needed <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {/* Mobile hamburger */}
          <button
            className="md:hidden rounded-md p-2 text-muted-foreground hover:bg-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border/40 bg-background px-6 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link to="/blog" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              </Button>
              <Button className="w-full" asChild>
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  Get Started Free <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-16 pt-20 md:pt-28">
        <AnimatedHeroBackground />
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
          <h1 className="mt-6 font-heading text-[2.25rem] font-extrabold tracking-tight sm:text-5xl md:text-6xl leading-[1.08]">
            The Kanban Productivity App
            <br />
            Built for <span className="text-primary">ADHD Brains</span>.
          </h1>
          <p
            className={`mx-auto mt-6 max-w-xl text-lg text-muted-foreground ${revealBase} ${heroReveal.isVisible ? revealVisible : revealHidden}`}
            style={{ transitionDelay: "350ms" }}
          >
            Turn ADHD overwhelm into clear next steps, big projects into manageable tasks, and let AI guide your next move.
          </p>
          <div
            className={`mx-auto mt-8 max-w-md ${revealBase} ${heroReveal.isVisible ? revealVisible : revealHidden}`}
            style={{ transitionDelay: "500ms" }}
          >
            <WaitlistForm source="landing_hero" cta="Get Free Access" />
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>✓ No credit card</span>
              <span>✓ Free forever</span>
              <span>✓ Import from Trello in 2 clicks</span>
            </div>
          </div>
          <div
            className={`mt-6 flex items-center justify-center ${revealBase} ${heroReveal.isVisible ? revealVisible : revealHidden}`}
            style={{ transitionDelay: "600ms" }}
          >
            <FounderLTDBanner compact />
          </div>
          <p
            className={`mt-4 text-xs text-muted-foreground ${revealBase} ${heroReveal.isVisible ? revealVisible : revealHidden}`}
            style={{ transitionDelay: "650ms" }}
          >
            Join <span className="font-bold text-primary">847</span> makers already on the waitlist
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

      {/* Personas */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <RevealSection>
            <h2 className="text-center font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Built for people like you
            </h2>
          </RevealSection>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Briefcase,
                title: "Freelancers & Consultants",
                text: "Manage multiple clients without the chaos. One board per client, one place for everything.",
              },
              {
                icon: User,
                title: "Solo Operators & Founders",
                text: "Running 5 things at once? Pintask keeps your work and personal life organized in one clean space.",
              },
              {
                icon: Users,
                title: "Small Teams (2–10 people)",
                text: "No enterprise bloat. Just a fast, shared board your whole team will actually use.",
              },
            ].map((c, i) => (
              <RevealSection key={c.title} delay={100 + i * 100}>
                <div className="rounded-xl border border-border/50 bg-muted/30 p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-semibold">{c.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{c.text}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

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
            Pintask combines visual Kanban task management with ADHD-friendly tools that help you organize the chaos, decide what to do next, and keep moving forward.
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
      <section id="pricing" className="border-t border-border/40 px-6 py-20">
        <div ref={pricingReveal.ref} className="mx-auto max-w-6xl">
          <h2
            className={`text-center font-heading text-3xl font-bold tracking-tight sm:text-4xl ${revealBase} ${pricingReveal.isVisible ? revealVisible : revealHidden}`}
          >
            Free forever. Pay only if you want more.
          </h2>
          <p
            className={`mx-auto mt-4 max-w-xl text-center text-muted-foreground ${revealBase} ${pricingReveal.isVisible ? revealVisible : revealHidden}`}
            style={{ transitionDelay: "80ms" }}
          >
            No per-seat pricing. No bait-and-switch. Just a great free product — with optional power-ups.
          </p>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {/* Free For Now */}
            <div
              className={`flex flex-col rounded-xl border border-border/50 bg-card p-8 shadow-sm ${revealBase} ${pricingReveal.isVisible ? revealVisible : revealHidden}`}
              style={{ transitionDelay: "150ms" }}
            >
              <h3 className="font-heading text-lg font-semibold">Free For Now</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-heading text-4xl font-extrabold">$0</span>
                <span className="text-sm text-muted-foreground">/ forever</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Everything you need to ship.</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {[
                  "Unlimited boards & cards",
                  "Nested subtasks",
                  "AI Next Action assistant",
                  "Brain Dump quick capture",
                  "Keyboard shortcuts",
                  "Import from Trello",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="mt-8 w-full" asChild>
                <Link to="/auth">Start Free</Link>
              </Button>
            </div>

            {/* Co-Founder LTD — featured */}
            <div
              className={`relative flex flex-col rounded-xl border-2 border-primary bg-primary p-8 text-primary-foreground shadow-lg shadow-primary/20 order-first md:order-none ${revealBase} ${pricingReveal.isVisible ? revealVisible : revealHidden}`}
              style={{ transitionDelay: "250ms" }}
            >
              <div className="absolute right-4 top-4 rounded-full bg-primary-foreground/20 px-2.5 py-0.5 text-xs font-semibold">
                Limited — 500 spots
              </div>
              <h3 className="font-heading text-lg font-semibold">Co-Founder Lifetime</h3>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-heading text-4xl font-extrabold">$39</span>
                <span className="text-sm line-through opacity-60">$199</span>
              </div>
              <p className="mt-2 text-sm opacity-80">One payment. Lifetime access.</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {[
                  "Everything in Free, forever",
                  "All current & future extensions",
                  "AI Daily Briefing",
                  "AI Task Breakdown",
                  "Time tracking + reports",
                  "Co-Founders Slack community",
                  "Lock in before public launch",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" /> {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-8 w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90" asChild>
                <Link to="/pricing#founder">Claim Co-Founder Spot</Link>
              </Button>
            </div>

            {/* Loyalty Club */}
            <div
              className={`flex flex-col rounded-xl border border-border/50 bg-card p-8 shadow-sm ${revealBase} ${pricingReveal.isVisible ? revealVisible : revealHidden}`}
              style={{ transitionDelay: "350ms" }}
            >
              <div className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent self-start">
                Grandfathered Forever
              </div>
              <h3 className="mt-3 font-heading text-lg font-semibold">Loyalty Club</h3>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-heading text-4xl font-extrabold">$8</span>
                <span className="text-sm text-muted-foreground">/ month</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Locked in at $8 forever. Even when prices go up, you never pay more.</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {[
                  "Everything in Free",
                  "All current & future extensions",
                  "AI Daily Briefing",
                  "AI Task Breakdown",
                  "Time tracking + reports",
                  "Grandfathered at $8/mo forever",
                  "Cancel anytime",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-accent" /> {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="mt-8 w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground" asChild>
                <Link to="/auth?plan=loyalty">Join Loyalty Club</Link>
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
          <p className="mt-8 text-center text-xs text-muted-foreground md:hidden">← swipe to compare →</p>
          <div
            className={`mt-2 md:mt-12 overflow-x-auto scrollbar-thin ${revealBase} ${comparisonReveal.isVisible ? revealVisible : revealHidden}`}
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

      {/* FAQ */}
      <section className="border-t border-border/40 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <RevealSection>
            <h2 className="text-center font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Questions we get a lot
            </h2>
          </RevealSection>
          <RevealSection delay={100}>
            <Accordion type="single" collapsible className="mt-12">
              {[
                {
                  q: "Is Pintask really free?",
                  a: "Yes. The Personal plan is free forever with no credit card required. We're also fully free during the beta period — including features that will be paid later. No surprises, no gotchas.",
                },
                {
                  q: "How is this different from Trello?",
                  a: "Trello is great but has no built-in time tracker, limited keyboard shortcuts, and gets complicated fast. Pintask is built for speed — you can manage your entire day without touching your mouse. It also has AI features Trello doesn't offer.",
                },
                {
                  q: "I used the original Pintask — is this the same thing?",
                  a: "We're big fans of the original Pintask and built this with that same simplicity-first philosophy in mind. Same clean kanban spirit, rebuilt from the ground up with modern tools and AI capabilities the original never had.",
                },
                {
                  q: "Is my data safe?",
                  a: "Yes. All data is encrypted at rest and in transit. We don't sell your data or share it with third parties. Ever.",
                },
                {
                  q: "What AI features are coming?",
                  a: "We're building AI-powered daily briefings, smart task breakdowns, natural language task entry ('remind me to call John on Friday'), and weekly productivity reports — all powered by AI, built directly into your board.",
                },
              ].map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-border/50">
                  <AccordionTrigger className="text-left font-heading text-base font-semibold hover:no-underline [&>svg]:text-primary">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </RevealSection>
        </div>
      </section>

      {/* Founder LTD banner */}
      <section className="border-t border-border/40 px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <FounderLTDBanner />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-border/40 bg-muted/30 px-6 py-16">
        <div
          ref={ctaReveal.ref}
          className={`mx-auto max-w-2xl text-center ${revealBase} duration-700 ${ctaReveal.isVisible ? revealVisible : revealHidden}`}
        >
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Stop fighting your task manager.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Get free access — we'll send you a link to start in 30 seconds.
          </p>
          <div className="mx-auto mt-8 max-w-md">
            <WaitlistForm source="landing_bottom_cta" cta="Get My Free Account" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 bg-[hsl(230,25%,10%)] px-6 py-14">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-heading text-lg font-bold text-white">
              <CheckSquare className="h-5 w-5 text-primary" />
              Pintask
            </div>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Simple task management for people who actually want to get things done.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-gray-300">Product</h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-400">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><Link to="/auth" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link to="/auth" className="hover:text-white transition-colors">Get Started</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-gray-300">Company</h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-6xl border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Pintask. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
