import { useState } from "react";
import { Check, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
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

const BUY_DISCOUNT = 0.99;

const BuyPage = () => {
  const { data: coins = [] } = useCryptoData();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [dialogStep, setDialogStep] = useState(0);
  const [selectedChain, setSelectedChain] = useState<ChainInfo | null>(null);
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const buyPrice = selectedCoin ? selectedCoin.priceKrw * BUY_DISCOUNT : 0;
  const krwTotal = numAmount * buyPrice;
  const fee = krwTotal * 0.001;

  const openBuyDialog = (coin: CoinData) => {
    setSelectedCoin(coin);
    setDialogStep(0);
    setSelectedChain(null);
    setAmount("");
    setWalletAddress("");
    setDialogOpen(true);
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
    toast({
      title: "구매 주문이 접수되었습니다",
      description: `${selectedCoin.symbol} ${amount}개 · ${formatKRW(krwTotal + fee)}`,
    });
    setDialogOpen(false);
  };

  const canNext = () => {
    if (dialogStep === 0) return !!selectedChain;
    if (dialogStep === 1) return numAmount > 0;
    if (dialogStep === 2) return walletAddress.trim().length >= 10;
    return true;
  };

  return (
    <AnimatedPage>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">코인 구매</h1>
        <p className="text-sm text-muted-foreground">시장가 대비 1% 할인된 가격으로 구매하세요</p>

        {/* Market list */}
        <div className="space-y-2">
          {coins.map((coin, index) => {
            const discountedPrice = coin.priceKrw * BUY_DISCOUNT;
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
                      <PriceFlash value={discountedPrice}>
                        <span className="font-semibold text-sm">{formatKRW(discountedPrice)}</span>
                      </PriceFlash>
                      <p className="text-xs text-muted-foreground">{formatVolume(coin.volume24h)}</p>
                    </div>
                    <div className={`flex items-center gap-0.5 min-w-[4rem] justify-end ${coin.change24h >= 0 ? "text-success" : "text-destructive"}`}>
                      {coin.change24h >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                      <span className="text-sm font-medium">{Math.abs(coin.change24h).toFixed(2)}%</span>
                    </div>
                    <Button
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4"
                      onClick={() => openBuyDialog(coin)}
                    >
                      구매
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Buy Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-card border-border sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground flex items-center gap-2">
                {selectedCoin && <CoinIcon image={selectedCoin.image} icon={selectedCoin.icon} symbol={selectedCoin.symbol} />}
                {selectedCoin?.symbol} 구매
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

              {/* Step 2: Wallet */}
              {dialogStep === 2 && (
                <div className="space-y-3">
                  <Label className="text-muted-foreground flex items-center gap-1.5">
                    <Wallet className="h-4 w-4" /> 수신 지갑 주소
                  </Label>
                  <Input placeholder="0x..." value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} className="bg-secondary border-border/50 font-mono text-sm" maxLength={100} />
                  <p className="text-xs text-muted-foreground">{selectedChain?.name} 네트워크 주소를 입력하세요</p>
                </div>
              )}

              {/* Step 3: Confirm */}
              {dialogStep === 3 && selectedCoin && (
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

              {/* Navigation */}
              <div className="flex gap-3 pt-2">
                {dialogStep > 0 && (
                  <Button variant="outline" className="flex-1 border-border/50" onClick={() => setDialogStep(dialogStep - 1)}>
                    이전
                  </Button>
                )}
                {dialogStep < 3 ? (
                  <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white" disabled={!canNext()} onClick={() => setDialogStep(dialogStep + 1)}>
                    다음
                  </Button>
                ) : (
                  <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleConfirm} disabled={submitting}>
                    <Check className="h-4 w-4 mr-1" /> 구매 확인
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

export default BuyPage;
