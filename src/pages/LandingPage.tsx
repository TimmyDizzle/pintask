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
  const heroReveal = useScrollReveal({ threshold: 0.1 });
  const shotReveal = useScrollReveal({ threshold: 0.1 });
  const featuresReveal = useScrollReveal({ threshold: 0.1 });
  const pricingReveal = useScrollReveal({ threshold: 0.1 });
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
          </div>
        </div>
      </section>

      {/* Social Proof */}
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
