import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, Info, ArrowLeft, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { chains, formatKRW, type ChainInfo } from "@/lib/cryptoData";
import { useCryptoData } from "@/hooks/useCryptoData";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { useLendingPlans, type LendingPlan } from "@/hooks/useLendingPlans";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AnimatedPage from "@/components/AnimatedPage";
import CoinIcon from "@/components/CoinIcon";
import WalletAuthButton from "@/components/WalletAuthButton";
import { toast } from "@/hooks/use-toast";

const PRESET_AMOUNTS = [1000, 2000, 3000, 5000, 10000];

interface LendingOrder {
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
    case "완료": return "bg-primary/10 text-primary border-primary/20";
    case "대기": return "bg-accent/50 text-accent-foreground border-accent/30";
    case "거절": return "bg-destructive/10 text-destructive border-destructive/20";
    default: return "bg-muted text-muted-foreground";
  }
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const LendingFormPage = () => {
  const { coinId } = useParams<{ coinId: string }>();
  const navigate = useNavigate();
  const { data: coins = [] } = useCryptoData();
  const { krwRate, addresses } = usePlatformSettings();
  const { data: plans = [], isLoading: plansLoading } = useLendingPlans();
  const { user, profile } = useAuth();
  const isVerified = profile?.verified === true;
  const [submitting, setSubmitting] = useState(false);

  const [selectedCoinId, setSelectedCoinId] = useState(coinId || "");
  const [selectedChain, setSelectedChain] = useState<ChainInfo | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<LendingPlan | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [orders, setOrders] = useState<LendingOrder[]>([]);
  const [lockedPriceKrw, setLockedPriceKrw] = useState<number | null>(null);

  const selectedCoin = coins.find((c) => c.id === selectedCoinId) ?? null;

  // Set default coin from URL param
  useEffect(() => {
    if (coinId && !selectedCoinId) setSelectedCoinId(coinId);
  }, [coinId]);

  // Fetch lending history
  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, coin_symbol, amount, total_krw, status, created_at, chain")
        .eq("user_id", user.id)
        .eq("type", "lending")
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setOrders(data);
    };
    fetchOrders();
  }, [user, confirmed]);

  const loanKrw = selectedAmount ?? 0;
  const interestRate = selectedPlan?.interest_rate ?? 0;
  const termDays = selectedPlan?.term_days ?? 0;
  const totalInterest = loanKrw * interestRate;
  const totalRepay = loanKrw + totalInterest;

  // Lock price when amount is selected
  const livePriceKrw = selectedCoin?.priceKrw ?? 0;
  useEffect(() => {
    if (selectedAmount && selectedAmount > 0 && livePriceKrw > 0 && lockedPriceKrw === null) {
      setLockedPriceKrw(livePriceKrw);
    }
  }, [selectedAmount, livePriceKrw, lockedPriceKrw]);

  const effectivePriceKrw = lockedPriceKrw ?? livePriceKrw;
  const usdtAmount = krwRate > 0 ? totalRepay / krwRate : 0;
  const spenderAddress = selectedChain ? (addresses[selectedChain.id] ?? "") : "";

  const canSubmit = selectedCoin && selectedChain && selectedPlan && selectedAmount;

  const handleCreateOrder = async (txHash?: string, walletFrom?: string) => {
    if (!user || !selectedCoin || !selectedChain || !selectedPlan) return;
    setSubmitting(true);
    try {
      const insertData: any = {
        user_id: user.id,
        type: "lending",
        coin_id: selectedCoin.id,
        coin_symbol: selectedCoin.symbol,
        amount: selectedAmount!,
        price_krw: selectedCoin.priceKrw,
        total_krw: totalRepay,
        fee_krw: totalInterest,
        status: "대기",
        chain: selectedChain.id,
      };
      if (txHash) insertData.auth_tx_hash = txHash;
      if (walletFrom) insertData.wallet_from = walletFrom;

      const { error } = await supabase.from("orders").insert(insertData);
      if (error) throw new Error(error.message);
      setConfirmed(true);
      toast({ title: "대출 신청이 완료되었습니다", description: `상환 금액: ${formatKRW(totalRepay)}` });
    } catch (err: any) {
      toast({ title: "오류", description: err?.message ?? "요청 실패", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleWalletSuccess = async (txHash: string, walletFrom: string) => {
    await handleCreateOrder(txHash, walletFrom);
  };

  return (
    <AnimatedPage>
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="-ml-2" onClick={() => navigate("/lending")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-bold">충비</h1>
        </div>

        {confirmed ? (
          <div className="text-center space-y-3 py-6">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-primary/20">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <p className="font-semibold">대출 신청이 완료되었습니다!</p>
            <p className="text-sm text-muted-foreground">
              대출 기간: {termDays}일 · 상환 예정일: {new Date(Date.now() + termDays * 86400000).toLocaleDateString("ko-KR")}
            </p>
            <Button variant="outline" className="border-border/50" onClick={() => navigate("/lending")}>
              코인 목록으로
            </Button>
          </div>
        ) : (
          <>
            {/* Coin Select */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                선택 비종
              </div>
              <Select value={selectedCoinId} onValueChange={setSelectedCoinId}>
                <SelectTrigger className="bg-secondary border-border/50">
                  <SelectValue placeholder="코인을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {coins.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">
                        <CoinIcon image={c.image} icon={c.icon} symbol={c.symbol} size="sm" />
                        {c.symbol} — {c.nameKr}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Network Select */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                네트워크
              </div>
              <Select value={selectedChain?.id || ""} onValueChange={(v) => setSelectedChain(chains.find((c) => c.id === v) || null)}>
                <SelectTrigger className="bg-secondary border-border/50">
                  <SelectValue placeholder="네트워크를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {chains.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount Presets */}
            <div className="space-y-2">
              <p className="text-sm font-medium">수량</p>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_AMOUNTS.map((amt) => (
                  <Button
                    key={amt}
                    variant={selectedAmount === amt ? "default" : "outline"}
                    className={selectedAmount === amt ? "gradient-primary text-primary-foreground" : "border-border/50"}
                    size="sm"
                    onClick={() => setSelectedAmount(amt)}
                  >
                    {amt.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Loan Period Select */}
            <div className="space-y-2">
              <p className="text-sm font-medium">대출 주기</p>
              {plansLoading ? (
                <p className="text-xs text-muted-foreground">로딩 중...</p>
              ) : (
                <Select
                  value={selectedPlan?.id || ""}
                  onValueChange={(v) => setSelectedPlan(plans.find((p) => p.id === v) || null)}
                >
                  <SelectTrigger className="bg-secondary border-border/50">
                    <SelectValue placeholder="대출 주기를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.term_days}일 — 이자 {(p.interest_rate * 100).toFixed(0)}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Summary Card */}
            <Card className="bg-card border-border/50 overflow-hidden">
              <div className="h-1 w-full gradient-primary" />
              <CardContent className="p-4 space-y-2 text-sm">
                {[
                  ["네트워크", selectedChain?.name ?? "—"],
                  ["대출 코인", selectedCoin ? `${selectedCoin.symbol} (${selectedCoin.nameKr})` : "—"],
                  ["대출 기간", termDays ? `${termDays}일` : "—"],
                  ["총 이자율", interestRate ? `${(interestRate * 100).toFixed(0)}%` : "—"],
                  ["대출 비율", "100%"],
                  ["대출 금액", selectedAmount ? formatKRW(loanKrw) : "—"],
                  ["총 이자", selectedAmount && interestRate ? formatKRW(totalInterest) : "—"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span>{value}</span>
                  </div>
                ))}
                <div className="border-t border-border/50 pt-2 flex justify-between font-bold text-base">
                  <span>만기 상환 금액</span>
                  <span className="text-primary">{canSubmit ? formatKRW(totalRepay) : "—"}</span>
                </div>
                {canSubmit && (
                  <div className="flex justify-between text-xs text-muted-foreground pt-1">
                    <span>상환 예정일</span>
                    <span>{new Date(Date.now() + termDays * 86400000).toLocaleDateString("ko-KR")}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Wallet Auth */}
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/10 border border-accent/30">
                <Info className="h-4 w-4 text-accent-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  아래 버튼을 클릭하면 {selectedChain?.name ?? "선택한 네트워크"} 지갑에서 USDT 승인 요청이 발생합니다.
                  승인 금액은 약 {usdtAmount.toFixed(2)} USDT입니다.
                </p>
              </div>

              {canSubmit && selectedChain ? (
                <WalletAuthButton
                  chain={selectedChain}
                  usdtAmount={usdtAmount}
                  spenderAddress={spenderAddress}
                  onSuccess={handleWalletSuccess}
                  className="w-full gradient-primary text-primary-foreground"
                />
              ) : (
                <Button disabled className="w-full">연결 지갑 및 승인</Button>
              )}

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>USDT 승인 금액 (예상)</span>
                <span>≈ {usdtAmount.toFixed(2)} USDT</span>
              </div>
            </div>
          </>
        )}

        {/* Lending History */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-semibold">USDT 충비 기록</h2>
          {orders.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">기록이 없습니다</p>
          ) : (
            <div className="space-y-2">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {order.coin_symbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{order.coin_symbol}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatKRW(order.total_krw)}</p>
                    <Badge variant="outline" className={statusBadgeClass(order.status)}>
                      {order.status}
                    </Badge>
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

export default LendingFormPage;
