import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckSquare, ArrowRight, Menu, X } from "lucide-react";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className={`sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md transition-shadow duration-300 ${scrolled ? "shadow-sm" : ""}`}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold text-primary">
            <CheckSquare className="h-6 w-6" />
            Pintask
          </Link>
          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" asChild><Link to="/features">Features</Link></Button>
            <Button variant="ghost" asChild><Link to="/pricing">Pricing</Link></Button>
            <Button variant="ghost" asChild><Link to="/auth">Sign In</Link></Button>
            <Button asChild>
              <Link to="/auth">Start Free <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <button className="md:hidden rounded-md p-2 text-muted-foreground hover:bg-muted" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="border-t border-border/40 bg-background px-6 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              <Button variant="ghost" className="w-full justify-start" asChild><Link to="/features" onClick={() => setMobileMenuOpen(false)}>Features</Link></Button>
              <Button variant="ghost" className="w-full justify-start" asChild><Link to="/pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</Link></Button>
              <Button variant="ghost" className="w-full justify-start" asChild><Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Sign In</Link></Button>
              <Button className="w-full" asChild><Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Get Started Free</Link></Button>
            </div>
          </div>
        )}
      </nav>

      {/* Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/20 bg-[hsl(230,25%,10%)] px-6 py-14">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 font-heading text-lg font-bold text-white">
              <CheckSquare className="h-5 w-5 text-primary" />
              Pintask
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Simple task management for people who actually want to get things done.
            </p>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-gray-300">Product</h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-400">
              <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/extensions" className="hover:text-white transition-colors">Extensions</Link></li>
              <li><Link to="/auth" className="hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-gray-300">Use Cases</h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-400">
              <li><Link to="/kanban-board" className="hover:text-white transition-colors">Kanban Board</Link></li>
              <li><Link to="/task-tracker" className="hover:text-white transition-colors">Task Tracker</Link></li>
              <li><Link to="/trello-alternative" className="hover:text-white transition-colors">Trello Alternative</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-gray-300">Company</h4>
            <ul className="mt-4 space-y-2 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-6xl border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Pintask. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
