import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

const plans = [
  {
    name: "Personal",
    price: "Free",
    period: "",
    desc: "For individuals getting started.",
    features: ["3 projects", "Unlimited tasks", "Kanban boards", "Time tracking", "Labels & comments", "Keyboard shortcuts"],
    cta: "Get Started Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$8",
    period: "/ month",
    desc: "For power users who want more.",
    features: ["Unlimited projects", "Everything in Personal", "Image attachments", "Advanced reports", "AI assistant (coming soon)", "Priority support"],
    cta: "Start Pro Free Trial",
    highlight: true,
  },
  {
    name: "Team",
    price: "$16",
    period: "/ user / month",
    desc: "For small teams who ship together.",
    features: ["Everything in Pro", "Team collaboration", "Shared boards", "Admin controls", "Activity feed", "Dedicated support"],
    cta: "Contact Us",
    highlight: false,
  },
];

export default function PricingPage() {
  useDocumentTitle("Pricing — Pintask");

  return (
    <MarketingLayout>
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            Simple, honest pricing
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Free while we're in beta. No credit card required. Upgrade when you're ready.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-xl border-2 p-8 shadow-sm ${
                plan.highlight
                  ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "border-border/50 bg-card"
              }`}
            >
              {plan.highlight && (
                <div className="mb-4 inline-flex self-start rounded-full bg-primary-foreground/20 px-2.5 py-0.5 text-xs font-semibold">
                  Most Popular
                </div>
              )}
              <h2 className="font-heading text-lg font-semibold">{plan.name}</h2>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-heading text-4xl font-extrabold">{plan.price}</span>
                {plan.period && <span className={`text-sm ${plan.highlight ? "opacity-80" : "text-muted-foreground"}`}>{plan.period}</span>}
              </div>
              <p className={`mt-3 text-sm ${plan.highlight ? "opacity-90" : "text-muted-foreground"}`}>{plan.desc}</p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.highlight ? "text-primary-foreground" : "text-primary"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button
                  size="lg"
                  className="w-full"
                  variant={plan.highlight ? "secondary" : "default"}
                  asChild
                >
                  <Link to="/auth">{plan.cta} <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
