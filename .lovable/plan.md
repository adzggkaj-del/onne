

## 全面重构：Binance API + 内联表单 + 借贷行情列表

### 问题诊断

从网络请求日志可以看到，CoinGecko API 每秒请求都返回 "Failed to fetch"（速率限制），偶尔成功一次。这是行情不实时的根本原因。

---

### 1. 替换 CoinGecko 为 Binance API（客户端直连）

**文件**：`src/hooks/useCryptoData.ts`

- 移除 CoinGecko API 调用
- 改用 Binance 公开 API（无需 Key，速率限制 6000 req/min）：
  - `GET https://api.binance.com/api/v3/ticker/24hr` 获取 24h 价格变动
  - 使用 USDT 交易对（BTCUSDT、ETHUSDT 等），再乘以 KRW 汇率
- `refetchInterval` 设为 3000ms（每 3 秒从 Binance 获取真实数据）
- 添加客户端微波动逻辑：使用 `useState` + `useEffect` 创建 1 秒定时器，对缓存数据施加 +/-0.01%~0.05% 随机偏移，触发 PriceFlash 闪烁
- 在 `cryptoData.ts` 中添加 CoinGecko ID 到 Binance symbol 的映射表

**数据映射**：
| coin_id | Binance Symbol |
|---------|---------------|
| bitcoin | BTCUSDT |
| ethereum | ETHUSDT |
| binancecoin | BNBUSDT |
| solana | SOLUSDT |
| ripple | XRPUSDT |
| tron | TRXUSDT |
| matic-network | MATICUSDT |
| tether | 固定 1 USD |

---

### 2. 买币页面改为内联表单（`src/pages/BuyPage.tsx`）

移除 Dialog 组件，改为页面内两段式布局：

- **上半部分**：币种行情列表（价格 = 市场价 x 0.99），每行末尾"购买"按钮
- **下半部分**：点击"购买"后，在页面下方展开内联表单卡片
  - Step 1: 选择链（卡片网格）
  - Step 2: 输入购买数量 + 费用摘要
  - Step 3: 填写收币地址
  - Step 4: 确认信息并提交
  - "上一步/下一步"按钮在步骤间切换

---

### 3. 卖币页面改为内联表单（`src/pages/SellPage.tsx`）

同样移除 Dialog，改为页面内布局：

- **上半部分**：币种行情列表（价格 = 市场价 x 1.01），每行"卖出"按钮
- **下半部分**：内联表单
  - Step 1: 选择链
  - Step 2: 输入卖出数量 + 费用摘要
  - Step 3: 银行卡信息（银行名、账号、户名）
  - Step 4: 平台充币地址 + QR 码
  - Step 5: 确认并提交

---

### 4. 借贷页面增加行情列表 + 内联表单（`src/pages/LendingPage.tsx`）

重构为与买卖页面一致的风格：

- **上半部分**：币种行情列表（显示原价），每行"대출"按钮
- **下半部分**：点击后展开内联表单
  - Step 1: 选择链
  - Step 2: 大出比例滑块（10%-100%）+ 贷款摘要
  - Step 3: 确认提交

---

### 技术细节

**修改文件清单**：
- `src/hooks/useCryptoData.ts` -- Binance API + 微波动逻辑
- `src/lib/cryptoData.ts` -- 添加 Binance symbol 映射
- `src/pages/BuyPage.tsx` -- 内联表单重构
- `src/pages/SellPage.tsx` -- 内联表单重构
- `src/pages/LendingPage.tsx` -- 添加行情列表 + 内联表单重构

**客户端微波动实现**：
- `useCryptoData` 返回的数据每 3 秒从 Binance 更新
- 组件层面用 `useEffect` 每 1 秒 clone 数据并施加微小随机偏移
- 偏移范围：价格 +/-0.01%~0.05%
- 这样即使 Binance 数据 3 秒才更新，页面每秒都有价格跳动效果

**KRW 汇率**：先尝试从 Binance 获取 USDTKRW，失败则使用固定汇率 1380。

**Sparkline 数据**：Binance 不直接提供 sparkline，改用 mockCoins 中的 `generateSparkline` 函数以当前价格为基准生成 24 点模拟数据，每次 API 刷新时重新生成。

