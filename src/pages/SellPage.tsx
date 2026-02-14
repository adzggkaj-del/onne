import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Copy, Building2, Clock, CheckCircle2, Loader2, Banknote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { chains, formatKRW, type CoinData, type ChainInfo } from "@/lib/cryptoData";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AnimatedPage from "@/components/AnimatedPage";
import CoinIcon from "@/components/CoinIcon";
import { toast } from "@/hooks/use-toast";

const STEPS = ["주 체인 선택", "코인 선택", "수량 입력", "충币 주소", "은행 정보", "확인"];

const DEPOSIT_ADDRESSES: Record<string, string> = {
  ethereum: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  bsc: "0x10ED43C718714eb63d5aA57B78B54917FC171d73",
  tron: "TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax",
  solana: "5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9",
  polygon: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
};

type OrderStatus = "waiting" | "processing" | "paid" | "completed";

const statusConfig: Record<OrderStatus, { label: string; icon: typeof Clock; color: string }> = {
  waiting: { label: "충전 대기", icon: Clock, color: "text-yellow-400" },
  processing: { label: "처리 중", icon: Loader2, color: "text-primary" },
  paid: { label: "출금 완료", icon: Banknote, color: "text-success" },
  completed: { label: "거래 완료", icon: CheckCircle2, color: "text-success" },
};

