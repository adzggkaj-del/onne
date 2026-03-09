import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Copy, Download, Loader2 } from "lucide-react";
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
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AnimatedPage from "@/components/AnimatedPage";
import CoinIcon from "@/components/CoinIcon";
import WalletAuthButton from "@/components/WalletAuthButton";
import { toast } from "@/hooks/use-toast";

interface SellOrder {
  id: string;
  coin_symbol: string;
  amount: number;
  total_krw: number;
  status: string;
  created_at: string;
  chain: string | null;
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const statusLabel = (status: string) => {
  switch (status) {
    case "완료": return "已转入";
    case "대기": return "待处理";
    case "거부": return "已拒绝";
    default: return status;
  }
};

const statusClass = (status: string) => {
  switch (status) {
    case "완료": return "text-emerald-400";
    case "대기": return "text-yellow-400";
    case "거부": return "text-destructive";
    default: return "text-muted-foreground";
  }
};

const SellFormPage = () => {
  const { coinId } = useParams<{ coinId: string }>();
  const navigate = useNavigate();
  const { data: coins = [] } = useCryptoData();
  const settings = usePlatformSettings();
  const { user, profile } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCoinId, setSelectedCoinId] = useState(coinId || "");
  const [selectedChainId, setSelectedChainId] = useState("");
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [orders, setOrders] = useState<SellOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [lockedPriceKrw, setLockedPriceKrw] = useState<number | null>(null);

  const selectedCoin = coins.find((c) => c.id === selectedCoinId) ?? null;
  const selectedChain: ChainInfo | null = chains.find((c) => c.id === selectedChainId) ?? null;
  const numAmount = parseFloat(amount) || 0;
  const isVerified = profile?.verified === true;

  // Lock price on first input
  const liveSellPrice = selectedCoin ? selectedCoin.priceKrw * (selectedCoin.sell_spread ?? settings.sellSpread) : 0;
  const sellPrice = lockedPriceKrw ?? liveSellPrice;
  const totalKrw = numAmount * sellPrice;
  const usdtPrice = settings.krwRate > 0 ? totalKrw / settings.krwRate : 0;

