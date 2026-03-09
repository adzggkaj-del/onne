

# 三项后台管理增强

## 1. 用户管理页面 — 添加管理员角色切换 + 星标用户标签优化

**文件**: `src/pages/admin/AdminUsers.tsx`

- 新增"관리자"（管理员）列：查询 `user_roles` 表获取每个用户的角色，显示 Switch 开关
- 开启时 INSERT 到 `user_roles`（role='admin'），关闭时 DELETE
- 现有的"인증" Switch 改标签为"⭐ 星표"以更清晰表达"星标用户"含义

## 2. 币种管理 — 添加独立点差设置

**数据库迁移**: 给 `supported_coins` 表添加三个可空列：
```sql
ALTER TABLE supported_coins ADD COLUMN buy_spread numeric DEFAULT NULL;
ALTER TABLE supported_coins ADD COLUMN sell_spread numeric DEFAULT NULL;
ALTER TABLE supported_coins ADD COLUMN lending_spread numeric DEFAULT NULL;
```
NULL 表示使用全局设置，有值则覆盖。

**文件**: `src/pages/admin/AdminCoins.tsx`
- 添加币种对话框和表格中增加三个点差输入字段（买入%、卖出%、借贷%）
- 留空 = 使用全局设置，填写 = 该币种独立点差

## 3. 前端页面读取独立点差

**文件**: `src/hooks/useCryptoData.ts`
- `SupportedCoin` 接口添加 `buy_spread`, `sell_spread`, `lending_spread` 可空字段
- `CoinData` 输出中携带这三个字段

**文件**: `src/pages/BuyPage.tsx`, `src/pages/BuyFormPage.tsx`
- 价格计算：`coin.buy_spread ?? settings.buySpread`（优先使用币种独立值）

**文件**: `src/pages/SellPage.tsx`, `src/pages/SellFormPage.tsx`
- 价格计算：`coin.sell_spread ?? settings.sellSpread`

**文件**: `src/pages/LendingPage.tsx`, `src/pages/LendingFormPage.tsx`
- 价格计算：`coin.lending_spread ?? settings.lendingSpread`

**文件**: `src/pages/Index.tsx`
- 首页价格继续使用 `homeSpread`（全局）

## 变更汇总

| 变更类型 | 文件/资源 |
|---------|----------|
| DB迁移 | 添加 `buy_spread`, `sell_spread`, `lending_spread` 到 `supported_coins` |
| 修改 | `src/pages/admin/AdminUsers.tsx` — 管理员角色开关 + 星标标签 |
| 修改 | `src/pages/admin/AdminCoins.tsx` — 点差输入字段 |
| 修改 | `src/hooks/useCryptoData.ts` — CoinData 携带点差 |
| 修改 | Buy/Sell/Lending 页面（6个文件） — 使用独立点差 |

