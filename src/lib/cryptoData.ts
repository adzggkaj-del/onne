export const PRICE_MARKUP = 1.01;

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  nameKr: string;
  icon: string;
  image?: string;
  chain: string;
  priceUsd: number;
  priceKrw: number;
  change24h: number;
  volume24h: number;
  sparkline: number[];
}

export interface ChainInfo {
  id: string;
  name: string;
  icon: string;
}

export const chains: ChainInfo[] = [
  { id: "ethereum", name: "Ethereum", icon: "⟠" },
  { id: "bsc", name: "BNB Chain", icon: "◆" },
  { id: "tron", name: "TRON", icon: "◈" },
  { id: "solana", name: "Solana", icon: "◎" },
  { id: "polygon", name: "Polygon", icon: "⬡" },
];

const generateSparkline = (base: number, volatility: number): number[] => {
  const points: number[] = [];
  let current = base;
  for (let i = 0; i < 24; i++) {
    current = current + (Math.random() - 0.5) * volatility;
    points.push(Math.max(0, current));
  }
  return points;
};

const KRW_RATE = 1380;

export const mockCoins: CoinData[] = [
  {
    id: "bitcoin", symbol: "BTC", name: "Bitcoin", nameKr: "비트코인",
    icon: "₿", image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png", chain: "ethereum", priceUsd: 96842, priceKrw: 96842 * KRW_RATE * PRICE_MARKUP,
    change24h: 2.34, volume24h: 48200000000, sparkline: generateSparkline(96842, 500),
  },
  {
    id: "ethereum", symbol: "ETH", name: "Ethereum", nameKr: "이더리움",
    icon: "⟠", image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png", chain: "ethereum", priceUsd: 3245, priceKrw: 3245 * KRW_RATE * PRICE_MARKUP,
    change24h: -1.12, volume24h: 18500000000, sparkline: generateSparkline(3245, 30),
  },
  {
    id: "bnb", symbol: "BNB", name: "BNB", nameKr: "비앤비",
    icon: "◆", image: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png", chain: "bsc", priceUsd: 685, priceKrw: 685 * KRW_RATE * PRICE_MARKUP,
    change24h: 0.87, volume24h: 2100000000, sparkline: generateSparkline(685, 8),
  },
  {
    id: "solana", symbol: "SOL", name: "Solana", nameKr: "솔라나",
    icon: "◎", image: "https://assets.coingecko.com/coins/images/4128/small/solana.png", chain: "solana", priceUsd: 195, priceKrw: 195 * KRW_RATE * PRICE_MARKUP,
    change24h: 5.62, volume24h: 4800000000, sparkline: generateSparkline(195, 4),
  },
  {
    id: "xrp", symbol: "XRP", name: "XRP", nameKr: "리플",
    icon: "✕", image: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png", chain: "ethereum", priceUsd: 2.38, priceKrw: 2.38 * KRW_RATE * PRICE_MARKUP,
    change24h: -0.45, volume24h: 3200000000, sparkline: generateSparkline(2.38, 0.05),
  },
  {
    id: "tron", symbol: "TRX", name: "TRON", nameKr: "트론",
    icon: "◈", image: "https://assets.coingecko.com/coins/images/1094/small/tron-logo.png", chain: "tron", priceUsd: 0.245, priceKrw: 0.245 * KRW_RATE * PRICE_MARKUP,
    change24h: 1.23, volume24h: 890000000, sparkline: generateSparkline(0.245, 0.005),
  },
  {
    id: "polygon", symbol: "MATIC", name: "Polygon", nameKr: "폴리곤",
    icon: "⬡", image: "https://assets.coingecko.com/coins/images/4713/small/polygon.png", chain: "polygon", priceUsd: 0.92, priceKrw: 0.92 * KRW_RATE * PRICE_MARKUP,
    change24h: 3.45, volume24h: 650000000, sparkline: generateSparkline(0.92, 0.02),
  },
  {
    id: "usdt", symbol: "USDT", name: "Tether", nameKr: "테더",
    icon: "₮", image: "https://assets.coingecko.com/coins/images/325/small/Tether.png", chain: "ethereum", priceUsd: 1.0, priceKrw: 1.0 * KRW_RATE * PRICE_MARKUP,
    change24h: 0.01, volume24h: 62000000000, sparkline: generateSparkline(1.0, 0.001),
  },
];

export const formatKRW = (value: number): string => {
  return "₩" + Math.round(value).toLocaleString("ko-KR");
};

export const formatUSD = (value: number): string => {
  if (value >= 1) return "$" + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return "$" + value.toFixed(4);
};

export const formatVolume = (value: number): string => {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toLocaleString()}`;
};
