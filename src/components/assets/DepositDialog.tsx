import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DepositDialog = ({ open, onOpenChange }: DepositDialogProps) => {
  const [method, setMethod] = useState<"crypto" | "krw">("crypto");
  const navigate = useNavigate();

  const handleConfirm = () => {
    if (method === "crypto") {
      onOpenChange(false);
      navigate("/buy");
    } else {
      toast({ title: "고객센터에 문의해주세요", description: "원화 입금은 고객센터를 통해 진행됩니다." });
    }
  };

  const handleClose = () => {
    setMethod("crypto");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>충전 (입금)</DialogTitle>
        </DialogHeader>

        <RadioGroup
          value={method}
          onValueChange={(v) => setMethod(v as "crypto" | "krw")}
          className="space-y-3 py-2"
        >
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="krw" id="krw" />
            <div>
              <Label htmlFor="krw" className="cursor-pointer font-medium">원화입금</Label>
              {method === "krw" && (
                <p className="text-xs text-muted-foreground mt-1">고객센터에 문의해주세요</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <RadioGroupItem value="crypto" id="crypto" />
            <Label htmlFor="crypto" className="cursor-pointer font-medium">암호화폐입금</Label>
          </div>
        </RadioGroup>

        <Button className="w-full mt-2" onClick={handleConfirm}>
          확인
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default DepositDialog;
