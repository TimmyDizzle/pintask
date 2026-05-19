import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import RevealSection from "@/components/RevealSection";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Check, Puzzle, Users } from "lucide-react";

const freePlan = [
  "Unlimited boards, lists & cards",
  "Nested lists inside cards",
  "File attachments on cards",
  "Member assignment & due dates",
  "Color labels & card voting",
  "Comments & activity feed",
  "Google Calendar, Outlook & iCal sync",
  "Slack integration",
  "Trello import in 2 clicks",
  "Full JavaScript + Meteor API access",
  "MongoDB browser access",
  "Build your own extensions",
];

const faqItems = [
  { q: "Is the free plan really free forever?", a: "Yes. The core Kanban board — including unlimited boards, nested cards, API access, and integrations — is free with no time limit and no catch." },
  { q: "How do extensions work?", a: "Extensions install per user, like an app store. Paid extensions include a free trial. After the trial, subscribe monthly. Cancel anytime." },
  { q: "Do my teammates need to pay for extensions too?", a: "Yes — extensions are per-user subscriptions. Each person controls their own extension setup." },
  { q: "Can I build my own extensions for free?", a: "Yes. The full JavaScript + Meteor API and MongoDB browser access are included on the free plan." },
];

const comparisonData = [
  { feature: "Free Kanban Board", pintask: "✅ Unlimited", trello: "✅ Limited", clickup: "✅ Limited", asana: "✅ Limited" },
  { feature: "Nested Cards", pintask: "✅ Free", trello: "❌", clickup: "✅ Paid", asana: "❌" },
  { feature: "API Access", pintask: "✅ Full JS", trello: "Limited", clickup: "Limited", asana: "Limited" },
  { feature: "Build Custom Features", pintask: "✅", trello: "❌", clickup: "❌", asana: "❌" },
  { feature: "Starting Price", pintask: "$0", trello: "$0", clickup: "$0", asana: "$0" },
  { feature: "Paid Plan From", pintask: "Extensions only", trello: "$5/user/mo", clickup: "$7/user/mo", asana: "$10.99/user/mo" },
];

export default function PricingPage() {
  useDocumentTitle(
    "Pintask Pricing — Free Kanban Board + Optional Paid Extensions",
    "Pintask is free forever. Pay only for the extensions you actually need. No per-seat pricing. No surprise bills. Start free today."
  );

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="px-6 py-20 md:py-28">
        <RevealSection className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            Free Forever. Pay Only For What You Actually Use.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Pintask's core Kanban board is free — forever. Extensions are optional add-ons you install only if you need them. No forced upgrades. No bloated plans.
          </p>
        </RevealSection>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl grid gap-8 md:grid-cols-3">
          {/* Free */}
          <RevealSection delay={100}>
            <div className="flex flex-col rounded-xl border-2 border-border/50 bg-card p-8 shadow-sm h-full">
              <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary self-start">Free Forever</div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-heading text-4xl font-extrabold">$0</span>
                <span className="text-sm text-muted-foreground">/ forever</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Everything you need to manage work.</p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {freePlan.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button size="lg" className="w-full" variant="outline" asChild>
                  <Link to="/auth">Start Free — No Card <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </RevealSection>

          {/* Founder Lifetime — featured */}
          <RevealSection delay={220}>
            <div id="founder" className="relative flex flex-col rounded-xl border-2 border-primary bg-primary text-primary-foreground p-8 shadow-lg shadow-primary/20 h-full scroll-mt-24">
              <div className="rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-semibold self-start">Limited — 500 spots</div>
              <h2 className="mt-4 font-heading text-lg font-semibold">Founder Lifetime</h2>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-heading text-4xl font-extrabold">$39</span>
                <span className="text-sm line-through opacity-60">$199</span>
              </div>
              <p className="mt-3 text-sm opacity-90">One payment. Forever access to every extension we ever ship.</p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {[
                  "Everything in Free, forever",
                  "All current & future extensions",
                  "Card & List Mirroring",
                  "Hands-Free Time Tracking",
                  "AI Daily Briefing + Task Breakdown",
                  "Founders-only Slack community",
                  "Lifetime updates — no renewals",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button size="lg" variant="secondary" className="w-full" asChild>
                  <Link to="/auth?plan=founder">Claim Founder Spot <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
                <p className="mt-3 text-center text-xs opacity-75">30-day money-back guarantee</p>
              </div>
            </div>
          </RevealSection>

          {/* Spire Club */}
          <RevealSection delay={340}>
            <div className="flex flex-col rounded-xl border-2 border-border/50 bg-card p-8 shadow-sm h-full">
              <div className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent self-start">Community</div>
              <h2 className="mt-4 font-heading text-lg font-semibold">Spire Club</h2>
              <p className="mt-1 text-sm text-muted-foreground">Community pricing</p>
              <p className="mt-3 text-sm text-muted-foreground">Co-fund the features your company needs.</p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {["Propose feature ideas", "Co-fund builds with other members", "Lifelong access when extension ships", "Works for your whole company"].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button size="lg" variant="outline" className="w-full" asChild>
                  <Link to="/extensions#spire-club">Learn About Spire Club <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/40 bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <RevealSection><h2 className="text-center font-heading text-2xl font-bold tracking-tight sm:text-3xl">Pricing FAQ</h2></RevealSection>
          <RevealSection delay={100}>
            <Accordion type="single" collapsible className="mt-10">
              {faqItems.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-border/50">
                  <AccordionTrigger className="text-left font-heading text-base font-semibold hover:no-underline [&>svg]:text-primary">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </RevealSection>
        </div>
      </section>

      {/* Comparison */}
      <section className="border-t border-border/40 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <RevealSection><h2 className="text-center font-heading text-2xl font-bold tracking-tight sm:text-3xl mb-10">Pintask vs. The Competition</h2></RevealSection>
          <RevealSection delay={100}>
            <div className="overflow-x-auto rounded-xl border border-border/50 bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/50">
                    <th className="px-4 py-3 text-left font-heading font-semibold"></th>
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
          <h2 className="font-heading text-3xl font-bold tracking-tight">Start free. Extend when you're ready.</h2>
          <div className="mt-8">
            <Button size="lg" className="h-12 px-10 text-base" asChild>
              <Link to="/auth">Create Your Free Board <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">No credit card. No expiration. No pressure.</p>
        </RevealSection>
      </section>
    </MarketingLayout>
  );
}
