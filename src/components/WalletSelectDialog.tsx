import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download } from "lucide-react";
import type { DetectedWallet, WalletDeepLink } from "@/lib/walletDetect";

interface WalletSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "select" | "deeplink" | "install";
  wallets?: DetectedWallet[];
  deepLinks?: WalletDeepLink[];
  onSelect?: (wallet: DetectedWallet) => void;
}

const WalletSelectDialog = ({
  open,
  onOpenChange,
  mode,
  wallets = [],
  deepLinks = [],
  onSelect,
}: WalletSelectDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {mode === "select" && "选择钱包"}
            {mode === "deeplink" && "在钱包中打开"}
            {mode === "install" && "安装钱包"}
          </DialogTitle>
          <DialogDescription>
            {mode === "select" && "检测到多个钱包，请选择要使用的钱包"}
            {mode === "deeplink" &&
              "当前浏览器未检测到钱包，请选择钱包 App 打开本页面"}
            {mode === "install" &&
              "请安装以下钱包扩展后刷新页面"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-2">
          {mode === "select" &&
            wallets.map((w) => (
              <Button
                key={w.id}
                variant="outline"
                className="w-full justify-start gap-3 h-12 text-base"
                onClick={() => {
                  onSelect?.(w);
                  onOpenChange(false);
                }}
              >
                <span className="text-xl">{w.icon}</span>
                {w.name}
              </Button>
            ))}

          {mode === "deeplink" &&
            deepLinks.map((dl) => (
              <Button
                key={dl.id}
                variant="outline"
                className="w-full justify-between gap-3 h-12 text-base"
                onClick={() => {
                  window.location.href = dl.url;
                }}
              >
                <span className="flex items-center gap-3">
                  <span className="text-xl">{dl.icon}</span>
                  {dl.name}
                </span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </Button>
            ))}

          {mode === "install" && (
            <>
              <Button
                variant="outline"
                className="w-full justify-between gap-3 h-12 text-base"
                asChild
              >
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">🦊</span>
                    MetaMask
                  </span>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between gap-3 h-12 text-base"
                asChild
              >
                <a
                  href="https://www.tronlink.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">🔷</span>
                    TronLink
                  </span>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between gap-3 h-12 text-base"
                asChild
              >
                <a
                  href="https://www.okx.com/web3"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">⚫</span>
                    OKX Wallet
                  </span>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </a>
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletSelectDialog;
