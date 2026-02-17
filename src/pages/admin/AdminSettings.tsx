import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Setting {
  id: string;
  key: string;
  value: string;
  label: string;
  description: string | null;
  updated_at: string;
}

const AdminSettings = () => {
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("platform_settings" as any).select("*");
      if (error) throw error;
      return (data as any[]) as Setting[];
    },
  });

  useEffect(() => {
    if (settings.length > 0) {
      const map: Record<string, string> = {};
      settings.forEach((s) => { map[s.key] = s.value; });
      setValues(map);
    }
  }, [settings]);

  const saveSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from("platform_settings" as any)
        .update({ value } as any)
        .eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      qc.invalidateQueries({ queryKey: ["platform-settings"] });
      toast({ title: "설정이 저장되었습니다" });
    },
    onError: (e: Error) => toast({ title: "오류", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">플랫폼 설정</h1>
      {isLoading ? (
        <p className="text-muted-foreground">로딩 중...</p>
      ) : (
        <div className="space-y-4">
          {settings.map((s) => (
            <Card key={s.key} className="bg-card border-border/50">
              <CardContent className="p-4 space-y-2">
                <Label className="font-medium">{s.label}</Label>
                {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
                <div className="flex gap-2">
                  <Input
                    value={values[s.key] ?? s.value}
                    onChange={(e) => setValues({ ...values, [s.key]: e.target.value })}
                    className="bg-secondary border-border/50"
                  />
                  <Button
                    size="sm"
                    onClick={() => saveSetting.mutate({ key: s.key, value: values[s.key] })}
                    disabled={values[s.key] === s.value}
                    className="gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" /> 저장
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">마지막 수정: {new Date(s.updated_at).toLocaleString("ko-KR")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
