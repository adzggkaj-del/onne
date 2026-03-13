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
      featuredWalletIds: [
        "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96", // MetaMask
        "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0", // Trust Wallet
        "971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709", // OKX Wallet
        "ef33381ad7d8084a511634b071759082405615a0c84c17666299f13e7104b2b0", // imToken
        "20459438007b75f4f4acb98bf29aa3b800550571e4c4f4fb6a258635e5685a70", // TokenPocket
      ],
    });
  }
  return modal;
}
