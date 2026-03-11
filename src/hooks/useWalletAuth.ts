import { ethers } from "ethers";

// USDT contract addresses per chain
const USDT_CONTRACTS: Record<string, string> = {
  ethereum: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  bsc: "0x55d398326f99059fF775485246999027B3197955",
  polygon: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  tron: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
};

// EVM chain IDs
const CHAIN_IDS: Record<string, string> = {
  ethereum: "0x1",
  bsc: "0x38",
  polygon: "0x89",
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

export interface WalletAuthResult {
  txHash: string;
  walletFrom: string;
}

/**
 * Approve USDT for EVM chains (Ethereum, BSC, Polygon)
 */
async function approveEVM(
  chainId: string,
  spender: string,
  usdtAmount: number,
  evmProvider?: any
): Promise<WalletAuthResult> {
  const win = window as any;
  const provider = evmProvider ?? win.ethereum;

  if (!provider) {
    throw new Error("MetaMask 또는 EVM 지갑 확장 프로그램을 설치해주세요");
  }

  // Request accounts
  await provider.request({ method: "eth_requestAccounts" });

  // Switch to correct network
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN_IDS[chainId] }],
    });
  } catch (switchErr: any) {
    // 4902 means chain not added, propagate other errors
    if (switchErr.code !== 4902) {
      if (switchErr.code === 4001) {
        throw new Error("네트워크 전환이 취소되었습니다. 다시 시도해주세요");
      }
      throw new Error(`네트워크 전환 실패: ${switchErr.message}`);
    }
    throw new Error(
      `지갑에서 ${chainId} 네트워크를 직접 추가한 후 다시 시도해주세요`
    );
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

  // Request accounts if tronLink available
  if (win.tronLink) {
    try {
      await win.tronLink.request({ method: "tron_requestAccounts" });
    } catch (err: any) {
      if (err.code === 4001) {
        throw new Error("지갑 연결이 취소되었습니다. 다시 시도해주세요");
      }
    }
  }

  // Wait briefly for tronWeb to be ready
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

  // Amount with 6 decimals, add 5% buffer
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
  usdtAmount: number,
  evmProvider?: any
): Promise<WalletAuthResult> {
  if (chainId === "solana") {
    throw new Error(
      "Solana 네트워크는 USDT 승인 모드를 지원하지 않습니다. 다른 네트워크를 선택해주세요"
    );
  }

  if (chainId === "tron") {
    return approveTRON(spenderAddress, usdtAmount);
  }

  return approveEVM(chainId, spenderAddress, usdtAmount, evmProvider);
}
