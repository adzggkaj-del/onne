

# WalletConnect 集成方案

## 目标
用 WalletConnect 替代当前自定义钱包检测逻辑，让用户通过 WalletConnect 标准 Modal 自由选择钱包（支持 300+ 钱包）。移除 Solana 支持。

## 方案概述

### 新增依赖
- `@web3modal/ethers` — Web3Modal v3（WalletConnect 官方 UI，基于 ethers.js）
- `@walletconnect/ethereum-provider` — WalletConnect EIP-1193 provider（peer dependency）

### 核心架构变更

**EVM 链（Ethereum/BSC/Polygon）**：点击授权按钮 → 打开 Web3Modal → 用户选择任意钱包连接 → 自动切换网络 → 发送 USDT approve 交易。Web3Modal 自带钱包列表、QR 码扫描、深度链接，覆盖桌面和移动端。

**TRON 链**：保持现有 TronLink/tronWeb 逻辑不变（WalletConnect 不支持 TRON）。

### 文件变更

| 文件 | 变更 |
|------|------|
| `src/lib/web3modal.ts` | **新建** — Web3Modal 初始化配置（projectId、chains、metadata） |
| `src/hooks/useWalletAuth.ts` | **修改** — EVM 分支改用 Web3Modal provider；移除 Solana 分支；添加 BSC/Polygon 的 `wallet_addEthereumChain` 自动添加网络 |
| `src/components/WalletAuthButton.tsx` | **简化** — EVM 链直接调用 Web3Modal 打开，不再走 detectWalletEnvironment；TRON 保留现有检测逻辑 |
| `src/lib/walletDetect.ts` | **保留精简** — 仅保留 TRON 检测 + mobile 检测 + TRON deep links；移除 EVM 检测 |
| `src/components/WalletSelectDialog.tsx` | **精简** — 仅保留 TRON 的 deeplink/install 模式；EVM 不再需要 |
| `src/lib/cryptoData.ts` | **修改** — 从 chains 数组移除 Solana |

### WalletConnect ProjectId
需要一个 WalletConnect Cloud projectId（免费注册 https://cloud.walletconnect.com）。这是一个公开 key，可以直接写在代码中。

### 流程对比

```text
当前:  按钮点击 → detectWalletEnvironment → 单钱包直连/多钱包弹窗/深度链接
改后:  
  EVM:  按钮点击 → Web3Modal.open() → 用户选钱包 → 连接+切网+approve
  TRON: 按钮点击 → 检测 TronLink → 直连/深度链接（保持不变）
```

### 网络自动添加（EVM）
在 `useWalletAuth.ts` 的 `wallet_switchEthereumChain` 4902 错误处理中，自动调用 `wallet_addEthereumChain` 添加 BSC/Polygon 配置。

### 韩文修复
`walletDetect.ts` 中 "浏览器钱包" → "브라우저 지갑"，"TronWeb 钱包" → "TronWeb 지갑"

