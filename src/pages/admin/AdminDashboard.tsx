import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ShoppingCart, Coins, Settings } from "lucide-react";

const AdminDashboard = () => {
  const { data: userCount = 0 } = useQuery({
    queryKey: ["admin-user-count"],
    queryFn: async () => {
      const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: orderCount = 0 } = useQuery({
    queryKey: ["admin-order-count"],
    queryFn: async () => {
      const { count } = await supabase.from("orders").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: coinCount = 0 } = useQuery({
    queryKey: ["admin-coin-count"],
    queryFn: async () => {
      const { count } = await supabase.from("supported_coins").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const { data: pendingOrders = 0 } = useQuery({
    queryKey: ["admin-pending-orders"],
    queryFn: async () => {
      const { count } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "대기");
      return count ?? 0;
    },
  });

  const stats = [
    { label: "총 사용자", value: userCount, icon: Users, color: "text-primary" },
    { label: "총 주문", value: orderCount, icon: ShoppingCart, color: "text-success" },
    { label: "지원 코인", value: coinCount, icon: Coins, color: "text-accent" },
    { label: "대기 주문", value: pendingOrders, icon: Settings, color: "text-destructive" },
  ];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">대시보드</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="bg-card border-border/50">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <span className="text-sm text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
