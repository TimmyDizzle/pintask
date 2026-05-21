import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Sparkles, Infinity as InfinityIcon, CreditCard, CalendarClock, ShieldCheck } from "lucide-react";

const PLAN_LABEL = {
  free: "Free For Now",
  loyalty: "Loyalty Club",
  cofounder: "Co-Founder Lifetime",
} as const;

const formatPrice = (cents: number, interval: string) => {
  const dollars = (cents / 100).toFixed(2);
  if (interval === "once") return `$${dollars} one-time`;
  if (interval === "monthly") return `$${dollars} / month`;
  if (interval === "yearly") return `$${dollars} / year`;
  return `$${dollars}`;
};

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function BillingPage() {
  useDocumentTitle("Billing");
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user!.id)
        .order("locked_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("cancel-subscription");
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription", user?.id] });
      toast({
        title: "Subscription canceled",
        description: "Your Loyalty Club membership has been canceled. You'll keep access until the end of your billing period.",
      });
      setConfirmOpen(false);
    },
    onError: (err: any) => {
      toast({ title: "Cancellation failed", description: err.message, variant: "destructive" });
    },
  });

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;

  const isFree = !subscription || subscription.status === "canceled";
  const isLoyalty = subscription?.plan === "loyalty" && subscription.status !== "canceled";
  const isCofounder = subscription?.plan === "cofounder" && subscription.status !== "canceled";

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-['Space_Grotesk']">Billing</h1>
          <p className="text-muted-foreground mt-1">Manage your plan, view renewals, and cancel anytime.</p>
        </div>

        {isLoading ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">Loading…</CardContent></Card>
        ) : (
          <>
            {/* Current plan card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-primary/10 p-2 text-primary mt-0.5">
                      {isCofounder ? <Sparkles className="h-5 w-5" /> :
                       isLoyalty ? <InfinityIcon className="h-5 w-5" /> :
                       <CreditCard className="h-5 w-5" />}
                    </div>
                    <div>
                      <CardTitle>{subscription ? PLAN_LABEL[subscription.plan] : PLAN_LABEL.free}</CardTitle>
                      <CardDescription className="mt-1">
                        {isCofounder && "Lifetime access — one payment, yours forever."}
                        {isLoyalty && "Grandfathered rate. This price never increases for you."}
                        {isFree && "You're on the free plan. Upgrade anytime to unlock more."}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={isFree ? "secondary" : "default"}>
                    {subscription?.status === "canceled" ? "Canceled" :
                     subscription?.status === "past_due" ? "Past due" :
                     subscription?.status === "pending" ? "Pending" :
                     subscription ? "Active" : "Free"}
                  </Badge>
                </div>
              </CardHeader>

              {subscription && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Price</p>
                      <p className="text-lg font-semibold mt-1">
                        {formatPrice(subscription.price_cents, subscription.billing_interval)}
                      </p>
                      {isLoyalty && (
                        <p className="text-xs text-accent flex items-center gap-1 mt-1">
                          <ShieldCheck className="h-3 w-3" /> Locked in forever
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <CalendarClock className="h-3 w-3" />
                        {subscription.billing_interval === "once" ? "Purchased" :
                         subscription.status === "canceled" ? "Canceled on" : "Next renewal"}
                      </p>
                      <p className="text-lg font-semibold mt-1">
                        {subscription.billing_interval === "once"
                          ? formatDate(subscription.locked_at)
                          : subscription.status === "canceled"
                          ? formatDate(subscription.canceled_at)
                          : formatDate(subscription.current_period_end)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Locked in on {formatDate(subscription.locked_at)}
                      {subscription.provider && ` · via ${subscription.provider}`}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Action card */}
            {isLoyalty && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cancel membership</CardTitle>
                  <CardDescription>
                    You'll keep access until the end of your current billing period. You can rejoin anytime — but the
                    <strong> $8/month rate is only available right now</strong>. If you cancel, you'll pay whatever the
                    public price is when you come back.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" onClick={() => setConfirmOpen(true)} disabled={cancelMutation.isPending}>
                    {cancelMutation.isPending ? "Canceling…" : "Cancel Loyalty Club"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {isCofounder && (
              <Card>
                <CardContent className="py-6">
                  <p className="text-sm text-muted-foreground">
                    Co-Founder Lifetime is a one-time purchase — there's nothing to cancel. Enjoy Pintask forever.
                  </p>
                </CardContent>
              </Card>
            )}

            {isFree && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upgrade your plan</CardTitle>
                  <CardDescription>Lock in lifetime access or our grandfathered monthly rate.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link to="/pricing">View plans</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Loyalty Club?</AlertDialogTitle>
            <AlertDialogDescription>
              You'll keep access until the end of your current billing period. If you ever come back, you'll pay the
              public price at that time — not the $8/month you have now.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep my membership</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
