import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import RevealSection from "@/components/RevealSection";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Check, Infinity, Crown, X, Minus, Sparkles, Trophy } from "lucide-react";

const freePlan = [
  "Unlimited boards, lists & cards",
  "Nested lists inside cards",
  "AI Next Action assistant",
  "Brain Dump quick capture",
  "File attachments on cards",
  "Member assignment & due dates",
  "Color labels & card voting",
  "Comments & activity feed",
  "Google Calendar, Outlook & iCal sync",
  "Slack integration",
  "Trello import in 2 clicks",
  "Open data — export anytime",
];

const faqItems = [
  { q: "Is the free plan really free forever?", a: "Yes. The core Kanban — unlimited boards, nested subtasks, AI Next Action, and Brain Dump — is free with no time limit and no catch." },
  { q: "What's the Loyalty Club?", a: "Loyalty Club is a $8/month subscription that locks in your rate forever. Even when we raise prices later, you keep paying $8. It's our way of saying thank you to early supporters." },
  { q: "Co-Founder Lifetime vs. Loyalty Club — which should I pick?", a: "Co-Founder Lifetime ($39 once) is the best value if you can afford the upfront payment. Loyalty Club ($8/mo) is for people who want to support us but prefer a smaller monthly commitment. Both unlock all premium power-ups forever." },
  { q: "Will my Loyalty Club price ever go up?", a: "Never. Your $8/month rate is grandfathered for life. Even if we raise prices to $15 or $20 for new members down the road, you stay at $8." },
  { q: "Can I export my data or build integrations?", a: "Yes. Your data lives in an open Postgres schema and can be exported any time. Webhook-friendly Edge Functions let you wire Pintask into the rest of your stack." },
];

type Cell =
  | { kind: "yes"; note?: string }
  | { kind: "no" }
  | { kind: "partial"; note?: string }
  | { kind: "text"; value: string; highlight?: boolean };

const competitors = ["Pintask", "Trello", "ClickUp", "Asana"] as const;

const comparisonRows: { feature: string; pintaskWins?: boolean; cells: [Cell, Cell, Cell, Cell] }[] = [
  {
    feature: "Free Kanban Board",
    cells: [
      { kind: "yes", note: "Unlimited" },
      { kind: "partial", note: "Limited" },
      { kind: "partial", note: "Limited" },
      { kind: "partial", note: "Limited" },
    ],
    pintaskWins: true,
  },
  {
    feature: "Nested Cards",
    cells: [
      { kind: "yes", note: "Free" },
      { kind: "no" },
      { kind: "partial", note: "Paid only" },
      { kind: "no" },
    ],
    pintaskWins: true,
  },
  {
    feature: "Open Data Export",
    cells: [
      { kind: "yes", note: "Anytime" },
      { kind: "partial", note: "Limited" },
      { kind: "partial", note: "Limited" },
      { kind: "partial", note: "Limited" },
    ],
    pintaskWins: true,
  },
  {
    feature: "Build Custom Features",
    cells: [{ kind: "yes" }, { kind: "no" }, { kind: "no" }, { kind: "no" }],
    pintaskWins: true,
  },
  {
    feature: "Starting Price",
    cells: [
      { kind: "text", value: "$0", highlight: true },
      { kind: "text", value: "$0" },
      { kind: "text", value: "$0" },
      { kind: "text", value: "$0" },
    ],
  },
  {
    feature: "Paid Plan From",
    cells: [
      { kind: "text", value: "$8/mo*", highlight: true },
      { kind: "text", value: "$5/user/mo" },
      { kind: "text", value: "$7/user/mo" },
      { kind: "text", value: "$10.99/user/mo" },
    ],
    pintaskWins: true,
  },
];

function ComparisonCell({ cell, isPintask }: { cell: Cell; isPintask: boolean }) {
  const tone = isPintask ? "text-primary" : "text-muted-foreground";
  if (cell.kind === "yes") {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${isPintask ? "bg-primary/15 text-primary" : "bg-emerald-500/10 text-emerald-500"}`}>
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
        {cell.note && <span className={`text-xs font-medium ${tone}`}>{cell.note}</span>}
      </div>
    );
  }
  if (cell.kind === "no") {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground/60">
        <X className="h-4 w-4" strokeWidth={2.5} />
      </span>
    );
  }
  if (cell.kind === "partial") {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
          <Minus className="h-4 w-4" strokeWidth={3} />
        </span>
        {cell.note && <span className="text-xs text-muted-foreground">{cell.note}</span>}
      </div>
    );
  }
  return (
    <span className={`font-heading text-base font-semibold tabular-nums ${cell.highlight ? "text-primary" : "text-foreground/80"}`}>
      {cell.value}
    </span>
  );
}

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
            <div className="flex flex-col rounded-xl border-2 border-border/50 bg-card p-8 shadow-lg h-full">
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
            <div id="founder" className="relative flex flex-col rounded-xl border-2 border-primary bg-primary text-primary-foreground p-8 shadow-xl shadow-primary/25 h-full scroll-mt-24">
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
            <div className="flex flex-col rounded-xl border-2 border-accent/50 bg-card p-8 shadow-lg h-full">
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
      <section className="relative border-t border-border/40 px-6 py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="mx-auto max-w-5xl">
          <RevealSection className="mb-12 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
              <Sparkles className="h-3 w-3" /> Side-by-side
            </span>
            <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Pintask vs. <span className="text-primary">The Competition</span>
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Six features that matter. Four tools. One free forever.
            </p>
          </RevealSection>

          <RevealSection delay={100}>
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[0_30px_80px_-40px_hsl(var(--primary)/0.35)]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-gradient-to-b from-muted/60 to-muted/20">
                      <th className="w-[34%] px-5 py-5 text-left font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Feature
                      </th>
                      {competitors.map((c) => {
                        const isPintask = c === "Pintask";
                        return (
                          <th
                            key={c}
                            className={`px-3 py-5 text-center font-heading text-sm font-semibold ${
                              isPintask
                                ? "relative bg-primary/10 text-primary"
                                : "text-muted-foreground"
                            }`}
                          >
                            <span className="inline-flex items-center gap-1.5">
                              {isPintask && <Trophy className="h-3.5 w-3.5" />}
                              {c}
                            </span>
                            {isPintask && (
                              <span className="absolute inset-x-0 top-0 h-0.5 bg-primary" />
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row, idx) => (
                      <tr
                        key={row.feature}
                        className={`group border-b border-border/40 last:border-0 transition-colors hover:bg-muted/30 ${
                          idx % 2 === 1 ? "bg-muted/15" : ""
                        }`}
                      >
                        <td className="px-5 py-4 font-medium text-foreground">
                          <span className="flex items-center gap-2">
                            {row.feature}
                            {row.pintaskWins && (
                              <span className="hidden rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary sm:inline">
                                Win
                              </span>
                            )}
                          </span>
                        </td>
                        {row.cells.map((cell, i) => {
                          const isPintask = i === 0;
                          return (
                            <td
                              key={i}
                              className={`px-3 py-4 text-center align-middle ${
                                isPintask ? "bg-primary/[0.06]" : ""
                              }`}
                            >
                              <ComparisonCell cell={cell} isPintask={isPintask} />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-muted/20 px-5 py-3 text-xs text-muted-foreground">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                    Included
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                      <Minus className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                    Limited
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted text-muted-foreground/60">
                      <X className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                    Not available
                  </span>
                </div>
                <span>* Loyalty Club rate, locked forever.</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button asChild size="lg" className="h-11 px-8">
                <Link to="/auth">
                  Start Free — Beat the Competition <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
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
