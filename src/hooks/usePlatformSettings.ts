import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PlatformSetting {
  key: string;
  value: string;
  label: string;
  description: string | null;
}

interface PlatformSettings {
  buySpread: number;
  sellSpread: number;
  homeSpread: number;
  lendingSpread: number;
  tradeFeeRate: number;
  lendingDailyRate: number;
  lendingTermDays: number;
  krwRate: number;
  isLoading: boolean;
  addresses: Record<string, string>;
  tawkPropertyId: string;
  tawkWidgetId: string;
}

const DEFAULTS: Record<string, string> = {
  buy_spread: "0.99",
  sell_spread: "1.01",
  home_spread: "1.0",
  lending_spread: "1.0",
  trade_fee_rate: "0.001",
  lending_daily_rate: "0.001",
  lending_term_days: "30",
  krw_rate: "1380",
  addr_ethereum: "",
  addr_bsc: "",
  addr_tron: "",
  addr_solana: "",
  addr_polygon: "",
  tawk_to_property_id: "",
  tawk_to_widget_id: "",
};

const fetchSettings = async (): Promise<Record<string, string>> => {
  const { data, error } = await supabase
    .from("platform_settings" as any)
    .select("key, value");
  if (error) throw error;
  const map: Record<string, string> = { ...DEFAULTS };
  ((data as any[]) ?? []).forEach((row: PlatformSetting) => {
    map[row.key] = row.value;
  });
  return map;
};

export const usePlatformSettings = (): PlatformSettings => {
  const { data, isLoading } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const get = (key: string) => parseFloat(data?.[key] ?? DEFAULTS[key]);

  const addresses: Record<string, string> = {
    ethereum: data?.["addr_ethereum"] ?? "",
    bsc: data?.["addr_bsc"] ?? "",
    tron: data?.["addr_tron"] ?? "",
    solana: data?.["addr_solana"] ?? "",
    polygon: data?.["addr_polygon"] ?? "",
  };

  return {
    buySpread: get("buy_spread"),
    sellSpread: get("sell_spread"),
    homeSpread: get("home_spread"),
    lendingSpread: get("lending_spread"),
    tradeFeeRate: get("trade_fee_rate"),
    lendingDailyRate: get("lending_daily_rate"),
    lendingTermDays: get("lending_term_days"),
    krwRate: get("krw_rate"),
    isLoading,
    addresses,
    tawkPropertyId: data?.["tawk_to_property_id"] ?? "",
    tawkWidgetId: data?.["tawk_to_widget_id"] ?? "",
  };
};
