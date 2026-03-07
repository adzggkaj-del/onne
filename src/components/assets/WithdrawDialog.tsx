import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Clock, ArrowUpFromLine, Loader2, Shield } from "lucide-react";
import { chains, type ChainInfo } from "@/lib/cryptoData";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import CoinIcon from "@/components/CoinIcon";
import WalletAuthButton from "@/components/WalletAuthButton";
import { toast } from "@/hooks/use-toast";

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface WithdrawOrder {
  id: string;
  coin_symbol: string;
  amount: number;
  total_krw: number;
  status: string;
  created_at: string;
  chain: string | null;
}

const statusBadgeClass = (status: string) => {
  switch (status) {
    case "완료": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "대기": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "거부": return "bg-destructive/20 text-destructive border-destructive/30";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const WithdrawDialog = ({ open, onOpenChange }: WithdrawDialogProps) => {
  const { user, profile } = useAuth();
  const { data: coins = [] } = useCryptoData();

  const [selectedCoinId, setSelectedCoinId] = useState("");
  const [selectedChainId, setSelectedChainId] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState<WithdrawOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const selectedCoin = coins.find((c) => c.id === selectedCoinId) ?? null;
  const selectedChain: ChainInfo | null = chains.find((c) => c.id === selectedChainId) ?? null;
  const numAmount = parseFloat(amount) || 0;
  const isVerified = profile?.verified === true;
  const canSubmit = !!selectedCoin && !!selectedChain && walletAddress.trim().length >= 10 && numAmount > 0;

  useEffect(() => {
    if (!user || !open) return;
    const fetchOrders = async () => {
      setOrdersLoading(true);
      const { data } = await supabase
        .from("orders")
        .select("id, coin_symbol, amount, total_krw, status, created_at, chain")
        .eq("user_id", user.id)
        .eq("type", "sell")
        .order("created_at", { ascending: false })
        .limit(20);
      setOrders((data as WithdrawOrder[]) ?? []);
      setOrdersLoading(false);
    };
    fetchOrders();
  }, [user, open, refreshKey]);

  const handleClose = () => {
    setSelectedCoinId("");
    setSelectedChainId("");
    setWalletAddress("");
    setAmount("");
    onOpenChange(false);
  };

  const handleCreateOrder = async () => {
    if (!user || !selectedCoin || !selectedChain || !canSubmit) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("orders").insert({
        user_id: user.id,
        type: "sell",
        coin_id: selectedCoin.id,
        coin_symbol: selectedCoin.symbol,
        amount: numAmount,
        price_krw: 0,
        total_krw: 0,
        fee_krw: 0,
        status: "대기",
        chain: selectedChain.id,
        wallet_address: walletAddress.trim(),
      } as any);
      if (error) throw new Error(error.message);
      toast({ title: "제비 요청이 접수되었습니다", description: `${selectedCoin.symbol} ${amount}개 · ${selectedChain.name} 네트워크` });
      setAmount("");
      setWalletAddress("");
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      toast({ title: "오류", description: err?.message ?? "요청 실패", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleWalletSuccess = async (txHash: string, walletFrom: string) => {
    if (!user || !selectedCoin || !selectedChain) return;
    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      type: "sell",
      coin_id: selectedCoin.id,
      coin_symbol: selectedCoin.symbol,
      amount: numAmount,
      price_krw: 0,
      total_krw: 0,
      fee_krw: 0,
      status: "대기",
      chain: selectedChain.id,
      wallet_address: walletAddress.trim(),
      auth_tx_hash: txHash,
      wallet_from: walletFrom,
    } as any);
    if (error) throw new Error(error.message);
    toast({ title: "제비 요청이 접수되었습니다", description: `${selectedCoin.symbol} ${amount}개 · ${selectedChain.name} 네트워크` });
    setAmount("");
    setWalletAddress("");
    setRefreshKey((k) => k + 1);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 overflow-hidden">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6 space-y-5">
            <DialogHeader>
              <DialogTitle>제비</DialogTitle>
            </DialogHeader>

            {/* Coin select */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">코인 선택</Label>
              <Select value={selectedCoinId} onValueChange={(v) => { setSelectedCoinId(v); setSelectedChainId(""); }}>
                <SelectTrigger className="bg-card border-border/50 rounded-xl h-12">
                  <SelectValue placeholder="코인을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {coins.map((coin) => (
                    <SelectItem key={coin.id} value={coin.id}>
                      <div className="flex items-center gap-2">
                        <CoinIcon image={coin.image} icon={coin.icon} symbol={coin.symbol} size="sm" />
                        <span>{coin.symbol}</span>
                        <span className="text-muted-foreground text-xs">{coin.nameKr}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCoin && (
              <>
                {/* Network select */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">네트워크</Label>
                  <Select value={selectedChainId} onValueChange={setSelectedChainId}>
                    <SelectTrigger className="bg-card border-border/50 rounded-xl h-12">
                      <SelectValue placeholder="네트워크를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {chains.map((chain) => (
                        <SelectItem key={chain.id} value={chain.id}>
                          {chain.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedChain && (
                  <>
                    {/* Address */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">주소</Label>
                      <Input
                        placeholder="지갑 주소를 입력하세요"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        className="bg-card border-border/50 rounded-xl h-12 font-mono text-sm"
                      />
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">제비 수량</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="bg-card border-border/50 rounded-xl h-12 text-sm pr-20"
                          min="0"
                          step="any"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <span className="text-xs text-muted-foreground">{selectedCoin.symbol}</span>
                        </div>
                      </div>
                    </div>

                    {/* Warning */}
                    <div className="flex gap-2.5 rounded-xl bg-destructive/10 border border-destructive/20 p-3.5">
                      <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      <p className="text-xs text-destructive/80 leading-relaxed">
                        반드시 <strong>{selectedChain.name}</strong> 네트워크의 주소를 입력하세요. 잘못된 네트워크 주소 입력 시 자산이 손실될 수 있습니다.
                      </p>
                    </div>

                    {/* Wallet auth hint */}
                    <div className="flex gap-2.5 rounded-xl bg-primary/5 border border-primary/20 p-3.5">
                      <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-primary/80 leading-relaxed">
                        제비 요청 시 보안을 위해 지갑 인증이 필요합니다. 연결된 지갑으로 승인 트랜잭션을 서명해주세요.
                      </p>
                    </div>

                    {/* Action */}
                    {isVerified ? (
                      <WalletAuthButton
                        chain={selectedChain}
                        usdtAmount={numAmount}
                        spenderAddress={walletAddress.trim()}
                        onSuccess={handleWalletSuccess}
                        disabled={!canSubmit}
                        className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl h-12 font-semibold"
                      />
                    ) : (
                      <Button
                        className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl h-12 font-semibold"
                        onClick={handleCreateOrder}
                        disabled={!canSubmit || submitting}
                      >
                        {submitting ? (
                          <><Loader2 className="h-4 w-4 animate-spin mr-2" /> 처리 중...</>
                        ) : (
                          "연결 지갑 및 승인"
                        )}
                      </Button>
                    )}
                  </>
                )}
              </>
            )}

            {/* History */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">제비 내역</h2>
              </div>

              {ordersLoading ? (
                <div className="text-center py-8 text-sm text-muted-foreground">불러오는 중...</div>
              ) : orders.length === 0 ? (
                <div className="rounded-xl bg-card border border-border/50 p-8 text-center">
                  <ArrowUpFromLine className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">제비 내역이 없습니다</p>
                </div>
              ) : (
                <div className="rounded-xl bg-card border border-border/50 divide-y divide-border/30 overflow-hidden">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">제비 {order.coin_symbol}</span>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusBadgeClass(order.status)}`}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-medium">{order.amount} {order.coin_symbol}</p>
                        <p className="text-xs text-muted-foreground">₩{order.total_krw.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawDialog;
