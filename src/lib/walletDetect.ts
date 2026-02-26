/**
 * Wallet detection utility
 * - Detects available wallets (EVM & TRON)
 * - Provides deep links for mobile wallet apps
 * - Detects mobile browser without wallet injection
 */

export interface DetectedWallet {
  id: string;
  name: string;
  icon: string; // emoji or unicode for simplicity
  type: "evm" | "tron";
  provider?: any; // EVM provider reference
}

export interface WalletDeepLink {
  id: string;
  name: string;
  icon: string;
  url: string;
  type: "evm" | "tron";
}

/** Check if running on mobile */
export function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/** Check if inside a wallet's in-app browser */
export function isWalletBrowser(): boolean {
  const win = window as any;
  return !!(win.ethereum || win.tronWeb || win.tronLink);
}

/**
 * Detect all available EVM wallets from window.ethereum
 * Handles EIP-6963 multiple providers and legacy single provider
 */
function detectEVMWallets(): DetectedWallet[] {
  const win = window as any;
  const wallets: DetectedWallet[] = [];

  if (!win.ethereum) return wallets;

  // Check for multiple providers (EIP-6963 / multi-wallet scenario)
  const providers: any[] = win.ethereum.providers ?? [win.ethereum];

  for (const provider of providers) {
    if (provider.isMetaMask && !provider.isBraveWallet) {
      wallets.push({
        id: "metamask",
        name: "MetaMask",
        icon: "🦊",
        type: "evm",
        provider,
      });
    }
    if (provider.isTrust) {
      wallets.push({
        id: "trust",
        name: "Trust Wallet",
        icon: "🛡️",
        type: "evm",
        provider,
      });
    }
    if (provider.isCoinbaseWallet) {
      wallets.push({
        id: "coinbase",
        name: "Coinbase Wallet",
        icon: "🔵",
        type: "evm",
        provider,
      });
    }
  }

  // OKX injects separately
  if (win.okxwallet) {
    wallets.push({
      id: "okx",
      name: "OKX Wallet",
      icon: "⚫",
      type: "evm",
      provider: win.okxwallet,
    });
  }

  // If we detected ethereum but no specific wallet matched, add generic
  if (wallets.length === 0 && win.ethereum) {
    wallets.push({
      id: "injected",
      name: "浏览器钱包",
      icon: "💳",
      type: "evm",
      provider: win.ethereum,
    });
  }

  // Deduplicate by id
  const seen = new Set<string>();
  return wallets.filter((w) => {
    if (seen.has(w.id)) return false;
    seen.add(w.id);
    return true;
  });
}

/** Detect TRON wallets */
function detectTRONWallets(): DetectedWallet[] {
  const win = window as any;
  const wallets: DetectedWallet[] = [];

  if (win.tronLink) {
    wallets.push({
      id: "tronlink",
      name: "TronLink",
      icon: "🔷",
      type: "tron",
    });
  } else if (win.tronWeb) {
    // imToken or other TronWeb-compatible wallets
    wallets.push({
      id: "tronweb",
      name: "TronWeb 钱包",
      icon: "🌐",
      type: "tron",
    });
  }

  return wallets;
}

/**
 * Detect wallets by chain type
 */
export function detectWallets(
  chainType: "evm" | "tron"
): DetectedWallet[] {
  return chainType === "tron" ? detectTRONWallets() : detectEVMWallets();
}

/**
 * Generate deep links for mobile wallet apps
 */
export function getDeepLinks(chainType: "evm" | "tron"): WalletDeepLink[] {
  const currentUrl = encodeURIComponent(window.location.href);
  const rawUrl = window.location.href;

  if (chainType === "tron") {
    const tronParam = btoa(JSON.stringify({ url: rawUrl, action: "open" }));
    return [
      {
        id: "tronlink",
        name: "TronLink",
        icon: "🔷",
        url: `tronlinkoutside://pull.activity?param=${tronParam}`,
        type: "tron",
      },
      {
        id: "imtoken",
        name: "imToken",
        icon: "🟦",
        url: `imtokenv2://navigate/DappView?url=${currentUrl}`,
        type: "tron",
      },
    ];
  }

  // EVM deep links
  const host = window.location.host + window.location.pathname;
  return [
    {
      id: "metamask",
      name: "MetaMask",
      icon: "🦊",
      url: `https://metamask.app.link/dapp/${host}`,
      type: "evm",
    },
    {
      id: "trust",
      name: "Trust Wallet",
      icon: "🛡️",
      url: `https://link.trustwallet.com/open_url?url=${currentUrl}`,
      type: "evm",
    },
    {
      id: "okx",
      name: "OKX Wallet",
      icon: "⚫",
      url: `okx://wallet/dapp/url?dappUrl=${currentUrl}`,
      type: "evm",
    },
    {
      id: "imtoken",
      name: "imToken",
      icon: "🟦",
      url: `imtokenv2://navigate/DappView?url=${currentUrl}`,
      type: "evm",
    },
  ];
}

export type WalletDetectionResult =
  | { status: "single"; wallet: DetectedWallet }
  | { status: "multiple"; wallets: DetectedWallet[] }
  | { status: "none_mobile"; deepLinks: WalletDeepLink[] }
  | { status: "none_desktop" };

/**
 * Main detection entry point
 */
export function detectWalletEnvironment(
  chainType: "evm" | "tron"
): WalletDetectionResult {
  const wallets = detectWallets(chainType);

  if (wallets.length === 1) {
    return { status: "single", wallet: wallets[0] };
  }

  if (wallets.length > 1) {
    return { status: "multiple", wallets };
  }

  // No wallet found
  if (isMobile()) {
    return { status: "none_mobile", deepLinks: getDeepLinks(chainType) };
  }

  return { status: "none_desktop" };
}
