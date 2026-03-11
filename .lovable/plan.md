

# 解决钱包支持的三个核心问题

## 问题概述

1. **无多钱包选择** - 当用户安装了多个钱包扩展时，系统默认使用第一个检测到的，用户无法选择
2. **手机普通浏览器不支持** - 在 Safari/Chrome 等普通浏览器中无 `window.ethereum` 或 `window.tronWeb`，用户只能看到"请安装钱包"的错误提示
3. **无 Deep Link 引导** - 手机端没有引导用户跳转到钱包 App 内置浏览器的机制

## 解决方案

采用 **钱包检测 + Deep Link 引导** 的方案（不引入 WalletConnect，避免增加复杂度和依赖）：

### 1. 新建钱包检测工具 `src/lib/walletDetect.ts`

- 检测当前环境中可用的钱包（MetaMask、OKX Wallet、Trust Wallet、TronLink 等）
- 检测是否为移动端普通浏览器（无钱包注入）
- 提供各钱包 App 的 Deep Link URL，用于跳转到钱包内置浏览器打开当前页面

### 2. 新建钱包选择弹窗 `src/components/WalletSelectDialog.tsx`

- 当检测到多个钱包时，弹出选择器让用户选择使用哪个钱包
- 当检测到无钱包（移动端普通浏览器）时，显示引导界面：
  - 展示 MetaMask / TronLink / imToken 等钱包 App 图标
  - 点击后通过 Deep Link 跳转到对应钱包 App 的 DApp 浏览器
  - 附带说明文字："请在钱包 App 中打开本网站完成授权"

### 3. 修改 `src/hooks/useWalletAuth.ts`

- EVM 链：支持接收指定的 provider（当用户选择了特定钱包时使用该 provider 而非默认的 `window.ethereum`）
- 多钱包检测：识别 `window.ethereum.providers` 数组（EIP-6963 兼容），区分不同钱包

### 4. 修改 `src/components/WalletAuthButton.tsx`

- 点击授权按钮时，先执行钱包检测：
  - 如果检测到多个钱包 → 弹出选择器
  - 如果检测到无钱包（手机普通浏览器）→ 弹出引导界面
  - 如果只有一个钱包 → 直接走现有流程
- 集成 WalletSelectDialog 组件

## 技术细节

### Deep Link 格式

```text
MetaMask:   https://metamask.app.link/dapp/{当前页面URL}
TronLink:   tronlinkoutside://pull.activity?param={base64URL}
Trust:      https://link.trustwallet.com/open_url?url={当前页面URL}
imToken:    imtokenv2://navigate/DappView?url={当前页面URL}
OKX:        okx://wallet/dapp/url?dappUrl={当前页面URL}
```

### 多钱包检测逻辑

```text
EVM:
  window.ethereum.providers (数组) → 多个钱包
  window.ethereum.isMetaMask → MetaMask
  window.ethereum.isTrust → Trust Wallet
  window.okxwallet → OKX Wallet

TRON:
  window.tronLink → TronLink
  window.tronWeb → imToken TRX 模式
```

### 文件变更清单

| 文件 | 操作 |
|------|------|
| `src/lib/walletDetect.ts` | 新建 - 钱包检测与 Deep Link 工具 |
| `src/components/WalletSelectDialog.tsx` | 新建 - 钱包选择/引导弹窗 |
| `src/hooks/useWalletAuth.ts` | 修改 - 支持指定 provider |
| `src/components/WalletAuthButton.tsx` | 修改 - 集成钱包选择逻辑 |

无需数据库变更，无需新增 npm 依赖。

