import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PRICE_MARKUP, mockCoins, type CoinData } from "@/lib/cryptoData";

const KRW_RATE = 1380;

interface SupportedCoin {
  coin_id: string;
  symbol: string;
  name_kr: string;
  chain: string;
  icon: string;
  sort_order: number;
}

interface CoinGeckoMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  sparkline_in_7d?: { price: number[] };
}

const fetchSupportedCoins = async (): Promise<SupportedCoin[]> => {
  const { data, error } = await supabase
    .from("supported_coins")
    .select("coin_id, symbol, name_kr, chain, icon, sort_order")
    .eq("enabled", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as SupportedCoin[];
};

const fetchCoins = async (): Promise<CoinData[]> => {
  const supportedCoins = await fetchSupportedCoins();
  if (supportedCoins.length === 0) return mockCoins;

  const coinMap = new Map(supportedCoins.map((c) => [c.coin_id, c]));
  const ids = supportedCoins.map((c) => c.coin_id).join(",");

  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=krw&ids=${ids}&sparkline=true&price_change_percentage=24h`
  );
  if (!res.ok) throw new Error("CoinGecko API error");
  const data: CoinGeckoMarket[] = await res.json();

  return data.map((coin) => {
    const sc = coinMap.get(coin.id);
    const sparkline = coin.sparkline_in_7d?.price?.slice(-24) ?? [];
    return {
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      nameKr: sc?.name_kr ?? coin.name,
      icon: sc?.icon ?? "●",
      image: coin.image,
      chain: sc?.chain ?? "ethereum",
      priceKrw: coin.current_price * PRICE_MARKUP,
      priceUsd: (coin.current_price / KRW_RATE) * PRICE_MARKUP,
      change24h: coin.price_change_percentage_24h ?? 0,
      volume24h: coin.total_volume,
      sparkline,
    };
  });
};

export const useCryptoData = () => {
  return useQuery<CoinData[]>({
    queryKey: ["crypto-markets"],
    queryFn: fetchCoins,
    refetchInterval: 10000,
    staleTime: 8000,
    placeholderData: mockCoins,
    retry: 2,
  });
};
