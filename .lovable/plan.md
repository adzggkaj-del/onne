

## 后台管理系统实现方案

### 概述

为 CryptoX 构建完整的后台管理系统，包括数据库角色系统、平台配置表、管理后台 UI，以及将前端硬编码参数迁移为动态配置。

---

### 第一步：数据库迁移

创建一个数据库迁移，包含以下内容：

**1. 角色系统**
- 创建 `app_role` 枚举（`admin`, `moderator`, `user`）
- 创建 `user_roles` 表（`user_id`, `role`，唯一约束）
- 创建 `has_role()` SECURITY DEFINER 函数
- 为 `user_roles` 启用 RLS，仅管理员可读写

**2. 平台设置表 `platform_settings`**
- 字段：`id`, `key`(unique), `value`, `label`, `description`, `updated_at`
- 预置 6 项配置：`buy_spread=0.99`, `sell_spread=1.01`, `trade_fee_rate=0.001`, `lending_daily_rate=0.001`, `lending_term_days=30`, `krw_rate=1380`
- RLS：认证用户可读，管理员可更新

**3. 扩展现有表 RLS**
- `supported_coins`：管理员可 INSERT/UPDATE/DELETE
- `profiles`：管理员可 SELECT 所有用户
- `orders`：管理员可 SELECT/UPDATE 所有订单

---

### 第二步：新建前端文件

**Hooks：**
- `src/hooks/usePlatformSettings.ts` -- 使用 React Query 从 `platform_settings` 读取配置，返回 `{ buySpread, sellSpread, tradeFeeRate, lendingDailyRate, lendingTermDays, krwRate, isLoading }`
- `src/hooks/useAdmin.ts` -- 查询 `user_roles` 判断当前用户是否为 admin

**组件：**
- `src/components/AdminRoute.tsx` -- 路由守卫，非管理员重定向到首页
- `src/components/AdminLayout.tsx` -- 管理后台独立布局，左侧导航栏（仪表盘、用户、币种、设置、订单）

**管理页面：**
- `src/pages/admin/AdminDashboard.tsx` -- 概览（用户数、订单数、币种数等统计卡片）
- `src/pages/admin/AdminUsers.tsx` -- 用户列表，可切换 verified 状态
- `src/pages/admin/AdminCoins.tsx` -- 币种 CRUD，启用/禁用，排序
- `src/pages/admin/AdminSettings.tsx` -- 表单编辑所有 platform_settings 配置项
- `src/pages/admin/AdminOrders.tsx` -- 全部订单列表，可更新状态

---

### 第三步：修改现有文件

**路由 (`src/App.tsx`)：**
- 添加 `/admin` 路由组，使用 `AdminRoute` + `AdminLayout` 包裹所有管理页面

**替换硬编码值：**
- `BuyPage.tsx`：`BUY_DISCOUNT = 0.99` 改为从 `usePlatformSettings` 读取
- `BuyFormPage.tsx`：同上，买币价格系数 + 手续费率
- `SellPage.tsx`：`SELL_MARKUP = 1.01` 改为动态读取
- `SellFormPage.tsx`：同上
- `LendingFormPage.tsx`：`DAILY_RATE = 0.001` 和 `TERM_DAYS = 30` 改为动态读取
- `useCryptoData.ts`：`PRICE_MARKUP = 1.01` 和 `KRW_FALLBACK = 1380` 改为从 settings 读取（通过参数传入或直接查询）

---

### 技术细节

**数据库查询方式：**
由于 `platform_settings` 和 `user_roles` 是新表，TypeScript 类型尚未自动生成。代码中需要使用 `.from("platform_settings")` 并手动定义接口类型，直到类型文件自动更新。

**`usePlatformSettings` 实现思路：**
```text
从 platform_settings SELECT 所有行
转换为 key-value map
返回带默认值的配置对象（防止数据未加载时出错）
使用 React Query 缓存 5 分钟
```

**`useCryptoData` 修改方式：**
将 `PRICE_MARKUP` 和 `KRW_FALLBACK` 从模块级常量改为函数参数或内部查询，使其可以使用动态配置值。

**管理后台 UI 风格：**
保持与前台一致的暗色主题，使用相同的 UI 组件库（shadcn/ui），独立的侧边栏导航。

---

### 文件变更清单

| 操作 | 文件 |
|------|------|
| 数据库迁移 | 角色系统 + platform_settings + RLS 扩展 |
| 新建 | `src/hooks/usePlatformSettings.ts` |
| 新建 | `src/hooks/useAdmin.ts` |
| 新建 | `src/components/AdminRoute.tsx` |
| 新建 | `src/components/AdminLayout.tsx` |
| 新建 | `src/pages/admin/AdminDashboard.tsx` |
| 新建 | `src/pages/admin/AdminUsers.tsx` |
| 新建 | `src/pages/admin/AdminCoins.tsx` |
| 新建 | `src/pages/admin/AdminSettings.tsx` |
| 新建 | `src/pages/admin/AdminOrders.tsx` |
| 修改 | `src/App.tsx` |
| 修改 | `src/pages/BuyPage.tsx` |
| 修改 | `src/pages/BuyFormPage.tsx` |
| 修改 | `src/pages/SellPage.tsx` |
| 修改 | `src/pages/SellFormPage.tsx` |
| 修改 | `src/pages/LendingFormPage.tsx` |
| 修改 | `src/hooks/useCryptoData.ts` |
| 修改 | `src/lib/cryptoData.ts` |

