
## 价格系数全面控制方案

### 问题分析

当前 `useCryptoData` 将 `sellSpread`（1.01）直接乘进了基准 `priceKrw`，导致：

- 首页 / 借贷页：显示的是已上浮 1% 的价格，而非纯市价
- 买币页：基准价 × 0.99 ≈ 市价（买入折扣消失）
- 卖币页：基准价 × 1.01 ≈ 市价 × 1.02（double 上浮）

后台修改 `buy_spread` / `sell_spread` 的值对前端**实际没有正确生效**。

### 目标架构

```text
纯基准价 = priceUsd × krwRate          （useCryptoData 输出）
首页显示 = 纯基准价 × home_spread       （初始值 1.0）
借贷页显示 = 纯基准价 × lending_spread  （初始值 1.0）
买币页显示 = 纯基准价 × buy_spread      （初始值 0.99）
卖币页显示 = 纯基准价 × sell_spread     （初始值 1.01）
```

所有 spread 值均来自后台 `platform_settings`，管理员可随时调整。

---

### 第一步：数据库 - 新增两个设置项

在 `platform_settings` 表插入两条新记录：

| key | value | label | description |
|-----|-------|-------|-------------|
| `home_spread` | `1.0` | 首页价格系数 | 首页行情展示价格系数，1.0 表示显示纯市价 |
| `lending_spread` | `1.0` | 借贷页价格系数 | 借贷页担保品估值系数，1.0 表示显示纯市价 |

---

### 第二步：修改 `src/hooks/usePlatformSettings.ts`

- 在 `DEFAULTS` 中添加 `home_spread: "1.0"` 和 `lending_spread: "1.0"`
- 在返回对象中添加 `homeSpread` 和 `lendingSpread` 两个字段
- 更新 `PlatformSettings` interface

---

### 第三步：修改 `src/hooks/useCryptoData.ts`

核心修复：将基准价从 `priceUsd × krwRate × sellSpread` 改为 `priceUsd × krwRate`（纯净基准价）。

- `fetchCoins` 参数从 `(krwRate, priceMarkup)` 改为只接收 `krwRate`
- 计算改为：`const priceKrw = priceUsd * krwRate`
- `useCryptoData` 内部只取 `krwRate`，`queryKey` 只依赖 `krwRate`

---

### 第四步：修改各展示页面，应用对应 spread

**`src/pages/Index.tsx`（首页）**
- 引入 `usePlatformSettings`，取 `homeSpread`
- 展示价格改为：`coin.priceKrw * homeSpread`

**`src/pages/LendingPage.tsx`（借贷列表页）**
- 引入 `usePlatformSettings`，取 `lendingSpread`
- 展示价格改为：`coin.priceKrw * lendingSpread`

**`src/pages/BuyPage.tsx` / `src/pages/SellPage.tsx`**
- 逻辑本身已正确（各自乘以 buySpread / sellSpread），修复基准价后自然正确，无需改动

---

### 第五步：移除遗留常量

**`src/lib/cryptoData.ts`**
- 删除 `export const PRICE_MARKUP = 1.01`
- `mockCoins` 中的 `priceKrw` 改为 `priceUsd * KRW_RATE`（去掉 `PRICE_MARKUP` 因子），保证 fallback 数据与真实逻辑一致

---

### 修复后各页面价格对比

| 页面 | 修复前 | 修复后 |
|------|--------|--------|
| 首页 | 市价 × 1.01（固定，不受后台控制） | 市价 × home_spread（后台可调，默认 1.0） |
| 借贷页 | 市价 × 1.01（固定） | 市价 × lending_spread（默认 1.0） |
| 买币页 | 市价 × 1.01 × 0.99 ≈ 市价 | 市价 × buy_spread（默认 0.99，正确打折） |
| 卖币页 | 市价 × 1.01 × 1.01 ≈ 市价 × 1.02 | 市价 × sell_spread（默认 1.01，正确上浮） |

### 文件变更清单

| 操作 | 文件 |
|------|------|
| 数据库 INSERT | platform_settings：新增 home_spread、lending_spread |
| 修改 | `src/hooks/usePlatformSettings.ts` |
| 修改 | `src/hooks/useCryptoData.ts` |
| 修改 | `src/pages/Index.tsx` |
| 修改 | `src/pages/LendingPage.tsx` |
| 修改 | `src/lib/cryptoData.ts` |
