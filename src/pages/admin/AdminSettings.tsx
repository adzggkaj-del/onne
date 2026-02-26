import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Save, Info, AlertTriangle, CheckCircle2, Wallet } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Setting {
  id: string;
  key: string;
  value: string;
  label: string;
  description: string | null;
  updated_at: string;
}

// Address keys (text type, not numeric)
const ADDRESS_KEYS = new Set(["addr_ethereum", "addr_bsc", "addr_tron", "addr_solana", "addr_polygon"]);
const TAWK_KEYS = new Set(["tawk_to_property_id", "tawk_to_widget_id"]);

const FIELD_META: Record<string, {
  min: number;
  max: number;
  step: number;
  unit: string;
  category: string;
  format?: (v: number) => string;
  rangeLabel: string;
}> = {
  buy_spread: {
    min: 0.90, max: 1.00, step: 0.001, unit: "계수",
    category: "가격 스프레드",
    rangeLabel: "0.90 ~ 1.00",
    format: (v) => `${((1 - v) * 100).toFixed(1)}% 할인`,
  },
  sell_spread: {
    min: 1.00, max: 1.10, step: 0.001, unit: "계수",
    category: "가격 스프레드",
    rangeLabel: "1.00 ~ 1.10",
    format: (v) => `${((v - 1) * 100).toFixed(1)}% 프리미엄`,
  },
  home_spread: {
    min: 0.98, max: 1.05, step: 0.001, unit: "계수",
    category: "가격 스프레드",
    rangeLabel: "0.98 ~ 1.05",
    format: (v) => v === 1 ? "순수 시장가" : v > 1 ? `${((v - 1) * 100).toFixed(1)}% 상승 표시` : `${((1 - v) * 100).toFixed(1)}% 하락 표시`,
  },
  lending_spread: {
    min: 0.95, max: 1.05, step: 0.001, unit: "계수",
    category: "가격 스프레드",
    rangeLabel: "0.95 ~ 1.05",
    format: (v) => v === 1 ? "순수 시장가" : v > 1 ? `${((v - 1) * 100).toFixed(1)}% 상승 기준` : `${((1 - v) * 100).toFixed(1)}% 하락 기준`,
  },
  trade_fee_rate: {
    min: 0.0001, max: 0.05, step: 0.0001, unit: "비율",
    category: "수수료 & 이자",
    rangeLabel: "0.0001 ~ 0.05",
    format: (v) => `${(v * 100).toFixed(2)}%`,
  },
  lending_daily_rate: {
    min: 0.0001, max: 0.01, step: 0.0001, unit: "비율",
    category: "수수료 & 이자",
    rangeLabel: "0.0001 ~ 0.01",
    format: (v) => `${(v * 100).toFixed(3)}%/일 → 연 ${(v * 365 * 100).toFixed(1)}%`,
  },
  lending_term_days: {
    min: 7, max: 365, step: 1, unit: "일",
    category: "대출 설정",
    rangeLabel: "7 ~ 365",
    format: (v) => `${v}일`,
  },
  krw_rate: {
    min: 900, max: 2000, step: 1, unit: "KRW",
    category: "환율",
    rangeLabel: "900 ~ 2000",
    format: (v) => `1 USD = ${v.toLocaleString()} KRW`,
  },
};

const CATEGORY_ORDER = ["가격 스프레드", "수수료 & 이자", "대출 설정", "환율"];

function getRangeStatus(key: string, value: string): "ok" | "warn" | "error" {
  const meta = FIELD_META[key];
  if (!meta) return "ok";
  const num = parseFloat(value);
  if (isNaN(num)) return "error";
  if (num < meta.min || num > meta.max) return "warn";
  return "ok";
}

