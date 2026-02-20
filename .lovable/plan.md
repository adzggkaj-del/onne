
# Web3 钱包授权功能实施方案

## 功能理解

将买币、卖币、借贷三个流程最后一步的"确认"按钮替换为：
1. 连接 Web3 钱包（EVM 链用 MetaMask/imToken；TRON 链用 TronLink/imToken）
2. 发起 USDT 授权交易（approve spender 为平台收款地址，金额为订单总额）
3. 用户在钱包内签名确认
4. 授权成功后，将授权哈希（txHash）保存到订单记录，创建订单
5. 管理后台可查看每笔订单的授权哈希

---

## 技术架构

### 链的分类

```text
EVM 兼容链（使用 ethers.js + window.ethereum）
├── Ethereum   — USDT 合约: 0xdAC17F958D2ee523a2206206994597C13D831ec7
├── BNB Chain  — USDT 合约: 0x55d398326f99059fF775485246999027B3197955
└── Polygon    — USDT 合约: 0xc2132D05D31c914a87C6611C10748AEb04B58e8F

TRON 链（使用 window.tronWeb，兼容 TronLink / imToken TRX 模式）
└── TRON       — USDT 合约: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t（TRC-20）

Solana 链（暂不支持 USDT approve 模式，架构上保留但提示"暂不支持"）
└── Solana     — 显示提示，引导使用其他网络
```

### 授权模式说明

```text
用户选择链 → 平台收款地址（来自 platform_settings） 就是 spender
订单金额（USDT）→ approve(spender, amount * 1e6)
txHash → 存入 orders.wallet_address 字段（复用）
```

---

## 数据库变更

在 `orders` 表新增一列 `auth_tx_hash text` 存储链上授权交易哈希，同时新增 `wallet_address_from text` 存储用户的钱包地址（便于管理员核查链上记录）。

SQL：
```sql
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS auth_tx_hash text,
  ADD COLUMN IF NOT EXISTS wallet_from text;
```

---

## 新增组件：`src/hooks/useWalletAuth.ts`

一个统一的 Hook，封装两套钱包体系：

**EVM 流程（Ethereum / BNB Chain / Polygon）**
```text
1. window.ethereum.request({ method: "eth_requestAccounts" })
2. new ethers.BrowserProvider(window.ethereum)
3. 切换到目标 chainId（eth_switchEthereumChain）
4. ERC20 合约 approve(spenderAddress, amount)
5. 返回 txHash
```

**TRON 流程（TronLink / imToken TRX）**
```text
1. 检测 window.tronWeb && window.tronWeb.ready
2. window.tronLink.request({ method: "tron_requestAccounts" })
3. TRC-20 合约 approve(spenderBase58Address, amount)
4. 返回 txHash
```

### Chain ID 映射

```text
ethereum → chainId 0x1    (1)
bsc      → chainId 0x38   (56)
polygon  → chainId 0x89   (137)
tron     → 使用 window.tronWeb（无 chainId 概念）
solana   → 暂不支持，弹出提示
```

---

## 新增组件：`src/components/WalletAuthButton.tsx`

替换三个表单页最后一步的确认按钮，负责完整的授权 UI 流程：

**UI 状态机**
```text
idle → "连接钱包并授权"按钮
  ↓ 点击
connecting → "正在连接钱包..." (spinner)
  ↓ 成功
approving → "请在钱包中确认授权..." (spinner + 钱包图标)
  ↓ 成功
submitting → "正在提交订单..." (spinner)
  ↓ 成功
done → 调用父组件 onSuccess(txHash, walletAddress) 回调
  ↓ 任一步失败
error → 显示错误信息 + "重试"按钮
```

**Props 接口**
```typescript
interface WalletAuthButtonProps {
  chain: ChainInfo;             // 用户选择的链
  usdtAmount: number;           // 需要授权的 USDT 数量
  spenderAddress: string;       // 平台收款地址（来自 platform_settings）
  onSuccess: (txHash: string, walletFrom: string) => Promise<void>;
  disabled?: boolean;
}
```

---

## 修改三个表单页

### BuyFormPage.tsx（最后一步 step=3）
- 将"구매 확인"按钮替换为 `<WalletAuthButton>`
- `onSuccess` 回调中执行 `supabase.from("orders").insert(...)` 并附带 `auth_tx_hash` 和 `wallet_from`

### SellFormPage.tsx（最后一步 step=4）
- 将"판매 확인"按钮替换为 `<WalletAuthButton>`
- 同上

### LendingFormPage.tsx（最后一步 step=2）
- 将"대출 신청"按钮替换为 `<WalletAuthButton>`
- 同上

---

## 管理后台展示

`AdminOrders.tsx` 中的订单列表新增列"授权哈希"，显示可点击的链接（截断显示），点击跳转对应区块链浏览器：

```text
ethereum → https://etherscan.io/tx/{hash}
bsc      → https://bscscan.com/tx/{hash}
polygon  → https://polygonscan.com/tx/{hash}
tron     → https://tronscan.org/#/transaction/{hash}
```

---

## 错误处理与用户提示

| 场景 | 提示内容 |
|------|---------|
| 未安装任何钱包 | "请先安装 MetaMask 或 TronLink 钱包扩展" |
| 网络不匹配 | "正在切换到 [链名] 网络..." → 自动切换 |
| 用户拒绝授权 | "您已取消授权，请重试" |
| 授权成功但平台地址未配置 | "平台地址未配置，请联系客服" |
| Solana 链 | "Solana 网络暂不支持此功能，请选择其他网络" |
| USDT 授权金额：使用订单 USDT 等值金额（总额 / krwRate）的 1.05 倍（留余量） | |

---

## 实施步骤

1. **数据库迁移**：新增 `auth_tx_hash` 和 `wallet_from` 字段
2. **安装依赖**：`ethers`（用于 EVM 链交互）
3. **创建 `useWalletAuth.ts`**：封装 EVM 和 TRON 两套连接+授权逻辑
4. **创建 `WalletAuthButton.tsx`**：带状态机的授权按钮组件
5. **修改 `BuyFormPage.tsx`**：替换最终确认按钮，在 `onSuccess` 中提交订单
6. **修改 `SellFormPage.tsx`**：同上
7. **修改 `LendingFormPage.tsx`**：同上
8. **修改 `AdminOrders.tsx`**：新增授权哈希列与区块链浏览器链接
9. **更新 `types.ts` 引用**：在 Order 接口中补充 `auth_tx_hash` 和 `wallet_from`
