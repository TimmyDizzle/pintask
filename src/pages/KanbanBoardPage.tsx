import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Columns3, GripVertical, Palette, Plus } from "lucide-react";

export default function KanbanBoardPage() {
  useDocumentTitle("Kanban Board — Pintask");

  return (
    <MarketingLayout>
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            Free online Kanban board
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Visualize your workflow with drag-and-drop Kanban boards. Create custom columns, set priorities, and move tasks through your pipeline with ease.
          </p>
          <div className="mt-8">
            <Button size="lg" className="h-12 px-10 text-base" asChild>
              <Link to="/auth">Create Your Board <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border/40 bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-4xl grid gap-8 sm:grid-cols-2">
          {[
            { icon: Columns3, title: "Custom Columns", desc: "Create columns that match your workflow — To Do, In Progress, Review, Done, or anything else." },
            { icon: GripVertical, title: "Drag & Drop", desc: "Move tasks between columns with smooth drag-and-drop. Reorder priorities instantly." },
            { icon: Palette, title: "Color-Coded Labels", desc: "Tag tasks with color-coded labels for quick visual categorization across your board." },
            { icon: Plus, title: "Multiple Boards", desc: "Create separate boards for different projects, clients, or areas of your life." },
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
          <h2 className="font-heading text-3xl font-bold tracking-tight">Start organizing with Kanban</h2>
          <p className="mt-4 text-muted-foreground">Free forever on the Personal plan. No credit card required.</p>
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
