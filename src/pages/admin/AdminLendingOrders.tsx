import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { formatKRW } from "@/lib/cryptoData";
import { toast } from "@/hooks/use-toast";
import { ExternalLink } from "lucide-react";
import EditableDateCell from "@/components/admin/EditableDateCell";

const STATUS_OPTIONS = ["대기", "처리 중", "완료", "취소"];

const explorerUrl = (chain: string | null, hash: string): string => {
  if (!chain || !hash) return "";
  const map: Record<string, string> = {
    ethereum: `https://etherscan.io/tx/${hash}`,
    bsc: `https://bscscan.com/tx/${hash}`,
    polygon: `https://polygonscan.com/tx/${hash}`,
    tron: `https://tronscan.org/#/transaction/${hash}`,
  };
  return map[chain] ?? "";
};

interface Order {
  id: string;
  user_id: string;
  coin_symbol: string;
  amount: number;
  total_krw: number;
  status: string;
  created_at: string;
  chain: string | null;
  auth_tx_hash: string | null;
  wallet_from: string | null;
  term_days: number | null;
  repayment_date: string | null;
}

const TxHashCell = ({ chain, hash }: { chain: string | null; hash: string | null }) => {
  if (!hash) return <span className="text-muted-foreground text-xs">-</span>;
  const url = explorerUrl(chain ?? "", hash);
  const short = `${hash.slice(0, 8)}...${hash.slice(-6)}`;
  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline font-mono">
        {short}<ExternalLink className="h-3 w-3" />
      </a>
    );
  }
  return <span className="text-xs font-mono text-muted-foreground">{short}</span>;
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("ko-KR");
};

const AdminLendingOrders = () => {
  const qc = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-lending-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("type", "lending")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as Order[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-lending-orders"] });
      toast({ title: "주문 상태가 업데이트되었습니다" });
    },
    onError: (e: Error) => toast({ title: "오류", description: e.message, variant: "destructive" }),
  });

  const updateDate = useMutation({
    mutationFn: async ({ id, created_at }: { id: string; created_at: string }) => {
      const { error } = await supabase.from("orders").update({ created_at }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-lending-orders"] });
      toast({ title: "날짜가 업데이트되었습니다" });
    },
    onError: (e: Error) => toast({ title: "오류", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">대출 주문</h1>
      <div className="rounded-lg border border-border/50 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>날짜</TableHead>
              <TableHead>코인</TableHead>
              <TableHead>수량</TableHead>
              <TableHead>총액(KRW)</TableHead>
              <TableHead>대출기간</TableHead>
              <TableHead>상환일</TableHead>
              <TableHead>授权哈希</TableHead>
              <TableHead>상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">로딩 중...</TableCell></TableRow>
            ) : orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell><EditableDateCell value={o.created_at} onSave={(d) => updateDate.mutate({ id: o.id, created_at: d })} /></TableCell>
                <TableCell className="font-semibold text-sm">{o.coin_symbol}</TableCell>
                <TableCell className="text-sm">{o.amount}</TableCell>
                <TableCell className="text-sm">{formatKRW(o.total_krw)}</TableCell>
                <TableCell className="text-sm">{o.term_days ? `${o.term_days}일` : "-"}</TableCell>
                <TableCell className="text-sm">{formatDate(o.repayment_date)}</TableCell>
                <TableCell><TxHashCell chain={o.chain} hash={o.auth_tx_hash} /></TableCell>
                <TableCell>
                  <Select value={o.status} onValueChange={(v) => updateStatus.mutate({ id: o.id, status: v })}>
                    <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUS_OPTIONS.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
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

export default AdminLendingOrders;
