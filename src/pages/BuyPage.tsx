import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { chains, formatKRW, type CoinData, type ChainInfo } from "@/lib/cryptoData";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AnimatedPage from "@/components/AnimatedPage";
import CoinIcon from "@/components/CoinIcon";
import { toast } from "@/hooks/use-toast";

const STEPS = ["주 체인 선택", "코인 선택", "수량 입력", "지갑 주소", "확인"];

const BuyPage = () => {
  const { data: coins = [] } = useCryptoData();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedChain, setSelectedChain] = useState<ChainInfo | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filteredCoins = selectedChain
    ? coins.filter((c) => c.chain === selectedChain.id)
    : coins;

  const numAmount = parseFloat(amount) || 0;
  const krwTotal = selectedCoin ? numAmount * selectedCoin.priceKrw : 0;
  const fee = krwTotal * 0.001;

  const canNext = () => {
    if (step === 0) return !!selectedChain;
    if (step === 1) return !!selectedCoin;
    if (step === 2) return numAmount > 0;
    if (step === 3) return walletAddress.trim().length >= 10;
    return true;
  };

  const handleConfirm = async () => {
    if (!user || !selectedCoin || !selectedChain) return;
    setSubmitting(true);
    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      type: "buy",
      coin_id: selectedCoin.id,
      coin_symbol: selectedCoin.symbol,
      amount: numAmount,
      price_krw: selectedCoin.priceKrw,
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
    toast({
      title: "구매 주문이 접수되었습니다",
      description: `${selectedCoin.symbol} ${amount}개 · ${formatKRW(krwTotal + fee)}`,
    });
    setStep(0);
    setSelectedChain(null);
    setSelectedCoin(null);
    setAmount("");
    setWalletAddress("");
  };

  return (
    <AnimatedPage>
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">코인 구매</h1>

      {/* Progress */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
              i < step ? "gradient-primary text-primary-foreground" : i === step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}>
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 mx-1 rounded ${i < step ? "bg-primary" : "bg-secondary"}`} />}
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{STEPS[step]}</p>

      {/* Step 0: Chain */}
      {step === 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {chains.map((chain) => (
            <Card key={chain.id} onClick={() => setSelectedChain(chain)} className={`cursor-pointer transition-all hover:border-primary/40 ${selectedChain?.id === chain.id ? "border-primary bg-primary/5" : "bg-card border-border/50"}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <span className="text-2xl">{chain.icon}</span>
                <span className="font-medium text-sm">{chain.name}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Step 1: Coin */}
      {step === 1 && (
        <div className="space-y-2">
          {filteredCoins.map((coin) => (
            <Card key={coin.id} onClick={() => setSelectedCoin(coin)} className={`cursor-pointer transition-all hover:border-primary/40 ${selectedCoin?.id === coin.id ? "border-primary bg-primary/5" : "bg-card border-border/50"}`}>
              <CardContent className="p-3 flex items-center gap-3">
                <CoinIcon image={coin.image} icon={coin.icon} symbol={coin.symbol} />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{coin.symbol}</p>
                  <p className="text-xs text-muted-foreground">{coin.nameKr}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatKRW(coin.priceKrw)}</p>
                  <p className={`text-xs ${coin.change24h >= 0 ? "text-success" : "text-destructive"}`}>
                    {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Step 2: Amount */}
      {step === 2 && selectedCoin && (
        <Card className="bg-card border-border/50">
          <CardContent className="p-5 space-y-4">
            <div>
              <Label className="text-muted-foreground">구매 수량 ({selectedCoin.symbol})</Label>
              <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1.5 bg-secondary border-border/50 text-lg" min="0" step="any" />
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">단가</span>
                <span>{formatKRW(selectedCoin.priceKrw)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">소계</span>
                <span>{formatKRW(krwTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">수수료 (0.1%)</span>
                <span>{formatKRW(fee)}</span>
              </div>
              <div className="border-t border-border/50 pt-2 flex justify-between font-bold">
                <span>총 결제 금액</span>
                <span className="text-primary">{formatKRW(krwTotal + fee)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Wallet */}
      {step === 3 && (
        <Card className="bg-card border-border/50">
          <CardContent className="p-5 space-y-4">
            <div>
              <Label className="text-muted-foreground flex items-center gap-1.5">
                <Wallet className="h-4 w-4" /> 수신 지갑 주소
              </Label>
              <Input placeholder="0x..." value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} className="mt-1.5 bg-secondary border-border/50 font-mono text-sm" maxLength={100} />
              <p className="text-xs text-muted-foreground mt-1.5">{selectedChain?.name} 네트워크 주소를 입력하세요</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && selectedCoin && (
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base">주문 확인</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["네트워크", selectedChain?.name],
              ["코인", `${selectedCoin.symbol} (${selectedCoin.nameKr})`],
              ["수량", `${amount} ${selectedCoin.symbol}`],
              ["단가", formatKRW(selectedCoin.priceKrw)],
              ["소계", formatKRW(krwTotal)],
              ["수수료", formatKRW(fee)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span>{value}</span>
              </div>
            ))}
            <div className="border-t border-border/50 pt-2 flex justify-between font-bold text-base">
              <span>총 결제 금액</span>
              <span className="text-primary">{formatKRW(krwTotal + fee)}</span>
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-1">수신 주소</p>
              <p className="text-xs font-mono bg-secondary/50 p-2 rounded break-all">{walletAddress}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-3">
        {step > 0 && (
          <Button variant="outline" className="flex-1 border-border/50" onClick={() => setStep(step - 1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> 이전
          </Button>
        )}
        {step < 4 ? (
          <Button className="flex-1 gradient-primary text-primary-foreground hover:opacity-90" disabled={!canNext()} onClick={() => setStep(step + 1)}>
            다음 <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button className="flex-1 bg-success hover:bg-success/90 text-white" onClick={handleConfirm} disabled={submitting}>
            <Check className="h-4 w-4 mr-1" /> 구매 확인
          </Button>
        )}
      </div>
    </div>
    </AnimatedPage>
  );
};

export default BuyPage;
