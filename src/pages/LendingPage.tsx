import { useState } from "react";
import { Landmark, Check, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { mockCoins, chains, formatKRW, type CoinData, type ChainInfo } from "@/lib/cryptoData";
import { toast } from "@/hooks/use-toast";

const DAILY_RATE = 0.001; // 0.1% / day
const TERM_DAYS = 30;

const LendingPage = () => {
  const [selectedChain, setSelectedChain] = useState<ChainInfo | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [amount, setAmount] = useState(50);
  const [confirmed, setConfirmed] = useState(false);

  const filteredCoins = selectedChain ? mockCoins.filter((c) => c.chain === selectedChain.id) : mockCoins;

  const loanKrw = selectedCoin ? amount * selectedCoin.priceKrw / 100 : 0;
  const totalInterest = loanKrw * DAILY_RATE * TERM_DAYS;
  const totalRepay = loanKrw + totalInterest;

  const handleConfirm = () => {
    setConfirmed(true);
    toast({ title: "대출 신청이 완료되었습니다", description: `상환 금액: ${formatKRW(totalRepay)}` });
  };

  const reset = () => {
    setSelectedChain(null);
    setSelectedCoin(null);
    setAmount(50);
    setConfirmed(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">암호화폐 대출</h1>

      {/* Chain select */}
      <div>
        <Label className="text-muted-foreground text-xs mb-2 block">1. 체인 선택</Label>
        <div className="flex flex-wrap gap-2">
          {chains.map((chain) => (
            <Button key={chain.id} variant={selectedChain?.id === chain.id ? "default" : "outline"} size="sm"
              className={selectedChain?.id === chain.id ? "gradient-primary text-primary-foreground" : "border-border/50"}
              onClick={() => { setSelectedChain(chain); setSelectedCoin(null); }}>
              <span className="mr-1">{chain.icon}</span> {chain.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Coin select */}
      {selectedChain && (
        <div>
          <Label className="text-muted-foreground text-xs mb-2 block">2. 코인 선택</Label>
          <div className="flex flex-wrap gap-2">
            {filteredCoins.map((coin) => (
              <Button key={coin.id} variant={selectedCoin?.id === coin.id ? "default" : "outline"} size="sm"
                className={selectedCoin?.id === coin.id ? "gradient-primary text-primary-foreground" : "border-border/50"}
                onClick={() => setSelectedCoin(coin)}>
                <span className="mr-1">{coin.icon}</span> {coin.symbol}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Amount slider */}
      {selectedCoin && (
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">3. 대출 수량</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Slider value={[amount]} onValueChange={([v]) => setAmount(v)} min={10} max={100} step={1} className="flex-1" />
              <div className="flex items-center gap-1 min-w-[5rem]">
                <Input type="number" value={amount} onChange={(e) => setAmount(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))} className="w-16 bg-secondary border-border/50 text-center text-sm h-8" />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">담보 대비 {amount}% 대출 · 대출 금액: {formatKRW(loanKrw)}</p>
          </CardContent>
        </Card>
      )}

      {/* Loan summary */}
      {selectedCoin && (
        <Card className="bg-card border-border/50 overflow-hidden">
          <div className="h-1 w-full gradient-primary" />
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Landmark className="h-4 w-4 text-primary" /> 대출 요약
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["대출 코인", `${selectedCoin.symbol} (${selectedCoin.nameKr})`],
              ["대출 비율", `${amount}%`],
              ["대출 금액", formatKRW(loanKrw)],
              ["일일 이자율", "0.1%"],
              ["대출 기간", `${TERM_DAYS}일`],
              ["총 이자", formatKRW(totalInterest)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span>{value}</span>
              </div>
            ))}
            <div className="border-t border-border/50 pt-2 flex justify-between font-bold text-base">
              <span>만기 상환 금액</span>
              <span className="text-primary">{formatKRW(totalRepay)}</span>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10 mt-2">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">대출 만기일에 자동으로 상환됩니다. 조기 상환 시 남은 이자는 면제됩니다.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action */}
      {selectedCoin && !confirmed && (
        <Button className="w-full gradient-primary text-primary-foreground hover:opacity-90 h-12 text-base" onClick={handleConfirm}>
          <Check className="h-5 w-5 mr-2" /> 대출 신청
        </Button>
      )}
      {confirmed && (
        <div className="text-center space-y-3">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-success/20">
            <Check className="h-8 w-8 text-success" />
          </div>
          <p className="font-semibold">대출 신청이 완료되었습니다!</p>
          <p className="text-sm text-muted-foreground">상환 예정일: {new Date(Date.now() + TERM_DAYS * 86400000).toLocaleDateString("ko-KR")}</p>
          <Button variant="outline" className="border-border/50" onClick={reset}>새 대출 신청</Button>
        </div>
      )}
    </div>
  );
};

export default LendingPage;
