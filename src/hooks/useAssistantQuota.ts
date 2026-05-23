import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AssistantUsage {
  tokens_used: number;
  tokens_limit: number;
  period_end: string;
}

export function useAssistantQuota() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["assistant-usage", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<AssistantUsage> => {
      const { data, error } = await supabase.rpc("get_user_assistant_usage", {
        _user_id: user!.id,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return {
        tokens_used: Number(row?.tokens_used ?? 0),
        tokens_limit: Number(row?.tokens_limit ?? 50000),
        period_end: row?.period_end ?? new Date().toISOString(),
      };
    },
  });
}
