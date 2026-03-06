import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Loader2, Clock, ArrowUpFromLine, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { chains, type ChainInfo } from "@/lib/cryptoData";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AnimatedPage from "@/components/AnimatedPage";
import CoinIcon from "@/components/CoinIcon";
import WalletAuthButton from "@/components/WalletAuthButton";
import { toast } from "@/hooks/use-toast";

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

const SellFormPage = () => {
  const { coinId } = useParams<{ coinId: string }>();
  const navigate = useNavigate();
  const { data: coins = [] } = useCryptoData();
  const { user, profile } = useAuth();

  const selectedCoin = coins.find((c) => c.id === coinId) ?? null;

  const [selectedChainId, setSelectedChainId] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [orders, setOrders] = useState<WithdrawOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const selectedChain: ChainInfo | null =
    chains.find((c) => c.id === selectedChainId) ?? null;
  const numAmount = parseFloat(amount) || 0;
  const isVerified = profile?.verified === true;
  const canSubmit = !!selectedChain && walletAddress.trim().length >= 10 && numAmount > 0;

  // Fetch withdrawal history
  useEffect(() => {
    if (!user) return;
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
  }, [user, confirmed]);

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
      setConfirmed(true);
      toast({
        title: "제비 요청이 접수되었습니다",
        description: `${selectedCoin.symbol} ${amount}개 · ${selectedChain.name} 네트워크`,
      });
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
    setConfirmed(true);
    toast({
      title: "제비 요청이 접수되었습니다",
      description: `${selectedCoin.symbol} ${amount}개 · ${selectedChain.name} 네트워크`,
    });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  if (!selectedCoin) {
    return (
      <AnimatedPage>
        <div className="p-4 md:p-6 max-w-4xl mx-auto text-center py-20">
          <p className="text-muted-foreground">코인 데이터를 불러오는 중...</p>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="p-4 md:p-6 max-w-lg mx-auto space-y-6">
        {/* Back */}
        <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground" onClick={() => navigate("/sell")}>
          <ArrowLeft className="h-4 w-4" /> 뒤로
        </Button>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold">제비</h1>
          <p className="text-sm text-muted-foreground mt-1">선택한 코인을 외부 지갑으로 출금합니다</p>
        </div>

        {confirmed ? (
          <div className="text-center space-y-3 py-10">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-red-500/20">
              <Check className="h-8 w-8 text-red-500" />
            </div>
            <p className="font-semibold text-lg">제비 요청이 접수되었습니다!</p>
            <p className="text-sm text-muted-foreground">
              {selectedCoin.symbol} {amount}개 · {selectedChain?.name} 네트워크
            </p>
            <Button variant="outline" className="border-border/50" onClick={() => { setConfirmed(false); setSelectedChainId(""); setWalletAddress(""); setAmount(""); }}>
              추가 제비
            </Button>
          </div>
        ) : (
          <>
            {/* Coin (read-only) */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">코인</Label>
              <div className="flex items-center gap-3 rounded-xl bg-card border border-border/50 p-4">
                <CoinIcon image={selectedCoin.image} icon={selectedCoin.icon} symbol={selectedCoin.symbol} size="sm" />
                <div>
                  <span className="font-semibold text-sm">{selectedCoin.symbol}</span>
                  <span className="text-muted-foreground text-sm ml-2">{selectedCoin.nameKr}</span>
                </div>
              </div>
            </div>

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
                {/* Wallet address */}
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
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
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

                {/* Action button */}
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
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        처리 중...
                      </>
                    ) : (
                      "다음 단계"
                    )}
                  </Button>
                )}
              </>
            )}
          </>
        )}

        {/* Withdrawal history */}
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
    </AnimatedPage>
  );
};

export default SellFormPage;
