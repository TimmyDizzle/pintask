import { useState, useEffect } from "react";
import fullDemoGif from "@/assets/pintask-full-demo.gif";
import { Button } from "@/components/ui/button";
import {
  Zap, CheckCircle2, ArrowRight, Shield, Star, Clock,
  Brain, Timer, Tag, BarChart3, Keyboard, Layout,
  ChevronDown, ChevronUp, Users, Rocket, TrendingUp,
  DollarSign, MousePointerClick, Sparkles, Target
} from "lucide-react";

// ─── Countdown Timer ───
function CountdownTimer() {
  const [time, setTime] = useState({ m: 29, s: 59 });
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        if (prev.m === 0 && prev.s === 0) return { m: 29, s: 59 };
        if (prev.s === 0) return { m: prev.m - 1, s: 59 };
        return { ...prev, s: prev.s - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="flex items-center gap-1">
      <span className="bg-red-600 text-white font-mono font-bold px-2 py-1 rounded text-sm">00</span>
      <span className="text-red-400 font-bold">:</span>
      <span className="bg-red-600 text-white font-mono font-bold px-2 py-1 rounded text-sm">{pad(time.m)}</span>
      <span className="text-red-400 font-bold">:</span>
      <span className="bg-red-600 text-white font-mono font-bold px-2 py-1 rounded text-sm">{pad(time.s)}</span>
    </div>
  );
}

// ─── Floating Badges ───
function FloatingBadge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`hidden lg:flex items-center gap-2 bg-[#1a1a2e]/80 backdrop-blur border border-white/10 rounded-full px-4 py-2 text-xs font-medium text-white/80 absolute animate-pulse ${className}`}>
      {children}
    </div>
  );
}

// ─── FAQ Item ───
function FaqItem({ num, q, a }: { num: string; q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left border border-white/10 rounded-xl p-5 hover:border-purple-500/30 transition-colors bg-white/[0.02]"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-purple-400 font-mono text-sm font-bold">{num}</span>
          <span className="font-semibold text-white/90">{q}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-purple-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-purple-400 shrink-0" />}
      </div>
      {open && <p className="mt-3 text-white/60 text-sm leading-relaxed pl-8">{a}</p>}
    </button>
  );
}

// ─── CTA Block (reused) ───
function CtaBlock() {
  return (
    <div className="border border-purple-500/20 rounded-2xl bg-gradient-to-b from-purple-500/5 to-transparent p-8 text-center max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-3 mb-4">
        <Clock className="w-4 h-4 text-red-400" />
        <span className="text-red-400 text-sm font-medium">Limited Access — Offer Closes Soon</span>
        <CountdownTimer />
      </div>
      <p className="text-white/50 text-sm mb-1">Total Value <span className="line-through">$497</span></p>
      <p className="text-white text-lg mb-5">
        Get Instant Access to <strong>Pintask Pro</strong> — Today Only <span className="text-green-400 font-bold text-2xl">$17</span>
      </p>
      <a href="#pricing">
        <Button size="lg" className="w-full sm:w-auto text-base px-10 py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold shadow-lg shadow-green-500/25 border-0 rounded-xl">
          Get Instant Access To Pintask Now!
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </a>
      <div className="flex items-center justify-center gap-2 mt-4 text-white/40 text-xs">
        <Shield className="w-3 h-3" />
        14-Day Money-Back Guarantee
      </div>
    </div>
  );
}

