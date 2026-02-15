import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PRICE_MARKUP, BINANCE_SYMBOL_MAP, generateSparkline, mockCoins, type CoinData } from "@/lib/cryptoData";

const KRW_FALLBACK = 1380;

interface SupportedCoin {
  coin_id: string;
  symbol: string;
  name_kr: string;
  chain: string;
  icon: string;
  sort_order: number;
}

interface BinanceTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  volume: string;
  quoteVolume: string;
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

  // Build list of Binance symbols to query
  const symbols = supportedCoins
    .map((c) => BINANCE_SYMBOL_MAP[c.coin_id])
    .filter((s) => s && s.length > 0);

  // Fetch all tickers from Binance
  const symbolsParam = JSON.stringify(symbols);
  const res = await fetch(
    `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbolsParam)}`
  );
  if (!res.ok) throw new Error("Binance API error");
  const tickers: BinanceTicker[] = await res.json();

  // Build symbol -> ticker map
  const tickerMap = new Map(tickers.map((t) => [t.symbol, t]));

  // Map coins
  return supportedCoins.map((sc) => {
    const binanceSymbol = BINANCE_SYMBOL_MAP[sc.coin_id] || "";
    const ticker = tickerMap.get(binanceSymbol);
    const mock = mockCoins.find((m) => m.symbol === sc.symbol);

    let priceUsd: number;
    let change24h: number;
    let volume24h: number;

    if (sc.coin_id === "tether") {
      priceUsd = 1.0;
      change24h = 0.01;
      volume24h = 62000000000;
    } else if (ticker) {
      priceUsd = parseFloat(ticker.lastPrice);
      change24h = parseFloat(ticker.priceChangePercent);
      volume24h = parseFloat(ticker.quoteVolume);
    } else if (mock) {
      priceUsd = mock.priceUsd;
      change24h = mock.change24h;
      volume24h = mock.volume24h;
    } else {
      priceUsd = 0;
      change24h = 0;
      volume24h = 0;
    }

    const priceKrw = priceUsd * KRW_FALLBACK * PRICE_MARKUP;
    const volatility = priceUsd * 0.01;

    return {
      id: sc.coin_id,
      symbol: sc.symbol,
      name: mock?.name ?? sc.symbol,
      nameKr: sc.name_kr,
      icon: sc.icon,
      image: mock?.image,
      chain: sc.chain,
      priceUsd,
      priceKrw,
      change24h,
      volume24h,
      sparkline: generateSparkline(priceUsd, volatility),
    };
  });
};

export const useCryptoData = () => {
  const query = useQuery<CoinData[]>({
    queryKey: ["crypto-markets"],
    queryFn: fetchCoins,
    refetchInterval: 3000,
    staleTime: 2500,
    placeholderData: mockCoins,
    retry: 2,
  });

  // Client-side micro-fluctuation for visual real-time effect
  const [fluctuatedData, setFluctuatedData] = useState<CoinData[] | undefined>(undefined);
  const baseDataRef = useRef<CoinData[] | undefined>(undefined);

  // Update base data when query data changes
  useEffect(() => {
    if (query.data) {
      baseDataRef.current = query.data;
    }
  }, [query.data]);

  // Apply micro-fluctuation every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      const base = baseDataRef.current;
      if (!base) return;

      const fluctuated = base.map((coin) => {
        // Random offset between -0.05% and +0.05%
        const offset = 1 + (Math.random() - 0.5) * 0.001;
        const newPriceKrw = coin.priceKrw * offset;
        const newPriceUsd = coin.priceUsd * offset;
        // Slight change24h jitter
        const changeOffset = (Math.random() - 0.5) * 0.02;
        return {
          ...coin,
          priceKrw: newPriceKrw,
          priceUsd: newPriceUsd,
          change24h: coin.change24h + changeOffset,
        };
      });
      setFluctuatedData(fluctuated);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    ...query,
    data: fluctuatedData ?? query.data,
  };
};
