

## CryptoX 功能完善计划

### 1. 首页 Hero Banner 仅未登录时显示

**问题**：Hero Banner（"안전하고 빠른 암호화폐 거래"）始终显示，登录后应隐藏。

**方案**：在 `Index.tsx` 中引入 `useAuth()`，用 `{!user && (<section>...</section>)}` 包裹 Hero Banner 部分。登录后显示用户资产概览替代。

**修改文件**：`src/pages/Index.tsx`

---

### 2. 首页行情实时变动

**问题**：价格每30秒刷新一次，但UI没有实时感。

**方案**：
- 将 `useCryptoData` 的 `refetchInterval` 从 30000ms 降低到 10000ms
- 利用已有的 `PriceFlash` 组件，在价格变化时闪烁动画已生效
- 确保 `staleTime` 低于 `refetchInterval`

**修改文件**：`src/hooks/useCryptoData.ts`

---

### 3. 主链（Chain）显示真实Logo

**问题**：买币、卖币、借贷页面的链选择只显示文字符号（⟠、◆ 等）。

**方案**：
- 在 `ChainInfo` 接口增加 `image` 字段
- 更新 `chains` 数组，为每条链添加真实 Logo URL
- 创建 `ChainIcon` 组件（类似 CoinIcon），显示链 Logo
- 在 BuyPage、SellPage、LendingPage 的链选择处使用 ChainIcon

**修改文件**：
- `src/lib/cryptoData.ts` - ChainInfo 增加 image 字段
- `src/components/ChainIcon.tsx` - 新建
- `src/pages/BuyPage.tsx`、`SellPage.tsx`、`LendingPage.tsx` - 替换链图标

---

### 4. 平台支持币种从数据库配置

**问题**：支持的币种硬编码在前端（COINGECKO_IDS 常量），无法动态管理。

**方案**：

**新建数据库表 `supported_coins`**：

| 列名 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| coin_id | text | CoinGecko ID（如 "bitcoin"） |
| symbol | text | 符号（如 "BTC"） |
| name_kr | text | 韩文名称 |
| chain | text | 所属链 |
| icon | text | 文字图标（fallback） |
| enabled | boolean | 是否启用 |
| sort_order | int | 排序 |
| created_at | timestamptz | 创建时间 |

- RLS：所有人可读（公开数据），仅管理员可写
- 预填入当前8个币种数据
- 修改 `useCryptoData.ts`：先查询 `supported_coins`，再用动态 ID 列表调用 CoinGecko API
- mockCoins 作为 fallback 保留

**修改文件**：
- 新建数据库迁移
- `src/hooks/useCryptoData.ts` - 查询数据库获取支持的币种列表
- `src/lib/cryptoData.ts` - 调整相关类型

---

### 5. 余额检查功能

**问题**：买币、卖币、借贷页面没有检查用户是否有足够余额/资产。

**方案**：
- 创建 `useUserBalance` Hook，从 orders 表聚合计算用户各币种的持仓量
  - 买入订单增加持仓，卖出订单减少持仓
  - 仅统计已完成状态的订单
- 买币页面：检查 KRW 余额是否足够
- 卖币页面：检查要卖的币种数量是否足够
- 借贷页面：检查是否有足够的抵押品
- 在提交按钮旁显示余额不足提示

**新建文件**：`src/hooks/useUserBalance.ts`
**修改文件**：`src/pages/BuyPage.tsx`、`SellPage.tsx`、`LendingPage.tsx`

---

### 6. 通知系统

**问题**：右上角通知铃铛按钮没有实际功能。

**方案**：

**新建数据库表 `notifications`**：

| 列名 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | 用户ID |
| title | text | 通知标题 |
| message | text | 通知内容 |
| type | text | 类型：order / system / promo |
| read | boolean | 是否已读，默认 false |
| related_order_id | uuid | 关联订单ID（可空） |
| created_at | timestamptz | 创建时间 |

- RLS：用户只能读取和更新自己的通知
- 启用 Realtime：`ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;`

**数据库触发器 `on_order_created`**：
- 当 orders 表插入新记录时，自动在 notifications 表创建对应通知
- 通知内容包含订单类型、币种、金额等信息

**前端实现**：
- 创建 `useNotifications` Hook
  - 查询未读通知数量
  - 订阅 Realtime 变更，新通知到达时自动更新
  - 提供标记已读、全部已读功能
- 创建 `NotificationPanel` 组件（Popover 弹窗）
  - 显示通知列表（按时间倒序）
  - 点击通知可跳转到对应订单
  - 未读数量显示在铃铛图标上
- 更新 `TopNav.tsx` 集成通知面板

**新建文件**：
- `src/hooks/useNotifications.ts`
- `src/components/NotificationPanel.tsx`

**修改文件**：
- `src/components/TopNav.tsx`

---

### 实施顺序

1. 创建数据库迁移（supported_coins 表 + notifications 表 + 订单通知触发器 + Realtime）
2. 修改 ChainInfo 接口和创建 ChainIcon 组件
3. 修改 useCryptoData 从数据库读取支持的币种
4. 首页 Hero Banner 条件显示 + 实时刷新频率调整
5. 创建 useUserBalance Hook 并在交易页面加余额检查
6. 实现通知系统（useNotifications + NotificationPanel + TopNav 集成）

