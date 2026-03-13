

# 钱包授权流程统一修复

## 问题分析

1. **买币/卖币页面**：EVM 链点击授权后应该弹出 Web3Modal（支持 300+ 钱包），但用户报告只看到 imToken — 可能是 Web3Modal 未正确初始化或弹出被拦截
2. **借贷页面**：使用相同的 `WalletAuthButton`，但行为不一致（无 imToken）
3. **TRON 链支持不明显**：当用户选择 TRON 链时，桌面端只显示 TronLink 安装链接，缺少 imToken；移动端深度链接只有 TronLink 和 imToken 两个选项

所有页面使用完全相同的 `WalletAuthButton` 组件，代码逻辑一致。问题可能出在：
- Web3Modal 在 Lovable preview iframe 中受限（WalletConnect relay 连接问题），导致 EVM 钱包列表加载不全
- TRON 的 `WalletSelectDialog` install 模式只列了 TronLink，缺少 imToken

## 修改方案

### 1. `src/components/WalletSelectDialog.tsx` — 完善 TRON 安装引导
- install 模式增加 imToken 下载链接（当前只有 TronLink）
- 添加 TokenPocket 下载链接（也支持 TRON）

### 2. `src/lib/web3modal.ts` — 改善 Web3Modal 配置
- 添加 `featuredWalletIds` 配置，确保 MetaMask、Trust Wallet、OKX Wallet、imToken、TokenPocket 等常用钱包置顶显示
- 添加 `includeWalletIds` 确保关键钱包不被过滤

### 3. `src/components/WalletAuthButton.tsx` — 统一行为 + 增强 TRON 可见性
- 当 TRON 链且桌面端无钱包时，错误提示改为更友好的引导（同时提到 TronLink 和 imToken）
- EVM 链增加连接失败的 fallback 提示

### 4. `src/lib/walletDetect.ts` — 扩展 TRON 深度链接
- 增加 TokenPocket TRON 深度链接

## 文件变更

| 文件 | 变更 |
|------|------|
| `src/lib/web3modal.ts` | 添加 featuredWalletIds 置顶常用钱包 |
| `src/components/WalletSelectDialog.tsx` | install 模式增加 imToken、TokenPocket |
| `src/lib/walletDetect.ts` | TRON 深度链接增加 TokenPocket |
| `src/components/WalletAuthButton.tsx` | 微调错误提示文案 |

