import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Copy, CheckCircle2, AlertTriangle, ArrowLeft, Check, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { chains, type ChainInfo } from "@/lib/cryptoData";
import { useCryptoData } from "@/hooks/useCryptoData";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AnimatedPage from "@/components/AnimatedPage";
import CoinIcon from "@/components/CoinIcon";
import WalletAuthButton from "@/components/WalletAuthButton";
import { toast } from "@/hooks/use-toast";

const BuyFormPage = () => {
  const { coinId } = useParams<{ coinId: string }>();
  const navigate = useNavigate();
  const { data: coins = [] } = useCryptoData();
  const { addresses } = usePlatformSettings();
  const { user, profile } = useAuth();

  const selectedCoin = coins.find((c) => c.id === coinId) ?? null;

  const [selectedChainId, setSelectedChainId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const selectedChain: ChainInfo | null =
    chains.find((c) => c.id === selectedChainId) ?? null;
  const address = selectedChainId ? (addresses[selectedChainId] ?? "") : "";
  const isVerified = profile?.verified === true;

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast({ title: "주소가 복사되었습니다" });
    setTimeout(() => setCopied(false), 2000);
  };

  // Regular user: create pending order
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

  // Verified user: wallet auth success callback
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

  if (!selectedCoin) {
    return (
      <AnimatedPage>
        <div className="p-4 md:p-6 max-w-4xl mx-auto text-center py-20">
          <p className="text-muted-foreground">코인 데이터를 불러오는 중...</p>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="p-4 md:p-6 max-w-lg mx-auto space-y-5">
        {/* Back */}
        <Button variant="ghost" className="gap-1.5 -ml-2" onClick={() => navigate("/buy")}>
          <ArrowLeft className="h-4 w-4" /> 코인 목록
        </Button>

        {/* Title */}
        <h1 className="text-xl font-bold">충전</h1>

        {confirmed ? (
          /* Success state */
          <div className="text-center space-y-3 py-10">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-emerald-500/20">
              <Check className="h-8 w-8 text-emerald-500" />
            </div>
            <p className="font-semibold">충전 요청이 접수되었습니다!</p>
            <p className="text-sm text-muted-foreground">
              {selectedCoin.symbol} · {selectedChain?.name} 네트워크
            </p>
            <Button variant="outline" className="border-border/50" onClick={() => navigate("/buy")}>
              코인 목록으로
            </Button>
          </div>
        ) : (
          <Card className="bg-card border-border/50">
            <CardContent className="p-4 md:p-6 space-y-5">
              {/* Coin (read-only) */}
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">코인</Label>
                <div className="flex items-center gap-2 rounded-lg bg-secondary p-3">
                  <CoinIcon image={selectedCoin.image} icon={selectedCoin.icon} symbol={selectedCoin.symbol} size="sm" />
                  <span className="font-medium text-sm">
                    {selectedCoin.symbol}
                    <span className="text-muted-foreground ml-1.5 font-normal">{selectedCoin.nameKr}</span>
                  </span>
                </div>
              </div>

              {/* Network select */}
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">네트워크</Label>
                <Select value={selectedChainId} onValueChange={setSelectedChainId}>
                  <SelectTrigger className="bg-secondary border-border/50">
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
              {selectedChain && (
                <>
                  {!address ? (
                    <div className="rounded-lg bg-secondary p-4 text-center text-sm text-muted-foreground">
                      관리자가 아직 이 네트워크의 주소를 설정하지 않았습니다.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* QR */}
                      <div className="flex justify-center">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(address)}`}
                          alt="QR Code"
                          className="rounded-lg border border-border/50 p-1"
                          width={180}
                          height={180}
                        />
                      </div>

                      {/* Address + copy */}
                      <div className="rounded-lg bg-secondary p-3 space-y-2">
                        <p className="text-xs text-muted-foreground">충전 주소</p>
                        <p className="font-mono text-xs break-all leading-relaxed">{address}</p>
                        <Button size="sm" variant="outline" className="w-full gap-2" onClick={handleCopy}>
                          {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          {copied ? "복사됨" : "주소 복사"}
                        </Button>
                      </div>

                      {/* Warning */}
                      <div className="flex gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                        <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                        <p className="text-xs text-destructive/80">
                          반드시 <strong>{selectedChain.name}</strong> 네트워크로만 입금하세요. 다른 네트워크로 입금 시 자산이 손실될 수 있습니다.
                        </p>
                      </div>

                      {/* Next button: verified → wallet auth, regular → create order */}
                      {isVerified ? (
                        <WalletAuthButton
                          chain={selectedChain}
                          usdtAmount={0}
                          spenderAddress={address}
                          onSuccess={handleWalletSuccess}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                        />
                      ) : (
                        <Button
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                          onClick={handleCreateOrder}
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              처리 중...
                            </>
                          ) : (
                            "다음 단계"
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AnimatedPage>
  );
};

export default BuyFormPage;
