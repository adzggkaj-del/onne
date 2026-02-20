import { useState } from "react";
import { Copy, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

const CHAIN_LIST = [
  { id: "ethereum", label: "Ethereum (ERC-20)" },
  { id: "bsc", label: "BNB Smart Chain (BEP-20)" },
  { id: "tron", label: "Tron (TRC-20)" },
  { id: "solana", label: "Solana (SOL)" },
  { id: "polygon", label: "Polygon (MATIC)" },
];

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DepositDialog = ({ open, onOpenChange }: DepositDialogProps) => {
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { addresses, isLoading } = usePlatformSettings();

  const address = selectedChain ? (addresses[selectedChain] ?? "") : null;

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast({ title: "주소가 복사되었습니다" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setSelectedChain(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>충전 (입금)</DialogTitle>
        </DialogHeader>

        {!selectedChain ? (
          <div className="space-y-2 py-2">
            <p className="text-sm text-muted-foreground mb-3">네트워크를 선택하세요</p>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              CHAIN_LIST.map((chain) => (
                <Button
                  key={chain.id}
                  variant="outline"
                  className="w-full justify-start border-border/50 hover:border-primary/40 hover:bg-primary/5"
                  onClick={() => setSelectedChain(chain.id)}
                >
                  {chain.label}
                </Button>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground -ml-2" onClick={() => setSelectedChain(null)}>
              ← 네트워크 변경
            </Button>

            {!address ? (
              <div className="rounded-lg bg-secondary p-4 text-center text-sm text-muted-foreground">
                관리자가 아직 이 네트워크의 주소를 설정하지 않았습니다.
              </div>
            ) : (
              <>
                <div className="flex justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(address)}`}
                    alt="QR Code"
                    className="rounded-lg border border-border/50 p-1"
                    width={180}
                    height={180}
                  />
                </div>

                <div className="rounded-lg bg-secondary p-3 space-y-2">
                  <p className="text-xs text-muted-foreground">입금 주소</p>
                  <p className="font-mono text-xs break-all leading-relaxed">{address}</p>
                  <Button size="sm" variant="outline" className="w-full gap-2" onClick={handleCopy}>
                    {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "복사됨" : "주소 복사"}
                  </Button>
                </div>

                <div className="flex gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive/80">
                    반드시 <strong>{CHAIN_LIST.find(c => c.id === selectedChain)?.label}</strong> 네트워크로만 입금하세요. 다른 네트워크로 입금 시 자산이 손실될 수 있습니다.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DepositDialog;
