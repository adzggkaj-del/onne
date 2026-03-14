import { useState, useEffect } from "react";
import { Wallet, Send, Download, QrCode, ArrowUpRight, ArrowDownRight, ShieldCheck, Copy, DollarSign, Clock, RefreshCw, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKRW } from "@/lib/cryptoData";
import { useAuth } from "@/hooks/useAuth";
import { useUserBalance } from "@/hooks/useUserBalance";
import { useCryptoData } from "@/hooks/useCryptoData";
import { supabase } from "@/integrations/supabase/client";
import AnimatedPage from "@/components/AnimatedPage";
import { toast } from "@/hooks/use-toast";
import DepositDialog from "@/components/assets/DepositDialog";
import WithdrawDialog from "@/components/assets/WithdrawDialog";
import QRDialog from "@/components/assets/QRDialog";

interface Order {
  id: string;
  type: string;
  coin_symbol: string;
  amount: number;
  total_krw: number;
  status: string;
  created_at: string;
}

const AssetsPage = () => {
  const { user, profile } = useAuth();
  const { data: balanceData, isLoading: balanceLoading } = useUserBalance();
  const { data: coins = [] } = useCryptoData();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderFilter, setOrderFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 10;

  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      setLoadingOrders(true);
      let query = supabase
        .from("orders")
        .select("id, type, coin_symbol, amount, total_krw, status, created_at", { count: "exact" })
        .eq("user_id", user.id);
      if (orderFilter !== "all") {
        query = query.eq("type", orderFilter);
      }
      const { data, count } = await query
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      setOrders((data as Order[]) ?? []);
      setTotalCount(count ?? 0);
      setLoadingOrders(false);
    };
    fetchOrders();
  }, [user, orderFilter, page]);

  // Calculate total asset value
  const totalKrw = balanceData
    ? Object.entries(balanceData.coinBalances).reduce((sum, [coinId, qty]) => {
        const coin = coins.find((c) => c.id === coinId);
        return sum + qty * (coin?.priceKrw ?? 0);
      }, 0)
    : 0;

  // Coin holdings with positive balance
  const holdings = balanceData
    ? Object.entries(balanceData.coinBalances)
        .filter(([, qty]) => qty > 0)
        .map(([coinId, qty]) => {
          const coin = coins.find((c) => c.id === coinId);
          return { coinId, qty, coin, krwValue: qty * (coin?.priceKrw ?? 0) };
        })
        .sort((a, b) => b.krwValue - a.krwValue)
    : [];

  const bonusKrw = profile?.bonus_krw ?? 0;
  const usdtBalance = profile?.usdt_balance ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const displayName = profile?.username || user?.email?.split("@")[0] || "사용자";
  const uidDisplay = profile?.uid_display || "CX-000000";

  const quickActions = [
    { label: "충전", icon: Download, color: "text-success", onClick: () => setDepositOpen(true) },
    { label: "출금", icon: Send, color: "text-primary", onClick: () => setWithdrawOpen(true) },
    { label: "전환", icon: RefreshCw, color: "text-accent", onClick: () => toast({ title: "준비 중", description: "곧 출시될 예정입니다." }) },
    { label: "QR코드", icon: QrCode, color: "text-muted-foreground", onClick: () => setQrOpen(true) },
  ];

  return (
    <AnimatedPage>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        {/* User info */}
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-primary/30">
            <AvatarFallback className="gradient-primary text-primary-foreground text-xl font-bold">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{displayName}</h1>
              {profile?.verified && (
                <Badge variant="outline" className="border-success/40 text-success text-[10px]">
                  <ShieldCheck className="h-3 w-3 mr-0.5" /> 인증완료
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              UID: {uidDisplay}
              <button onClick={() => { navigator.clipboard.writeText(uidDisplay); toast({ title: "UID가 복사되었습니다" }); }}>
                <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </p>
          </div>
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="overflow-hidden border-0">
            <div className="gradient-primary p-5">
              <p className="text-xs text-white/70 mb-1">총 보유금액</p>
              {!profile ? (
                <Skeleton className="h-9 w-36 bg-white/20 mb-2" />
              ) : (
                <p className="text-3xl font-bold text-white">{formatKRW(bonusKrw)}</p>
              )}
              <p className="text-xs text-white/60 mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> 한국 원화 잔액
              </p>
            </div>
          </Card>
          <Card className="bg-card border-border/50 overflow-hidden">
            <div className="relative p-5">
              <div className="absolute top-3 right-3">
                <DollarSign className="h-5 w-5 text-primary/40" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">총 보유금액</p>
              {!profile ? (
                <Skeleton className="h-9 w-36 mb-2" />
              ) : (
                <p className="text-3xl font-bold">{usdtBalance.toLocaleString()} USDT</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">USDT 잔액</p>
            </div>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="flex-col h-auto py-4 border-border/50 hover:border-primary/30 hover:bg-primary/5 gap-1.5"
              onClick={action.onClick}
            >
              <action.icon className={`h-5 w-5 ${action.color}`} />
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Coin holdings */}
        {holdings.length > 0 && (
          <section>
            <h2 className="text-base font-bold flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" /> 코인 보유 현황
            </h2>
            <div className="space-y-2">
              {holdings.map(({ coinId, qty, coin, krwValue }) => (
                <Card key={coinId} className="bg-card border-border/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-lg">
                        {coin?.icon || "●"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{coin?.nameKr || coinId}</p>
                        <p className="text-xs text-muted-foreground">{coin?.symbol || coinId.toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{qty.toLocaleString("ko-KR", { maximumFractionDigits: 8 })}</p>
                        <p className="text-xs text-muted-foreground">{formatKRW(krwValue)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Orders */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> 전체 내역
            </h2>
          </div>

          <Tabs value={orderFilter} onValueChange={(v) => { setOrderFilter(v); setPage(0); }}>
            <TabsList className="bg-secondary mb-3">
              <TabsTrigger value="all" className="text-xs">전체</TabsTrigger>
              <TabsTrigger value="buy" className="text-xs">매수</TabsTrigger>
              <TabsTrigger value="sell" className="text-xs">매도</TabsTrigger>
              <TabsTrigger value="lending" className="text-xs">대출</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            {loadingOrders ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="bg-card border-border/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : orders.length === 0 && totalCount === 0 ? (
              <Card className="bg-card border-border/50">
                <CardContent className="py-12 flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <Wallet className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium mb-1">주문 내역이 없습니다</p>
                  <p className="text-sm text-muted-foreground">첫 번째 거래를 시작해 보세요!</p>
                </CardContent>
              </Card>
            ) : (
              <>
              {orders.map((order) => (
                <Card key={order.id} className="bg-card border-border/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        order.type === "buy" ? "bg-success/10" : order.type === "sell" ? "bg-destructive/10" : "bg-primary/10"
                      }`}>
                        {order.type === "buy" ? <ArrowDownRight className="h-4 w-4 text-success" /> :
                         order.type === "sell" ? <ArrowUpRight className="h-4 w-4 text-destructive" /> :
                         order.type === "withdraw" ? <ArrowUpRight className="h-4 w-4 text-orange-400" /> :
                         <Wallet className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {order.type === "buy" ? "매수" : order.type === "sell" ? "매도" : order.type === "withdraw" ? "출금" : "대출"} {order.coin_symbol !== "KRW" ? order.coin_symbol : "KRW"}
                          </span>
                          <Badge variant="outline" className={`text-[10px] ${
                            order.status === "완료" ? "border-success/30 text-success" :
                            order.status === "처리 중" ? "border-primary/30 text-primary" :
                            "border-yellow-500/30 text-yellow-500"
                          }`}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleString("ko-KR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{order.coin_symbol !== "KRW" ? `${order.amount} ${order.coin_symbol}` : formatKRW(order.amount)}</p>
                        <p className="text-xs text-muted-foreground">{formatKRW(order.total_krw)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <Button variant="outline" size="sm" className="gap-1 border-border/50" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                    <ChevronLeft className="h-4 w-4" /> 이전
                  </Button>
                  <span className="text-xs text-muted-foreground">{page + 1} / {totalPages}</span>
                  <Button variant="outline" size="sm" className="gap-1 border-border/50" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                    다음 <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              </>
            )}
          </div>
        </section>
      </div>

      <DepositDialog open={depositOpen} onOpenChange={setDepositOpen} />
      <WithdrawDialog open={withdrawOpen} onOpenChange={setWithdrawOpen} />
      <QRDialog open={qrOpen} onOpenChange={setQrOpen} />
    </AnimatedPage>
  );
};

export default AssetsPage;
