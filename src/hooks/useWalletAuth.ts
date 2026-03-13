import { ethers } from "ethers";
import { getWeb3Modal, CHAIN_ID_MAP } from "@/lib/web3modal";

// USDT contract addresses per chain
const USDT_CONTRACTS: Record<string, string> = {
  ethereum: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  bsc: "0x55d398326f99059fF775485246999027B3197955",
  polygon: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  tron: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
};

// ERC20 minimal ABI for approve
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

// TRC20 minimal ABI for approve (used with tronWeb)
const TRC20_ABI = [
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    type: "Function",
  },
];

// Network configs for auto-add
const NETWORK_CONFIGS: Record<string, any> = {
  "0x38": {
    chainId: "0x38",
    chainName: "BNB Smart Chain",
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    rpcUrls: ["https://bsc-dataseed1.binance.org"],
    blockExplorerUrls: ["https://bscscan.com"],
  },
  "0x89": {
    chainId: "0x89",
    chainName: "Polygon",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    rpcUrls: ["https://polygon-rpc.com"],
    blockExplorerUrls: ["https://polygonscan.com"],
  },
};

const EVM_CHAIN_IDS: Record<string, string> = {
  ethereum: "0x1",
  bsc: "0x38",
  polygon: "0x89",
};

export interface WalletAuthResult {
  txHash: string;
  walletFrom: string;
}

/**
 * Approve USDT for EVM chains via Web3Modal (WalletConnect)
 */
async function approveEVM(
  chainId: string,
  spender: string,
  usdtAmount: number
): Promise<WalletAuthResult> {
  const modal = getWeb3Modal();

  // Open modal and wait for connection
  await modal.open();

  // Wait for the user to connect
  const provider = await waitForProvider(modal);

  if (!provider) {
    throw new Error("지갑 연결이 취소되었습니다. 다시 시도해주세요");
  }

  const hexChainId = EVM_CHAIN_IDS[chainId];

  // Switch to correct network
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hexChainId }],
    });
  } catch (switchErr: any) {
    if (switchErr.code === 4902) {
      // Auto-add network
      const config = NETWORK_CONFIGS[hexChainId];
      if (config) {
        try {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [config],
          });
        } catch {
          throw new Error(
            `지갑에서 ${chainId} 네트워크를 직접 추가한 후 다시 시도해주세요`
          );
        }
      } else {
        throw new Error(
          `지갑에서 ${chainId} 네트워크를 직접 추가한 후 다시 시도해주세요`
        );
      }
    } else if (switchErr.code === 4001) {
      throw new Error("네트워크 전환이 취소되었습니다. 다시 시도해주세요");
    } else {
      throw new Error(`네트워크 전환 실패: ${switchErr.message}`);
    }
  }

  const ethersProvider = new ethers.BrowserProvider(provider);
  const signer = await ethersProvider.getSigner();
  const walletFrom = await signer.getAddress();

  if (!spender) {
    throw new Error("플랫폼 수신 주소가 설정되지 않았습니다. 고객센터에 문의해주세요");
  }

  const usdtContract = new ethers.Contract(
    USDT_CONTRACTS[chainId],
    ERC20_ABI,
    signer
  );

  // Amount in USDT with 6 decimals, add 5% buffer
  const rawAmount = BigInt(Math.ceil(usdtAmount * 1.05 * 1_000_000));

  let tx: any;
  try {
    tx = await usdtContract.approve(spender, rawAmount);
  } catch (err: any) {
    if (err.code === 4001 || err.code === "ACTION_REJECTED") {
      throw new Error("승인이 취소되었습니다. 다시 시도해주세요");
    }
    throw new Error(`승인 실패: ${err.message}`);
  }

  await tx.wait();
  return { txHash: tx.hash, walletFrom };
}

/**
 * Wait for Web3Modal provider to be available after user connects
 */
function waitForProvider(modal: any): Promise<any> {
  return new Promise((resolve) => {
    // Check if already connected
    const existing = modal.getWalletProvider?.();
    if (existing) {
      resolve(existing);
      return;
    }

    const checkInterval = setInterval(() => {
      const p = modal.getWalletProvider?.();
      if (p) {
        clearInterval(checkInterval);
        clearTimeout(timeout);
        resolve(p);
      }
    }, 300);

    // Timeout after 120s
    const timeout = setTimeout(() => {
      clearInterval(checkInterval);
      resolve(null);
    }, 120000);

    // Listen for modal close (user cancelled)
    const unsubscribe = modal.subscribeEvents?.((event: any) => {
      if (event?.data?.event === "MODAL_CLOSE") {
        const p = modal.getWalletProvider?.();
        if (p) {
          resolve(p);
        } else {
          clearInterval(checkInterval);
          clearTimeout(timeout);
          resolve(null);
        }
        unsubscribe?.();
      }
    });
  });
}

/**
 * Approve USDT for TRON chain (TronLink / imToken TRX)
 */
async function approveTRON(
  spender: string,
  usdtAmount: number
): Promise<WalletAuthResult> {
  const win = window as any;

  if (!win.tronWeb && !win.tronLink) {
    throw new Error("TronLink 또는 imToken 지갑 확장 프로그램을 설치해주세요");
  }

  if (win.tronLink) {
    try {
      await win.tronLink.request({ method: "tron_requestAccounts" });
    } catch (err: any) {
      if (err.code === 4001) {
        throw new Error("지갑 연결이 취소되었습니다. 다시 시도해주세요");
      }
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  const tronWeb = win.tronWeb;
  if (!tronWeb || !tronWeb.ready) {
    throw new Error("TronLink가 준비되지 않았습니다. 지갑을 잠금 해제한 후 다시 시도해주세요");
  }

  const walletFrom: string = tronWeb.defaultAddress.base58;

  if (!spender) {
    throw new Error("플랫폼 수신 주소가 설정되지 않았습니다. 고객센터에 문의해주세요");
  }

  const contract = await tronWeb.contract(TRC20_ABI, USDT_CONTRACTS.tron);
  const rawAmount = Math.ceil(usdtAmount * 1.05 * 1_000_000);

  let txHash: string;
  try {
    txHash = await contract.approve(spender, rawAmount).send({
      feeLimit: 100_000_000,
    });
  } catch (err: any) {
    if (
      typeof err === "string" &&
      (err.includes("cancel") || err.includes("Cancel"))
    ) {
      throw new Error("승인이 취소되었습니다. 다시 시도해주세요");
    }
    const msg = typeof err === "string" ? err : err?.message ?? "알 수 없는 오류";
    throw new Error(`TRON 승인 실패: ${msg}`);
  }

  return { txHash, walletFrom };
}

/**
 * Main entry: route to the correct wallet flow based on chain
 */
export async function approveUSDT(
  chainId: string,
  spenderAddress: string,
  usdtAmount: number
): Promise<WalletAuthResult> {
  if (chainId === "tron") {
    return approveTRON(spenderAddress, usdtAmount);
  }

  return approveEVM(chainId, spenderAddress, usdtAmount);
}
