import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import RevealSection from "@/components/RevealSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, Unlock, Code, Users, Heart } from "lucide-react";

const beliefs = [
  { icon: Unlock, title: "Customization isn't a premium feature. It's a right.", desc: "Your workflow is yours. Your task tracker should reflect that." },
  { icon: Code, title: "Developers deserve better tools.", desc: "We give developers real API access, not a watered-down workaround." },
  { icon: Users, title: "Communities build better products than roadmaps.", desc: "That's why Spire Club exists." },
  { icon: Heart, title: "Free should mean free.", desc: "The core board is free forever. We earn when you find genuine value in extensions." },
];

const timeline = [
  { year: "2014", text: "Pintask launches on Product Hunt. Hackable Kanban board with a real JavaScript API." },
  { year: "2015", text: "Extensions Store launches." },
  { year: "2016", text: "Card & List Mirroring extension ships." },
  { year: "2017", text: "Hands-Free Time Tracking extension ships." },
  { year: "2018", text: "Spire Club community funding model launches." },
  { year: "2024–2026", text: "Platform modernization and renewed growth focus." },
];

export default function AboutPage() {
  useDocumentTitle("About Pintask — The Story Behind the Most Customizable Kanban Board", "Pintask was built by people who got tired of task tools that almost worked. Learn why we built it, what drives us, and why customization isn't a feature — it's a philosophy.");

  return (
    <MarketingLayout>
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <RevealSection className="text-center">
            <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">We Built the Task Tracker We Couldn't Find Anywhere Else</h1>
            <p className="mt-6 text-lg text-muted-foreground">Pintask started in 2014 with one idea: what if a task tracker was designed to be extended, modified, and made your own?</p>
          </RevealSection>
          <RevealSection delay={100}>
            <div className="mt-12 space-y-6 text-muted-foreground leading-relaxed">
              <p>Most task tools are built for an imaginary average user. They make assumptions about how you work. When those assumptions are wrong, you submit a feature request, build a workaround, or move on to the next tool.</p>
              <p>We got tired of that cycle. Pintask launched in 2014 with a different premise: give teams a solid free Kanban foundation and the actual tools to extend it. Real JavaScript. Real API. Real database access.</p>
              <p>The result is the only task tracker where the answer to "can it do X?" is almost always yes — because if it doesn't exist, you can build it.</p>
            </div>
          </RevealSection>
        </div>
      </section>

      <section className="border-t border-border/40 bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <RevealSection><h2 className="text-center font-heading text-2xl font-bold tracking-tight sm:text-3xl">What We Believe</h2></RevealSection>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {beliefs.map((b, i) => (
              <RevealSection key={b.title} delay={80 + i * 80}>
                <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm h-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><b.icon className="h-5 w-5" /></div>
                  <h3 className="mt-4 font-heading text-base font-semibold">{b.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/40 px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <RevealSection><h2 className="text-center font-heading text-2xl font-bold tracking-tight sm:text-3xl">Timeline</h2></RevealSection>
          <div className="mt-10 space-y-4">
            {timeline.map((t, i) => (
              <RevealSection key={t.year} delay={80 + i * 60}>
                <div className="flex gap-4 items-start">
                  <div className="shrink-0 w-24 text-right font-heading font-bold text-primary">{t.year}</div>
                  <div className="border-l-2 border-primary/20 pl-4 pb-2 text-sm text-muted-foreground">{t.text}</div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border/40 bg-muted/30 px-6 py-16">
        <RevealSection className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight">Pintask is for teams who refuse to fit their work into someone else's box.</h2>
          <div className="mt-8"><Button size="lg" className="h-12 px-10 text-base" asChild><Link to="/auth">Start Your Free Board <ArrowRight className="ml-1.5 h-4 w-4" /></Link></Button></div>
          <p className="mt-3 text-xs text-muted-foreground">Questions? Email us at hello@pintask.online</p>
        </RevealSection>
      </section>
    </MarketingLayout>
  );
}
