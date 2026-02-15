

## 需求整理与实施计划

### 概述

本次修改涉及5个核心变更：买卖页面改为"行情列表+内联按钮"模式、价格差异化显示、行情刷新频率提升、首页简化及滚动虚拟交易通知、按钮颜色优化。

---

### 1. 买币页面重构 (`src/pages/BuyPage.tsx`)

**当前**：多步流程（选链 → 选币 → 数量 → 地址 → 确认）
**改为**：页面顶部展示所有币种行情列表，每个币种价格 = 市场价 x 0.99（低于行情1%），每行末尾显示"购买"按钮。

点击"购买"后进入弹窗/内联流程：
- Step 1: 选择链
- Step 2: 输入购买数量
- Step 3: 填写收币地址
- Step 4: 确认并提交

使用 Dialog 或 Drawer 承载购买流程，币种已在列表中选定无需再选。

---

### 2. 卖币页面重构 (`src/pages/SellPage.tsx`)

**当前**：多步流程（选链 → 选币 → 数量 → 充币地址 → 银行信息 → 确认）
**改为**：页面顶部展示所有币种行情列表，每个币种价格 = 市场价 x 1.01（高于行情1%），每行末尾显示"卖出"按钮。

点击"卖出"后进入弹窗流程：
- Step 1: 选择链
- Step 2: 输入卖出数量
- Step 3: 输入收款银行卡信息（银行名、账号、户名）
- Step 4: 显示平台充币钱包地址 + 二维码（使用 QR Code API 生成）
- Step 5: 确认卖出

---

### 3. 行情刷新频率 (`src/hooks/useCryptoData.ts`)

将 `refetchInterval` 从 10000ms 改为 1000ms（每秒刷新一次），`staleTime` 相应调整为 800ms。

---

### 4. 首页改造 (`src/pages/Index.tsx`)

**币种行情列表**：移除点击交互和"거래"按钮，仅做纯展示。移除 Drawer 交易弹窗相关代码。

**新闻公告板块替换为滚动虚拟交易通知**：
- 移除 `news` 数组和新闻卡片
- 生成虚拟交易数据数组，格式：`用户名 --- 钱包地址(中间星号隐藏) --- 购买/卖出 X.XX BTC`
- 使用 CSS 动画实现垂直无限滚动效果
- 示例数据：
  - `김민수 --- 0x7a25****488D --- 구매 0.52 BTC`
  - `이서연 --- TKzx****g2Ax --- 판매 150.00 TRX`
  - `박지훈 --- 5tzF****uAi9 --- 구매 3.20 ETH`

---

### 5. 按钮颜色优化

- 购买按钮：使用饱满的绿色 `bg-emerald-500 hover:bg-emerald-600`
- 卖出按钮：使用饱满的红色 `bg-red-500 hover:bg-red-600`
- 主操作按钮：使用更饱和的紫色渐变
- "다음"/"이전" 等导航按钮也适当增加色彩饱和度

---

### 技术细节

**修改文件**：
- `src/pages/BuyPage.tsx` — 重构为行情列表 + Dialog 购买流程
- `src/pages/SellPage.tsx` — 重构为行情列表 + Dialog 卖出流程（含QR码）
- `src/pages/Index.tsx` — 移除交易交互、替换新闻为滚动虚拟交易
- `src/hooks/useCryptoData.ts` — refetchInterval 改为 1000ms

**新增工具函数**（在 `src/lib/cryptoData.ts`）：
- `generateFakeTransactions()` — 生成虚拟交易信息数据

**QR码实现**：使用免费 API `https://api.qrserver.com/v1/create-qr-code/?data=ADDRESS&size=200x200` 生成二维码图片，无需额外依赖。

**价格差异化**：
- 买币页面：`coin.priceKrw * 0.99`
- 卖币页面：`coin.priceKrw * 1.01`
- 首页：原价显示（市场行情价）

