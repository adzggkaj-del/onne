

## CryptoX 优化计划：动画、实时数据、滚动修复

### 1. 修复PC端滚动行为
**问题**：当前整个页面一起滚动，左侧菜单栏也跟着滚动。
**方案**：修改 `Layout.tsx`，让侧边栏固定（`sticky top-0 h-screen`），右侧内容区独立滚动（`overflow-y-auto h-screen`）。TopNav 也保持 sticky 在内容区顶部。

修改文件：`src/components/Layout.tsx`、`src/components/AppSidebar.tsx`

### 2. Framer-motion 页面切换动画
**方案**：创建一个 `AnimatedPage` 包装组件，使用 `framer-motion` 的 `motion.div` + `AnimatePresence`，为每个页面添加淡入+上滑效果。

- 创建 `src/components/AnimatedPage.tsx` 组件
- 在所有5个页面（Index、Buy、Sell、Lending、Assets）外层包裹该组件
- 动画参数：opacity 0->1 + translateY 12px->0，duration 0.3s

### 3. 价格变化红/绿闪烁高亮
**方案**：创建一个 `PriceFlash` 组件，当价格变化时短暂闪烁绿色（涨）或红色（跌）背景。

- 创建 `src/components/PriceFlash.tsx`
- 使用 `useEffect` 监听价格变化，触发CSS动画闪烁
- 在首页币种列表的价格显示处使用该组件

### 4. 接入 CoinGecko API 获取实时数据
**方案**：CoinGecko 提供免费公开 API（无需 API Key），直接从前端调用。

- 创建 `src/hooks/useCryptoData.ts` 自定义 Hook，使用 `@tanstack/react-query` 调用 CoinGecko API
- API端点：`https://api.coingecko.com/api/v3/coins/markets?vs_currency=krw&ids=bitcoin,ethereum,binancecoin,solana,ripple,tron,matic-network,tether&sparkline=true`
- 返回数据自动带 KRW 价格、24h 涨跌、sparkline 等
- 价格乘以 1.01 上浮逻辑保留
- 加载时显示 Skeleton 骨架屏
- 失败时 fallback 到现有 mockCoins 数据
- 更新所有引用 `mockCoins` 的页面使用新 Hook

### 技术细节

**修改文件清单**：
- `src/components/Layout.tsx` - 修复滚动结构
- `src/components/AppSidebar.tsx` - 侧边栏 sticky + h-screen
- `src/components/AnimatedPage.tsx` - 新建，页面过渡动画包装
- `src/components/PriceFlash.tsx` - 新建，价格闪烁组件
- `src/hooks/useCryptoData.ts` - 新建，CoinGecko 数据获取 Hook
- `src/lib/cryptoData.ts` - 添加 CoinGecko 数据映射函数，保留 mockCoins 作为 fallback
- `src/pages/Index.tsx` - 使用实时数据 + 动画 + 价格闪烁
- `src/pages/BuyPage.tsx` - 使用实时数据 + 页面动画
- `src/pages/SellPage.tsx` - 使用实时数据 + 页面动画
- `src/pages/LendingPage.tsx` - 使用实时数据 + 页面动画
- `src/pages/AssetsPage.tsx` - 页面动画

**CoinGecko API 数据映射**：
- `id` -> coin id
- `current_price` * 1.01 -> priceKrw（API 直接返回 KRW 价格）
- `current_price / krw_rate` * 1.01 -> priceUsd
- `price_change_percentage_24h` -> change24h
- `total_volume` -> volume24h
- `sparkline_in_7d.price` (取最后24个点) -> sparkline
- 自动刷新间隔：30秒

