import { useState } from "react";
import { Loader2, Wallet, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { approveUSDT } from "@/hooks/useWalletAuth";
import WalletSelectDialog from "@/components/WalletSelectDialog";
import type { ChainInfo } from "@/lib/cryptoData";

type AuthStage = "idle" | "connecting" | "approving" | "submitting" | "done" | "error";

interface WalletAuthButtonProps {
  chain: ChainInfo;
  usdtAmount: number;
  spenderAddress: string;
  onSuccess: (txHash: string, walletFrom: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

const STAGE_LABELS: Record<AuthStage, string> = {
  idle: "지갑 연결 및 승인",
  connecting: "지갑 연결 중...",
  approving: "지갑에서 승인을 확인하세요...",
  submitting: "주문 제출 중...",
  done: "승인 완료",
  error: "재시도",
};

const WalletAuthButton = ({
  chain,
  usdtAmount,
  spenderAddress,
  onSuccess,
  disabled,
  className,
}: WalletAuthButtonProps) => {
  const [stage, setStage] = useState<AuthStage>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const runApprove = async (chainOverride?: string) => {
    setStage("connecting");
    setErrorMsg("");
    try {
      setStage("approving");
      const { txHash, walletFrom } = await approveUSDT(
        chainOverride ?? chain.id,
        spenderAddress,
        usdtAmount
      );
      setStage("submitting");
      await onSuccess(txHash, walletFrom);
      setStage("done");
    } catch (err: any) {
      setStage("error");
      setErrorMsg(err?.message ?? "승인 실패, 다시 시도하세요");
    }
  };

  const handleClick = () => {
    if (stage === "done") return;
    // Always show the unified wallet picker
    setDialogOpen(true);
  };

  const handleSelectTron = () => {
    runApprove("tron");
  };

  const handleSelectWalletConnect = () => {
    // Use the selected chain for EVM, fallback to current chain
    const evmChainId = chain.id === "tron" ? "ethereum" : chain.id;
    runApprove(evmChainId);
  };

  const isLoading = stage === "connecting" || stage === "approving" || stage === "submitting";

  return (
    <div className="w-full space-y-2">
      <Button
        className={className}
        onClick={handleClick}
        disabled={disabled || isLoading || stage === "done"}
        style={{ width: "100%" }}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {STAGE_LABELS[stage]}
          </>
        ) : stage === "done" ? (
          <>
            <ShieldCheck className="h-4 w-4" />
            {STAGE_LABELS.done}
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            {stage === "error" ? STAGE_LABELS.error : STAGE_LABELS.idle}
          </>
        )}
      </Button>

      {stage === "error" && errorMsg && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive">{errorMsg}</p>
        </div>
      )}

      {stage === "approving" && (
        <p className="text-xs text-center text-muted-foreground">
          지갑 앱에서 USDT 승인 거래를 확인하세요
        </p>
      )}

      <WalletSelectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSelectTron={handleSelectTron}
        onSelectWalletConnect={handleSelectWalletConnect}
      />
    </div>
  );
};

export default WalletAuthButton;
