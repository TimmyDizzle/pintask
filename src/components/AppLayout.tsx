import { ReactNode, useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TaskSearch } from "@/components/TaskSearch";
import { NotificationBell } from "@/components/NotificationBell";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useDueTaskNotifications } from "@/hooks/useDueTaskNotifications";
import { useToast } from "@/hooks/use-toast";
import { Keyboard } from "lucide-react";

function AppLayoutInner({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  const [helpOpen, setHelpOpen] = useState(false);
  const { toast } = useToast();
  const toastShown = useRef(false);

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: dueTasks = [] } = useDueTaskNotifications(3);

  // Toast on page load for overdue / due-today tasks
  useEffect(() => {
    if (toastShown.current || dueTasks.length === 0) return;
    const overdue = dueTasks.filter((t) => t.status === "overdue");
    const today = dueTasks.filter((t) => t.status === "today");

    if (overdue.length > 0 || today.length > 0) {
      toastShown.current = true;
      const parts: string[] = [];
      if (overdue.length) parts.push(`${overdue.length} overdue`);
      if (today.length) parts.push(`${today.length} due today`);
      toast({
        title: "⏰ Tasks need attention",
        description: `You have ${parts.join(" and ")} task${overdue.length + today.length !== 1 ? "s" : ""}.`,
        variant: overdue.length > 0 ? "destructive" : undefined,
      });
    }
  }, [dueTasks, toast]);

  const shortcuts = useMemo(
    () => [
      { key: "b", handler: () => toggleSidebar() },
      { key: "d", handler: () => navigate("/") },
      { key: "r", handler: () => navigate("/reports") },
      { key: "?", shift: true, handler: () => setHelpOpen((v) => !v) },
      ...projects.slice(0, 9).map((p, i) => ({
        key: String(i + 1),
        handler: () => navigate(`/project/${p.id}`),
      })),
    ],
    [toggleSidebar, navigate, projects]
  );

  useKeyboardShortcuts(shortcuts);

  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 flex items-center justify-between border-b border-border px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <SidebarTrigger className="mr-4" />
          <div className="flex items-center gap-2">
            <TaskSearch />
            <NotificationBell />
            <button
              onClick={() => setHelpOpen(true)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Keyboard shortcuts (?)"
            >
              <Keyboard className="h-4 w-4" />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      <KeyboardShortcutsHelp open={helpOpen} onOpenChange={setHelpOpen} />
    </div>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </SidebarProvider>
  );
}
