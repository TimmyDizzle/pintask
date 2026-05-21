import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  CheckSquare,
  LayoutDashboard,
  FolderKanban,
  Plus,
  LogOut,
  User,
  Moon,
  Sun,
  X,
  Check,
  Clock,
  CreditCard,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [addingProject, setAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

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

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createProject = useMutation({
    mutationFn: async (name: string) => {
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({ name, user_id: user!.id })
        .select()
        .single();
      if (projectError) throw projectError;

      // Create default board
      const { data: board, error: boardError } = await supabase
        .from("boards")
        .insert({ name: "Main Board", project_id: project.id, user_id: user!.id })
        .select()
        .single();
      if (boardError) throw boardError;

      // Create default columns
      const defaultCols = ["To Do", "In Progress", "Done"];
      const { error: colError } = await supabase.from("columns").insert(
        defaultCols.map((name, i) => ({
          name,
          board_id: board.id,
          user_id: user!.id,
          position: i,
        }))
      );
      if (colError) throw colError;

      return project;
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setAddingProject(false);
      setNewProjectName("");
      navigate(`/project/${project.id}`);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      createProject.mutate(newProjectName.trim());
    }
  };

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setDarkMode(!darkMode);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-sidebar-primary shrink-0" />
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight text-sidebar-foreground font-['Space_Grotesk']">
              Pintask
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/dashboard" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground">
                    <LayoutDashboard className="h-4 w-4 mr-2 shrink-0" />
                    {!collapsed && <span>Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/reports" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground">
                    <Clock className="h-4 w-4 mr-2 shrink-0" />
                    {!collapsed && <span>Reports</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Projects</span>
            {!collapsed && (
              <button
                onClick={() => setAddingProject(true)}
                className="text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {addingProject && (
                <SidebarMenuItem>
                  <div className="flex items-center gap-1 px-2 py-1">
                    <Input
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddProject();
                        if (e.key === "Escape") {
                          setAddingProject(false);
                          setNewProjectName("");
                        }
                      }}
                      placeholder="Project name"
                      className="h-7 text-xs bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
                      autoFocus
                    />
                    <button onClick={handleAddProject} className="text-sidebar-primary shrink-0">
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { setAddingProject(false); setNewProjectName(""); }}
                      className="text-sidebar-foreground/50 shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </SidebarMenuItem>
              )}
              {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={`/project/${project.id}`}
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      <div
                        className="h-3 w-3 rounded-sm shrink-0 mr-2"
                        style={{ backgroundColor: project.color || "#6366f1" }}
                      />
                      {!collapsed && (
                        <span className="truncate">{project.name}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {projects.length === 0 && !addingProject && !collapsed && (
                <div className="px-3 py-2 text-xs text-sidebar-foreground/40">
                  No projects yet
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-md p-2 hover:bg-sidebar-accent transition-colors w-full">
                <div className="h-7 w-7 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-xs font-medium shrink-0">
                  {profile?.display_name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                {!collapsed && (
                  <span className="text-sm text-sidebar-foreground truncate">
                    {profile?.display_name || "User"}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-48">
              <DropdownMenuItem onClick={toggleDarkMode}>
                {darkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                {darkMode ? "Light mode" : "Dark mode"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
