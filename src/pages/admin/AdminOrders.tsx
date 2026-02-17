import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatKRW } from "@/lib/cryptoData";
import { toast } from "@/hooks/use-toast";

const STATUS_OPTIONS = ["대기", "처리 중", "완료", "취소"];
const TYPE_MAP: Record<string, string> = { buy: "구매", sell: "판매", lending: "대출" };

const statusVariant = (s: string) => {
  if (s === "완료") return "default" as const;
  if (s === "취소") return "destructive" as const;
  return "secondary" as const;
};

const AdminOrders = () => {
  const qc = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      toast({ title: "주문 상태가 업데이트되었습니다" });
    },
    onError: (e: Error) => toast({ title: "오류", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">주문 관리</h1>
      <div className="rounded-lg border border-border/50 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>날짜</TableHead>
              <TableHead>유형</TableHead>
              <TableHead>코인</TableHead>
              <TableHead>수량</TableHead>
              <TableHead>총액</TableHead>
              <TableHead>상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">로딩 중...</TableCell></TableRow>
            ) : orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(o.created_at).toLocaleString("ko-KR")}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{TYPE_MAP[o.type] ?? o.type}</Badge>
                </TableCell>
                <TableCell className="font-semibold text-sm">{o.coin_symbol}</TableCell>
                <TableCell className="text-sm">{o.amount}</TableCell>
                <TableCell className="text-sm">{formatKRW(o.total_krw)}</TableCell>
                <TableCell>
                  <Select value={o.status} onValueChange={(v) => updateStatus.mutate({ id: o.id, status: v })}>
                    <SelectTrigger className="w-24 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminOrders;
