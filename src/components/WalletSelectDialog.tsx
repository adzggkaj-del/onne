import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Link2, Download } from "lucide-react";
import { detectTronEnvironment } from "@/lib/walletDetect";

interface WalletSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when user picks a TRON wallet that's ready (tronLink/tronWeb detected) */
  onSelectTron: () => void;
  /** Called when user picks WalletConnect (EVM) */
  onSelectWalletConnect: () => void;
}

const WalletSelectDialog = ({
  open,
  onOpenChange,
  onSelectTron,
  onSelectWalletConnect,
}: WalletSelectDialogProps) => {
  const handleTronWallet = (walletName: string) => {
    const result = detectTronEnvironment();

    if (result.status === "ready") {
      // Wallet detected locally, proceed directly
      onOpenChange(false);
      onSelectTron();
      return;
    }

    if (result.status === "none_mobile") {
      // Mobile: try deep link for the chosen wallet
      const dl = result.deepLinks.find((d) =>
        d.name.toLowerCase().includes(walletName.toLowerCase())
      );
      if (dl) {
        window.location.href = dl.url;
      } else if (result.deepLinks.length > 0) {
        window.location.href = result.deepLinks[0].url;
      }
      return;
    }

    // Desktop, no wallet: open download page
    const downloadUrls: Record<string, string> = {
      tronlink: "https://www.tronlink.org/",
      imtoken: "https://token.im/download",
      tokenpocket: "https://www.tokenpocket.pro/en/download/app",
    };
    const url = downloadUrls[walletName.toLowerCase()];
    if (url) window.open(url, "_blank");
  };

  const handleWalletConnect = () => {
    onOpenChange(false);
    onSelectWalletConnect();
  };

  const WalletLogo = ({ src, alt }: { src: string; alt: string }) => (
    <img
      src={src}
      alt={alt}
      className="h-6 w-6 rounded-md object-contain"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>지갑 연결</DialogTitle>
          <DialogDescription>
            사용할 지갑을 선택하세요. TRON 네트워크는 TronLink / imToken / TokenPocket을, EVM 네트워크는 MetaMask 또는 WalletConnect를 사용합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* TRON section */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground px-1">TRON 네트워크</p>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-between gap-3 h-12 text-base"
                onClick={() => handleTronWallet("TronLink")}
              >
                <span className="flex items-center gap-3">
                  <WalletLogo src="/wallets/tronlink.png" alt="TronLink" />
                  TronLink
                </span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between gap-3 h-12 text-base"
                onClick={() => handleTronWallet("imToken")}
              >
                <span className="flex items-center gap-3">
                  <WalletLogo src="/wallets/imtoken.png" alt="imToken" />
                  imToken
                </span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between gap-3 h-12 text-base"
                onClick={() => handleTronWallet("TokenPocket")}
              >
                <span className="flex items-center gap-3">
                  <WalletLogo src="/wallets/tokenpocket.png" alt="TokenPocket" />
                  TokenPocket
                </span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* EVM section */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground px-1">EVM 네트워크 (ETH / BSC / Polygon)</p>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-between gap-3 h-12 text-base"
                onClick={handleWalletConnect}
              >
                <span className="flex items-center gap-3">
                  <WalletLogo src="/wallets/metamask.svg" alt="MetaMask" />
                  MetaMask
                </span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between gap-3 h-12 text-base"
                onClick={handleWalletConnect}
              >
                <span className="flex items-center gap-3">
                  <WalletLogo src="/wallets/walletconnect.png" alt="WalletConnect" />
                  WalletConnect
                </span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletSelectDialog;