// ─── Main Page ───
export default function JVSalesPage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 200);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white overflow-x-hidden">
      {/* Sticky Bottom Bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a1a]/95 backdrop-blur border-t border-white/10 py-3 px-4 transition-transform duration-300 ${scrolled ? "translate-y-0" : "translate-y-full"}`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-red-400 text-sm font-medium hidden sm:block">Price increases when timer runs out</span>
            <CountdownTimer />
          </div>
          <a href="#pricing">
            <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-6 border-0">
              Get Access Now for Only $17
            </Button>
          </a>
        </div>
      </div>

      {/* ═══════ HERO ═══════ */}
      <section className="relative pt-12 pb-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />
        
        {/* Floating badges */}
        <FloatingBadge className="top-20 left-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
          <span className="w-2 h-2 rounded-full bg-green-400 absolute" />
          AI Assistant <span className="text-green-400 font-bold text-[10px]">ACTIVE</span>
        </FloatingBadge>
        <FloatingBadge className="top-36 right-8">
          <Zap className="w-3 h-3 text-yellow-400" />
          Task Engine <span className="text-yellow-400 font-bold text-[10px]">RUNNING</span>
        </FloatingBadge>
        <FloatingBadge className="top-64 left-12">
          <TrendingUp className="w-3 h-3 text-emerald-400" />
          Productivity <span className="text-emerald-400 font-bold text-[10px]">+247%</span>
        </FloatingBadge>
        <FloatingBadge className="bottom-32 right-16">
          <Target className="w-3 h-3 text-purple-400" />
          Tasks Completed <span className="text-purple-400 font-bold text-[10px]">2,847</span>
        </FloatingBadge>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-5 py-2 text-sm text-purple-300 mb-8">
            <Sparkles className="w-4 h-4" />
            The AI-Powered Task Manager That Works While You Sleep
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            An AI Task Manager That{" "}
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Organizes Your Day,
            </span>{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Tracks Your Time,
            </span>{" "}
            & Boosts Productivity —{" "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent italic">
              In Minutes Flat
            </span>
          </h1>
          
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10">
            Other tools charge <strong className="text-white">$10/mo… $25/mo… $50/mo</strong> for this. 
            You're about to get lifetime access for <strong className="text-green-400">$17</strong>.
          </p>

          {/* Demo Area Placeholder */}
          <div className="relative max-w-3xl mx-auto rounded-2xl border border-white/10 bg-[#12122a] overflow-hidden mb-10">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs text-white/50 font-mono">PINTASK LIVE DEMO</span>
              </div>
              <span className="text-xs text-purple-400 font-mono">AI SYSTEM ACTIVE</span>
            </div>
            <div className="aspect-video bg-[#12122a]">
              <img src={fullDemoGif} alt="Pintask live demo – Kanban, Reports & AI Briefing" className="w-full h-full object-cover" />
            </div>
          </div>

          <CtaBlock />
        </div>
      </section>

      {/* ═══════ STAT BADGES ═══════ */}
      <section className="border-y border-white/5 py-8 bg-white/[0.01]">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { icon: Brain, label: "AI Task Breakdown", sub: "Auto-splits complex work" },
            { icon: Timer, label: "Built-In Timer", sub: "Track every minute" },
            { icon: Keyboard, label: "Keyboard First", sub: "Mouse-free workflow" },
            { icon: BarChart3, label: "Smart Reports", sub: "AI weekly summaries" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-sm font-semibold text-white/90">{s.label}</p>
              <p className="text-xs text-white/40">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ THE PROBLEM ═══════ */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <p className="text-purple-400 text-sm font-semibold tracking-wider uppercase mb-4 text-center">THE PROBLEM</p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          You're Drowning in Tasks.<br />
          <span className="text-white/50">And Your Tools Make It Worse.</span>
        </h2>
        <div className="max-w-2xl mx-auto space-y-4 text-white/60 text-center text-lg">
          <p>Trello gets messy fast. Asana feels like enterprise bloatware. Notion is a wiki pretending to be a task manager.</p>
          <p className="text-white/80 font-semibold">You don't need another "project management" tool. You need a system that actually helps you <span className="text-green-400">get things done</span>.</p>
        </div>
      </section>

      {/* ═══════ WHAT IS PINTASK ═══════ */}
      <section className="bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <p className="text-purple-400 text-sm font-semibold tracking-wider uppercase mb-4 text-center">MEET PINTASK</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            The Task Manager Built for{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Speed, Simplicity & AI</span>
          </h2>
          <p className="text-white/50 text-center max-w-2xl mx-auto mb-14">Everything you need to manage your entire day — without the bloat.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Layout, title: "Drag & Drop Kanban", desc: "Intuitive boards that feel effortless. Organize tasks visually in seconds." },
              { icon: Brain, title: "AI Daily Briefings", desc: "Wake up to an AI-generated summary of your priorities. Never miss what matters." },
              { icon: Keyboard, title: "Full Keyboard Nav", desc: "Power users can manage their entire day without touching a mouse." },
              { icon: Timer, title: "Built-In Time Tracker", desc: "Track time per task — no third-party tool needed. See where your hours go." },
              { icon: Sparkles, title: "Natural Language Entry", desc: "'Remind me to call John on Friday' — just type naturally, AI handles the rest." },
              { icon: BarChart3, title: "AI Weekly Reports", desc: "Automated productivity insights delivered to you. Know exactly how you performed." },
              { icon: Tag, title: "Labels & Priorities", desc: "Color-coded organization with due dates, priority levels, and smart filters." },
              { icon: MousePointerClick, title: "One-Click Projects", desc: "Create boards, columns, and tasks in seconds. Zero learning curve." },
              { icon: Users, title: "Team Collaboration", desc: "Share boards, assign tasks, and stay in sync with your team effortlessly." },
            ].map((f) => (
              <div key={f.title} className="border border-white/10 rounded-xl p-6 bg-white/[0.02] hover:border-purple-500/30 hover:bg-purple-500/5 transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white/90 mb-2">{f.title}</h3>
                <p className="text-sm text-white/50">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS (Numbered Steps) ═══════ */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <p className="text-purple-400 text-sm font-semibold tracking-wider uppercase mb-4 text-center">AI IN ACTION</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          What Pintask Does For You —{" "}
          <span className="text-white/50">Automatically</span>
        </h2>
        <div className="space-y-6 max-w-2xl mx-auto">
          {[
            { step: "01", title: "Creates your daily action plan", tag: "AI-Powered" },
            { step: "02", title: "Breaks big tasks into small steps", tag: "Automated" },
            { step: "03", title: "Tracks your time on every task", tag: "Built-In" },
            { step: "04", title: "Sends you smart due-date reminders", tag: "Automated" },
            { step: "05", title: "Generates weekly productivity reports", tag: "AI-Powered" },
            { step: "06", title: "Lets you manage everything from keyboard", tag: "Speed" },
          ].map((s) => (
            <div key={s.step} className="flex items-center gap-5 border border-white/10 rounded-xl p-5 bg-white/[0.02] hover:border-purple-500/20 transition-colors">
              <span className="text-2xl font-bold text-purple-400 font-mono w-10 shrink-0">{s.step}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-white/90">{s.title}</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-500/10 px-3 py-1 rounded-full shrink-0">{s.tag}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-white/50 mt-8">
          All of this happens <strong className="text-white/80">automatically</strong>. You just focus on doing the work.
        </p>
      </section>

      {/* ═══════ CTA BREAK ═══════ */}
      <section className="px-4 pb-20">
        <CtaBlock />
      </section>

      {/* ═══════ COMPARISON: OLD vs NEW ═══════ */}
      <section className="bg-white/[0.02] border-y border-white/5 py-20 px-4">
        <p className="text-purple-400 text-sm font-semibold tracking-wider uppercase mb-4 text-center">THE HIDDEN COST</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          How Pintask Saves You Hours Every Week
        </h2>
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Old way */}
          <div className="border border-red-500/20 rounded-2xl p-8 bg-red-500/5">
            <p className="text-red-400 text-sm font-bold uppercase tracking-wider mb-4">⚠️ The Old Way</p>
            <h3 className="text-xl font-bold mb-6 text-white/90">Juggling 5 different tools</h3>
            <ul className="space-y-3 text-white/60 text-sm">
              <li className="flex gap-2"><span className="text-red-400">✕</span> Trello for tasks, Toggl for time, Notion for notes…</li>
              <li className="flex gap-2"><span className="text-red-400">✕</span> No AI, no automation, no insights</li>
              <li className="flex gap-2"><span className="text-red-400">✕</span> Context-switching kills your focus</li>
              <li className="flex gap-2"><span className="text-red-400">✕</span> Paying $30-50/mo for fragmented tools</li>
            </ul>
            <p className="mt-6 text-red-400/70 text-sm font-medium">😤 Expensive. Fragmented. Exhausting.</p>
          </div>
          {/* New way */}
          <div className="border border-green-500/20 rounded-2xl p-8 bg-green-500/5">
            <p className="text-green-400 text-sm font-bold uppercase tracking-wider mb-4">✦ The Pintask Way</p>
            <h3 className="text-xl font-bold mb-6 text-white/90">Everything in one place</h3>
            <ul className="space-y-3 text-white/60 text-sm">
              <li className="flex gap-2"><span className="text-green-400">✓</span> Kanban + Timer + AI — all built in</li>
              <li className="flex gap-2"><span className="text-green-400">✓</span> AI writes your daily plan automatically</li>
              <li className="flex gap-2"><span className="text-green-400">✓</span> Keyboard-first speed, zero friction</li>
              <li className="flex gap-2"><span className="text-green-400">✓</span> One-time $17 — no monthly fees ever</li>
            </ul>
            <p className="mt-6 text-green-400/70 text-sm font-medium">🚀 Fast. Focused. All-in-one.</p>
          </div>
        </div>
      </section>

      {/* ═══════ SOCIAL PROOF ═══════ */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="flex flex-wrap items-center justify-center gap-2 text-2xl mb-3">🚀⚡🔥💎🌟🎯💡🏆</div>
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Users Are Already Crushing It.{" "}
          <span className="text-white/50">And They Can't Stop Talking About It. 🔥</span>
        </h2>
        <p className="text-white/40 text-center mb-12">No hype. No filters. Just real results.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { quote: "Replaced Trello AND Toggl in one day. The AI daily briefing alone is worth it.", name: "Sarah M.", role: "Freelance Designer" },
            { quote: "I manage my entire agency from keyboard shortcuts now. Insanely fast.", name: "Marcus T.", role: "Agency Owner" },
            { quote: "The time tracker built into the kanban board? Why doesn't every tool do this?", name: "Priya K.", role: "Solo Consultant" },
            { quote: "Set it up in 5 minutes. Already more organized than I've been in months.", name: "Jake R.", role: "Content Creator" },
          ].map((t, i) => (
            <div key={i} className="border border-white/10 rounded-xl p-6 bg-white/[0.02]">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-white/70 text-sm mb-4 italic">"{t.quote}"</p>
              <div>
                <p className="text-white/90 text-sm font-semibold">{t.name}</p>
                <p className="text-white/40 text-xs">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ TWO CHOICES ═══════ */}
      <section className="bg-white/[0.02] border-y border-white/5 py-20 px-4">
        <p className="text-purple-400 text-sm font-semibold tracking-wider uppercase mb-4 text-center">THE ONLY QUESTION LEFT</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Right now you have two choices.
        </h2>
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="border border-red-500/20 rounded-2xl p-8 bg-red-500/5 text-center">
            <p className="text-red-400 font-bold text-sm uppercase tracking-wider mb-3">⚠️ The Hard Way</p>
            <h3 className="text-xl font-bold mb-4">Stay in the grind.</h3>
            <ul className="space-y-2 text-white/50 text-sm text-left">
              <li>Spend hours organizing tasks that AI handles in minutes</li>
              <li>Keep paying monthly for 3-5 separate tools</li>
              <li>Work harder. Get less done. Wonder what went wrong.</li>
            </ul>
          </div>
          <div className="border border-green-500/20 rounded-2xl p-8 bg-green-500/5 text-center">
            <p className="text-green-400 font-bold text-sm uppercase tracking-wider mb-3">✦ The Smart Move</p>
            <h3 className="text-xl font-bold mb-4">Deploy Pintask. Own your time.</h3>
            <ul className="space-y-2 text-white/50 text-sm text-left">
              <li>AI handles the planning — you focus on execution</li>
              <li>One tool. One payment. Everything you need.</li>
              <li>Get more done in less time, starting today.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ═══════ THE OFFER ═══════ */}
      <section className="max-w-4xl mx-auto px-4 py-20" id="pricing">
        <p className="text-purple-400 text-sm font-semibold tracking-wider uppercase mb-4 text-center">THE OFFER</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Here's What You Get When You<br />Grab Access Today
        </h2>
        <p className="text-white/50 text-center max-w-xl mx-auto mb-12">
          Everything you need to supercharge your productivity — no learning curve required.
        </p>

        <div className="border border-purple-500/20 rounded-2xl bg-gradient-to-b from-purple-500/5 to-transparent p-8 sm:p-12 max-w-2xl mx-auto">
          <div className="space-y-4 mb-8">
            {[
              "Full Pintask Pro Access (Lifetime)",
              "Unlimited Kanban Boards & Projects",
              "AI Daily Briefings & Smart Summaries",
              "Built-In Time Tracker (per task)",
              "Natural Language Task Entry (AI-Powered)",
              "AI Weekly Productivity Reports",
              "Full Keyboard Navigation System",
              "Labels, Priorities & Due Date Reminders",
              "Team Collaboration Features",
              "All Future Updates — Free Forever",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                <span className="text-white/80">{item}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-white/40 text-sm mb-1">💎 Total Value: <span className="line-through">$497</span></p>
            <p className="text-white text-sm mb-1">🚀 Today Only:</p>
            <p className="text-5xl font-bold text-green-400 mb-1">$17</p>
            <p className="text-white/40 text-xs mb-6">One-time payment. No monthly fees. No hidden costs.</p>
            
            <a href="https://www.jvzoo.com" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="w-full text-lg py-7 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold shadow-lg shadow-green-500/25 border-0 rounded-xl">
                Get Instant Access Now — Only $17
              </Button>
            </a>

            <div className="flex items-center justify-center gap-4 mt-4 text-white/30 text-xs">
              <span>🔒 256-bit secure checkout</span>
              <span>⚡ Instant delivery</span>
              <span>💳 One-time payment</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ GUARANTEE ═══════ */}
      <section className="bg-white/[0.02] border-y border-white/5 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl font-bold text-green-400">14</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            14-Day Simple Guarantee
          </h2>
          <p className="text-white/50 mb-4">No hoops. No fine print. Just results — or your money back.</p>
          <div className="text-white/60 text-sm space-y-2 max-w-md mx-auto text-left">
            <p>Try Pintask for a full 14 days.</p>
            <p>Set up your boards. Use the AI features. Track your time.</p>
            <p>If you don't feel more productive and organized…</p>
            <p>Email us. We'll refund you. <strong className="text-white/80">No drama. No questions.</strong></p>
          </div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className="max-w-3xl mx-auto px-4 py-20">
        <p className="text-purple-400 text-sm font-semibold tracking-wider uppercase mb-4 text-center">💬 Got Questions?</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          <FaqItem num="01" q="Is Pintask really free?" a="Yes — the Personal plan is free forever with no credit card required. We're also fully free during the beta period including features that will be paid later. This JVZoo offer gives you lifetime Pro access at a massive discount." />
          <FaqItem num="02" q="How is this different from Trello?" a="Trello is great but has no built-in time tracker, limited keyboard shortcuts, and gets complicated fast. Pintask is built for speed — you can manage your entire day without touching your mouse. It also has AI features Trello doesn't offer." />
          <FaqItem num="03" q="What AI features are included?" a="AI-powered daily briefings, smart task breakdowns, natural language task entry ('remind me to call John on Friday'), and weekly productivity reports — all built directly into your board." />
          <FaqItem num="04" q="Is my data safe?" a="Yes. All data is encrypted at rest and in transit. We don't sell your data or share it with third parties. Ever." />
          <FaqItem num="05" q="What if I don't like it?" a="You're covered by our 14-day money-back guarantee. Try it risk-free. If it's not for you, email us and we'll refund you — no questions asked." />
          <FaqItem num="06" q="Do I need technical skills?" a="Not at all. Pintask is 100% browser-based. No downloads, no installs, no code. If you can use a web browser, you can use Pintask." />
          <FaqItem num="07" q="Is this a monthly subscription?" a="No — this JVZoo offer is a one-time payment. You get lifetime Pro access. No recurring charges ever." />
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section className="px-4 pb-20">
        <CtaBlock />
      </section>

      {/* ═══════ DISCLAIMER FOOTER ═══════ */}
      <footer className="border-t border-white/5 bg-[#060612]">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="text-[11px] text-white/25 leading-relaxed space-y-4">
            <p className="font-semibold text-white/40 text-xs">Disclaimer</p>
            <p>
              Please note that this product does not provide any guarantee of income or success. The results achieved by the product owner or any other individuals mentioned are not indicative of future success or earnings. This website is not affiliated with FaceBook or any of its associated entities. Once you navigate away from FaceBook, the responsibility for the content and its usage lies solely with the user. All content on this website, including but not limited to text, images, and multimedia, is protected by copyright law and the Digital Millennium Copyright Act. Unauthorized copying, duplication, modification, or theft, whether intentional or unintentional, is strictly prohibited. Violators will be prosecuted to the fullest extent of the law.
            </p>
            <p>
              We want to clarify that JVZoo serves as the retailer for the products featured on this site. JVZoo® is a registered trademark of BBC Systems Inc., a Florida corporation located at 1809 E. Broadway Street, Suite 125, Oviedo, FL 32765, USA, and is used with permission. The role of JVZoo as a retailer does not constitute an endorsement, approval, or review of these products or any claims, statements, or opinions used in their promotion.
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-white/20">© {new Date().getFullYear()} Pintask. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Bottom padding for sticky bar */}
      <div className="h-16" />
    </div>
  );
}
