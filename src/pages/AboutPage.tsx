import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import RevealSection from "@/components/RevealSection";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const pinBullets = [
  { emoji: "📌", title: "See it, pin it, do it.", desc: "Visual task pinning means your priorities never get buried under a pile of \"someday\" items." },
  { emoji: "🧠", title: "Distraction-proof by design.", desc: "Clean interface built to keep hyperfocus on the work, not the tool." },
  { emoji: "⚡", title: "Instant capture, zero friction.", desc: "Got an idea or a deadline? Pin it in seconds and move on." },
  { emoji: "🔄", title: "Works the way your brain works.", desc: "Not the other way around." },
];

const systemBullets = [
  { title: "Focus", desc: "Eliminate the noise, amplify what matters." },
  { title: "Prioritization", desc: "Always know your next most important move." },
  { title: "Daily execution", desc: "Build momentum, not just lists." },
  { title: "Overwhelm reduction", desc: "Simplicity that scales with you." },
  { title: "Accountability", desc: "Systems that keep you honest." },
];

export default function AboutPage() {
  useDocumentTitle(
    "About PinTask — The AI Productivity System Built for ADHD Brains",
    "PinTask was built out of frustration with productivity tools that don't fit how ADHD brains actually work. A solid free Kanban foundation, real extensibility, and a system engineered for focus, prioritization, and daily execution."
  );

  return (
    <MarketingLayout>
      {/* Hero / Story */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <RevealSection className="text-center">
            <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
              We Built the Task Tracker We Couldn't Find Anywhere Else
            </h1>
          </RevealSection>
          <RevealSection delay={100}>
            <div className="mt-10 space-y-6 text-muted-foreground leading-relaxed">
              <p>
                Most productivity tools are built for someone who doesn't exist. The "average user." The person whose workflow fits perfectly into someone else's rigid system — the one who never needs to customize, extend, or adapt anything. Yeah. That's not us. And we're guessing it's not you either.
              </p>
              <p>
                PinTask was born out of frustration. The kind that builds up after you've tried tool after tool, submitted feature request after feature request, and built workaround after workaround — only to give up and move on to the next shiny app that promises to fix everything. It doesn't. It never does. So we stopped waiting and started building.
              </p>
              <p>
                The premise was simple but radical: what if a task tracker was designed from day one to be extended, modified, and made completely your own? Not a watered-down drag-and-drop board with locked settings. Not a feature-bloated enterprise monster that requires a certification to operate. A solid, free Kanban foundation — paired with the actual tools to make it do exactly what you need. Real JavaScript. Real API. Real database access. Your data. Your rules. Your system.
              </p>
              <p className="font-heading text-lg text-foreground">
                PinTask isn't just a tool. It's a platform with your name on it.
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Stop Losing Your Focus */}
      <section className="border-t border-border/40 bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <RevealSection className="text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Stop Losing Your Focus. Start Pinning Your Priorities.
            </h2>
          </RevealSection>
          <RevealSection delay={100}>
            <div className="mt-8 space-y-5 text-muted-foreground leading-relaxed">
              <p>You know the feeling. Seventeen tabs open. Three apps running. Zero tasks done.</p>
              <p className="font-heading text-lg text-foreground">PinTask fixes that.</p>
              <p>
                Built for the way ADHD brains actually work, PinTask strips away the noise and puts your most important tasks front and center — pinned, visual, and impossible to ignore. No complicated workflows. No endless setup. Just clarity, right when you need it.
              </p>
              <p className="font-heading text-foreground">Here's what makes PinTask different:</p>
            </div>
          </RevealSection>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {pinBullets.map((b, i) => (
              <RevealSection key={b.title} delay={120 + i * 80}>
                <div className="flex gap-4 rounded-xl border border-border/50 bg-card p-5 shadow-sm h-full">
                  <div className="text-2xl leading-none">{b.emoji}</div>
                  <div>
                    <h3 className="font-heading text-base font-semibold">{b.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
          <RevealSection delay={200}>
            <div className="mt-10 space-y-5 text-muted-foreground leading-relaxed">
              <p>
                Most productivity apps were designed by people who don't struggle with focus. PinTask was built because of it. The result is a task manager that feels less like a chore and more like a superpower.
              </p>
              <p>
                Whether you're a freelancer juggling clients, an entrepreneur managing chaos, or someone who's tried every app on the market and still can't get organized — PinTask meets you exactly where you are.
              </p>
              <p className="font-heading text-lg text-foreground">No fluff. No overwhelm. Just done.</p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* AI Productivity System */}
      <section className="border-t border-border/40 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <RevealSection className="text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              The AI Productivity System Built for Professionals with ADHD
            </h2>
          </RevealSection>
          <RevealSection delay={100}>
            <div className="mt-8 space-y-5 text-muted-foreground leading-relaxed">
              <p>
                Let's be honest. The world already has roughly 9,742 productivity apps. Most are digital graveyards filled with abandoned tasks and stolen optimism.
              </p>
              <p className="font-heading text-lg text-foreground">PinTask is something different entirely.</p>
              <p>
                This isn't another task manager. It isn't another planner. It isn't another AI chatbot pretending to understand how you work. PinTask is a system — specifically engineered for the way ambitious, high-performing ADHD brains actually operate:
              </p>
            </div>
          </RevealSection>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {systemBullets.map((b, i) => (
              <RevealSection key={b.title} delay={120 + i * 70}>
                <div className="flex gap-3 rounded-lg border border-border/50 bg-card p-4 shadow-sm h-full">
                  <div className="text-primary font-bold">✅</div>
                  <div>
                    <h3 className="font-heading text-sm font-semibold">{b.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
          <RevealSection delay={220}>
            <div className="mt-10 space-y-5 text-muted-foreground leading-relaxed">
              <p>
                Built by someone who knows exactly what it feels like to fight their own brain every single day — for ambitious professionals who are done losing that fight.
              </p>
              <p>
                Thousands of users are already pinning their way to more productive days. The question is — what's sitting on your to-do list right now that still isn't finished?
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/40 bg-muted/30 px-6 py-16">
        <RevealSection className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight">
            Ready to pin your priorities and actually finish what matters?
          </h2>
          <div className="mt-8">
            <Button size="lg" className="h-12 px-10 text-base" asChild>
              <Link to="/auth">Start Your Free Board <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Questions? Email us at hello@pintask.online</p>
        </RevealSection>
      </section>
    </MarketingLayout>
  );
}
