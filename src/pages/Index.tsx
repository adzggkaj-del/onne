import { useMemo } from "react";
import { TrendingUp, Users, Coins, Zap, ArrowUpRight, ArrowDownRight, PieChart, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKRW, formatVolume, generateFakeTransactions } from "@/lib/cryptoData";
import { useCryptoData } from "@/hooks/useCryptoData";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { useAuth } from "@/hooks/useAuth";
import AnimatedPage from "@/components/AnimatedPage";
import PriceFlash from "@/components/PriceFlash";
import CoinIcon from "@/components/CoinIcon";

// const stats = [
//   { label: "24시간 거래량", value: "$48.2B", change: "+12.5%", icon: TrendingUp },
//   { label: "활성 사용자", value: "2.4M", change: "+8.3%", icon: Users },
//   { label: "상장 코인", value: "350+", change: "+15", icon: Coins },
//   { label: "평균 응답", value: "0.3초", change: "-12%", icon: Zap },
// ];

const portfolio = [
  { symbol: "BTC", amount: 0.245, value: 23926320, pct: 52 },
  { symbol: "ETH", amount: 3.12, value: 14012640, pct: 30 },
  { symbol: "SOL", amount: 45.5, value: 12267900, pct: 18 },
];

const Index = () => {
  const { data: coins = [], isLoading } = useCryptoData();
  const { homeSpread } = usePlatformSettings();
  const { user } = useAuth();

  const fakeTransactions = useMemo(() => generateFakeTransactions(30), []);

  return (
    <AnimatedPage>
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Hero Banner - only for non-logged-in users */}
        {!user && (
          <section className="relative overflow-hidden rounded-2xl gradient-hero border border-primary/10 p-6 md:p-10">
            <div className="relative z-10">
              <h1 className="text-2xl md:text-4xl font-bold mb-3 leading-tight">
                안전하고 빠른 <span className="text-gradient">암호화폐 거래</span>
              </h1>
              <p className="text-muted-foreground text-sm md:text-base mb-6 max-w-lg">
                350개 이상의 코인을 한국 원화로 간편하게 거래하세요. 업계 최저 수수료와 실시간 시세를 제공합니다.
              </p>
              <div className="flex gap-3">
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold">거래 시작하기</Button>
                <Button variant="outline" className="border-primary/30 text-foreground hover:bg-primary/10">
                  더 알아보기
                </Button>
              </div>
            </div>
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-accent/10 blur-2xl" />
          </section>
        )}

        {/* Stats */}
        {/* <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-card border-border/50 hover:border-primary/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-success">{stat.change}</span>
                </div>
                <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </section> */}

        {/* Portfolio + Scrolling Transactions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-primary" />내 자산 포트폴리오
                </CardTitle>
                <span className="text-xs text-muted-foreground">총 자산</span>
              </div>
              <p className="text-2xl font-bold">{formatKRW(50206860)}</p>
              <p className="text-xs text-success">+3.24% (24시간)</p>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {portfolio.map((item) => (
                <div key={item.symbol} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full gradient-primary" />
                    <span className="text-sm font-medium">{item.symbol}</span>
                    <span className="text-xs text-muted-foreground">{item.amount}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{formatKRW(item.value)}</span>
                    <span className="text-xs text-muted-foreground w-8 text-right">{item.pct}%</span>
                  </div>
                </div>
              ))}
              <div className="flex h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-primary" style={{ width: "52%" }} />
                <div className="bg-accent/70" style={{ width: "30%" }} />
                <div className="bg-success" style={{ width: "18%" }} />
              </div>
            </CardContent>
          </Card>

          {/* Scrolling fake transactions */}
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
                        className={`ml-auto font-bold whitespace-nowrap ${tx.action === "구매" ? "text-emerald-400" : "text-red-400"}`}
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
        </section>

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

        {/* Partners */}
        <section className="py-6">
          <h2 className="text-lg font-bold mb-4">파트너</h2>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {[
              { name: "Visa", url: "https://primexbt.com/_next/static/media/Visa.937c0a5f.svg" },
              { name: "Mastercard", url: "https://primexbt.com/_next/static/media/Mastercard.7b1f0d2d.svg" },
              { name: "Skrill", url: "https://primexbt.com/_next/static/media/SkrillLogo.eec3e8fc.svg" },
              {
                name: "Standard Bank",
                url: "https://primexbt.com/_next/static/media/StandardBankOfSouthAfricaLogo.1fd5dabf.svg",
              },
              { name: "Neteller", url: "https://primexbt.com/_next/static/media/Neteller.14f4589d.svg" },
              { name: "Binance Pay", url: "https://primexbt.com/_next/static/media/BinancePay.13985e69.svg" },
            ].map((partner) => (
              <div
                key={partner.name}
                className="flex items-center justify-center h-12 w-12 md:h-16 md:w-16 rounded-full bg-white shadow-sm hover:shadow-md transition-all duration-300"
              >
                <img src={partner.url} alt={partner.name} className="h-5 md:h-7 w-auto object-contain" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </AnimatedPage>
  );
};

export default Index;