// ── Address setting card (text, not numeric) ──────────────────────────────────
const AddressCard = ({
  s,
  currentVal,
  onChange,
  onSave,
  isPending,
}: {
  s: Setting;
  currentVal: string;
  onChange: (v: string) => void;
  onSave: () => void;
  isPending: boolean;
}) => {
  const isDirty = currentVal !== s.value;
  return (
    <Card className={cn("bg-card border-border/50 transition-colors", isDirty && "border-primary/40 bg-primary/5")}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
              <Label className="font-semibold text-sm">{s.label}</Label>
              <Badge variant="secondary" className="text-xs font-mono px-1.5 py-0">{s.key}</Badge>
              {isDirty && <Badge variant="outline" className="text-xs text-primary border-primary/50">미저장</Badge>}
            </div>
            {s.description && (
              <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                <Info className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground/70" />
                {s.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <Input
            type="text"
            value={currentVal}
            placeholder="지갑 주소를 입력하세요"
            onChange={(e) => onChange(e.target.value)}
            className="bg-secondary border-border/50 font-mono text-xs"
          />
          <Button size="sm" onClick={onSave} disabled={!isDirty || isPending} className="gap-1.5 shrink-0">
            <Save className="h-3.5 w-3.5" /> 저장
          </Button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {currentVal && (
              <span className="flex items-center gap-1 text-xs text-primary">
                <CheckCircle2 className="h-3 w-3" />
                {currentVal.length > 20 ? currentVal.slice(0, 10) + "…" + currentVal.slice(-8) : currentVal}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground shrink-0">
            마지막 수정: {new Date(s.updated_at).toLocaleString("ko-KR")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const AdminSettings = () => {
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("platform_settings").select("*");
      if (error) throw error;
      return data as Setting[];
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
        .from("platform_settings")
        .update({ value })
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

  // Numeric settings grouped by category
  const grouped = CATEGORY_ORDER.reduce<Record<string, Setting[]>>((acc, cat) => {
    acc[cat] = settings.filter((s) => FIELD_META[s.key]?.category === cat);
    return acc;
  }, {});

  // Address settings
  const addressSettings = settings.filter((s) => ADDRESS_KEYS.has(s.key));

  // Tawk.to settings
  const tawkSettings = settings.filter((s) => TAWK_KEYS.has(s.key));

  // Completely unknown settings
  const ungrouped = settings.filter((s) => !FIELD_META[s.key] && !ADDRESS_KEYS.has(s.key) && !TAWK_KEYS.has(s.key));

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">플랫폼 설정</h1>
        <p className="text-sm text-muted-foreground mt-1">각 항목의 권장 범위를 확인하고 설정을 조정하세요.</p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">로딩 중...</p>
      ) : (
        <div className="space-y-8">
          {/* Numeric categories */}
          {CATEGORY_ORDER.map((category) => {
            const items = grouped[category];
            if (!items?.length) return null;
            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{category}</h2>
                  <div className="flex-1 h-px bg-border/60" />
                </div>
                <div className="space-y-3">
                  {items.map((s) => {
                    const meta = FIELD_META[s.key];
                    const currentVal = values[s.key] ?? s.value;
                    const status = getRangeStatus(s.key, currentVal);
                    const numVal = parseFloat(currentVal);
                    const preview = meta?.format && !isNaN(numVal) ? meta.format(numVal) : null;
                    const isDirty = currentVal !== s.value;

                    return (
                      <Card key={s.key} className={cn(
                        "bg-card border-border/50 transition-colors",
                        isDirty && "border-primary/40 bg-primary/5"
                      )}>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Label className="font-semibold text-sm">{s.label}</Label>
                                <Badge variant="secondary" className="text-xs font-mono px-1.5 py-0">{s.key}</Badge>
                                {isDirty && (
                                  <Badge variant="outline" className="text-xs text-primary border-primary/50">미저장</Badge>
                                )}
                              </div>
                              {s.description && (
                                <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                                  <Info className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground/70" />
                                  {s.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {meta && (
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-muted-foreground">권장 범위:</span>
                              <code className="bg-muted px-2 py-0.5 rounded font-mono text-foreground">{meta.rangeLabel}</code>
                              <span className="text-muted-foreground">단위: {meta.unit}</span>
                              {meta.step < 1 && (
                                <span className="text-muted-foreground">소수점 {String(meta.step).split(".")[1]?.length ?? 0}자리</span>
                              )}
                            </div>
                          )}

                          <div className="flex gap-2 items-center">
                            <div className="relative flex-1">
                              <Input
                                type="number"
                                value={currentVal}
                                min={meta?.min}
                                max={meta?.max}
                                step={meta?.step}
                                onChange={(e) => setValues({ ...values, [s.key]: e.target.value })}
                                className={cn(
                                  "bg-secondary border-border/50 font-mono",
                                  status === "warn" && "border-warning/60 focus-visible:ring-warning/30",
                                  status === "error" && "border-destructive/60 focus-visible:ring-destructive/30"
                                )}
                              />
                            </div>
                            <Button
                              size="sm"
                              onClick={() => saveSetting.mutate({ key: s.key, value: currentVal })}
                              disabled={!isDirty || saveSetting.isPending}
                              className="gap-1.5 shrink-0"
                            >
                              <Save className="h-3.5 w-3.5" /> 저장
                            </Button>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              {status === "warn" && (
                                <span className="flex items-center gap-1 text-xs text-destructive/80">
                                  <AlertTriangle className="h-3 w-3" />
                                  권장 범위({meta?.rangeLabel}) 벗어남
                                </span>
                              )}
                              {status === "ok" && preview && (
                                <span className="flex items-center gap-1 text-xs text-primary">
                                  <CheckCircle2 className="h-3 w-3" />
                                  {preview}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground shrink-0">
                              마지막 수정: {new Date(s.updated_at).toLocaleString("ko-KR")}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Wallet addresses */}
          {addressSettings.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">입금 지갑 주소</h2>
                <div className="flex-1 h-px bg-border/60" />
              </div>
              <div className="space-y-3">
                {addressSettings.map((s) => (
                  <AddressCard
                    key={s.key}
                    s={s}
                    currentVal={values[s.key] ?? s.value}
                    onChange={(v) => setValues({ ...values, [s.key]: v })}
                    onSave={() => saveSetting.mutate({ key: s.key, value: values[s.key] ?? s.value })}
                    isPending={saveSetting.isPending}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tawk.to Settings */}
          {tawkSettings.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">고객 채팅 (Tawk.to)</h2>
                <div className="flex-1 h-px bg-border/60" />
              </div>
              <div className="space-y-3">
                {tawkSettings.map((s) => (
                  <Card key={s.key} className="bg-card border-border/50">
                    <CardContent className="p-4 space-y-2">
                      <Label className="font-medium">{s.label}</Label>
                      {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
                      <div className="flex gap-2">
                        <Input
                          value={values[s.key] ?? s.value}
                          placeholder="tawk.to에서 발급받은 ID를 입력하세요"
                          onChange={(e) => setValues({ ...values, [s.key]: e.target.value })}
                          className="bg-secondary border-border/50 font-mono text-xs"
                        />
                        <Button
                          size="sm"
                          onClick={() => saveSetting.mutate({ key: s.key, value: values[s.key] ?? s.value })}
                          disabled={(values[s.key] ?? s.value) === s.value || saveSetting.isPending}
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
              <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span>tawk.to 가입 후 관리 화면에서 Property ID와 Widget ID를 확인할 수 있습니다. 두 값 모두 입력해야 채팅 위젯이 표시됩니다.</span>
              </div>
            </div>

          {/* Unknown / ungrouped fallback */}
          {ungrouped.length > 0 && (
            <div className="space-y-3">
              {ungrouped.map((s) => (
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
      )}
    </div>
  );
};

export default AdminSettings;
