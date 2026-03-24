import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import RevealSection from "@/components/RevealSection";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function AboutPage() {
  useDocumentTitle("About — Pintask");

  return (
    <MarketingLayout>
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <RevealSection className="text-center">
            <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
              About Pintask
            </h1>
          </RevealSection>
          <RevealSection delay={100}>
            <div className="mt-12 space-y-6 text-muted-foreground leading-relaxed">
              <p>
                Pintask was born from a simple frustration: every project management tool out there is either too complex, too expensive, or too slow. We wanted something that just works — a clean Kanban board with time tracking, keyboard shortcuts, and nothing else in the way.
              </p>
              <p>
                Inspired by the original Pintask.me that thousands of people loved, we rebuilt the experience from the ground up with modern technology. Same simplicity-first philosophy, now with AI capabilities and a faster, more reliable platform.
              </p>
              <p>
                We believe productivity tools should get out of your way. No 50-page setup guides. No enterprise features you'll never use. Just open your board, add a task, and start working.
              </p>
            </div>
          </RevealSection>
          <RevealSection delay={200}>
            <h2 className="font-heading text-2xl font-bold text-foreground pt-8">Our principles</h2>
            <ul className="mt-4 space-y-3 list-disc list-inside text-muted-foreground leading-relaxed">
              <li><strong className="text-foreground">Simplicity first</strong> — If a feature adds complexity without clear value, we skip it.</li>
              <li><strong className="text-foreground">Speed matters</strong> — Every interaction should feel instant.</li>
              <li><strong className="text-foreground">Your data is yours</strong> — We never sell or share your data. Period.</li>
              <li><strong className="text-foreground">Fair pricing</strong> — A generous free tier and transparent paid plans.</li>
            </ul>
          </RevealSection>
          <RevealSection delay={300} className="mt-12 text-center">
            <Button size="lg" className="h-12 px-10 text-base" asChild>
              <Link to="/auth">Try Pintask Free <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </RevealSection>
        </div>
      </section>
    </MarketingLayout>
  );
}
