import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import RevealSection from "@/components/RevealSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, Chrome, Globe, Smartphone } from "lucide-react";

const extensions = [
  { icon: Chrome, title: "Chrome Extension", desc: "Add tasks from any webpage. Clip content, save links, and manage your board without leaving your browser.", status: "Coming Soon" },
  { icon: Globe, title: "Firefox Add-on", desc: "Full Pintask integration for Firefox users. Same great features, same fast workflow.", status: "Coming Soon" },
  { icon: Smartphone, title: "Mobile App (PWA)", desc: "Install Pintask on your phone as a progressive web app. Works offline, syncs when you're back online.", status: "Available Now" },
];

export default function ExtensionsPage() {
  useDocumentTitle("Extensions — Pintask");

  return (
    <MarketingLayout>
      <section className="px-6 py-20 md:py-28">
        <RevealSection className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            Pintask everywhere you work
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Browser extensions and mobile apps to keep your tasks within reach — no matter where you are.
          </p>
        </RevealSection>
      </section>

      <section className="border-t border-border/40 bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-4xl grid gap-8 md:grid-cols-3">
          {extensions.map((ext, i) => (
            <RevealSection key={ext.title} delay={100 + i * 100}>
              <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm text-center hover:shadow-md transition-shadow">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ext.icon className="h-6 w-6" />
                </div>
                <h2 className="mt-4 font-heading text-lg font-semibold">{ext.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{ext.desc}</p>
                <div className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                  ext.status === "Available Now" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {ext.status}
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      <section className="border-t border-border/40 px-6 py-16">
        <RevealSection className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight">Try Pintask today</h2>
          <p className="mt-4 text-muted-foreground">Works in any modern browser. No installation required.</p>
          <div className="mt-8">
            <Button size="lg" className="h-12 px-10 text-base" asChild>
              <Link to="/auth">Get Started Free <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
        </RevealSection>
      </section>
    </MarketingLayout>
  );
}
