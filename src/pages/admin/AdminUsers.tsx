import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  uid_display: string | null;
  verified: boolean;
  created_at: string;
}

const AdminUsers = () => {
  const qc = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

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

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">사용자 관리</h1>
      <div className="rounded-lg border border-border/50 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>UID</TableHead>
              <TableHead>사용자명</TableHead>
              <TableHead>인증</TableHead>
              <TableHead>가입일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">로딩 중...</TableCell></TableRow>
            ) : users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-mono text-xs">{u.uid_display}</TableCell>
                <TableCell>{u.username ?? "-"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch checked={u.verified} onCheckedChange={(v) => toggleVerified.mutate({ id: u.id, verified: v })} />
                    <Badge variant={u.verified ? "default" : "secondary"} className="text-xs">
                      {u.verified ? "인증됨" : "미인증"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString("ko-KR")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminUsers;
