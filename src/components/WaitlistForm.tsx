import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface WaitlistFormProps {
  source: string;
  cta?: string;
  className?: string;
  variant?: "light" | "dark";
}

export default function WaitlistForm({
  source,
  cta = "Get Free Access",
  className = "",
  variant = "light",
}: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("waitlist_emails")
      .insert({ email: trimmed, source });
    setLoading(false);
    if (error && !error.message.includes("duplicate")) {
      toast({ title: "Something went wrong", description: error.message, variant: "destructive" });
      return;
    }
    setSuccess(true);
    setEmail("");
    toast({ title: "You're on the list!", description: "We'll be in touch soon." });
  };

  if (success) {
    return (
      <div className={`flex items-center justify-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-primary ${className}`}>
        <CheckCircle2 className="h-4 w-4" />
        You're in. Check your inbox.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={`flex flex-col gap-2 sm:flex-row ${className}`}>
      <Input
        type="email"
        required
        placeholder="you@work.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={variant === "dark" ? "h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50" : "h-12"}
      />
      <Button type="submit" size="lg" className="h-12 px-6 whitespace-nowrap" disabled={loading}>
        {loading ? "..." : cta} <ArrowRight className="ml-1 h-4 w-4" />
      </Button>
    </form>
  );
}
