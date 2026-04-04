

# 修复余额重复扣除 Bug

## 问题根因

KRW 余额有两套计算体系导致重复扣除：

1. **`profile.bonus_krw`** — 用户下单时直接从 profiles 表扣除（BuyFormPage 第 142-146 行）
2. **`useUserBalance` 的 `krwBalance`** — 聚合所有"완료"状态订单计算：buy 订单扣 KRW，sell 订单加 KRW

在 BuyFormPage 第 97 行，两者相加作为总余额：
```typescript
const krwBalance = (balanceData?.krwBalance ?? 0) + (profile?.bonus_krw ?? 0);
```

流程：用户用余额购买 → `bonus_krw` 立即扣除 → 管理员审核标记"완료" → `useUserBalance` 再次从聚合中扣除 `total_krw` → **双重扣除**

## 修复方案

**移除 `useUserBalance` 中的 KRW 聚合计算**，KRW 余额只以 `profile.bonus_krw` 为唯一数据源。

### 文件变更

| 文件 | 变更 |
|------|------|
| `src/hooks/useUserBalance.ts` | 移除 `krwBalance` 的订单聚合逻辑，只保留 `coinBalances` |
| `src/pages/BuyFormPage.tsx` | `krwBalance` 直接用 `profile?.bonus_krw ?? 0`，不再加 `balanceData?.krwBalance` |
| `src/pages/AssetsPage.tsx` | 检查是否也存在类似的余额叠加，如有则修正 |

### `useUserBalance.ts` 改动

移除 `krwBalance` 字段，或将其固定为 0。`coinBalances` 的聚合逻辑保留不变（用于追踪用户持有的币种数量）。

### `BuyFormPage.tsx` 改动

```typescript
// 改前
const krwBalance = (balanceData?.krwBalance ?? 0) + (profile?.bonus_krw ?? 0);
// 改后
const krwBalance = profile?.bonus_krw ?? 0;
```

