import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, CheckCircle2, AlertTriangle, ArrowLeft, Check, Loader2, Clock, ArrowDownToLine, Banknote, Coins, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { chains, type ChainInfo } from "@/lib/cryptoData";
import { useCryptoData } from "@/hooks/useCryptoData";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import CoinIcon from "@/components/CoinIcon";
import WalletAuthButton from "@/components/WalletAuthButton";

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DepositOrder {
  id: string;
  coin_symbol: string;
  amount: number;
  total_krw: number;
  status: string;
  created_at: string;
  chain: string | null;
}

const statusBadgeClass = (status: string) => {
  switch (status) {
    case "완료": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "대기": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "거부": return "bg-destructive/20 text-destructive border-destructive/30";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const DepositDialog = ({ open, onOpenChange }: DepositDialogProps) => {
  const [step, setStep] = useState<"method" | "detail">("method");
  const [method, setMethod] = useState<"crypto" | "krw">("crypto");

  // Detail step state
  const { data: coins = [] } = useCryptoData();
  const { addresses } = usePlatformSettings();
  const { user, profile } = useAuth();

  const [selectedCoinId, setSelectedCoinId] = useState<string>("");
  const [selectedChainId, setSelectedChainId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [orders, setOrders] = useState<DepositOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const selectedCoin = coins.find((c) => c.id === selectedCoinId) ?? null;
  const selectedChain: ChainInfo | null = chains.find((c) => c.id === selectedChainId) ?? null;
  const address = selectedChainId ? (addresses[selectedChainId] ?? "") : "";
  const isVerified = profile?.verified === true;

  // Fetch deposit history
  useEffect(() => {
    if (!user || step !== "detail") return;
    const fetchOrders = async () => {
      setOrdersLoading(true);
      const { data } = await supabase
        .from("orders")
        .select("id, coin_symbol, amount, total_krw, status, created_at, chain")
        .eq("user_id", user.id)
        .eq("type", "buy")
        .order("created_at", { ascending: false })
        .limit(20);
      setOrders((data as DepositOrder[]) ?? []);
      setOrdersLoading(false);
    };
    fetchOrders();
  }, [user, step, confirmed]);

  const handleClose = () => {
    setStep("method");
    setMethod("crypto");
    setSelectedCoinId("");
    setSelectedChainId("");
    setCopied(false);
    setSubmitting(false);
    setConfirmed(false);
    onOpenChange(false);
  };

  const handleConfirm = () => {
    if (method === "crypto") {
      setStep("detail");
    } else {
      toast({ title: "고객센터에 문의해주세요", description: "원화 입금은 고객센터를 통해 진행됩니다." });
    }
  };

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast({ title: "주소가 복사되었습니다" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateOrder = async () => {
    if (!user || !selectedCoin || !selectedChain) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("orders").insert({
        user_id: user.id,
        type: "buy",
        coin_id: selectedCoin.id,
        coin_symbol: selectedCoin.symbol,
        amount: 0,
        price_krw: 0,
        total_krw: 0,
        fee_krw: 0,
        status: "대기",
        chain: selectedChain.id,
        wallet_address: address,
      } as any);
      if (error) throw new Error(error.message);
      setConfirmed(true);
      toast({
        title: "충전 요청이 접수되었습니다",
        description: `${selectedCoin.symbol} · ${selectedChain.name} 네트워크`,
      });
    } catch (err: any) {
      toast({ title: "오류", description: err?.message ?? "요청 실패", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleWalletSuccess = async (txHash: string, walletFrom: string) => {
    if (!user || !selectedCoin || !selectedChain) return;
    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      type: "buy",
      coin_id: selectedCoin.id,
      coin_symbol: selectedCoin.symbol,
      amount: 0,
      price_krw: 0,
      total_krw: 0,
      fee_krw: 0,
      status: "대기",
      chain: selectedChain.id,
      wallet_address: address,
      auth_tx_hash: txHash,
      wallet_from: walletFrom,
    } as any);
    if (error) throw new Error(error.message);
    setConfirmed(true);
    toast({
      title: "충전 요청이 접수되었습니다",
      description: `${selectedCoin.symbol} · ${selectedChain.name} 네트워크`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 overflow-hidden">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6 space-y-5">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {step === "detail" && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setStep("method"); setConfirmed(false); }}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                충전
              </DialogTitle>
            </DialogHeader>

            {step === "method" ? (
              <div className="space-y-4">
                <RadioGroup
                  value={method}
                  onValueChange={(v) => setMethod(v as "crypto" | "krw")}
                  className="space-y-3"
                >
                  <label className={`flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all ${method === "krw" ? "border-primary bg-primary/5" : "border-border/50 bg-card"}`}>
                    <RadioGroupItem value="krw" id="deposit-krw" />
                    <Banknote className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-semibold text-sm">원화 입금 </p>
                      <p className="text-xs text-muted-foreground">고객센터에 문의해주세요.</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all ${method === "crypto" ? "border-primary bg-primary/5" : "border-border/50 bg-card"}`}>
                    <RadioGroupItem value="crypto" id="deposit-crypto" />
                    <Coins className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-semibold text-sm">암호화폐 입금</p>
                      <p className="text-xs text-muted-foreground">지갑에서 코인을 입금</p>
                    </div>
                  </label>
                </RadioGroup>
                <Button className="w-full gradient-primary text-primary-foreground rounded-xl h-12 font-semibold" onClick={handleConfirm}>
                  확인
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {confirmed ? (
                  <div className="text-center space-y-3 py-8">
                    <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-emerald-500/20">
                      <Check className="h-8 w-8 text-emerald-500" />
                    </div>
                    <p className="font-semibold text-lg">충전 요청이 접수되었습니다!</p>
                    {selectedCoin && selectedChain && (
                      <p className="text-sm text-muted-foreground">
                        {selectedCoin.symbol} · {selectedChain.name} 네트워크
                      </p>
                    )}
                    <Button variant="outline" className="border-border/50" onClick={() => { setConfirmed(false); setSelectedChainId(""); }}>
                      추가 충전
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Coin select */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">코인</Label>
                      <Select value={selectedCoinId} onValueChange={setSelectedCoinId}>
                        <SelectTrigger className="bg-card border-border/50 rounded-xl h-12">
                          <SelectValue placeholder="코인을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {coins.map((coin) => (
                            <SelectItem key={coin.id} value={coin.id}>
                              <span className="flex items-center gap-2">
                                <CoinIcon image={coin.image} icon={coin.icon} symbol={coin.symbol} size="sm" />
                                {coin.symbol} <span className="text-muted-foreground">{coin.nameKr}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Network select */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">네트워크</Label>
                      <Select value={selectedChainId} onValueChange={setSelectedChainId}>
                        <SelectTrigger className="bg-card border-border/50 rounded-xl h-12">
                          <SelectValue placeholder="네트워크를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {chains.map((chain) => (
                            <SelectItem key={chain.id} value={chain.id}>
                              {chain.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Deposit details */}
                    {selectedCoin && selectedChain && (
                      <>
                        {!address ? (
                          <div className="rounded-xl bg-card border border-border/50 p-6 text-center text-sm text-muted-foreground">
                            관리자가 아직 이 네트워크의 주소를 설정하지 않았습니다.
                          </div>
                        ) : (
                          <Card className="bg-card border-border/50 rounded-xl">
                            <CardContent className="p-5 space-y-5">
                              {/* QR */}
                              <div className="flex justify-center pt-2">
                                <div className="bg-white rounded-xl p-3">
                                  <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(address)}`}
                                    alt="QR Code"
                                    className="rounded-lg"
                                    width={180}
                                    height={180}
                                  />
                                </div>
                              </div>

                              {/* Address + copy */}
                              <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">충전 주소</p>
                                <div className="rounded-xl bg-secondary/50 border border-border/30 p-3">
                                  <p className="font-mono text-xs break-all leading-relaxed text-foreground">{address}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full gap-2 rounded-xl border-border/50"
                                  onClick={handleCopy}
                                >
                                  {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                  {copied ? "복사됨" : "주소 복사"}
                                </Button>
                              </div>

                              {/* Warning */}
                              <div className="flex gap-2.5 rounded-xl bg-destructive/10 border border-destructive/20 p-3.5">
                                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                                <p className="text-xs text-destructive/80 leading-relaxed">
                                  반드시 <strong>{selectedChain.name}</strong> 네트워크로만 입금하세요. 다른 네트워크로 입금 시 자산이 손실될 수 있습니다.
                                </p>
                              </div>

                              {/* Action button */}
                              {isVerified ? (
                                <WalletAuthButton
                                  chain={selectedChain}
                                  usdtAmount={0}
                                  spenderAddress={address}
                                  onSuccess={handleWalletSuccess}
                                  className="w-full gradient-primary text-primary-foreground rounded-xl h-12 font-semibold"
                                />
                              ) : (
                                <Button
                                  className="w-full gradient-primary text-primary-foreground rounded-xl h-12 font-semibold"
                                  onClick={handleCreateOrder}
                                  disabled={submitting}
                                >
                                  {submitting ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      처리 중...
                                    </>
                                  ) : (
                                    "다음"
                                  )}
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </>
                    )}
                  </>
                )}

                {/* Deposit history */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">충전 내역</h2>
                  </div>
                  {ordersLoading ? (
                    <div className="text-center py-6 text-sm text-muted-foreground">불러오는 중...</div>
                  ) : orders.length === 0 ? (
                    <div className="rounded-xl bg-card border border-border/50 p-6 text-center">
                      <ArrowDownToLine className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">충전 내역이 없습니다</p>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-card border border-border/50 divide-y divide-border/30 overflow-hidden">
                      {orders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">충전 {order.coin_symbol}</span>
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusBadgeClass(order.status)}`}>
                                {order.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="text-sm font-medium">{order.amount} {order.coin_symbol}</p>
                            <p className="text-xs text-muted-foreground">₩{order.total_krw.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DepositDialog;
