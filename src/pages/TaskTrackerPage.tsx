import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Target, TrendingUp, Bell } from "lucide-react";

export default function TaskTrackerPage() {
  useDocumentTitle("Task Tracker — Pintask");

  return (
    <MarketingLayout>
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            Personal task tracker that keeps you focused
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Track tasks, manage deadlines, and measure your productivity — all in one clean, distraction-free workspace.
          </p>
          <div className="mt-8">
            <Button size="lg" className="h-12 px-10 text-base" asChild>
              <Link to="/auth">Start Tracking Tasks <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border/40 bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-4xl grid gap-8 sm:grid-cols-2">
          {[
            { icon: Target, title: "Set Priorities", desc: "Mark tasks as urgent, high, medium, or low priority. Focus on what matters most." },
            { icon: Clock, title: "Time Tracking", desc: "Built-in timer on every task. See exactly how long each task takes to complete." },
            { icon: Bell, title: "Due Date Reminders", desc: "Set deadlines and get notified before tasks are due. Never miss a deadline again." },
            { icon: TrendingUp, title: "Productivity Reports", desc: "Track task completion rates, time spent, and trends over time with visual reports." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-heading text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border/40 px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight">Take control of your tasks</h2>
          <p className="mt-4 text-muted-foreground">Free to use. No credit card. No strings attached.</p>
          <div className="mt-8">
            <Button size="lg" className="h-12 px-10 text-base" asChild>
              <Link to="/auth">Get Started Free <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
