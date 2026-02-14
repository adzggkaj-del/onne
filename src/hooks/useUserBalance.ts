import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface UserBalance {
  coinBalances: Record<string, number>; // coin_id -> amount
  krwBalance: number;
}

export const useUserBalance = () => {
  const { user } = useAuth();

  return useQuery<UserBalance>({
    queryKey: ["user-balance", user?.id],
    queryFn: async () => {
      if (!user) return { coinBalances: {}, krwBalance: 0 };

      const { data: orders, error } = await supabase
        .from("orders")
        .select("type, coin_id, amount, total_krw, status")
        .eq("user_id", user.id)
        .eq("status", "완료");

      if (error) throw error;

      const coinBalances: Record<string, number> = {};
      let krwBalance = 0;

      for (const order of orders ?? []) {
        const coinId = order.coin_id;
        if (!coinBalances[coinId]) coinBalances[coinId] = 0;

        if (order.type === "buy") {
          coinBalances[coinId] += Number(order.amount);
          krwBalance -= Number(order.total_krw);
        } else if (order.type === "sell") {
          coinBalances[coinId] -= Number(order.amount);
          krwBalance += Number(order.total_krw);
        }
      }

      return { coinBalances, krwBalance };
    },
    enabled: !!user,
    staleTime: 10000,
  });
};
