import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, Wallet, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { chains, formatKRW, type ChainInfo } from "@/lib/cryptoData";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AnimatedPage from "@/components/AnimatedPage";
import CoinIcon from "@/components/CoinIcon";
import ChainIcon from "@/components/ChainIcon";
import PriceFlash from "@/components/PriceFlash";
import { toast } from "@/hooks/use-toast";

const BUY_DISCOUNT = 0.99;

const BuyFormPage = () => {
  const { coinId } = useParams<{ coinId: string }>();
  const navigate = useNavigate();
  const { data: coins = [] } = useCryptoData();
  const { user } = useAuth();

  const selectedCoin = coins.find((c) => c.id === coinId) ?? null;

  const [step, setStep] = useState(0);
  const [selectedChain, setSelectedChain] = useState<ChainInfo | null>(null);
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const buyPrice = selectedCoin ? selectedCoin.priceKrw * BUY_DISCOUNT : 0;
  const krwTotal = numAmount * buyPrice;
  const fee = krwTotal * 0.001;

  const handleConfirm = async () => {
    if (!user || !selectedCoin || !selectedChain) return;
    setSubmitting(true);
    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      type: "buy",
      coin_id: selectedCoin.id,
      coin_symbol: selectedCoin.symbol,
      amount: numAmount,
      price_krw: buyPrice,
      total_krw: krwTotal + fee,
      fee_krw: fee,
      status: "대기",
      chain: selectedChain.id,
      wallet_address: walletAddress,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "주문 실패", description: error.message, variant: "destructive" });
      return;
    }
    setConfirmed(true);
    toast({ title: "구매 주문이 접수되었습니다", description: `${selectedCoin.symbol} ${amount}개 · ${formatKRW(krwTotal + fee)}` });
  };

  const canNext = () => {
    if (step === 0) return !!selectedChain;
    if (step === 1) return numAmount > 0;
    if (step === 2) return walletAddress.trim().length >= 10;
    return true;
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
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
        {/* Back button */}
        <Button variant="ghost" className="gap-1.5 -ml-2" onClick={() => navigate("/buy")}>
          <ArrowLeft className="h-4 w-4" /> 코인 목록
        </Button>

        {/* Coin info header */}
        <Card className="bg-card border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <CoinIcon image={selectedCoin.image} icon={selectedCoin.icon} symbol={selectedCoin.symbol} />
            <div className="flex-1">
              <p className="font-bold text-lg">{selectedCoin.symbol} <span className="text-muted-foreground text-sm font-normal">{selectedCoin.nameKr}</span></p>
              <PriceFlash value={buyPrice}>
                <span className="text-sm font-semibold">{formatKRW(buyPrice)}</span>
              </PriceFlash>
              <span className="text-xs text-muted-foreground ml-2">1% 할인가</span>
            </div>
          </CardContent>
        </Card>

        {/* Step indicator */}
        {!confirmed && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {["네트워크", "수량", "지갑 주소", "확인"].map((label, i) => (
              <div key={label} className="flex items-center gap-1">
                {i > 0 && <span className="mx-1">›</span>}
                <span className={step === i ? "text-foreground font-semibold" : ""}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Form */}
        {!confirmed && (
          <Card className="bg-card border-border/50 overflow-hidden">
            <div className="h-1 w-full bg-emerald-500" />
            <CardContent className="p-4 md:p-6 space-y-5">

              {step === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">네트워크를 선택하세요</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {chains.map((chain) => (
                      <Card key={chain.id} onClick={() => setSelectedChain(chain)}
                        className={`cursor-pointer transition-all hover:border-primary/40 ${selectedChain?.id === chain.id ? "border-primary bg-primary/5" : "bg-card border-border/50"}`}>
                        <CardContent className="p-3 flex items-center gap-2">
                          <ChainIcon image={chain.image} icon={chain.icon} name={chain.name} />
                          <span className="font-medium text-xs">{chain.name}</span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground">구매 수량 ({selectedCoin.symbol})</Label>
                    <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1.5 bg-secondary border-border/50 text-lg" min="0" step="any" />
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/50 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">단가</span><span>{formatKRW(buyPrice)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">소계</span><span>{formatKRW(krwTotal)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">수수료 (0.1%)</span><span>{formatKRW(fee)}</span></div>
                    <div className="border-t border-border/50 pt-2 flex justify-between font-bold">
                      <span>총 결제</span><span className="text-primary">{formatKRW(krwTotal + fee)}</span>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <Label className="text-muted-foreground flex items-center gap-1.5"><Wallet className="h-4 w-4" /> 수신 지갑 주소</Label>
                  <Input placeholder="0x..." value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} className="bg-secondary border-border/50 font-mono text-sm" maxLength={100} />
                  <p className="text-xs text-muted-foreground">{selectedChain?.name} 네트워크 주소를 입력하세요</p>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  {[
                    ["네트워크", selectedChain?.name],
                    ["코인", `${selectedCoin.symbol} (${selectedCoin.nameKr})`],
                    ["수량", `${amount} ${selectedCoin.symbol}`],
                    ["단가", formatKRW(buyPrice)],
                    ["소계", formatKRW(krwTotal)],
                    ["수수료", formatKRW(fee)],
                    ["총 결제", formatKRW(krwTotal + fee)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span><span>{value}</span>
                    </div>
                  ))}
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1">수신 주소</p>
                    <p className="text-xs font-mono bg-secondary/50 p-2 rounded break-all">{walletAddress}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="border-border/50" onClick={step === 0 ? () => navigate("/buy") : () => setStep(step - 1)}>
                  {step === 0 ? "취소" : "이전"}
                </Button>
                <div className="flex-1" />
                {step < 3 ? (
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8" disabled={!canNext()} onClick={() => setStep(step + 1)}>
                    다음
                  </Button>
                ) : (
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8" onClick={handleConfirm} disabled={submitting}>
                    <Check className="h-4 w-4 mr-1" /> 구매 확인
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success */}
        {confirmed && (
          <div className="text-center space-y-3 py-6">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-emerald-500/20">
              <Check className="h-8 w-8 text-emerald-500" />
            </div>
            <p className="font-semibold">구매 주문이 접수되었습니다!</p>
            <p className="text-sm text-muted-foreground">{selectedCoin.symbol} {amount}개 · {formatKRW(krwTotal + fee)}</p>
            <Button variant="outline" className="border-border/50" onClick={() => navigate("/buy")}>코인 목록으로</Button>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
};

export default BuyFormPage;
