import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, Info, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { chains, formatKRW, type ChainInfo } from "@/lib/cryptoData";
import { useCryptoData } from "@/hooks/useCryptoData";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AnimatedPage from "@/components/AnimatedPage";
import CoinIcon from "@/components/CoinIcon";
import ChainIcon from "@/components/ChainIcon";
import PriceFlash from "@/components/PriceFlash";
import { toast } from "@/hooks/use-toast";

const LendingFormPage = () => {
  const { coinId } = useParams<{ coinId: string }>();
  const navigate = useNavigate();
  const { data: coins = [] } = useCryptoData();
  const { lendingDailyRate, lendingTermDays } = usePlatformSettings();
  const { user } = useAuth();

  const selectedCoin = coins.find((c) => c.id === coinId) ?? null;

  const [step, setStep] = useState(0);
  const [selectedChain, setSelectedChain] = useState<ChainInfo | null>(null);
  const [amount, setAmount] = useState(50);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const loanKrw = selectedCoin ? (amount * selectedCoin.priceKrw) / 100 : 0;
  const totalInterest = loanKrw * lendingDailyRate * lendingTermDays;
  const totalRepay = loanKrw + totalInterest;

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
        <Button variant="ghost" className="gap-1.5 -ml-2" onClick={() => navigate("/lending")}>
          <ArrowLeft className="h-4 w-4" /> 코인 목록
        </Button>

        <Card className="bg-card border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <CoinIcon image={selectedCoin.image} icon={selectedCoin.icon} symbol={selectedCoin.symbol} />
            <div className="flex-1">
              <p className="font-bold text-lg">{selectedCoin.symbol} <span className="text-muted-foreground text-sm font-normal">{selectedCoin.nameKr}</span></p>
              <PriceFlash value={selectedCoin.priceKrw}>
                <span className="text-sm font-semibold">{formatKRW(selectedCoin.priceKrw)}</span>
              </PriceFlash>
            </div>
          </CardContent>
        </Card>

        {!confirmed && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {["네트워크", "대출 설정", "확인"].map((label, i) => (
              <div key={label} className="flex items-center gap-1">
                {i > 0 && <span className="mx-1">›</span>}
                <span className={step === i ? "text-foreground font-semibold" : ""}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {!confirmed && (
          <Card className="bg-card border-border/50 overflow-hidden">
            <div className="h-1 w-full gradient-primary" />
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
                      ["대출 기간", `${lendingTermDays}일`],
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

              {step === 2 && (
                <div className="space-y-3">
                  {[
                    ["네트워크", selectedChain?.name],
                    ["대출 코인", `${selectedCoin.symbol} (${selectedCoin.nameKr})`],
                    ["대출 비율", `${amount}%`],
                    ["대출 금액", formatKRW(loanKrw)],
                    ["총 이자", formatKRW(totalInterest)],
                    ["만기 상환 금액", formatKRW(totalRepay)],
                    ["상환 예정일", new Date(Date.now() + lendingTermDays * 86400000).toLocaleDateString("ko-KR")],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span><span>{value}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="border-border/50" onClick={step === 0 ? () => navigate("/lending") : () => setStep(step - 1)}>
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
        )}

        {confirmed && (
          <div className="text-center space-y-3 py-6">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-success/20">
              <Check className="h-8 w-8 text-success" />
            </div>
            <p className="font-semibold">대출 신청이 완료되었습니다!</p>
            <p className="text-sm text-muted-foreground">상환 예정일: {new Date(Date.now() + lendingTermDays * 86400000).toLocaleDateString("ko-KR")}</p>
            <Button variant="outline" className="border-border/50" onClick={() => navigate("/lending")}>코인 목록으로</Button>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
};

export default LendingFormPage;
