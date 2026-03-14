import { useMemo } from "react";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKRW, formatVolume, generateFakeTransactions } from "@/lib/cryptoData";
import { useCryptoData } from "@/hooks/useCryptoData";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { useAuth } from "@/hooks/useAuth";
import AnimatedPage from "@/components/AnimatedPage";
import PriceFlash from "@/components/PriceFlash";
import CoinIcon from "@/components/CoinIcon";
import usdtGift from "@/assets/usdt-gift.png";

const Index = () => {
  const { data: coins = [], isLoading } = useCryptoData();
  const { homeSpread } = usePlatformSettings();
  const { user } = useAuth();

  const fakeTransactions = useMemo(() => generateFakeTransactions(30), []);

  return (
    <AnimatedPage>
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Hero Banner */}
        <section className="rounded-2xl bg-card border border-border/50 p-6 md:p-10">
            <h1 className="text-3xl md:text-3xl font-bold mb-5 leading-tight">
              안전하고 빠른
              <br />
              <span className="text-gradient text-3xl md:text-4xl">암호화폐 거래소</span>
            </h1>
            <ul className="space-y-2.5">
              {[
                "즉시거래",
                "2분 이내 인증",
                "24/7 온라인 지원",
                "외부 지갑으로 구매",
                "실시간 시세보다 1% 할인된 가격",
                "다양한 암호화폐를  빠르고 쉽게 안전하게 거래",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm md:text-base text-muted-foreground">
                  <span className="h-2 w-2 rounded-full gradient-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

        {/* USDT Welcome Reward Banner */}
        <section className="rounded-2xl bg-card border border-border/50 px-4 py-3 md:px-6 md:py-4 flex flex-row items-center gap-3 md:gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-sm md:text-base font-bold leading-snug">
              회원님을 위한 전용혜택{" "}
              <br />
              회원가입 즉시 <span className="text-green-400 text-base md:text-xl font-extrabold">300 USDT</span> 보상 받기
              <br />
             
            </p>
          </div>
          <img
            src={usdtGift}
            alt="USDT welcome reward"
            className="w-20 md:w-32 h-auto object-contain shrink-0"
          />
        </section>

        <Card className="bg-card border-border/50 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              실시간 거래 현황
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 h-48 overflow-hidden relative">
            <div className="absolute inset-0">
              <div className="animate-scroll-up space-y-2.5">
                {[...fakeTransactions, ...fakeTransactions].map((tx, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs px-1">
                    <span className="font-medium text-foreground min-w-[3rem]">{tx.username}</span>
                    <span className="text-muted-foreground font-mono">{tx.wallet}</span>
                    <span
                      className={`ml-auto font-bold whitespace-nowrap ${tx.action === "구매" ? "text-success" : "text-destructive"}`}
                    >
                      {tx.action} {tx.amount} {tx.symbol}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-card to-transparent z-10" />
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-card to-transparent z-10" />
          </CardContent>
        </Card>

        {/* Market List - display only */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">인기 코인</h2>
          </div>

          <div className="space-y-2">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="bg-card border-border/50">
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center gap-3 md:gap-4">
                        <Skeleton className="h-5 w-5 rounded" />
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              : coins.map((coin, index) => (
                  <Card key={coin.id} className="bg-card border-border/50">
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
                        <div className="hidden md:flex items-end h-8 gap-px w-20">
                          {coin.sparkline.slice(-12).map((val, i, arr) => {
                            const min = Math.min(...arr);
                            const max = Math.max(...arr);
                            const height = max === min ? 50 : ((val - min) / (max - min)) * 100;
                            return (
                              <div
                                key={i}
                                className={`flex-1 rounded-sm ${coin.change24h >= 0 ? "bg-success/60" : "bg-destructive/60"}`}
                                style={{ height: `${Math.max(8, height)}%` }}
                              />
                            );
                          })}
                        </div>
                        <div className="text-right">
                          <PriceFlash value={coin.priceKrw * homeSpread}>
                            <span className="font-semibold text-sm">{formatKRW(coin.priceKrw * homeSpread)}</span>
                          </PriceFlash>
                          <p className="text-xs text-muted-foreground">{formatVolume(coin.volume24h)}</p>
                        </div>
                        <div
                          className={`flex items-center gap-0.5 min-w-[4.5rem] justify-end ${coin.change24h >= 0 ? "text-success" : "text-destructive"}`}
                        >
                          {coin.change24h >= 0 ? (
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDownRight className="h-3.5 w-3.5" />
                          )}
                          <span className="text-sm font-medium">{Math.abs(coin.change24h).toFixed(2)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </section>

      </div>
    </AnimatedPage>
  );
};

export default Index;
