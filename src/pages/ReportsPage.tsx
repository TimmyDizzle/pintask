import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Reports from "@/pages/Reports";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function ReportsPage() {
  useDocumentTitle("Reports");
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <AppLayout>
      <Reports />
    </AppLayout>
  );
}
