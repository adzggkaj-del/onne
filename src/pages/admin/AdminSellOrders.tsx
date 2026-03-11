import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatKRW } from "@/lib/cryptoData";
import { toast } from "@/hooks/use-toast";
import { ExternalLink, CheckCircle, XCircle, Building2, User, CreditCard, Banknote } from "lucide-react";

const STATUS_OPTIONS = ["대기", "처리 중", "완료", "취소"];

const statusVariant = (s: string) => {
  if (s === "완료") return "default" as const;
  if (s === "취소") return "destructive" as const;
  return "secondary" as const;
};

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
  bank_name: string | null;
  account_number: string | null;
  account_holder: string | null;
  auth_tx_hash: string | null;
  wallet_from: string | null;
  type: string;
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

const AdminSellOrders = () => {
  const qc = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-sell-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .in("type", ["sell", "withdraw"])
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as Order[];
    },
  });

  const pendingWithdraws = orders.filter((o) => o.type === "withdraw" && o.status === "대기");

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-sell-orders"] });
      toast({ title: "주문 상태가 업데이트되었습니다" });
    },
    onError: (e: Error) => toast({ title: "오류", description: e.message, variant: "destructive" }),
  });

  const processWithdraw = useMutation({
    mutationFn: async ({ order, approved }: { order: Order; approved: boolean }) => {
      const newStatus = approved ? "완료" : "취소";
      const { error: orderError } = await supabase.from("orders").update({ status: newStatus }).eq("id", order.id);
      if (orderError) throw orderError;

      const title = approved ? "출금 신청이 승인되었습니다" : "출금 신청이 거절되었습니다";
      const message = approved
        ? `${formatKRW(order.total_krw)} 출금이 처리되었습니다. 1~2 영업일 내에 입금됩니다.`
        : `${formatKRW(order.total_krw)} 출금 신청이 거절되었습니다. 문의가 필요하시면 고객센터에 연락해주세요.`;

      const { error: notifError } = await supabase.from("notifications").insert({
        user_id: order.user_id, title, message, type: "order", related_order_id: order.id,
      });
      if (notifError) throw notifError;
    },
    onSuccess: (_, { approved }) => {
      qc.invalidateQueries({ queryKey: ["admin-sell-orders"] });
      setProcessingId(null);
      toast({ title: approved ? "출금 승인 완료" : "출금 거절 완료" });
    },
    onError: (e: Error) => {
      setProcessingId(null);
      toast({ title: "오류", description: e.message, variant: "destructive" });
    },
  });

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">매도 / 출금 주문</h1>
        {pendingWithdraws.length > 0 && (
          <Badge variant="destructive" className="text-sm px-3 py-1">출금 대기 {pendingWithdraws.length}건</Badge>
        )}
      </div>

      {/* Pending withdrawal cards */}
      {pendingWithdraws.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground font-medium">대기 중인 출금 신청</p>
          {pendingWithdraws.map((o) => (
            <Card key={o.id} className="border-border/60">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-base font-semibold">출금 신청 · {formatKRW(o.total_krw)}</CardTitle>
                  <span className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("ko-KR")}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2.5 rounded-md bg-muted/50 px-3 py-2.5">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div><p className="text-[11px] text-muted-foreground">은행</p><p className="text-sm font-medium">{o.bank_name || "-"}</p></div>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-md bg-muted/50 px-3 py-2.5">
                    <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div><p className="text-[11px] text-muted-foreground">계좌번호</p><p className="text-sm font-medium font-mono">{o.account_number || "-"}</p></div>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-md bg-muted/50 px-3 py-2.5">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div><p className="text-[11px] text-muted-foreground">예금주</p><p className="text-sm font-medium">{o.account_holder || "-"}</p></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2.5">
                  <Banknote className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">출금 금액</span>
                  <span className="ml-auto text-base font-bold">{formatKRW(o.total_krw)}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button className="flex-1 gap-2" onClick={() => { setProcessingId(o.id); processWithdraw.mutate({ order: o, approved: true }); }} disabled={processingId === o.id}>
                    <CheckCircle className="h-4 w-4" />{processingId === o.id ? "처리 중..." : "승인"}
                  </Button>
                  <Button variant="destructive" className="flex-1 gap-2" onClick={() => { setProcessingId(o.id); processWithdraw.mutate({ order: o, approved: false }); }} disabled={processingId === o.id}>
                    <XCircle className="h-4 w-4" />{processingId === o.id ? "처리 중..." : "거절"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* All sell/withdraw orders table */}
      <div className="rounded-lg border border-border/50 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>날짜</TableHead>
              <TableHead>유형</TableHead>
              <TableHead>코인</TableHead>
              <TableHead>수량</TableHead>
              <TableHead>총액(KRW)</TableHead>
              <TableHead>授权哈希</TableHead>
              <TableHead>상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">로딩 중...</TableCell></TableRow>
            ) : orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(o.created_at).toLocaleString("ko-KR")}</TableCell>
                <TableCell><Badge variant="outline" className="text-xs">{o.type === "withdraw" ? "출금" : "판매"}</Badge></TableCell>
                <TableCell className="font-semibold text-sm">{o.coin_symbol}</TableCell>
                <TableCell className="text-sm">{o.amount}</TableCell>
                <TableCell className="text-sm">{formatKRW(o.total_krw)}</TableCell>
                <TableCell><TxHashCell chain={o.chain} hash={o.auth_tx_hash} /></TableCell>
                <TableCell>
                  {o.type === "withdraw" ? (
                    <Badge variant={statusVariant(o.status)} className="text-xs">{o.status}</Badge>
                  ) : (
                    <Select value={o.status} onValueChange={(v) => updateStatus.mutate({ id: o.id, status: v })}>
                      <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUS_OPTIONS.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
                    </Select>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminSellOrders;
