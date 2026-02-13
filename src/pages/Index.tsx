import { TrendingUp, Users, Coins, Zap, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockCoins, formatKRW, formatVolume } from "@/lib/cryptoData";

const stats = [
  { label: "24시간 거래량", value: "$48.2B", change: "+12.5%", icon: TrendingUp, positive: true },
  { label: "활성 사용자", value: "2.4M", change: "+8.3%", icon: Users, positive: true },
  { label: "상장 코인", value: "350+", change: "+15", icon: Coins, positive: true },
  { label: "평균 응답", value: "0.3초", change: "-12%", icon: Zap, positive: true },
];

const Index = () => {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl gradient-hero border border-primary/10 p-6 md:p-10">
        <div className="relative z-10">
          <h1 className="text-2xl md:text-4xl font-bold mb-3 leading-tight">
            안전하고 빠른 <span className="text-gradient">암호화폐 거래</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mb-6 max-w-lg">
            350개 이상의 코인을 한국 원화로 간편하게 거래하세요. 업계 최저 수수료와 실시간 시세를 제공합니다.
          </p>
          <div className="flex gap-3">
            <Button className="gradient-primary text-primary-foreground hover:opacity-90 transition-opacity">
              거래 시작하기
            </Button>
            <Button variant="outline" className="border-primary/30 text-foreground hover:bg-primary/10">
              더 알아보기
            </Button>
          </div>
        </div>
        {/* Decorative element */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-accent/10 blur-2xl" />
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
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
      </section>

      {/* Market List */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">인기 코인</h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs">
            전체보기 →
          </Button>
        </div>

        <div className="space-y-2">
          {mockCoins.map((coin, index) => (
            <Card key={coin.id} className="bg-card border-border/50 hover:border-primary/20 transition-all cursor-pointer group">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-3 md:gap-4">
                  {/* Rank */}
                  <span className="text-xs text-muted-foreground w-5 text-center font-medium">{index + 1}</span>

                  {/* Coin info */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-lg shrink-0">
                      {coin.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{coin.symbol}</p>
                      <p className="text-xs text-muted-foreground truncate">{coin.nameKr}</p>
                    </div>
                  </div>

                  {/* Mini sparkline */}
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

                  {/* Price */}
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatKRW(coin.priceKrw)}</p>
                    <p className="text-xs text-muted-foreground">{formatVolume(coin.volume24h)}</p>
                  </div>

                  {/* Change */}
                  <div className={`flex items-center gap-0.5 min-w-[4.5rem] justify-end ${
                    coin.change24h >= 0 ? "text-success" : "text-destructive"
                  }`}>
                    {coin.change24h >= 0 ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    )}
                    <span className="text-sm font-medium">{Math.abs(coin.change24h).toFixed(2)}%</span>
                  </div>

                  {/* Trade button */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="hidden md:inline-flex border-primary/30 text-primary hover:bg-primary/10 text-xs"
                  >
                    거래
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
