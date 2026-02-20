import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";

interface QRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QRDialog = ({ open, onOpenChange }: QRDialogProps) => {
  const { user, profile } = useAuth();
  const uid = profile?.uid_display || "CX-000000";
  const email = user?.email || "";
  const qrData = encodeURIComponent(`${uid}|${email}`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs text-center">
        <DialogHeader>
          <DialogTitle>내 QR 코드</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`}
            alt="My QR Code"
            className="rounded-xl border border-border/50 p-2"
            width={200}
            height={200}
          />
          <div className="space-y-0.5">
            <p className="font-mono font-bold text-base">{uid}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
          <p className="text-xs text-muted-foreground px-4">다른 사용자가 이 QR 코드를 스캔하여 송금할 수 있습니다.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRDialog;
