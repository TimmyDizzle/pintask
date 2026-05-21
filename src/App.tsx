import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ProjectPage from "./pages/ProjectPage";
import ReportsPage from "./pages/ReportsPage";
import JVPage from "./pages/JVPage";
import JVSalesPage from "./pages/JVSalesPage";
import NotFound from "./pages/NotFound";
import FeaturesPage from "./pages/FeaturesPage";
import PricingPage from "./pages/PricingPage";
import ExtensionsPage from "./pages/ExtensionsPage";
import TrelloAlternativePage from "./pages/TrelloAlternativePage";
import KanbanBoardPage from "./pages/KanbanBoardPage";
import TaskTrackerPage from "./pages/TaskTrackerPage";
import AboutPage from "./pages/AboutPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import BillingPage from "./pages/BillingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/project/:projectId" element={<ProjectPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/jv" element={<JVPage />} />
            <Route path="/jvsalespage" element={<JVSalesPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/extensions" element={<ExtensionsPage />} />
            <Route path="/trello-alternative" element={<TrelloAlternativePage />} />
            <Route path="/kanban-board" element={<KanbanBoardPage />} />
            <Route path="/task-tracker" element={<TaskTrackerPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
