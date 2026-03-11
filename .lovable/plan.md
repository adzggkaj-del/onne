

# 综合修改计划

涉及约 10 个文件修改 + 3 个新文件 + 1 次数据库迁移。

## 数据库迁移

给 `orders` 表添加借贷相关字段，给 `profiles` 表添加 USDT 余额字段：

```sql
ALTER TABLE public.orders ADD COLUMN term_days integer DEFAULT NULL;
ALTER TABLE public.orders ADD COLUMN repayment_date timestamp with time zone DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN usdt_balance numeric NOT NULL DEFAULT 300;
```

- `term_days` / `repayment_date`: 借贷订单专用，记录周期和还款日
- `usdt_balance`: 新用户默认 300 USDT

## 变更清单

### 1. Footer 删除 Logo 部分
**文件**: `src/components/Footer.tsx`
- 删除 `partners` 数组和整个合作伙伴渲染区域，只保留公司备案信息部分

### 2. 借贷页面历史记录增加字段
**文件**: `src/pages/LendingFormPage.tsx`
- `LendingOrder` 接口添加 `term_days`, `repayment_date`
- 查询时 select 增加这两个字段
- 创建订单时写入 `term_days` 和 `repayment_date`（`Date.now() + termDays * 86400000`）
- 历史记录每条显示：数量、周期（X日）、还款日期

### 3. 后台订单拆分为三个页面
**新文件**:
- `src/pages/admin/AdminBuyOrders.tsx` — 买入订单（type=buy）
- `src/pages/admin/AdminSellOrders.tsx` — 卖出订单（type=sell）
- `src/pages/admin/AdminLendingOrders.tsx` — 借贷订单（type=lending），额外显示 term_days 和 repayment_date 列

**修改文件**:
- `src/components/AdminLayout.tsx` — 导航中 "주문 관리" 拆分为三个子菜单项
- `src/App.tsx` — 添加三条新路由，移除旧 `/admin/orders`
- 删除或保留 `src/pages/admin/AdminOrders.tsx`（可保留但不再路由）

### 4. 后台看板添加今日访问统计
**文件**: `src/pages/admin/AdminDashboard.tsx`
- 添加"오늘 방문"统计卡片
- 由于没有真实访问统计表，使用 `profiles` 表中 `created_at` 为今天的用户数作为"오늘 가입"指标展示，或显示为模拟数据（可后续接入真实统计）

### 5. 后台用户页面增加字段
**文件**: `src/pages/admin/AdminUsers.tsx`
- Profile 接口添加 `phone`, `usdt_balance` 字段
- 通过 edge function 或 admin API 获取用户邮箱（auth.users 表无法直接从客户端查询）—— 使用 edge function `get-user-emails` 批量获取
- 表格新增列：邮箱、手机号、韩币余额（bonus_krw）、USDT余额（usdt_balance）、IP地址（显示为 "-"，因 IP 需要额外记录机制）

**新文件**: `supabase/functions/get-user-emails/index.ts` — 使用 service role key 从 `auth.users` 获取邮箱列表

### 6. 买入/卖出历史记录显示韩币总额
**文件**: `src/pages/BuyFormPage.tsx`, `src/pages/SellFormPage.tsx`
- HistorySection 表格增加 `총액(KRW)` 列，显示 `formatKRW(order.total_krw)`

### 7. 订单状态改为韩文显示
**文件**: `src/pages/BuyFormPage.tsx`, `src/pages/SellFormPage.tsx`
- `statusLabel` 函数改为韩文：완료→완료, 대기→대기, 거부→거부（当前是中文"已转入/待处理/已拒绝"，改回韩文）

### 8. 买入第二步添加二维码
**文件**: `src/pages/BuyFormPage.tsx`
- 在 step 2 的充币地址区域（line ~446-457），添加 QR 码图片（同卖出页面的实现方式）：
```tsx
const qrUrl = platformAddress 
  ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(platformAddress)}` 
  : "";
// 在地址显示区添加 <img src={qrUrl} .../>
```

### 9. 买入/卖出/借贷最后一步统一改为钱包授权
**文件**: `src/pages/BuyFormPage.tsx`, `src/pages/SellFormPage.tsx`, `src/pages/LendingFormPage.tsx`
- 移除 `isVerified` 条件判断，所有用户最后一步都显示 `WalletAuthButton`（钱包授权按钮）
- 不再区分普通用户和星标用户的按钮逻辑

## 技术要点

- Edge function 获取邮箱需要 `SUPABASE_SERVICE_ROLE_KEY`（已配置）
- IP 地址记录需要额外的登录时记录机制，暂时显示为 "-"
- 今日访问统计暂用今日注册数替代，可后续接入 analytics

