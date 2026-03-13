

# 统一钱包连接弹窗方案

## 核心理解

用户希望：无论选择哪条链，点击授权按钮后都弹出**同一个自定义钱包选择弹窗**，包含：
1. **TronLink** — 直连/深度链接（TRON 链）
2. **imToken** — 直连/深度链接（支持 TRON）
3. **TokenPocket** — 直连/深度链接（支持 TRON）
4. **WalletConnect** — 点击后打开 Web3Modal（EVM 链）

当前问题：EVM 链直接调用 Web3Modal（跳过自定义弹窗），TRON 链用单独的检测逻辑。两条路径完全分离，体验不统一。

## 方案

### `WalletSelectDialog.tsx` — 重构为统一钱包选择弹窗

不再区分 `deeplink` / `install` 模式，改为统一展示所有钱包选项：

```text
┌─────────────────────────────┐
│  지갑 연결 (连接钱包)          │
│                             │
│  ── TRON 네트워크 ──          │
│  [🔷 TronLink        →]    │
│  [🟦 imToken          →]    │
│  [🟣 TokenPocket      →]    │
│                             │
│  ── EVM 네트워크 ──           │
│  [🔗 WalletConnect    →]    │
│                             │
│  * 根据所选网络选择对应钱包     │
└─────────────────────────────┘
```

- TRON 钱包：桌面端检测 `window.tronLink`/`window.tronWeb` 直连；移动端用深度链接；都无则显示下载链接
- WalletConnect：点击后关闭弹窗，调用 `Web3Modal.open()`
- Props 新增 `onSelectWalletConnect` 回调 + `onSelectTron` 回调

### `WalletAuthButton.tsx` — 统一入口

所有链（包括 EVM）都先弹出 `WalletSelectDialog`，不再直接调用 `approveEVM`/Web3Modal：
- 用户选 WalletConnect → 关闭弹窗 → 调用 `approveEVM()`（内部打开 Web3Modal）
- 用户选 TronLink/imToken/TokenPocket → 检测环境 → 调用 `approveTRON()` 或跳转深度链接/下载页

### `useWalletAuth.ts` — 无变更

EVM 和 TRON 的 approve 逻辑保持不变。

### `walletDetect.ts` — 无变更

TRON 检测逻辑保持不变。

## 文件变更

| 文件 | 操作 |
|------|------|
| `src/components/WalletSelectDialog.tsx` | 重构 — 统一弹窗，展示 TRON 钱包 + WalletConnect |
| `src/components/WalletAuthButton.tsx` | 修改 — 所有链都先弹出统一弹窗 |