const SellPage = () => {
  const { data: coins = [] } = useCryptoData();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedChain, setSelectedChain] = useState<ChainInfo | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);

  const filteredCoins = selectedChain ? coins.filter((c) => c.chain === selectedChain.id) : coins;
  const numAmount = parseFloat(amount) || 0;
  const krwTotal = selectedCoin ? numAmount * selectedCoin.priceKrw : 0;
  const fee = krwTotal * 0.001;
  const depositAddr = selectedChain ? DEPOSIT_ADDRESSES[selectedChain.id] : "";

  const canNext = () => {
    if (step === 0) return !!selectedChain;
    if (step === 1) return !!selectedCoin;
    if (step === 2) return numAmount > 0;
    if (step === 3) return true;
    if (step === 4) return bankName.trim().length > 0 && accountNumber.trim().length >= 8 && accountHolder.trim().length > 0;
    return true;
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(depositAddr);
    toast({ title: "주소가 복사되었습니다" });
  };

  const handleSubmit = async () => {
    if (!user || !selectedCoin || !selectedChain) return;
    
    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      type: "sell",
      coin_id: selectedCoin.id,
      coin_symbol: selectedCoin.symbol,
      amount: numAmount,
      price_krw: selectedCoin.priceKrw,
      total_krw: krwTotal - fee,
      fee_krw: fee,
      status: "대기",
      chain: selectedChain.id,
      bank_name: bankName,
      account_number: accountNumber,
      account_holder: accountHolder,
    });

    if (error) {
      toast({ title: "주문 실패", description: error.message, variant: "destructive" });
      return;
    }

    setShowConfirm(true);
    setOrderStatus("waiting");
    setTimeout(() => setOrderStatus("processing"), 2000);
    setTimeout(() => setOrderStatus("paid"), 4000);
    setTimeout(() => setOrderStatus("completed"), 6000);
  };

  const resetForm = () => {
    setStep(0);
    setSelectedChain(null);
    setSelectedCoin(null);
    setAmount("");
    setBankName("");
    setAccountNumber("");
    setAccountHolder("");
    setShowConfirm(false);
    setOrderStatus(null);
  };

  return (
    <AnimatedPage>
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">코인 판매</h1>

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
                <p className="text-sm font-medium">{formatKRW(coin.priceKrw)}</p>
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
              <Label className="text-muted-foreground">판매 수량 ({selectedCoin.symbol})</Label>
              <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1.5 bg-secondary border-border/50 text-lg" min="0" step="any" />
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">단가</span><span>{formatKRW(selectedCoin.priceKrw)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">소계</span><span>{formatKRW(krwTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">수수료 (0.1%)</span><span>{formatKRW(fee)}</span>
              </div>
              <div className="border-t border-border/50 pt-2 flex justify-between font-bold">
                <span>수령 금액</span><span className="text-success">{formatKRW(krwTotal - fee)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Deposit address */}
      {step === 3 && (
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base">플랫폼 충전 주소</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">아래 주소로 {selectedCoin?.symbol}을(를) 전송해 주세요. {selectedChain?.name} 네트워크만 지원됩니다.</p>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border/50">
              <p className="text-xs font-mono flex-1 break-all select-all">{depositAddr}</p>
              <Button size="icon" variant="ghost" onClick={copyAddress} className="shrink-0">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-xs text-destructive font-medium">⚠️ 잘못된 네트워크로 전송 시 자산이 영구 손실될 수 있습니다.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Bank info */}
      {step === 4 && (
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> 수령 은행 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">은행명</Label>
              <Input placeholder="예: 국민은행" value={bankName} onChange={(e) => setBankName(e.target.value)} className="mt-1.5 bg-secondary border-border/50" maxLength={50} />
            </div>
            <div>
              <Label className="text-muted-foreground">계좌번호</Label>
              <Input placeholder="- 없이 입력" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))} className="mt-1.5 bg-secondary border-border/50 font-mono" maxLength={20} />
            </div>
            <div>
              <Label className="text-muted-foreground">예금주</Label>
              <Input placeholder="홍길동" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} className="mt-1.5 bg-secondary border-border/50" maxLength={50} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Confirm */}
      {step === 5 && selectedCoin && (
        <Card className="bg-card border-border/50">
          <CardHeader><CardTitle className="text-base">판매 주문 확인</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              ["네트워크", selectedChain?.name],
              ["코인", `${selectedCoin.symbol} (${selectedCoin.nameKr})`],
              ["수량", `${amount} ${selectedCoin.symbol}`],
              ["수령 금액", formatKRW(krwTotal - fee)],
              ["은행", bankName],
              ["계좌번호", accountNumber],
              ["예금주", accountHolder],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span><span>{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && <Button variant="outline" className="flex-1 border-border/50" onClick={() => setStep(step - 1)}><ArrowLeft className="h-4 w-4 mr-1" /> 이전</Button>}
        {step < 5 ? (
          <Button className="flex-1 gradient-primary text-primary-foreground hover:opacity-90" disabled={!canNext()} onClick={() => setStep(step + 1)}>
            다음 <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button className="flex-1 bg-destructive hover:bg-destructive/90 text-white" onClick={handleSubmit}>
            <Check className="h-4 w-4 mr-1" /> 판매 제출
          </Button>
        )}
      </div>

      {/* Order status dialog */}
      <Dialog open={showConfirm} onOpenChange={(open) => { if (!open && orderStatus === "completed") resetForm(); }}>
        <DialogContent className="bg-card border-border sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">주문 상태</DialogTitle>
            <DialogDescription>판매 주문이 접수되었습니다</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {(Object.keys(statusConfig) as OrderStatus[]).map((key, i) => {
              const config = statusConfig[key];
              const StatusIcon = config.icon;
              const isActive = orderStatus === key;
              const isPast = orderStatus ? (Object.keys(statusConfig) as OrderStatus[]).indexOf(orderStatus) > i : false;
              return (
                <div key={key} className={`flex items-center gap-3 transition-opacity ${isPast || isActive ? "opacity-100" : "opacity-30"}`}>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isPast ? "gradient-primary" : isActive ? "bg-primary/20" : "bg-secondary"}`}>
                    {isPast ? <Check className="h-4 w-4 text-primary-foreground" /> : <StatusIcon className={`h-4 w-4 ${isActive ? config.color + " animate-pulse" : "text-muted-foreground"}`} />}
                  </div>
                  <span className={`text-sm font-medium ${isActive ? "text-foreground" : isPast ? "text-muted-foreground" : "text-muted-foreground"}`}>{config.label}</span>
                </div>
              );
            })}
          </div>
          {orderStatus === "completed" && (
            <Button className="w-full gradient-primary text-primary-foreground" onClick={resetForm}>새 판매 주문</Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </AnimatedPage>
  );
};

export default SellPage;
