import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import ScrollToTop from "@/components/ScrollToTop";
import AdminGuard from "@/components/AdminGuard";

const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ProjectPage = lazy(() => import("./pages/ProjectPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const JVPage = lazy(() => import("./pages/JVPage"));
const JVSalesPage = lazy(() => import("./pages/JVSalesPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const FeaturesPage = lazy(() => import("./pages/FeaturesPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const ExtensionsPage = lazy(() => import("./pages/ExtensionsPage"));
const TrelloAlternativePage = lazy(() => import("./pages/TrelloAlternativePage"));
const KanbanBoardPage = lazy(() => import("./pages/KanbanBoardPage"));
const TaskTrackerPage = lazy(() => import("./pages/TaskTrackerPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const BillingPage = lazy(() => import("./pages/BillingPage"));
const AdAnalyticsPage = lazy(() => import("./pages/AdAnalyticsPage"));
const AdminBlogList = lazy(() => import("./pages/AdminBlogList"));
const AdminBlogEditor = lazy(() => import("./pages/AdminBlogEditor"));
const AdminAiEval = lazy(() => import("./pages/AdminAiEval"));
const AssistantPage = lazy(() => import("./pages/AssistantPage"));
const UnsubscribePage = lazy(() => import("./pages/UnsubscribePage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      retry: 1,
    },
  },
});

function PageLoader() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#1b1b1b" }}>
      <div style={{ width: 28, height: 28, border: "3px solid #444", borderTopColor: "#c5c1b9", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <CookieConsentBanner />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
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
              <Route path="/ad-analytics" element={<AdminGuard><AdAnalyticsPage /></AdminGuard>} />
              <Route path="/assistant" element={<AssistantPage />} />
              <Route path="/unsubscribe" element={<UnsubscribePage />} />
              <Route path="/admin/blog" element={<AdminBlogList />} />
              <Route path="/admin/blog/:id" element={<AdminBlogEditor />} />
              <Route path="/admin/ai-eval" element={<AdminAiEval />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