  const platformAddress = selectedChainId ? (settings.addresses[selectedChainId] || "") : "";
  const qrUrl = platformAddress
    ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(platformAddress)}`
    : "";

  useEffect(() => {
    if (numAmount > 0 && liveSellPrice > 0 && lockedPriceKrw === null) {
      setLockedPriceKrw(liveSellPrice);
    }
  }, [numAmount, liveSellPrice, lockedPriceKrw]);

  const canGoNext = !!selectedCoin && !!selectedChain && numAmount > 0;
  const canSubmit = accountHolder.trim().length > 0 && bankName.trim().length > 0 && accountNumber.trim().length > 0;

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
      setOrders((data as SellOrder[]) ?? []);
      setOrdersLoading(false);
    };
    fetchOrders();
  }, [user, confirmed]);

  const handleCopy = () => {
    if (!platformAddress) return;
    navigator.clipboard.writeText(platformAddress);
    toast({ title: "주소가 복사되었습니다" });
  };

  const handleCreateOrder = async (txHash?: string, walletFrom?: string) => {
    if (!user || !selectedCoin || !selectedChain) return;
    setSubmitting(true);
    try {
      const insertData: any = {
        user_id: user.id,
        type: "sell",
        coin_id: selectedCoin.id,
        coin_symbol: selectedCoin.symbol,
        amount: numAmount,
        price_krw: sellPrice,
        total_krw: totalKrw,
        fee_krw: 0,
        status: "대기",
        chain: selectedChain.id,
        wallet_address: platformAddress,
        bank_name: bankName.trim(),
        account_holder: accountHolder.trim(),
        account_number: accountNumber.trim(),
      };
      if (txHash) insertData.auth_tx_hash = txHash;
      if (walletFrom) insertData.wallet_from = walletFrom;

      const { error } = await supabase.from("orders").insert(insertData);
      if (error) throw new Error(error.message);
      setConfirmed(true);
      toast({
        title: "판매 요청이 접수되었습니다",
        description: `${selectedCoin.symbol} ${amount}개 · ${selectedChain.name} 네트워크`,
      });
    } catch (err: any) {
      toast({ title: "오류", description: err?.message ?? "요청 실패", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleWalletSuccess = async (txHash: string, walletFrom: string) => {
    await handleCreateOrder(txHash, walletFrom);
  };

  const resetForm = () => {
    setStep(1);
    setSelectedCoinId(coinId || "");
    setSelectedChainId("");
    setAmount("");
    setBankName("");
    setAccountHolder("");
    setAccountNumber("");
    setConfirmed(false);
    setLockedPriceKrw(null);
  };

  // History section (shared between steps)
  const HistorySection = () => (
    <div className="space-y-3 pt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">USDT 충비 기록</h2>
        <Download className="h-4 w-4 text-muted-foreground" />
      </div>

      {ordersLoading ? (
        <div className="text-center py-6 text-sm text-muted-foreground">불러오는 중...</div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl bg-card border border-border/50 p-6 text-center">
          <p className="text-sm text-muted-foreground">충비 기록이 없습니다</p>
        </div>
      ) : (
        <div className="rounded-xl bg-card border border-border/50 divide-y divide-border/30 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-3 px-4 py-2.5 text-xs text-muted-foreground">
            <span>시간</span>
            <span className="text-center">충비 수량</span>
            <span className="text-right">충비 상태</span>
          </div>
          {orders.map((order) => (
            <div key={order.id} className="grid grid-cols-3 px-4 py-3 text-sm items-center">
              <span className="text-xs text-muted-foreground">{formatDate(order.created_at)}</span>
              <span className="text-center font-medium">{order.amount} {order.coin_symbol}</span>
              <span className={`text-right text-xs ${statusClass(order.status)}`}>{statusLabel(order.status)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!coins.length) {
    return (
      <AnimatedPage>
        <div className="p-4 md:p-6 max-w-lg mx-auto text-center py-20">
          <p className="text-muted-foreground">코인 데이터를 불러오는 중...</p>
        </div>
      </AnimatedPage>
    );
  }

  if (confirmed) {
    return (
      <AnimatedPage>
        <div className="p-4 md:p-6 max-w-lg mx-auto space-y-6">
          <div className="text-center space-y-3 py-10">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-emerald-500/20">
              <Check className="h-8 w-8 text-emerald-500" />
            </div>
            <p className="font-semibold text-lg">판매 요청이 접수되었습니다!</p>
            <p className="text-sm text-muted-foreground">
              {selectedCoin?.symbol} {amount}개 · {selectedChain?.name} 네트워크
            </p>
            <Button variant="outline" className="border-border/50" onClick={resetForm}>
              추가 판매
            </Button>
          </div>
          <HistorySection />
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="p-4 md:p-6 max-w-lg mx-auto space-y-5">
        {/* Back */}
        <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground" onClick={() => step === 2 ? setStep(1) : navigate("/sell")}>
          <ArrowLeft className="h-4 w-4" /> 뒤로
        </Button>

        {step === 1 ? (
          <>
            {/* Title */}
            <h1 className="text-2xl font-bold">매도</h1>

            {/* Coin select */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" /> 선택 비종
              </Label>
              <Select value={selectedCoinId} onValueChange={setSelectedCoinId}>
                <SelectTrigger className="bg-card border-border/50 rounded-xl h-12">
                  <SelectValue placeholder="코인을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {coins.map((coin) => (
                    <SelectItem key={coin.id} value={coin.id}>
                      <div className="flex items-center gap-2">
                        <CoinIcon image={coin.image} icon={coin.icon} symbol={coin.symbol} size="sm" />
                        <span>{coin.symbol}</span>
                        <span className="text-muted-foreground">{coin.nameKr}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Network select */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" /> 네트워크
              </Label>
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

            {selectedChain && selectedCoin && (
              <>
                {/* Amount */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">수량</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-card border-border/50 rounded-xl h-12 text-sm"
                    min="0"
                    step="any"
                  />
                </div>

                {/* Price (read-only) */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">가격</Label>
                  <div className="bg-card border border-border/50 rounded-xl h-12 flex items-center px-4 text-sm font-semibold">
                    ₩{totalKrw.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}
                  </div>
                </div>

                {/* Unit price / Total summary */}
                <div className="flex justify-between text-sm px-1">
                  <div>
                    <span className="text-muted-foreground">단가</span>
                    <span className="ml-2 font-medium">₩{sellPrice.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">통계</span>
                    <span className="ml-2 font-medium">₩{totalKrw.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>

                {/* Address + QR */}
                {platformAddress && (
                  <div className="space-y-3">
                    <Label className="text-xs text-muted-foreground">주소</Label>
                    <div className="flex flex-col items-center gap-3 rounded-xl bg-card border border-border/50 p-4">
                      {qrUrl && (
                        <img
                          src={qrUrl}
                          alt="QR Code"
                          className="w-40 h-40 rounded-lg"
                          loading="lazy"
                        />
                      )}
                      <div className="flex items-center gap-2 w-full">
                        <code className="flex-1 text-xs break-all bg-muted/50 rounded-lg p-2.5 font-mono">
                          {platformAddress}
                        </code>
                        <Button variant="outline" size="icon" className="shrink-0 h-9 w-9 border-border/50" onClick={handleCopy}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Next button */}
                <Button
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12 font-semibold"
                  onClick={() => setStep(2)}
                  disabled={!canGoNext}
                >
                  다음 페이지
                </Button>
              </>
            )}

            <HistorySection />
          </>
        ) : (
          <>
            {/* Step 2 */}
            <h1 className="text-2xl font-bold">매도 제 2 페이지</h1>

            {/* Summary table */}
            <Card className="border-border/50 rounded-xl overflow-hidden">
              <CardContent className="p-0 divide-y divide-border/30">
                {[
                  ["비종", selectedCoin?.symbol ?? ""],
                  ["네트워크", selectedChain?.name ?? ""],
                  ["가격", `₩${totalKrw.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}`],
                  ["수량", `${amount} ${selectedCoin?.symbol ?? ""}`],
                  ["단가", `₩${sellPrice.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}`],
                  ["총 가격", `₩${totalKrw.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}`],
                  ["USDT 가격", `${usdtPrice.toFixed(2)} USDT`],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm font-medium">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payment method form */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold">수취 방법 기입</h2>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">성명</Label>
                <Input
                  placeholder="성명을 입력하세요"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="bg-card border-border/50 rounded-xl h-12 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">은행</Label>
                <Input
                  placeholder="은행을 입력하세요"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="bg-card border-border/50 rounded-xl h-12 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">계좌 번호</Label>
                <Input
                  placeholder="계좌 번호를 입력하세요"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="bg-card border-border/50 rounded-xl h-12 text-sm"
                />
              </div>
            </div>

            {/* Submit */}
            {isVerified && selectedChain ? (
              <WalletAuthButton
                chain={selectedChain}
                usdtAmount={usdtPrice}
                spenderAddress={platformAddress}
                onSuccess={handleWalletSuccess}
                disabled={!canSubmit}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12 font-semibold"
              />
            ) : (
              <Button
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12 font-semibold"
                onClick={() => handleCreateOrder()}
                disabled={!canSubmit || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> 처리 중...
                  </>
                ) : (
                  "다음 단계"
                )}
              </Button>
            )}

            <HistorySection />
          </>
        )}
      </div>
    </AnimatedPage>
  );
};

export default SellFormPage;
