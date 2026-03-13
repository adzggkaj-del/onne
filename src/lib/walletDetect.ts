/**
 * Wallet detection utility — TRON only
 * EVM chains now use Web3Modal (WalletConnect) for wallet selection
 */

export interface DetectedWallet {
  id: string;
  name: string;
  icon: string;
  type: "tron";
}

export interface WalletDeepLink {
  id: string;
  name: string;
  icon: string;
  url: string;
  type: "tron";
}

/** Check if running on mobile */
export function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Generate deep links for TRON mobile wallet apps
 */
function getTronDeepLinks(): WalletDeepLink[] {
  const currentUrl = encodeURIComponent(window.location.href);
  const rawUrl = window.location.href;
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
    {
      id: "tokenpocket",
      name: "TokenPocket",
      icon: "🟣",
      url: `tpoutside://pull.activity?param=${tronParam}`,
      type: "tron",
    },
  ];
}

export type TronDetectionResult =
  | { status: "ready" }
  | { status: "none_mobile"; deepLinks: WalletDeepLink[] }
  | { status: "none_desktop" };

/**
 * Detect TRON wallet environment
 */
export function detectTronEnvironment(): TronDetectionResult {
  const win = window as any;

  if (win.tronLink || win.tronWeb) {
    return { status: "ready" };
  }

  if (isMobile()) {
    return { status: "none_mobile", deepLinks: getTronDeepLinks() };
  }

  return { status: "none_desktop" };
}
