import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, MicOff, Loader2, Sparkles } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Minimal typings for the Web Speech API (not in standard TS lib).
type SR = any;
function getSpeechRecognition(): { Ctor: any } | null {
  const w = window as any;
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return Ctor ? { Ctor } : null;
}

function splitFragments(text: string): string[] {
  return text
    .split(/[,.;\n]| then | and then |\band\b/i)
    .map((s) => s.trim())
    .filter((s) => s.length >= 3)
    .slice(0, 12);
}

export function VoiceCapture() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [creating, setCreating] = useState(false);
  const [columnId, setColumnId] = useState<string>("");
  const recogRef = useRef<SR | null>(null);

  useEffect(() => {
    setSupported(!!getSpeechRecognition());
  }, []);

  const { data: columns = [] } = useQuery({
    queryKey: ["voice-capture-columns", user?.id],
    enabled: !!user && open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("columns")
        .select("id, name, boards!inner(project_id, projects!inner(name))")
        .order("position", { ascending: true });
      if (error) throw error;
      return (data as any[]).map((c) => ({
        id: c.id as string,
        label: `${c.boards?.projects?.name ?? "Project"} · ${c.name}`,
      }));
    },
  });

  useEffect(() => {
    if (!columnId && columns.length > 0) setColumnId(columns[0].id);
  }, [columns, columnId]);

  const start = () => {
    const s = getSpeechRecognition();
    if (!s) return;
    const r = new s.Ctor();
    r.continuous = true;
    r.interimResults = true;
    r.lang = navigator.language || "en-US";
    let finalText = "";
    r.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += chunk + " ";
        else interim += chunk;
      }
      setTranscript((finalText + interim).trim());
    };
    r.onerror = (e: any) => {
      setListening(false);
      const msg = e?.error === "not-allowed"
        ? "Microphone blocked. Enable mic access in your browser."
        : e?.error === "no-speech"
        ? "No speech detected — try again."
        : "Voice capture error.";
      toast({ title: "Voice capture", description: msg, variant: "destructive" });
    };
    r.onend = () => setListening(false);
    recogRef.current = r;
    setTranscript("");
    setListening(true);
    try { r.start(); } catch { /* already started */ }
  };

  const stop = () => {
    try { recogRef.current?.stop(); } catch { /* noop */ }
    setListening(false);
  };

  const handleClose = () => {
    if (listening) stop();
    setOpen(false);
    setTranscript("");
  };

  const createTasks = async () => {
    if (!user || !columnId) return;
    const fragments = splitFragments(transcript);
    if (fragments.length === 0) {
      toast({ title: "Nothing to add", description: "Say a few tasks first.", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const { data: existing } = await supabase
        .from("tasks").select("position").eq("column_id", columnId)
        .order("position", { ascending: false }).limit(1);
      let pos = (existing?.[0]?.position ?? 0) + 1;

      const rows: any[] = [];
      for (const frag of fragments) {
        let parsed: any = { title: frag, dueDate: null, priority: "medium" };
        try {
          const { data, error } = await supabase.functions.invoke("parse-task", { body: { text: frag } });
          if (!error && data && !(data as any).error) {
            parsed = {
              title: (data as any).title || frag,
              dueDate: (data as any).dueDate || null,
              priority: (data as any).label === "urgent" ? "urgent" : ((data as any).priority || "medium"),
            };
          }
        } catch { /* fall back to raw */ }
        rows.push({
          column_id: columnId,
          user_id: user.id,
          title: parsed.title,
          due_date: parsed.dueDate,
          priority: parsed.priority,
          position: pos++,
        });
      }

      const { error } = await supabase.from("tasks").insert(rows);
      if (error) throw error;
      await qc.invalidateQueries();
      toast({ title: `Captured ${rows.length} task${rows.length === 1 ? "" : "s"}`, description: "Brain dumped. Good move." });
      handleClose();
    } catch (e: any) {
      toast({ title: "Couldn't save tasks", description: e.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  if (!supported) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button variant="outline" size="sm" disabled className="gap-1.5">
              <MicOff className="h-4 w-4" /> Voice
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Voice capture works in Chrome, Edge, and Safari.</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" size="sm" className="gap-1.5">
        <Mic className="h-4 w-4" /> Voice Capture
      </Button>
      <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" /> Voice Capture
            </DialogTitle>
            <DialogDescription>
              Just talk. Say tasks separated by "and", commas, or pauses — we'll split and parse them.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Where should these tasks go?
              </label>
              <Select value={columnId} onValueChange={setColumnId}>
                <SelectTrigger><SelectValue placeholder="Pick a column" /></SelectTrigger>
                <SelectContent>
                  {columns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border border-border bg-muted/30 p-3 min-h-[110px] text-sm">
              {transcript ? (
                <p className="leading-relaxed whitespace-pre-wrap">{transcript}</p>
              ) : (
                <p className="text-muted-foreground italic">
                  {listening ? "Listening..." : "Press Start and speak."}
                </p>
              )}
            </div>

            {transcript && (
              <div className="text-xs text-muted-foreground">
                Will create <strong>{splitFragments(transcript).length}</strong> task(s).
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            {!listening ? (
              <Button onClick={start} variant="outline" className="gap-1.5">
                <Mic className="h-4 w-4" /> {transcript ? "Add more" : "Start"}
              </Button>
            ) : (
              <Button onClick={stop} variant="outline" className="gap-1.5">
                <MicOff className="h-4 w-4 text-red-500" /> Stop
              </Button>
            )}
            <Button
              onClick={createTasks}
              disabled={creating || !transcript || !columnId}
              className="gap-1.5"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Save tasks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
