

# 普通用户/星标用户按钮区分 + 首页名字脱敏

## 变更概述

4个文件修改：

### 1. 首页名字中间字星号脱敏
**文件**: `src/lib/cryptoData.ts`

在 `generateFakeTransactions` 中，将三字韩文名的中间字替换为 `*`（如 `김민수` → `김*수`）。

```ts
// line 148 area
const maskedName = name.length === 3 
  ? name[0] + '*' + name[2] 
  : name.length === 2 
    ? name[0] + '*' 
    : name;
```

### 2. 买币页面（BuyFormPage.tsx）
**当前逻辑**（~line 466）：`isVerified` → WalletAuthButton，否则普通按钮显示"연결 지갑"。

**修改为**：
- 普通用户（`!isVerified`）：按钮文字改为 `다음 단계`（下一步），点击直接调用 `handleCreateOrder()` 创建订单
- 星标用户（`isVerified`）：保持 WalletAuthButton 钱包授权逻辑不变

### 3. 卖币页面（SellFormPage.tsx）
**当前逻辑**（~line 436）：同上。

**修改为**：
- 普通用户：按钮文字 `다음 단계`，点击直接创建订单
- 星标用户：保持 WalletAuthButton

### 4. 借贷页面（LendingFormPage.tsx）
**当前逻辑**（~line 279）：直接显示 WalletAuthButton（无 `isVerified` 判断）。

**修改为**：
- 添加 `isVerified` 判断（需引入 `profile` from `useAuth`）
- 普通用户：显示 `다음 단계` 按钮，点击创建订单（新增 `handleCreateOrder` 函数，逻辑同 `handleWalletSuccess` 但不需要 txHash）
- 星标用户：保持 WalletAuthButton
- 移除或保留钱包提示信息（仅星标用户显示）

### 技术细节

所有三个页面的普通用户按钮统一为：
```tsx
<Button
  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12 font-semibold"
  onClick={() => handleCreateOrder()}
  disabled={!canSubmit || submitting}
>
  {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> 처리 중...</> : "다음 단계"}
</Button>
```

