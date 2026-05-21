import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import RevealSection from "@/components/RevealSection";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Check, Infinity, Crown } from "lucide-react";

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
  { q: "What's the Loyalty Club?", a: "Loyalty Club is a $8/month subscription that locks in your rate forever. Even when we raise prices later, you keep paying $8. It's our way of saying thank you to early supporters." },
  { q: "Co-Founder Lifetime vs. Loyalty Club — which should I pick?", a: "Co-Founder Lifetime ($39 once) is the best value if you can afford the upfront payment. Loyalty Club ($8/mo) is for people who want to support us but prefer a smaller monthly commitment. Both get all extensions forever." },
  { q: "Will my Loyalty Club price ever go up?", a: "Never. Your $8/month rate is grandfathered for life. Even if we raise prices to $15 or $20 for new members down the road, you stay at $8." },
  { q: "Can I build my own extensions for free?", a: "Yes. The full JavaScript + Meteor API and MongoDB browser access are included on the free plan." },
];

const comparisonData = [
  { feature: "Free Kanban Board", pintask: "✅ Unlimited", trello: "✅ Limited", clickup: "✅ Limited", asana: "✅ Limited" },
  { feature: "Nested Cards", pintask: "✅ Free", trello: "❌", clickup: "✅ Paid", asana: "❌" },
  { feature: "API Access", pintask: "✅ Full JS", trello: "Limited", clickup: "Limited", asana: "Limited" },
  { feature: "Build Custom Features", pintask: "✅", trello: "❌", clickup: "❌", asana: "❌" },
  { feature: "Starting Price", pintask: "$0", trello: "$0", clickup: "$0", asana: "$0" },
  { feature: "Paid Plan From", pintask: "$8/mo*", trello: "$5/user/mo", clickup: "$7/user/mo", asana: "$10.99/user/mo" },
];

export default function PricingPage() {
  useDocumentTitle(
    "Pintask Pricing — Free Forever, Co-Founder Lifetime, or Loyalty Club",
    "Free forever Kanban board. Co-Founder Lifetime for $39. Loyalty Club at $8/month locked in forever. Start free today.",
    {
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    }
  );

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="px-6 py-20 md:py-28">
        <RevealSection className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            Free Forever. Or Lock In A Price For Life.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Pintask's core Kanban board is free forever. Want more? Pick the Co-Founder Lifetime ($39 once) or the Loyalty Club ($8/mo — locked in forever, even when we raise prices).
          </p>
        </RevealSection>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl grid gap-8 md:grid-cols-3">
          {/* Free */}
          <RevealSection delay={100}>
            <div className="flex flex-col rounded-xl border-2 border-border/50 bg-card p-8 shadow-sm h-full">
              <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary self-start">Free For Now</div>
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

          {/* Co-Founder Lifetime — featured */}
          <RevealSection delay={220}>
            <div id="founder" className="relative flex flex-col rounded-xl border-2 border-primary bg-primary text-primary-foreground p-8 shadow-lg shadow-primary/20 h-full scroll-mt-24">
              <div className="rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-semibold self-start">Limited — 500 spots</div>
              <h2 className="mt-4 font-heading text-lg font-semibold">Co-Founder Lifetime</h2>
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
                  "Co-Founders-only Slack community",
                  "Lifetime updates — no renewals",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button size="lg" variant="secondary" className="w-full" asChild>
                  <Link to="/auth?plan=founder">Claim Co-Founder Spot <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
                <p className="mt-3 text-center text-xs opacity-75">30-day money-back guarantee</p>
              </div>
            </div>
          </RevealSection>

          {/* Loyalty Club */}
          <RevealSection delay={340}>
            <div className="flex flex-col rounded-xl border-2 border-accent/50 bg-card p-8 shadow-sm h-full">
              <div className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent self-start flex items-center gap-1">
                <Infinity className="h-3 w-3" /> Grandfathered Forever
              </div>
              <h2 className="mt-4 font-heading text-lg font-semibold">Loyalty Club</h2>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-heading text-4xl font-extrabold">$8</span>
                <span className="text-sm text-muted-foreground">/ month</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Your $8 rate is locked in forever. Even when prices go up for new members, you never pay more.
              </p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {[
                  "Everything in Free",
                  "All current & future extensions",
                  "Card & List Mirroring",
                  "Hands-Free Time Tracking",
                  "AI Daily Briefing + Task Breakdown",
                  "Grandfathered at $8/mo forever",
                  "Cancel anytime — no contracts",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button size="lg" variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground" asChild>
                  <Link to="/auth?plan=loyalty">Join Loyalty Club <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">Future price hikes don't apply to you</p>
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
            <p className="mt-3 text-center text-xs text-muted-foreground">* Loyalty Club rate. Free plan available for everyone.</p>
          </RevealSection>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/40 bg-muted/30 px-6 py-16">
        <RevealSection className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight">Start free. Upgrade when you're ready.</h2>
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
