import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckSquare,
  Clock,
  Tags,
  Image,
  Keyboard,
  BarChart3,
  ArrowRight,
  Loader2,
} from "lucide-react";
import productShot from "@/assets/product-shot.png";

const features = [
  {
    icon: CheckSquare,
    title: "Kanban Boards",
    desc: "Drag-and-drop task management with customizable columns and priorities.",
  },
  {
    icon: Clock,
    title: "Time Tracking",
    desc: "Built-in timer on every task. Know exactly where your hours go.",
  },
  {
    icon: Tags,
    title: "Labels & Comments",
    desc: "Organize with color-coded labels and collaborate through task comments.",
  },
  {
    icon: Image,
    title: "Image Attachments",
    desc: "Attach screenshots and reference images directly to tasks or projects.",
  },
  {
    icon: Keyboard,
    title: "Keyboard Shortcuts",
    desc: "Navigate and manage everything without touching your mouse.",
  },
  {
    icon: BarChart3,
    title: "Reports & Insights",
    desc: "Visualize productivity with time and task completion reports.",
  },
];

function EmailForm({ id }: { id?: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast({ title: "Please enter a valid email address", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("waitlist_emails").insert({ email: trimmed });
    setLoading(false);
    if (error) {
      if (error.code === "23505") {
        toast({ title: "You're already on the list! 🎉" });
      } else {
        toast({ title: "Something went wrong. Try again.", variant: "destructive" });
      }
    } else {
      toast({ title: "You're on the list! We'll be in touch. ✉️" });
      setEmail("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2" id={id}>
      <Input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-12 bg-background/80 backdrop-blur-sm border-border/50"
        required
      />
      <Button type="submit" size="lg" className="h-12 px-6 shrink-0" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
          <>Join Waitlist <ArrowRight className="ml-1 h-4 w-4" /></>
        )}
      </Button>
    </form>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2 font-heading text-xl font-bold text-primary">
            <CheckSquare className="h-6 w-6" />
            Pintask
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <a href="#features">Features</a>
            </Button>
            <Button asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-16 pt-20 md:pt-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Organize your work.
            <br />
            <span className="text-primary">Track your time.</span>
            <br />
            Ship faster.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Pintask is a lightweight project management tool with Kanban boards,
            built-in time tracking, and everything you need to stay on top of your
            work.
          </p>
          <div className="mt-8 flex justify-center">
            <EmailForm id="hero-email" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Join the waitlist — be the first to know when we launch.
          </p>
        </div>
      </section>

      {/* Product Shot */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl">
          <img
            src={productShot}
            alt="Pintask dashboard showing a Kanban board with tasks organized in columns"
            className="w-full rounded-lg shadow-2xl shadow-primary/10"
            loading="lazy"
          />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border/40 bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to stay productive
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
            No bloat. Just the tools that matter.
          </p>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border/50 bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to take control of your workflow?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Drop your email and we'll let you know the moment Pintask is ready.
          </p>
          <div className="mt-8 flex justify-center">
            <EmailForm id="bottom-email" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-heading font-semibold text-foreground">
            <CheckSquare className="h-4 w-4 text-primary" />
            Pintask
          </div>
          <span>© {new Date().getFullYear()} Pintask. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
