import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download } from "lucide-react";
import type { WalletDeepLink } from "@/lib/walletDetect";

interface WalletSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "deeplink" | "install";
  deepLinks?: WalletDeepLink[];
}

const WalletSelectDialog = ({
  open,
  onOpenChange,
  mode,
  deepLinks = [],
}: WalletSelectDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {mode === "deeplink" && "지갑 앱에서 열기"}
            {mode === "install" && "지갑 설치"}
          </DialogTitle>
          <DialogDescription>
            {mode === "deeplink" &&
              "현재 브라우저에서 지갑이 감지되지 않았습니다. 지갑 앱에서 이 페이지를 열어주세요"}
            {mode === "install" &&
              "아래 지갑 확장 프로그램을 설치한 후 페이지를 새로고침하세요"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-2">
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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletSelectDialog;
