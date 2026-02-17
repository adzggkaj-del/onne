import { useNavigate } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatKRW, formatVolume } from "@/lib/cryptoData";
import { useCryptoData } from "@/hooks/useCryptoData";
import AnimatedPage from "@/components/AnimatedPage";
import CoinIcon from "@/components/CoinIcon";
import PriceFlash from "@/components/PriceFlash";

const LendingPage = () => {
  const { data: coins = [] } = useCryptoData();
  const navigate = useNavigate();

  return (
    <AnimatedPage>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">암호화폐 대출</h1>
        <p className="text-sm text-muted-foreground">보유 코인을 담보로 대출받으세요</p>

        <div className="space-y-2">
          {coins.map((coin, index) => (
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
                    <PriceFlash value={coin.priceKrw}>
                      <span className="font-semibold text-sm">{formatKRW(coin.priceKrw)}</span>
                    </PriceFlash>
                    <p className="text-xs text-muted-foreground">{formatVolume(coin.volume24h)}</p>
                  </div>
                  <div className={`flex items-center gap-0.5 min-w-[4rem] justify-end ${coin.change24h >= 0 ? "text-success" : "text-destructive"}`}>
                    {coin.change24h >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                    <span className="text-sm font-medium">{Math.abs(coin.change24h).toFixed(2)}%</span>
                  </div>
                  <Button size="sm" className="gradient-primary text-primary-foreground text-xs font-bold px-4" onClick={() => navigate(`/lending/${coin.id}`)}>
                    대출
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AnimatedPage>
  );
};

export default LendingPage;
