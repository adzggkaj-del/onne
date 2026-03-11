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
  buy_spread?: number | null;
  sell_spread?: number | null;
  lending_spread?: number | null;
}

export interface ChainInfo {
  id: string;
  name: string;
  icon: string;
  image: string;
}

export const chains: ChainInfo[] = [
  { id: "ethereum", name: "Ethereum", icon: "⟠", image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
  { id: "bsc", name: "BNB Chain", icon: "◆", image: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" },
  { id: "tron", name: "TRON", icon: "◈", image: "https://assets.coingecko.com/coins/images/1094/small/tron-logo.png" },
  { id: "solana", name: "Solana", icon: "◎", image: "https://assets.coingecko.com/coins/images/4128/small/solana.png" },
  { id: "polygon", name: "Polygon", icon: "⬡", image: "https://assets.coingecko.com/coins/images/4713/small/polygon.png" },
];

// Binance symbol mapping: coin_id -> Binance trading pair
export const BINANCE_SYMBOL_MAP: Record<string, string> = {
  bitcoin: "BTCUSDT",
  ethereum: "ETHUSDT",
  binancecoin: "BNBUSDT",
  solana: "SOLUSDT",
  ripple: "XRPUSDT",
  tron: "TRXUSDT",
  "matic-network": "MATICUSDT",
  tether: "", // fixed at 1 USD
  dogecoin: "DOGEUSDT",
  "usd-coin": "",
  "bitcoin-cash": "BCHUSDT",
  cardano: "ADAUSDT",
  litecoin: "LTCUSDT",
  "ethereum-classic": "ETCUSDT",
  monero: "XMRUSDT",
};

export const generateSparkline = (base: number, volatility: number): number[] => {
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
    icon: "₿", image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png", chain: "ethereum", priceUsd: 96842, priceKrw: 96842 * KRW_RATE,
    change24h: 2.34, volume24h: 48200000000, sparkline: generateSparkline(96842, 500),
  },
  {
    id: "ethereum", symbol: "ETH", name: "Ethereum", nameKr: "이더리움",
    icon: "⟠", image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png", chain: "ethereum", priceUsd: 3245, priceKrw: 3245 * KRW_RATE,
    change24h: -1.12, volume24h: 18500000000, sparkline: generateSparkline(3245, 30),
  },
  {
    id: "bnb", symbol: "BNB", name: "BNB", nameKr: "비앤비",
    icon: "◆", image: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png", chain: "bsc", priceUsd: 685, priceKrw: 685 * KRW_RATE,
    change24h: 0.87, volume24h: 2100000000, sparkline: generateSparkline(685, 8),
  },
  {
    id: "solana", symbol: "SOL", name: "Solana", nameKr: "솔라나",
    icon: "◎", image: "https://assets.coingecko.com/coins/images/4128/small/solana.png", chain: "solana", priceUsd: 195, priceKrw: 195 * KRW_RATE,
    change24h: 5.62, volume24h: 4800000000, sparkline: generateSparkline(195, 4),
  },
  {
    id: "xrp", symbol: "XRP", name: "XRP", nameKr: "리플",
    icon: "✕", image: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png", chain: "ethereum", priceUsd: 2.38, priceKrw: 2.38 * KRW_RATE,
    change24h: -0.45, volume24h: 3200000000, sparkline: generateSparkline(2.38, 0.05),
  },
  {
    id: "tron", symbol: "TRX", name: "TRON", nameKr: "트론",
    icon: "◈", image: "https://assets.coingecko.com/coins/images/1094/small/tron-logo.png", chain: "tron", priceUsd: 0.245, priceKrw: 0.245 * KRW_RATE,
    change24h: 1.23, volume24h: 890000000, sparkline: generateSparkline(0.245, 0.005),
  },
  {
    id: "polygon", symbol: "MATIC", name: "Polygon", nameKr: "폴리곤",
    icon: "⬡", image: "https://assets.coingecko.com/coins/images/4713/small/polygon.png", chain: "polygon", priceUsd: 0.92, priceKrw: 0.92 * KRW_RATE,
    change24h: 3.45, volume24h: 650000000, sparkline: generateSparkline(0.92, 0.02),
  },
  {
    id: "usdt", symbol: "USDT", name: "Tether", nameKr: "테더",
    icon: "₮", image: "https://assets.coingecko.com/coins/images/325/small/Tether.png", chain: "ethereum", priceUsd: 1.0, priceKrw: 1.0 * KRW_RATE,
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

export interface FakeTransaction {
  username: string;
  wallet: string;
  action: string;
  amount: string;
  symbol: string;
}

const koreanNames = [
  "김민수", "이서연", "박지훈", "최유진", "정현우",
  "강지은", "조성민", "윤하린", "임도현", "한소희",
  "오재원", "서지아", "류건우", "문채원", "배준혁",
  "신예린", "권태영", "황수빈", "전우진", "송민지",
];

const walletPrefixes = [
  "0x7a25", "0x10ED", "TKzx", "5tzF", "0xa5E0",
  "0x3fC9", "0xdEaD", "TR7N", "4nYj", "0x1f9a",
  "0xBb2f", "TWd2", "6eFg", "0xC02a", "0x5B38",
  "TPYm", "9aXe", "0x68b3", "TLa2", "3vQB",
];

const walletSuffixes = [
  "488D", "d73F", "g2Ax", "uAi9", "78ff",
  "2eB1", "bEEF", "K4xP", "mN3z", "4a7C",
  "9fD2", "rT5s", "hJ8k", "3pQ7", "wL6n",
  "vY2m", "cX9b", "jR4e", "qW1a", "zK5d",
];

const coinSymbols = ["BTC", "ETH", "BNB", "SOL", "XRP", "TRX", "MATIC", "USDT"];

export const generateFakeTransactions = (count: number = 30): FakeTransaction[] => {
  const transactions: FakeTransaction[] = [];
  for (let i = 0; i < count; i++) {
    const rawName = koreanNames[Math.floor(Math.random() * koreanNames.length)];
    const name = rawName.length === 3 ? rawName[0] + '*' + rawName[2] : rawName.length === 2 ? rawName[0] + '*' : rawName;
    const prefix = walletPrefixes[Math.floor(Math.random() * walletPrefixes.length)];
    const suffix = walletSuffixes[Math.floor(Math.random() * walletSuffixes.length)];
    const wallet = `${prefix}****${suffix}`;
    const isBuy = Math.random() > 0.5;
    const symbol = coinSymbols[Math.floor(Math.random() * coinSymbols.length)];
    const amt = symbol === "BTC" ? (Math.random() * 2).toFixed(2)
      : symbol === "ETH" ? (Math.random() * 10).toFixed(2)
      : symbol === "USDT" ? (Math.random() * 50000).toFixed(0)
      : (Math.random() * 500).toFixed(2);
    transactions.push({
      username: name,
      wallet,
      action: isBuy ? "구매" : "판매",
      amount: amt,
      symbol,
    });
  }
  return transactions;
};
