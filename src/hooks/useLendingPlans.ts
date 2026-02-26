import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LendingPlan {
  id: string;
  term_days: number;
  interest_rate: number;
  label: string;
  enabled: boolean;
  sort_order: number;
}

export const useLendingPlans = () => {
  return useQuery({
    queryKey: ["lending-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lending_plans" as any)
        .select("*")
        .eq("enabled", true)
        .order("sort_order");
      if (error) throw error;
      return (data as any[]).map((row): LendingPlan => ({
        id: row.id,
        term_days: row.term_days,
        interest_rate: row.interest_rate,
        label: row.label,
        enabled: row.enabled,
        sort_order: row.sort_order,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
};
