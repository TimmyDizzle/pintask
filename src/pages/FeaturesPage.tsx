import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import RevealSection from "@/components/RevealSection";
import { Button } from "@/components/ui/button";
import { CheckSquare, Clock, Tags, Image, Keyboard, BarChart3, BrainCircuit, ArrowRight } from "lucide-react";

const features = [
  { icon: CheckSquare, title: "Kanban Boards", desc: "Drag-and-drop task management with customizable columns, priorities, and color-coded labels. Organize your workflow exactly the way you think." },
  { icon: Clock, title: "Built-in Time Tracking", desc: "Start a timer on any task with one click. See exactly where your hours go with per-task and per-project time reports." },
  { icon: Tags, title: "Labels & Comments", desc: "Color-coded labels for categorization. Add comments to any task for context, notes, or collaboration." },
  { icon: Image, title: "Image Attachments", desc: "Attach screenshots, mockups, and reference images directly to tasks or projects. Everything stays in context." },
  { icon: Keyboard, title: "Keyboard Shortcuts", desc: "Power users rejoice — navigate, create, move, and manage tasks entirely from the keyboard. No mouse required." },
  { icon: BarChart3, title: "Reports & Insights", desc: "Visualize your productivity with time tracking reports, task completion trends, and project-level analytics." },
  { icon: BrainCircuit, title: "AI Assistant (Coming Soon)", desc: "AI-powered daily briefings, smart task breakdowns, natural language task entry, and weekly productivity reports — built right into your board." },
];

export default function FeaturesPage() {
  useDocumentTitle("Features — Pintask");

  return (
    <MarketingLayout>
      <section className="px-6 py-20 md:py-28">
        <RevealSection className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            Everything you need. Nothing you don't.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Pintask gives you powerful task management tools without the bloat. Built for speed, designed for clarity.
          </p>
        </RevealSection>
      </section>

      <section className="border-t border-border/40 bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-6xl grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <RevealSection key={f.title} delay={100 + i * 80}>
              <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 font-heading text-lg font-semibold">{f.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      <section className="border-t border-border/40 px-6 py-16">
        <RevealSection className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight">Ready to get started?</h2>
          <p className="mt-4 text-muted-foreground">Try Pintask free — no credit card required.</p>
          <div className="mt-8">
            <Button size="lg" className="h-12 px-10 text-base" asChild>
              <Link to="/auth">Start Free <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
        </RevealSection>
      </section>
    </MarketingLayout>
  );
}
