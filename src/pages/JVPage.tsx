import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Rocket, DollarSign, Users, Zap, BarChart3, Clock,
  CheckCircle2, ArrowRight, Shield, TrendingUp, Star,
  Keyboard, Brain, Timer, Tag
} from "lucide-react";

const commissionTiers = [
  { label: "Front-End", rate: "70%", price: "$17–$27", color: "hsl(var(--primary))" },
  { label: "OTO 1 – Pro Upgrade", rate: "70%", price: "$37", color: "hsl(var(--accent))" },
  { label: "OTO 2 – Team License", rate: "70%", price: "$47", color: "hsl(var(--warning))" },
  { label: "OTO 3 – Agency/Reseller", rate: "70%", price: "$97", color: "hsl(var(--success))" },
];

const features = [
  { icon: Zap, title: "Instant Kanban Boards", desc: "Drag-and-drop task management that feels effortless." },
  { icon: Keyboard, title: "Full Keyboard Navigation", desc: "Power users can manage their entire day without a mouse." },
  { icon: Brain, title: "AI-Powered Productivity", desc: "Smart briefings, task breakdowns, natural language entry." },
  { icon: Timer, title: "Built-In Time Tracker", desc: "Track time per task — no third-party integrations needed." },
  { icon: Tag, title: "Labels, Priorities & Due Dates", desc: "Organize everything with color-coded labels and filters." },
  { icon: BarChart3, title: "Weekly Reports", desc: "AI-generated productivity summaries delivered automatically." },
];

const proofPoints = [
  "SaaS product with real recurring value",
  "Modern tech stack (React, AI, Cloud-hosted)",
  "No downloads, no installs — 100% browser-based",
  "Works on desktop, tablet, and mobile",
  "Free tier drives massive conversions",
  "Pro & Team upsells with strong EPCs",
];

const swipeAssets = [
  {
    subject: "This replaced Trello for me (and it's free)",
    preview: "I found a task manager that actually gets out of your way. It has AI features Trello doesn't, built-in time tracking, and you can run your whole day from the keyboard..."
  },
  {
    subject: "NEW: AI-powered task manager (70% commissions)",
    preview: "Pintask just launched on JVZoo — it's a modern kanban board with AI smarts, and the free tier converts like crazy. 70% across the funnel..."
  },
  {
    subject: "Your audience needs this (seriously)",
    preview: "If your list includes freelancers, solopreneurs, or small teams, they're going to love Pintask. It's the simplest project manager I've seen, and it has AI built in..."
  },
];

export default function JVPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="relative max-w-5xl mx-auto px-4 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Rocket className="w-4 h-4" />
            JV Partner Opportunity
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Promote <span className="text-primary">Pintask</span> &<br />
            Earn <span className="text-accent">50% Commissions</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            AI-powered task management your audience actually needs. 
            High conversions, strong EPCs, and a product people love.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="w-full sm:w-auto text-base px-8 gap-2">
              <DollarSign className="w-5 h-5" />
              Get Your Affiliate Link
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 gap-2">
              <Users className="w-5 h-5" />
              Request Review Access
            </Button>
          </div>
        </div>
      </section>

      {/* Commission Structure */}
      <section className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Commission Structure
          </h2>
          <p className="text-muted-foreground text-lg">Generous payouts across the entire funnel</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {commissionTiers.map((tier) => (
            <Card key={tier.label} className="relative overflow-hidden border-2 hover:border-primary/40 transition-colors">
              <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: tier.color }} />
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground font-medium mb-2">{tier.label}</p>
                <p className="text-4xl font-bold text-primary mb-1">{tier.rate}</p>
                <p className="text-sm text-muted-foreground">{tier.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* What Is Pintask */}
      <section className="bg-muted/50">
        <div className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              What Is Pintask?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Pintask is a modern, AI-powered task management app built for freelancers, solopreneurs, and small teams 
              who want to stay productive without the bloat of enterprise tools.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="border hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Promote */}
      <section className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Why Promote Pintask?
            </h2>
            <ul className="space-y-4">
              {proofPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <span className="text-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-8 text-center">
              <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="text-4xl font-bold text-primary mb-2">$2.50+</p>
              <p className="text-muted-foreground font-medium mb-4">Expected EPC</p>
              <div className="border-t border-border pt-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  With a free tier driving opt-ins and a proven upsell funnel, 
                  affiliates are seeing strong earnings per click.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Swipe Copy */}
      <section className="bg-muted/50">
        <div className="max-w-5xl mx-auto px-4 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Swipe Copy
            </h2>
            <p className="text-muted-foreground text-lg">Ready-to-send emails — just copy, paste, and profit</p>
          </div>
          <div className="space-y-4">
            {swipeAssets.map((swipe, i) => (
              <Card key={i} className="border hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-sm font-bold text-primary">#{i + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Subject: {swipe.subject}</p>
                      <p className="text-muted-foreground text-sm">{swipe.preview}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contest / Leaderboard */}
      <section className="max-w-5xl mx-auto px-4 py-16 sm:py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-4 py-1.5 text-sm font-medium text-warning mb-6">
          <Star className="w-4 h-4" />
          Launch Contest
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          JV Contest Prizes
        </h2>
        <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
          Top affiliates get bonus cash prizes on top of commissions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { place: "1st Place", prize: "$500 Cash", accent: "hsl(var(--warning))" },
            { place: "2nd Place", prize: "$250 Cash", accent: "hsl(var(--primary))" },
            { place: "3rd Place", prize: "$100 Cash", accent: "hsl(var(--accent))" },
          ].map((p) => (
            <Card key={p.place} className="border-2 hover:shadow-lg transition-shadow">
              <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: p.accent }} />
              <CardContent className="p-6 text-center relative">
                <p className="text-sm text-muted-foreground font-medium mb-2">{p.place}</p>
                <p className="text-2xl font-bold">{p.prize}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-primary/10 via-transparent to-accent/10">
        <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20 text-center">
          <Shield className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Ready to Promote?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Grab your affiliate link and start earning. We handle the product, support, and upsells — you just send traffic.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="w-full sm:w-auto text-base px-8 gap-2">
              <DollarSign className="w-5 h-5" />
              Get Your Affiliate Link
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 gap-2">
              Contact JV Manager
            </Button>
          </div>
        </div>
      </section>

      {/* Disclaimer / Footer */}
      <footer className="bg-muted border-t border-border">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="text-xs text-muted-foreground leading-relaxed space-y-4">
            <p className="font-semibold text-sm text-foreground">Disclaimer</p>
            <p>
              Please note that this product does not provide any guarantee of income or success. The results achieved by the product owner or any other individuals mentioned are not indicative of future success or earnings. This website is not affiliated with FaceBook or any of its associated entities. Once you navigate away from FaceBook, the responsibility for the content and its usage lies solely with the user. All content on this website, including but not limited to text, images, and multimedia, is protected by copyright law and the Digital Millennium Copyright Act. Unauthorized copying, duplication, modification, or theft, whether intentional or unintentional, is strictly prohibited. Violators will be prosecuted to the fullest extent of the law.
            </p>
            <p>
              We want to clarify that JVZoo serves as the retailer for the products featured on this site. JVZoo® is a registered trademark of BBC Systems Inc., a Florida corporation located at 1809 E. Broadway Street, Suite 125, Oviedo, FL 32765, USA, and is used with permission. The role of JVZoo as a retailer does not constitute an endorsement, approval, or review of these products or any claims, statements, or opinions used in their promotion.
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Pintask. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
