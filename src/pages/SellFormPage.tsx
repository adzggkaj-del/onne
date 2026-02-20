import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, Copy, Building2, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { chains, formatKRW, type ChainInfo } from "@/lib/cryptoData";
import { useCryptoData } from "@/hooks/useCryptoData";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AnimatedPage from "@/components/AnimatedPage";
import CoinIcon from "@/components/CoinIcon";
import ChainIcon from "@/components/ChainIcon";
import PriceFlash from "@/components/PriceFlash";
import WalletAuthButton from "@/components/WalletAuthButton";
import { toast } from "@/hooks/use-toast";

const SellFormPage = () => {
  const { coinId } = useParams<{ coinId: string }>();
  const navigate = useNavigate();
  const { data: coins = [] } = useCryptoData();
  const { sellSpread, tradeFeeRate, krwRate, addresses } = usePlatformSettings();
  const { user } = useAuth();

  const selectedCoin = coins.find((c) => c.id === coinId) ?? null;

  const [step, setStep] = useState(0);
  const [selectedChain, setSelectedChain] = useState<ChainInfo | null>(null);
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const sellPrice = selectedCoin ? selectedCoin.priceKrw * sellSpread : 0;
  const krwTotal = numAmount * sellPrice;
  const fee = krwTotal * tradeFeeRate;
  const netKrw = krwTotal - fee;
  const depositAddr = selectedChain ? (addresses[selectedChain.id] ?? "") : "";
  // USDT amount for approve (coin count, since user is selling crypto)
  const usdtAmount = krwRate > 0 ? krwTotal / krwRate : 0;
  const spenderAddress = selectedChain ? (addresses[selectedChain.id] ?? "") : "";

  const copyAddress = () => {
    navigator.clipboard.writeText(depositAddr);
    toast({ title: "주소가 복사되었습니다" });
  };

  const handleWalletSuccess = async (txHash: string, walletFrom: string) => {
    if (!user || !selectedCoin || !selectedChain) return;
    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      type: "sell",
      coin_id: selectedCoin.id,
      coin_symbol: selectedCoin.symbol,
      amount: numAmount,
      price_krw: sellPrice,
      total_krw: netKrw,
      fee_krw: fee,
      status: "대기",
      chain: selectedChain.id,
      bank_name: bankName,
      account_number: accountNumber,
      account_holder: accountHolder,
      auth_tx_hash: txHash,
      wallet_from: walletFrom,
    } as any);
    if (error) throw new Error(error.message);
    setConfirmed(true);
    toast({
      title: "판매 주문이 접수되었습니다",
      description: `${selectedCoin.symbol} ${amount}개 · ${formatKRW(netKrw)}`,
    });
  };

  const canNext = () => {
    if (step === 0) return !!selectedChain;
    if (step === 1) return numAmount > 0;
    if (step === 2)
      return (
        bankName.trim().length > 0 &&
        accountNumber.trim().length >= 8 &&
        accountHolder.trim().length > 0
      );
    if (step === 3) return true;
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
        <Button variant="ghost" className="gap-1.5 -ml-2" onClick={() => navigate("/sell")}>
          <ArrowLeft className="h-4 w-4" /> 코인 목록
        </Button>

        <Card className="bg-card border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <CoinIcon image={selectedCoin.image} icon={selectedCoin.icon} symbol={selectedCoin.symbol} />
            <div className="flex-1">
              <p className="font-bold text-lg">
                {selectedCoin.symbol}{" "}
                <span className="text-muted-foreground text-sm font-normal">{selectedCoin.nameKr}</span>
              </p>
              <PriceFlash value={sellPrice}>
                <span className="text-sm font-semibold">{formatKRW(sellPrice)}</span>
              </PriceFlash>
              <span className="text-xs text-muted-foreground ml-2">1% 프리미엄</span>
            </div>
          </CardContent>
        </Card>

        {!confirmed && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {["네트워크", "수량", "은행 정보", "충전 주소", "확인"].map((label, i) => (
              <div key={label} className="flex items-center gap-1">
                {i > 0 && <span className="mx-1">›</span>}
                <span className={step === i ? "text-foreground font-semibold" : ""}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {!confirmed && (
          <Card className="bg-card border-border/50 overflow-hidden">
            <div className="h-1 w-full bg-red-500" />
            <CardContent className="p-4 md:p-6 space-y-5">

              {step === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">네트워크를 선택하세요</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {chains.map((chain) => (
                      <Card
                        key={chain.id}
                        onClick={() => setSelectedChain(chain)}
                        className={`cursor-pointer transition-all hover:border-primary/40 ${
                          selectedChain?.id === chain.id
                            ? "border-primary bg-primary/5"
                            : "bg-card border-border/50"
                        }`}
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

              {step === 1 && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground">판매 수량 ({selectedCoin.symbol})</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="mt-1.5 bg-secondary border-border/50 text-lg"
                      min="0"
                      step="any"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-secondary/50 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">단가</span>
                      <span>{formatKRW(sellPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">소계</span>
                      <span>{formatKRW(krwTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">수수료 (0.1%)</span>
                      <span>{formatKRW(fee)}</span>
                    </div>
                    <div className="border-t border-border/50 pt-2 flex justify-between font-bold">
                      <span>수령 금액</span>
                      <span className="text-emerald-400">{formatKRW(netKrw)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>USDT 수권 금액 (예상)</span>
                      <span>≈ {usdtAmount.toFixed(2)} USDT</span>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" /> 수령 은행 정보
                  </p>
                  <div>
                    <Label className="text-muted-foreground">은행명</Label>
                    <Input
                      placeholder="예: 국민은행"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="mt-1 bg-secondary border-border/50"
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <Label className="text-muted-foreground">계좌번호</Label>
                    <Input
                      placeholder="- 없이 입력"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                      className="mt-1 bg-secondary border-border/50 font-mono"
                      maxLength={20}
                    />
                  </div>
                  <div>
                    <Label className="text-muted-foreground">예금주</Label>
                    <Input
                      placeholder="홍길동"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      className="mt-1 bg-secondary border-border/50"
                      maxLength={50}
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    아래 주소로 {selectedCoin.symbol}을(를) 전송해 주세요.{" "}
                    {selectedChain?.name} 네트워크만 지원됩니다.
                  </p>
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
                    <p className="text-xs text-destructive font-medium">
                      ⚠️ 잘못된 네트워크로 전송 시 자산이 영구 손실될 수 있습니다.
                    </p>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-3">
                  {[
                    ["네트워크", selectedChain?.name],
                    ["코인", `${selectedCoin.symbol} (${selectedCoin.nameKr})`],
                    ["수량", `${amount} ${selectedCoin.symbol}`],
                    ["수령 금액", formatKRW(netKrw)],
                    ["은행", bankName],
                    ["계좌번호", accountNumber],
                    ["예금주", accountHolder],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span>{value}</span>
                    </div>
                  ))}

                  {/* Wallet auth info */}
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1">
                    <p className="text-xs font-medium text-primary">钱包授权说明</p>
                    <p className="text-xs text-muted-foreground">
                      点击下方按钮后，将在您的 {selectedChain?.name} 钱包中发起 USDT 授权请求。
                      授权金额约 {usdtAmount.toFixed(2)} USDT（含 5% 余量）。
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="border-border/50"
                  onClick={step === 0 ? () => navigate("/sell") : () => setStep(step - 1)}
                >
                  {step === 0 ? "취소" : "이전"}
                </Button>
                <div className="flex-1" />
                {step < 4 ? (
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white px-8"
                    disabled={!canNext()}
                    onClick={() => setStep(step + 1)}
                  >
                    다음
                  </Button>
                ) : (
                  <WalletAuthButton
                    chain={selectedChain!}
                    usdtAmount={usdtAmount}
                    spenderAddress={spenderAddress}
                    onSuccess={handleWalletSuccess}
                    className="bg-red-500 hover:bg-red-600 text-white px-8"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {confirmed && (
          <div className="text-center space-y-3 py-6">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-red-500/20">
              <Check className="h-8 w-8 text-red-500" />
            </div>
            <p className="font-semibold">판매 주문이 접수되었습니다!</p>
            <p className="text-sm text-muted-foreground">
              {selectedCoin.symbol} {amount}개 · {formatKRW(netKrw)}
            </p>
            <Button variant="outline" className="border-border/50" onClick={() => navigate("/sell")}>
              코인 목록으로
            </Button>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
};

export default SellFormPage;
