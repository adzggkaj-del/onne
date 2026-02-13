import { useState } from "react";
import { Wallet, Send, Download, QrCode, ArrowUpRight, ArrowDownRight, ShieldCheck, Copy, Gift, Clock, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatKRW } from "@/lib/cryptoData";
import AnimatedPage from "@/components/AnimatedPage";
import { toast } from "@/hooks/use-toast";

const holdings = [
  { symbol: "BTC", name: "비트코인", icon: "₿", amount: 0.245, valueKrw: 32856780 },
  { symbol: "ETH", name: "이더리움", icon: "⟠", amount: 3.12, valueKrw: 14012640 },
  { symbol: "SOL", name: "솔라나", icon: "◎", amount: 45.5, valueKrw: 12267900 },
  { symbol: "USDT", name: "테더", icon: "₮", amount: 5200, valueKrw: 7243920 },
];

const orders = [
  { id: "ORD-20260213-001", type: "buy" as const, symbol: "BTC", amount: 0.05, krw: 6705420, status: "완료", date: "2026-02-13 14:32" },
  { id: "ORD-20260213-002", type: "sell" as const, symbol: "ETH", amount: 1.2, krw: 5385120, status: "처리 중", date: "2026-02-13 11:15" },
  { id: "ORD-20260212-003", type: "buy" as const, symbol: "SOL", amount: 20, krw: 5414760, status: "완료", date: "2026-02-12 09:45" },
  { id: "ORD-20260211-004", type: "sell" as const, symbol: "USDT", amount: 1000, krw: 1393800, status: "완료", date: "2026-02-11 16:22" },
  { id: "ORD-20260210-005", type: "buy" as const, symbol: "BTC", amount: 0.1, krw: 13410840, status: "완료", date: "2026-02-10 20:10" },
];

const quickActions = [
  { label: "충전", icon: Download, color: "text-success" },
  { label: "출금", icon: Send, color: "text-primary" },
  { label: "전환", icon: ArrowUpRight, color: "text-accent" },
  { label: "QR코드", icon: QrCode, color: "text-muted-foreground" },
];

const totalBalance = holdings.reduce((sum, h) => sum + h.valueKrw, 0);
const bonusBalance = 150000;

const AssetsPage = () => {
  const [orderFilter, setOrderFilter] = useState("all");

  const filteredOrders = orderFilter === "all" ? orders : orders.filter((o) => o.type === orderFilter);

  return (
    <AnimatedPage>
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* User info */}
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14 border-2 border-primary/30">
          <AvatarFallback className="gradient-primary text-primary-foreground text-xl font-bold">CX</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">CryptoX 사용자</h1>
            <Badge variant="outline" className="border-success/40 text-success text-[10px]">
              <ShieldCheck className="h-3 w-3 mr-0.5" /> 인증완료
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            UID: CX-892741
            <button onClick={() => { navigator.clipboard.writeText("CX-892741"); toast({ title: "UID가 복사되었습니다" }); }}>
              <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </button>
          </p>
        </div>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="overflow-hidden border-0">
          <div className="gradient-primary p-5">
            <p className="text-xs text-white/70 mb-1">총 자산 잔액</p>
            <p className="text-3xl font-bold text-white">{formatKRW(totalBalance)}</p>
            <p className="text-xs text-white/60 mt-2">≈ ${(totalBalance / 1380).toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
          </div>
        </Card>
        <Card className="bg-card border-border/50 overflow-hidden">
          <div className="relative p-5">
            <div className="absolute top-3 right-3">
              <Gift className="h-5 w-5 text-primary/40" />
            </div>
            <p className="text-xs text-muted-foreground mb-1">플랫폼 보너스</p>
            <p className="text-3xl font-bold">{formatKRW(bonusBalance)}</p>
            <p className="text-xs text-muted-foreground mt-2">거래 수수료 차감에 사용</p>
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <Button key={action.label} variant="outline" className="flex-col h-auto py-4 border-border/50 hover:border-primary/30 hover:bg-primary/5 gap-1.5">
            <action.icon className={`h-5 w-5 ${action.color}`} />
            <span className="text-xs">{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Holdings */}
      <section>
        <h2 className="text-base font-bold mb-3 flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" /> 보유 자산
        </h2>
        {holdings.length > 0 ? (
          <div className="space-y-2">
            {holdings.map((h) => (
              <Card key={h.symbol} className="bg-card border-border/50">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-lg shrink-0">{h.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{h.symbol}</p>
                    <p className="text-xs text-muted-foreground">{h.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{h.amount} {h.symbol}</p>
                    <p className="text-xs text-muted-foreground">{formatKRW(h.valueKrw)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border/50">
            <CardContent className="py-12 flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Wallet className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-medium mb-1">보유 자산이 없습니다</p>
              <p className="text-sm text-muted-foreground mb-4">첫 번째 코인을 구매해 보세요!</p>
              <Button className="gradient-primary text-primary-foreground">코인 구매하기</Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Orders */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> 주문 내역
          </h2>
        </div>

        <Tabs value={orderFilter} onValueChange={setOrderFilter}>
          <TabsList className="bg-secondary mb-3">
            <TabsTrigger value="all" className="text-xs">전체</TabsTrigger>
            <TabsTrigger value="buy" className="text-xs">매수</TabsTrigger>
            <TabsTrigger value="sell" className="text-xs">매도</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-2">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="bg-card border-border/50">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${order.type === "buy" ? "bg-success/10" : "bg-destructive/10"}`}>
                    {order.type === "buy" ? <ArrowDownRight className="h-4 w-4 text-success" /> : <ArrowUpRight className="h-4 w-4 text-destructive" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{order.type === "buy" ? "매수" : "매도"} {order.symbol}</span>
                      <Badge variant="outline" className={`text-[10px] ${order.status === "완료" ? "border-success/30 text-success" : "border-primary/30 text-primary"}`}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{order.amount} {order.symbol}</p>
                    <p className="text-xs text-muted-foreground">{formatKRW(order.krw)}</p>
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

export default AssetsPage;
