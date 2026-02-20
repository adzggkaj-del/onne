import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WithdrawDialog = ({ open, onOpenChange }: WithdrawDialogProps) => {
  const { user } = useAuth();
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = bankName && accountNumber && accountHolder && Number(amount) > 0;

  const handleSubmit = async () => {
    if (!user || !canSubmit) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("orders").insert({
        user_id: user.id,
        type: "withdraw",
        coin_id: "krw",
        coin_symbol: "KRW",
        amount: Number(amount),
        price_krw: 1,
        total_krw: Number(amount),
        fee_krw: 0,
        bank_name: bankName,
        account_number: accountNumber,
        account_holder: accountHolder,
        status: "대기",
      });
      if (error) throw error;
      toast({ title: "출금 신청이 접수되었습니다", description: "처리까지 1~2 영업일이 소요될 수 있습니다." });
      handleClose();
    } catch (e: unknown) {
      toast({ title: "오류", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setBankName("");
    setAccountNumber("");
    setAccountHolder("");
    setAmount("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>출금 신청</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="bank-name">은행명</Label>
            <Input id="bank-name" placeholder="예: 국민은행" value={bankName} onChange={e => setBankName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="account-number">계좌번호</Label>
            <Input id="account-number" placeholder="- 없이 입력" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="account-holder">예금주명</Label>
            <Input id="account-holder" placeholder="실명 입력" value={accountHolder} onChange={e => setAccountHolder(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="withdraw-amount">출금 금액 (KRW)</Label>
            <Input
              id="withdraw-amount"
              type="number"
              placeholder="0"
              min={0}
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>
          <Button className="w-full" disabled={!canSubmit || submitting} onClick={handleSubmit}>
            {submitting ? "처리 중..." : "출금 신청"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawDialog;
