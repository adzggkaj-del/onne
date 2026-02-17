import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Coin {
  id: string;
  coin_id: string;
  symbol: string;
  name_kr: string;
  chain: string;
  icon: string;
  enabled: boolean;
  sort_order: number;
}

const AdminCoins = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ coin_id: "", symbol: "", name_kr: "", chain: "ethereum", icon: "●", sort_order: 0 });

  const { data: coins = [], isLoading } = useQuery({
    queryKey: ["admin-coins"],
    queryFn: async () => {
      const { data, error } = await supabase.from("supported_coins").select("*").order("sort_order");
      if (error) throw error;
      return data as Coin[];
    },
  });

  const toggleEnabled = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase.from("supported_coins").update({ enabled }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-coins"] }),
    onError: (e: Error) => toast({ title: "오류", description: e.message, variant: "destructive" }),
  });

  const addCoin = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("supported_coins").insert(form);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-coins"] });
      setOpen(false);
      setForm({ coin_id: "", symbol: "", name_kr: "", chain: "ethereum", icon: "●", sort_order: 0 });
      toast({ title: "코인이 추가되었습니다" });
    },
    onError: (e: Error) => toast({ title: "오류", description: e.message, variant: "destructive" }),
  });

  const deleteCoin = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("supported_coins").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-coins"] });
      toast({ title: "코인이 삭제되었습니다" });
    },
    onError: (e: Error) => toast({ title: "오류", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">코인 관리</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> 코인 추가</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>새 코인 추가</DialogTitle></DialogHeader>
            <div className="space-y-3">
              {[
                { key: "coin_id", label: "Coin ID", placeholder: "bitcoin" },
                { key: "symbol", label: "심볼", placeholder: "BTC" },
                { key: "name_kr", label: "한국어 이름", placeholder: "비트코인" },
                { key: "chain", label: "체인", placeholder: "ethereum" },
                { key: "icon", label: "아이콘", placeholder: "₿" },
              ].map((f) => (
                <div key={f.key}>
                  <Label className="text-sm">{f.label}</Label>
                  <Input
                    placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="mt-1"
                  />
                </div>
              ))}
              <div>
                <Label className="text-sm">정렬 순서</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="mt-1" />
              </div>
              <Button onClick={() => addCoin.mutate()} disabled={!form.coin_id || !form.symbol || !form.name_kr} className="w-full">추가</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border border-border/50 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>순서</TableHead>
              <TableHead>심볼</TableHead>
              <TableHead>이름</TableHead>
              <TableHead>체인</TableHead>
              <TableHead>활성</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">로딩 중...</TableCell></TableRow>
            ) : coins.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.sort_order}</TableCell>
                <TableCell className="font-semibold">{c.icon} {c.symbol}</TableCell>
                <TableCell>{c.name_kr}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{c.chain}</TableCell>
                <TableCell>
                  <Switch checked={c.enabled} onCheckedChange={(v) => toggleEnabled.mutate({ id: c.id, enabled: v })} />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => deleteCoin.mutate(c.id)}>삭제</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminCoins;
