import { useNavigate } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatKRW, formatVolume } from "@/lib/cryptoData";
import { useCryptoData } from "@/hooks/useCryptoData";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import AnimatedPage from "@/components/AnimatedPage";
import CoinIcon from "@/components/CoinIcon";
import PriceFlash from "@/components/PriceFlash";

const BuyPage = () => {
  const { data: coins = [] } = useCryptoData();
  const { buySpread } = usePlatformSettings();
  const navigate = useNavigate();

  return (
    <AnimatedPage>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        <p className="text-sm text-muted-foreground">시장가 대비 1% 할인된 가격으로 구매하세요</p>

        <div className="space-y-2">
          {coins.map((coin, index) => {
            const discountedPrice = coin.priceKrw * (coin.buy_spread ?? buySpread);
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
                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4" onClick={() => navigate(`/buy/${coin.id}`)}>
                      구매
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AnimatedPage>
  );
};

export default BuyPage;
