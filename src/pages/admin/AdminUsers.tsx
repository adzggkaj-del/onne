import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { formatKRW } from "@/lib/cryptoData";
import { Edit2, Star, ShieldCheck } from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  uid_display: string | null;
  verified: boolean;
  bonus_krw: number;
  created_at: string;
}

const AdminUsers = () => {
  const qc = useQueryClient();
  const [bonusTarget, setBonusTarget] = useState<Profile | null>(null);
  const [bonusInput, setBonusInput] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

  // Fetch admin roles for all users
  const { data: adminRoles = [] } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .eq("role", "admin");
      if (error) throw error;
      return (data ?? []) as { user_id: string; role: string }[];
    },
  });

  const adminUserIds = new Set(adminRoles.map((r) => r.user_id));

  const toggleVerified = useMutation({
    mutationFn: async ({ id, verified }: { id: string; verified: boolean }) => {
      const { error } = await supabase.from("profiles").update({ verified }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "사용자 상태가 업데이트되었습니다" });
    },
    onError: (e: Error) => toast({ title: "오류", description: e.message, variant: "destructive" }),
  });

  const toggleAdmin = useMutation({
    mutationFn: async ({ user_id, makeAdmin }: { user_id: string; makeAdmin: boolean }) => {
      if (makeAdmin) {
        const { error } = await supabase.from("user_roles").insert({ user_id, role: "admin" } as any);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_roles").delete().eq("user_id", user_id).eq("role", "admin");
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-user-roles"] });
      toast({ title: "관리자 권한이 업데이트되었습니다" });
    },
    onError: (e: Error) => toast({ title: "오류", description: e.message, variant: "destructive" }),
  });

  const updateBonus = useMutation({
    mutationFn: async ({ id, bonus_krw }: { id: string; bonus_krw: number }) => {
      const { error } = await supabase.from("profiles").update({ bonus_krw }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "보너스가 업데이트되었습니다" });
      setBonusTarget(null);
      setBonusInput("");
    },
    onError: (e: Error) => toast({ title: "오류", description: e.message, variant: "destructive" }),
  });

  const handleOpenBonus = (user: Profile) => {
    setBonusTarget(user);
    setBonusInput(String(user.bonus_krw ?? 0));
  };

  const handleSaveBonus = () => {
    if (!bonusTarget) return;
    updateBonus.mutate({ id: bonusTarget.id, bonus_krw: Number(bonusInput) });
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">사용자 관리</h1>
      <div className="rounded-lg border border-border/50 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>UID</TableHead>
              <TableHead>사용자명</TableHead>
              <TableHead>⭐ 星표</TableHead>
              <TableHead>관리자</TableHead>
              <TableHead>플랫폼 보너스</TableHead>
              <TableHead>가입일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">로딩 중...</TableCell></TableRow>
            ) : users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-mono text-xs">{u.uid_display}</TableCell>
                <TableCell>{u.username ?? "-"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch checked={u.verified} onCheckedChange={(v) => toggleVerified.mutate({ id: u.id, verified: v })} />
                    <Badge variant={u.verified ? "default" : "secondary"} className="text-xs gap-1">
                      {u.verified ? <><Star className="h-3 w-3" /> 星표</> : "普通"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={adminUserIds.has(u.user_id)}
                      onCheckedChange={(v) => toggleAdmin.mutate({ user_id: u.user_id, makeAdmin: v })}
                    />
                    {adminUserIds.has(u.user_id) && (
                      <Badge variant="default" className="text-xs gap-1 bg-amber-500/20 text-amber-400 border-amber-500/30">
                        <ShieldCheck className="h-3 w-3" /> Admin
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{formatKRW(u.bonus_krw ?? 0)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenBonus(u)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString("ko-KR")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Bonus edit dialog */}
      <Dialog open={!!bonusTarget} onOpenChange={(o) => { if (!o) { setBonusTarget(null); setBonusInput(""); } }}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>보너스 설정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{bonusTarget?.username ?? bonusTarget?.uid_display}</span> 의 플랫폼 보너스를 설정합니다.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="bonus-amount">보너스 금액 (KRW)</Label>
              <Input
                id="bonus-amount"
                type="number"
                min={0}
                value={bonusInput}
                onChange={(e) => setBonusInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveBonus()}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setBonusTarget(null); setBonusInput(""); }}>취소</Button>
              <Button className="flex-1" onClick={handleSaveBonus} disabled={updateBonus.isPending}>
                {updateBonus.isPending ? "저장 중..." : "저장"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
