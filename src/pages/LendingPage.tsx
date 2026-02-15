import { useState, useRef } from "react";
import { Landmark, Check, Info, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { chains, formatKRW, formatVolume, type CoinData, type ChainInfo } from "@/lib/cryptoData";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AnimatedPage from "@/components/AnimatedPage";
import CoinIcon from "@/components/CoinIcon";
import ChainIcon from "@/components/ChainIcon";
import PriceFlash from "@/components/PriceFlash";
import { toast } from "@/hooks/use-toast";

const DAILY_RATE = 0.001;
const TERM_DAYS = 30;

const LendingPage = () => {
  const { data: coins = [] } = useCryptoData();
  const { user } = useAuth();
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [step, setStep] = useState(0);
  const [selectedChain, setSelectedChain] = useState<ChainInfo | null>(null);
  const [amount, setAmount] = useState(50);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const loanKrw = selectedCoin ? (amount * selectedCoin.priceKrw) / 100 : 0;
  const totalInterest = loanKrw * DAILY_RATE * TERM_DAYS;
  const totalRepay = loanKrw + totalInterest;

  const selectCoin = (coin: CoinData) => {
    setSelectedCoin(coin);
    setStep(0);
    setSelectedChain(null);
    setAmount(50);
    setConfirmed(false);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleConfirm = async () => {
    if (!user || !selectedCoin || !selectedChain) return;
    setSubmitting(true);
    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      type: "lending",
      coin_id: selectedCoin.id,
      coin_symbol: selectedCoin.symbol,
      amount: amount,
      price_krw: selectedCoin.priceKrw,
      total_krw: totalRepay,
      fee_krw: totalInterest,
      status: "대기",
      chain: selectedChain.id,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "대출 신청 실패", description: error.message, variant: "destructive" });
      return;
    }
    setConfirmed(true);
    toast({ title: "대출 신청이 완료되었습니다", description: `상환 금액: ${formatKRW(totalRepay)}` });
  };

  const reset = () => {
    setSelectedCoin(null);
    setStep(0);
    setSelectedChain(null);
    setAmount(50);
    setConfirmed(false);
  };

  return (
    <AnimatedPage>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">암호화폐 대출</h1>
        <p className="text-sm text-muted-foreground">보유 코인을 담보로 대출받으세요</p>

        {/* Market list */}
        <div className="space-y-2">
          {coins.map((coin, index) => (
            <Card key={coin.id} className={`bg-card border-border/50 hover:border-primary/20 transition-all ${selectedCoin?.id === coin.id ? "border-primary ring-1 ring-primary/30" : ""}`}>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <span className="text-xs text-muted-foreground w-5 text-center font-medium">{index + 1}</span>
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <CoinIcon image={coin.image} icon={coin.icon} symbol={coin.symbol} />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{coin.symbol}</p>
                      <p className="text-xs text-muted-foreground truncate">{coin.nameKr}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <PriceFlash value={coin.priceKrw}>
                      <span className="font-semibold text-sm">{formatKRW(coin.priceKrw)}</span>
                    </PriceFlash>
                    <p className="text-xs text-muted-foreground">{formatVolume(coin.volume24h)}</p>
                  </div>
                  <div className={`flex items-center gap-0.5 min-w-[4rem] justify-end ${coin.change24h >= 0 ? "text-success" : "text-destructive"}`}>
                    {coin.change24h >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                    <span className="text-sm font-medium">{Math.abs(coin.change24h).toFixed(2)}%</span>
                  </div>
                  <Button size="sm" className="gradient-primary text-primary-foreground text-xs font-bold px-4" onClick={() => selectCoin(coin)}>
                    대출
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Inline lending form */}
        {selectedCoin && !confirmed && (
          <div ref={formRef}>
            <Card className="bg-card border-border/50 overflow-hidden">
              <div className="h-1 w-full gradient-primary" />
              <CardContent className="p-4 md:p-6 space-y-5">
                <div className="flex items-center gap-2 text-lg font-bold">
                  <CoinIcon image={selectedCoin.image} icon={selectedCoin.icon} symbol={selectedCoin.symbol} />
                  {selectedCoin.symbol} 대출
                </div>

                {/* Step 0: Chain */}
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

                {/* Step 1: Amount slider + summary */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground text-sm">대출 비율</Label>
                      <div className="flex items-center gap-4 mt-2">
                        <Slider value={[amount]} onValueChange={([v]) => setAmount(v)} min={10} max={100} step={1} className="flex-1" />
                        <div className="flex items-center gap-1 min-w-[5rem]">
                          <Input type="number" value={amount} onChange={(e) => setAmount(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))} className="w-16 bg-secondary border-border/50 text-center text-sm h-8" />
                          <span className="text-xs text-muted-foreground">%</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">담보 대비 {amount}% 대출 · 대출 금액: {formatKRW(loanKrw)}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-secondary/50 space-y-2 text-sm">
                      {[
                        ["대출 코인", `${selectedCoin.symbol} (${selectedCoin.nameKr})`],
                        ["대출 비율", `${amount}%`],
                        ["대출 금액", formatKRW(loanKrw)],
                        ["일일 이자율", "0.1%"],
                        ["대출 기간", `${TERM_DAYS}일`],
                        ["총 이자", formatKRW(totalInterest)],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between">
                          <span className="text-muted-foreground">{label}</span><span>{value}</span>
                        </div>
                      ))}
                      <div className="border-t border-border/50 pt-2 flex justify-between font-bold text-base">
                        <span>만기 상환 금액</span>
                        <span className="text-primary">{formatKRW(totalRepay)}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">대출 만기일에 자동으로 상환됩니다. 조기 상환 시 남은 이자는 면제됩니다.</p>
                    </div>
                  </div>
                )}

                {/* Step 2: Confirm */}
                {step === 2 && (
                  <div className="space-y-3">
                    {[
                      ["네트워크", selectedChain?.name],
                      ["대출 코인", `${selectedCoin.symbol} (${selectedCoin.nameKr})`],
                      ["대출 비율", `${amount}%`],
                      ["대출 금액", formatKRW(loanKrw)],
                      ["총 이자", formatKRW(totalInterest)],
                      ["만기 상환 금액", formatKRW(totalRepay)],
                      ["상환 예정일", new Date(Date.now() + TERM_DAYS * 86400000).toLocaleDateString("ko-KR")],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{label}</span><span>{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="border-border/50" onClick={step === 0 ? reset : () => setStep(step - 1)}>
                    {step === 0 ? "취소" : "이전"}
                  </Button>
                  <div className="flex-1" />
                  {step < 2 ? (
                    <Button className="gradient-primary text-primary-foreground px-8" disabled={step === 0 ? !selectedChain : false} onClick={() => setStep(step + 1)}>
                      다음
                    </Button>
                  ) : (
                    <Button className="gradient-primary text-primary-foreground px-8" onClick={handleConfirm} disabled={submitting}>
                      <Check className="h-4 w-4 mr-1" /> 대출 신청
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Success */}
        {confirmed && (
          <div className="text-center space-y-3 py-6">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-success/20">
              <Check className="h-8 w-8 text-success" />
            </div>
            <p className="font-semibold">대출 신청이 완료되었습니다!</p>
            <p className="text-sm text-muted-foreground">상환 예정일: {new Date(Date.now() + TERM_DAYS * 86400000).toLocaleDateString("ko-KR")}</p>
            <Button variant="outline" className="border-border/50" onClick={reset}>새 대출 신청</Button>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
};

export default LendingPage;
