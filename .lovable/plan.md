

## CryptoX 升级计划：真实Logo + 用户系统 + 订单数据库

### 1. 币种真实Logo显示

**问题**：当前所有币种使用文字符号（如 "₿"、"⟠"）显示，不够直观。

**方案**：
- CoinGecko API 的 `/coins/markets` 接口本身就返回 `image` 字段（币种Logo URL）
- 修改 `CoinData` 接口，新增 `image` 字段存储真实Logo URL
- 修改 `useCryptoData.ts`，从API响应中提取 `image` 字段
- 修改 `mockCoins` fallback 数据，使用静态Logo URL
- 创建一个 `CoinIcon` 组件，显示 `<img>` 标签，加载失败时 fallback 到文字符号
- 全局替换所有页面中显示币种图标的地方（Index、BuyPage、SellPage、LendingPage、AssetsPage）

**涉及文件**：
- `src/lib/cryptoData.ts` - CoinData 接口增加 image 字段，mockCoins 加默认Logo URL
- `src/hooks/useCryptoData.ts` - CoinGeckoMarket 接口增加 image 字段并映射
- `src/components/CoinIcon.tsx` - 新建，统一的币种图标组件
- 所有5个页面 - 替换文字图标为 CoinIcon 组件

### 2. 启用 Lovable Cloud + 用户认证

**方案**：启用 Lovable Cloud 后，配置 Supabase 认证系统。

**数据库表设计**：

**profiles 表**（用户资料）：
- `id` (uuid, PK, 关联 auth.users.id)
- `username` (text)
- `avatar_url` (text)
- `uid_display` (text) - 展示用的UID如 "CX-892741"
- `verified` (boolean, 默认 false)
- `created_at` (timestamptz)

**orders 表**（订单记录）：
- `id` (uuid, PK)
- `user_id` (uuid, 关联 auth.users.id, NOT NULL)
- `type` (text: 'buy' / 'sell' / 'lending')
- `coin_id` (text)
- `coin_symbol` (text)
- `amount` (numeric)
- `price_krw` (numeric)
- `total_krw` (numeric)
- `fee_krw` (numeric)
- `status` (text: '대기' / '처리 중' / '완료')
- `chain` (text)
- `wallet_address` (text, nullable)
- `bank_name` (text, nullable)
- `account_number` (text, nullable)
- `account_holder` (text, nullable)
- `created_at` (timestamptz)

**RLS 策略**：
- profiles: 用户只能读取和更新自己的资料
- orders: 用户只能读取和插入自己的订单

**触发器**：注册时自动创建 profile，生成随机 UID

### 3. 认证页面

**新建文件**：
- `src/pages/AuthPage.tsx` - 登录/注册页面（邮箱+密码，Tab 切换登录和注册）
- `src/hooks/useAuth.ts` - 认证状态 Hook（onAuthStateChange + getSession）
- `src/components/ProtectedRoute.tsx` - 路由保护组件

**路由变更**：
- `/auth` - 登录/注册页（未登录时可访问）
- 买卖/借贷/资产页需要登录才能访问
- 首页保持公开可访问
- TopNav 显示登录状态，已登录显示用户信息

### 4. 订单存储集成

**修改页面**：
- `BuyPage.tsx` - 确认购买时将订单写入 orders 表
- `SellPage.tsx` - 提交卖单时将订单写入 orders 表
- `LendingPage.tsx` - 确认借贷时将订单写入 orders 表
- `AssetsPage.tsx` - 从 orders 表读取用户历史订单，替换硬编码数据

### 技术实施顺序

1. 启用 Lovable Cloud
2. 创建数据库迁移（profiles 表 + orders 表 + RLS + 触发器）
3. 修改 CoinData 接口和 useCryptoData Hook 支持真实Logo
4. 创建 CoinIcon 组件并全局替换
5. 实现 useAuth Hook 和 AuthPage
6. 创建 ProtectedRoute 并更新路由
7. 更新 Buy/Sell/Lending 页面写入订单
8. 更新 Assets 页面读取真实订单数据
9. 更新 TopNav 显示登录状态

