import { useQuery } from "@tanstack/react-query";
import { PRICE_MARKUP, mockCoins, type CoinData } from "@/lib/cryptoData";

const KRW_RATE = 1380;

const COINGECKO_IDS = "bitcoin,ethereum,binancecoin,solana,ripple,tron,matic-network,tether";

const CHAIN_MAP: Record<string, string> = {
  bitcoin: "ethereum",
  ethereum: "ethereum",
  binancecoin: "bsc",
  solana: "solana",
  ripple: "ethereum",
  tron: "tron",
  "matic-network": "polygon",
  tether: "ethereum",
};

const NAME_KR_MAP: Record<string, string> = {
  bitcoin: "비트코인",
  ethereum: "이더리움",
  binancecoin: "비앤비",
  solana: "솔라나",
  ripple: "리플",
  tron: "트론",
  "matic-network": "폴리곤",
  tether: "테더",
};

const ICON_MAP: Record<string, string> = {
  bitcoin: "₿",
  ethereum: "⟠",
  binancecoin: "◆",
  solana: "◎",
  ripple: "✕",
  tron: "◈",
  "matic-network": "⬡",
  tether: "₮",
};

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

const fetchCoins = async (): Promise<CoinData[]> => {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=krw&ids=${COINGECKO_IDS}&sparkline=true&price_change_percentage=24h`
  );
  if (!res.ok) throw new Error("CoinGecko API error");
  const data: CoinGeckoMarket[] = await res.json();

  return data.map((coin) => {
    const sparkline = coin.sparkline_in_7d?.price?.slice(-24) ?? [];
    return {
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      nameKr: NAME_KR_MAP[coin.id] ?? coin.name,
      icon: ICON_MAP[coin.id] ?? "●",
      image: coin.image,
      chain: CHAIN_MAP[coin.id] ?? "ethereum",
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
    refetchInterval: 30000,
    staleTime: 15000,
    placeholderData: mockCoins,
    retry: 2,
  });
};
