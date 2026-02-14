import { useState } from "react";
import { TrendingUp, Users, Coins, Zap, ArrowUpRight, ArrowDownRight, Newspaper, PieChart, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKRW, formatVolume, type CoinData } from "@/lib/cryptoData";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useAuth } from "@/hooks/useAuth";
import AnimatedPage from "@/components/AnimatedPage";
import PriceFlash from "@/components/PriceFlash";
import CoinIcon from "@/components/CoinIcon";

const stats = [
  { label: "24시간 거래량", value: "$48.2B", change: "+12.5%", icon: TrendingUp },
  { label: "활성 사용자", value: "2.4M", change: "+8.3%", icon: Users },
  { label: "상장 코인", value: "350+", change: "+15", icon: Coins },
  { label: "평균 응답", value: "0.3초", change: "-12%", icon: Zap },
];

const portfolio = [
  { symbol: "BTC", amount: 0.245, value: 23926320, pct: 52 },
  { symbol: "ETH", amount: 3.12, value: 14012640, pct: 30 },
  { symbol: "SOL", amount: 45.5, value: 12267900, pct: 18 },
];

const news = [
  { title: "비트코인, 10만 달러 돌파 임박 – 기관 투자 급증", time: "2시간 전", tag: "시장" },
  { title: "한국 금융위원회, 가상자산 규제 프레임워크 발표", time: "4시간 전", tag: "규제" },
  { title: "이더리움 Dencun 업그레이드 완료, L2 수수료 대폭 인하", time: "6시간 전", tag: "기술" },
  { title: "솔라나 생태계 TVL 역대 최고치 경신", time: "8시간 전", tag: "DeFi" },
];

const Index = () => {
  const { data: coins = [], isLoading } = useCryptoData();
  const { user } = useAuth();
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [tradeTab, setTradeTab] = useState("buy");
  const [tradeAmount, setTradeAmount] = useState("");

  const krwValue = selectedCoin && tradeAmount
    ? parseFloat(tradeAmount) * selectedCoin.priceKrw
    : 0;

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
              <Button className="gradient-primary text-primary-foreground hover:opacity-90 transition-opacity">
                거래 시작하기
              </Button>
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

        {/* Portfolio + News */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-primary" />
                  내 자산 포트폴리오
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

          <Card className="bg-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-primary" />
                실시간 뉴스
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {news.map((item, i) => (
                <div key={i} className="flex gap-3 group cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">{item.tag}</span>
                      <span className="text-xs text-muted-foreground">{item.time}</span>
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                </div>
              ))}
            </CardContent>
          </Card>
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
                  <Card
                    key={coin.id}
                    className="bg-card border-border/50 hover:border-primary/20 transition-all cursor-pointer group"
                    onClick={() => { setSelectedCoin(coin); setTradeAmount(""); }}
                  >
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
                              <div key={i} className={`flex-1 rounded-sm ${coin.change24h >= 0 ? "bg-success/60" : "bg-destructive/60"}`} style={{ height: `${Math.max(8, height)}%` }} />
                            );
                          })}
                        </div>
                        <div className="text-right">
                          <PriceFlash value={coin.priceKrw}>
                            <span className="font-semibold text-sm">{formatKRW(coin.priceKrw)}</span>
                          </PriceFlash>
                          <p className="text-xs text-muted-foreground">{formatVolume(coin.volume24h)}</p>
                        </div>
                        <div className={`flex items-center gap-0.5 min-w-[4.5rem] justify-end ${coin.change24h >= 0 ? "text-success" : "text-destructive"}`}>
                          {coin.change24h >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                          <span className="text-sm font-medium">{Math.abs(coin.change24h).toFixed(2)}%</span>
                        </div>
                        <Button size="sm" variant="outline" className="hidden md:inline-flex border-primary/30 text-primary hover:bg-primary/10 text-xs" onClick={(e) => { e.stopPropagation(); setSelectedCoin(coin); setTradeAmount(""); }}>
                          거래
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </section>

        {/* Trade Drawer */}
        <Drawer open={!!selectedCoin} onOpenChange={(open) => { if (!open) setSelectedCoin(null); }}>
          <DrawerContent className="bg-card border-border">
            {selectedCoin && (
              <>
                <DrawerHeader>
                  <div className="flex items-center gap-3">
                    <CoinIcon image={selectedCoin.image} icon={selectedCoin.icon} symbol={selectedCoin.symbol} size="lg" />
                    <div>
                      <DrawerTitle className="text-foreground">{selectedCoin.symbol} / KRW</DrawerTitle>
                      <DrawerDescription>{selectedCoin.nameKr} · {formatKRW(selectedCoin.priceKrw)}</DrawerDescription>
                    </div>
                    <div className={`ml-auto text-sm font-medium ${selectedCoin.change24h >= 0 ? "text-success" : "text-destructive"}`}>
                      {selectedCoin.change24h >= 0 ? "+" : ""}{selectedCoin.change24h.toFixed(2)}%
                    </div>
                  </div>
                </DrawerHeader>

                <div className="px-4 pb-4 space-y-4">
                  <Tabs value={tradeTab} onValueChange={setTradeTab}>
                    <TabsList className="w-full bg-secondary">
                      <TabsTrigger value="buy" className="flex-1 data-[state=active]:bg-success data-[state=active]:text-success-foreground">매수</TabsTrigger>
                      <TabsTrigger value="sell" className="flex-1 data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">매도</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">수량 ({selectedCoin.symbol})</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={tradeAmount}
                        onChange={(e) => setTradeAmount(e.target.value)}
                        className="bg-secondary border-border/50"
                        min="0"
                        step="any"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <span className="text-xs text-muted-foreground">환산 금액 (KRW)</span>
                      <span className="text-sm font-semibold">{krwValue > 0 ? formatKRW(krwValue) : "₩0"}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>수수료 (0.1%)</span>
                      <span>{krwValue > 0 ? formatKRW(krwValue * 0.001) : "₩0"}</span>
                    </div>
                  </div>
                </div>

                <DrawerFooter>
                  <Button className={`w-full ${tradeTab === "buy" ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"} text-white`}>
                    {tradeTab === "buy" ? "매수" : "매도"} {selectedCoin.symbol}
                  </Button>
                  <DrawerClose asChild>
                    <Button variant="outline" className="w-full border-border/50">취소</Button>
                  </DrawerClose>
                </DrawerFooter>
              </>
            )}
          </DrawerContent>
        </Drawer>
      </div>
    </AnimatedPage>
  );
};

export default Index;
