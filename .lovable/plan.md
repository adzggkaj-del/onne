

## 后台管理系统建设方案

### 概述

为 CryptoX 构建一个独立的后台管理面板（路由 `/admin`），仅限管理员用户访问。管理面板包含三大功能模块：用户管理、币种管理、点差/费率配置。

当前系统中，买币折扣（0.99）、卖币上浮（1.01）、借贷利率（0.1%/天）等参数均硬编码在前端页面中。本方案将这些参数迁移到数据库的 `platform_settings` 表中，实现后台动态配置。

---

### 一、数据库变更

#### 1. 创建角色系统（权限控制）

- 创建 `app_role` 枚举类型（`admin`, `moderator`, `user`）
- 创建 `user_roles` 表，存储用户角色映射
- 创建 `has_role()` 安全函数（SECURITY DEFINER），供 RLS 策略使用
- 为 `user_roles` 设置 RLS：仅管理员可读写

#### 2. 创建平台设置表 `platform_settings`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| key | text (unique) | 配置项标识 |
| value | text | 配置值 |
| label | text | 显示名称 |
| description | text | 配置说明 |
| updated_at | timestamptz | 更新时间 |

预设配置项：
- `buy_spread` = `0.99`（买币价格系数）
- `sell_spread` = `1.01`（卖币价格系数）
- `trade_fee_rate` = `0.001`（交易手续费率 0.1%）
- `lending_daily_rate` = `0.001`（借贷日利率 0.1%）
- `lending_term_days` = `30`（借贷期限天数）
- `krw_rate` = `1380`（KRW 汇率备用值）

RLS 策略：所有认证用户可读取（前端需要读取这些配置），仅管理员可更新。

#### 3. 扩展 `supported_coins` 表的 RLS

为管理员添加 INSERT / UPDATE / DELETE 权限。

#### 4. 扩展 `profiles` 表的 RLS

为管理员添加读取所有用户资料的权限。

#### 5. 扩展 `orders` 表的 RLS

为管理员添加读取和更新所有订单的权限（用于查看和处理订单状态）。

---

### 二、前端页面

#### 1. 管理员路由保护组件 `AdminRoute`

- 检查当前用户是否具有 `admin` 角色（从 `user_roles` 表查询）
- 非管理员重定向到首页

#### 2. 管理后台布局 `AdminLayout`

- 独立的侧边栏导航（不使用前台的 Layout）
- 包含：仪表盘、用户管理、币种管理、系统设置、订单管理 等导航项

#### 3. 管理页面

**用户管理页 `/admin/users`**
- 用户列表（用户名、UID、邮箱、认证状态、注册时间）
- 可修改用户的 `verified` 认证状态
- 查看用户的交易记录

**币种管理页 `/admin/coins`**
- 展示 `supported_coins` 列表
- 可以新增、编辑、删除币种
- 可切换 `enabled` 状态
- 可调整排序顺序

**系统设置页 `/admin/settings`**
- 从 `platform_settings` 表读取所有配置
- 以表单形式编辑每个配置项的值
- 保存后即时生效
- 主要配置项：
  - 买币点差系数（当前 0.99，即 -1%）
  - 卖币点差系数（当前 1.01，即 +1%）
  - 交易手续费率
  - 借贷日利率
  - 借贷期限天数
  - KRW 汇率

**订单管理页 `/admin/orders`**
- 查看所有用户的订单
- 可更新订单状态（대기 / 처리 중 / 완료）

---

### 三、前端代码修改（读取动态配置）

#### 1. 创建 `usePlatformSettings` hook

- 从 `platform_settings` 表查询所有配置
- 使用 React Query 缓存
- 返回 `{ buySpread, sellSpread, tradeFee, lendingRate, lendingDays, krwRate }`

#### 2. 修改现有页面，替换硬编码值

- **`BuyPage.tsx`** / **`BuyFormPage.tsx`**：`BUY_DISCOUNT` 改为从 settings 读取
- **`SellPage.tsx`** / **`SellFormPage.tsx`**：`SELL_MARKUP` 改为从 settings 读取
- **`LendingFormPage.tsx`**：`DAILY_RATE` 和 `TERM_DAYS` 改为从 settings 读取
- **`useCryptoData.ts`**：`PRICE_MARKUP` 和 `KRW_FALLBACK` 改为从 settings 读取

---

### 四、文件清单

**新建文件**：
- `src/hooks/usePlatformSettings.ts` -- 平台配置 hook
- `src/hooks/useAdmin.ts` -- 管理员权限检查 hook
- `src/components/AdminRoute.tsx` -- 管理员路由守卫
- `src/components/AdminLayout.tsx` -- 管理后台布局
- `src/pages/admin/AdminDashboard.tsx` -- 管理仪表盘
- `src/pages/admin/AdminUsers.tsx` -- 用户管理
- `src/pages/admin/AdminCoins.tsx` -- 币种管理
- `src/pages/admin/AdminSettings.tsx` -- 系统设置
- `src/pages/admin/AdminOrders.tsx` -- 订单管理

**修改文件**：
- `src/App.tsx` -- 添加 `/admin/*` 路由
- `src/pages/BuyPage.tsx` -- 读取动态点差
- `src/pages/BuyFormPage.tsx` -- 读取动态点差
- `src/pages/SellPage.tsx` -- 读取动态点差
- `src/pages/SellFormPage.tsx` -- 读取动态点差
- `src/pages/LendingFormPage.tsx` -- 读取动态利率
- `src/hooks/useCryptoData.ts` -- 读取动态汇率和基础加价

**数据库迁移**：
- 创建 `app_role` 枚举 + `user_roles` 表 + `has_role()` 函数
- 创建 `platform_settings` 表并插入默认值
- 更新 `supported_coins`、`profiles`、`orders` 的 RLS 策略（添加管理员权限）

