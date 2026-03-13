/**
 * Web3Modal (WalletConnect) configuration for EVM chains
 * Supports Ethereum, BSC, Polygon with 300+ wallets
 */
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers";

const projectId = "9151164eacdda74fe66fc032918e7938";

const mainnet = {
  chainId: 1,
  name: "Ethereum",
  currency: "ETH",
  explorerUrl: "https://etherscan.io",
  rpcUrl: "https://eth.llamarpc.com",
};

const bsc = {
  chainId: 56,
  name: "BNB Chain",
  currency: "BNB",
  explorerUrl: "https://bscscan.com",
  rpcUrl: "https://bsc-dataseed1.binance.org",
};

const polygon = {
  chainId: 137,
  name: "Polygon",
  currency: "MATIC",
  explorerUrl: "https://polygonscan.com",
  rpcUrl: "https://polygon-rpc.com",
};

const metadata = {
  name: "ONNE",
  description: "ONNE Crypto Platform",
  url: window.location.origin,
  icons: [`${window.location.origin}/favicon.ico`],
};

const ethersConfig = defaultConfig({
  metadata,
  defaultChainId: 56,
});

export const CHAIN_ID_MAP: Record<string, number> = {
  ethereum: 1,
  bsc: 56,
  polygon: 137,
};

let modal: ReturnType<typeof createWeb3Modal> | null = null;

export function getWeb3Modal() {
  if (!modal) {
    modal = createWeb3Modal({
      ethersConfig,
      chains: [mainnet, bsc, polygon],
      projectId,
      enableAnalytics: false,
      themeMode: "dark",
    });
  }
  return modal;
}
