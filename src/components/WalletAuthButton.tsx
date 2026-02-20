import { useState } from "react";
import { Loader2, Wallet, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { approveUSDT } from "@/hooks/useWalletAuth";
import type { ChainInfo } from "@/lib/cryptoData";

type AuthStage = "idle" | "connecting" | "approving" | "submitting" | "done" | "error";

interface WalletAuthButtonProps {
  chain: ChainInfo;
  usdtAmount: number;           // USDT amount to approve
  spenderAddress: string;       // Platform receiving address from platform_settings
  onSuccess: (txHash: string, walletFrom: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

const STAGE_LABELS: Record<AuthStage, string> = {
  idle: "连接钱包并授权",
  connecting: "正在连接钱包...",
  approving: "请在钱包中确认授权...",
  submitting: "正在提交订单...",
  done: "授权成功",
  error: "重试",
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

  const handleClick = async () => {
    if (stage === "done") return;

    setStage("connecting");
    setErrorMsg("");

    try {
      // Step 1: Connect wallet and approve USDT
      setStage("approving");
      const { txHash, walletFrom } = await approveUSDT(
        chain.id,
        spenderAddress,
        usdtAmount
      );

      // Step 2: Submit order to backend
      setStage("submitting");
      await onSuccess(txHash, walletFrom);

      setStage("done");
    } catch (err: any) {
      setStage("error");
      setErrorMsg(err?.message ?? "授权失败，请重试");
    }
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
          请在 {chain.name} 钱包中确认 USDT 授权交易
        </p>
      )}
    </div>
  );
};

export default WalletAuthButton;
