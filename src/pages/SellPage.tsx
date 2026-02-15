import { useState } from "react";
import { Check, Copy, Building2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { chains, formatKRW, formatVolume, type CoinData, type ChainInfo } from "@/lib/cryptoData";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AnimatedPage from "@/components/AnimatedPage";
import CoinIcon from "@/components/CoinIcon";
import ChainIcon from "@/components/ChainIcon";
import PriceFlash from "@/components/PriceFlash";
import { toast } from "@/hooks/use-toast";

const SELL_MARKUP = 1.01;

const DEPOSIT_ADDRESSES: Record<string, string> = {
  ethereum: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  bsc: "0x10ED43C718714eb63d5aA57B78B54917FC171d73",
  tron: "TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax",
  solana: "5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9",
  polygon: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
};

const SellPage = () => {
  const { data: coins = [] } = useCryptoData();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [dialogStep, setDialogStep] = useState(0);
  const [selectedChain, setSelectedChain] = useState<ChainInfo | null>(null);
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const sellPrice = selectedCoin ? selectedCoin.priceKrw * SELL_MARKUP : 0;
  const krwTotal = numAmount * sellPrice;
  const fee = krwTotal * 0.001;
  const depositAddr = selectedChain ? DEPOSIT_ADDRESSES[selectedChain.id] : "";

  const openSellDialog = (coin: CoinData) => {
    setSelectedCoin(coin);
    setDialogStep(0);
    setSelectedChain(null);
    setAmount("");
    setBankName("");
    setAccountNumber("");
    setAccountHolder("");
    setDialogOpen(true);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(depositAddr);
    toast({ title: "주소가 복사되었습니다" });
  };

  const handleConfirm = async () => {
    if (!user || !selectedCoin || !selectedChain) return;
    setSubmitting(true);
    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      type: "sell",
      coin_id: selectedCoin.id,
      coin_symbol: selectedCoin.symbol,
      amount: numAmount,
      price_krw: sellPrice,
      total_krw: krwTotal - fee,
      fee_krw: fee,
      status: "대기",
      chain: selectedChain.id,
      bank_name: bankName,
      account_number: accountNumber,
      account_holder: accountHolder,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "주문 실패", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: "판매 주문이 접수되었습니다",
      description: `${selectedCoin.symbol} ${amount}개 · ${formatKRW(krwTotal - fee)}`,
    });
    setDialogOpen(false);
  };

  const canNext = () => {
    if (dialogStep === 0) return !!selectedChain;
    if (dialogStep === 1) return numAmount > 0;
    if (dialogStep === 2) return bankName.trim().length > 0 && accountNumber.trim().length >= 8 && accountHolder.trim().length > 0;
    if (dialogStep === 3) return true; // QR + address display
    return true;
  };

  return (
    <AnimatedPage>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">코인 판매</h1>
        <p className="text-sm text-muted-foreground">시장가 대비 1% 높은 가격으로 판매하세요</p>

        {/* Market list */}
        <div className="space-y-2">
          {coins.map((coin, index) => {
            const markupPrice = coin.priceKrw * SELL_MARKUP;
            return (
              <Card key={coin.id} className="bg-card border-border/50 hover:border-primary/20 transition-all">
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
                      <PriceFlash value={markupPrice}>
                        <span className="font-semibold text-sm">{formatKRW(markupPrice)}</span>
                      </PriceFlash>
                      <p className="text-xs text-muted-foreground">{formatVolume(coin.volume24h)}</p>
                    </div>
                    <div className={`flex items-center gap-0.5 min-w-[4rem] justify-end ${coin.change24h >= 0 ? "text-success" : "text-destructive"}`}>
                      {coin.change24h >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                      <span className="text-sm font-medium">{Math.abs(coin.change24h).toFixed(2)}%</span>
                    </div>
                    <Button
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4"
                      onClick={() => openSellDialog(coin)}
                    >
                      판매
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Sell Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-card border-border sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground flex items-center gap-2">
                {selectedCoin && <CoinIcon image={selectedCoin.image} icon={selectedCoin.icon} symbol={selectedCoin.symbol} />}
                {selectedCoin?.symbol} 판매
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Step 0: Chain */}
              {dialogStep === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">네트워크를 선택하세요</p>
                  <div className="grid grid-cols-2 gap-2">
                    {chains.map((chain) => (
                      <Card
                        key={chain.id}
                        onClick={() => setSelectedChain(chain)}
                        className={`cursor-pointer transition-all hover:border-primary/40 ${selectedChain?.id === chain.id ? "border-primary bg-primary/5" : "bg-card border-border/50"}`}
                      >
                        <CardContent className="p-3 flex items-center gap-2">
                          <ChainIcon image={chain.image} icon={chain.icon} name={chain.name} />
                          <span className="font-medium text-xs">{chain.name}</span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: Amount */}
              {dialogStep === 1 && selectedCoin && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground">판매 수량 ({selectedCoin.symbol})</Label>
                    <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1.5 bg-secondary border-border/50 text-lg" min="0" step="any" />
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/50 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">단가</span><span>{formatKRW(sellPrice)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">소계</span><span>{formatKRW(krwTotal)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">수수료 (0.1%)</span><span>{formatKRW(fee)}</span></div>
                    <div className="border-t border-border/50 pt-2 flex justify-between font-bold">
                      <span>수령 금액</span><span className="text-emerald-400">{formatKRW(krwTotal - fee)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Bank info */}
              {dialogStep === 2 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Building2 className="h-4 w-4" /> 수령 은행 정보</p>
                  <div>
                    <Label className="text-muted-foreground">은행명</Label>
                    <Input placeholder="예: 국민은행" value={bankName} onChange={(e) => setBankName(e.target.value)} className="mt-1 bg-secondary border-border/50" maxLength={50} />
                  </div>
                  <div>
                    <Label className="text-muted-foreground">계좌번호</Label>
                    <Input placeholder="- 없이 입력" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))} className="mt-1 bg-secondary border-border/50 font-mono" maxLength={20} />
                  </div>
                  <div>
                    <Label className="text-muted-foreground">예금주</Label>
                    <Input placeholder="홍길동" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} className="mt-1 bg-secondary border-border/50" maxLength={50} />
                  </div>
                </div>
              )}

              {/* Step 3: Deposit address + QR */}
              {dialogStep === 3 && selectedCoin && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">아래 주소로 {selectedCoin.symbol}을(를) 전송해 주세요. {selectedChain?.name} 네트워크만 지원됩니다.</p>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border/50">
                    <p className="text-xs font-mono flex-1 break-all select-all">{depositAddr}</p>
                    <Button size="icon" variant="ghost" onClick={copyAddress} className="shrink-0">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(depositAddr)}&size=200x200`}
                      alt="QR Code"
                      className="w-40 h-40 rounded-lg border border-border/50"
                    />
                  </div>
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-xs text-destructive font-medium">⚠️ 잘못된 네트워크로 전송 시 자산이 영구 손실될 수 있습니다.</p>
                  </div>
                </div>
              )}

              {/* Step 4: Confirm */}
              {dialogStep === 4 && selectedCoin && (
                <div className="space-y-3">
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
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-2">
                {dialogStep > 0 && (
                  <Button variant="outline" className="flex-1 border-border/50" onClick={() => setDialogStep(dialogStep - 1)}>
                    이전
                  </Button>
                )}
                {dialogStep < 4 ? (
                  <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white" disabled={!canNext()} onClick={() => setDialogStep(dialogStep + 1)}>
                    다음
                  </Button>
                ) : (
                  <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white" onClick={handleConfirm} disabled={submitting}>
                    <Check className="h-4 w-4 mr-1" /> 판매 확인
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedPage>
  );
};

export default SellPage;
