

# 综合修改计划

## 1. 删除顶部搜索框
**文件**: `src/components/TopNav.tsx`
- 删除 lines 29-36 的搜索框区域，保留空 div 或直接移除

## 2. 提现弹窗改为两步选择（类似充值弹窗）
**文件**: `src/components/assets/WithdrawDialog.tsx`
- 添加 `step` 状态：`"method"` | `"detail"`
- 第一步：RadioGroup 选择"韩元提现"或"USDT提现"
- **韩元提现**：显示表单（姓名、银行名称、银行卡号），提交后创建 `type: "withdraw"` 订单，`coin_symbol: "KRW"`，银行信息存入 `bank_name`, `account_number`, `account_holder`
- **USDT提现**：保持现有逻辑（选币、选网络、地址、数量、钱包授权）

## 3. 新增 7 个币种到数据库
通过数据库 INSERT 工具添加到 `supported_coins` 表：

| coin_id | symbol | name_kr | chain | icon | sort_order |
|---------|--------|---------|-------|------|------------|
| dogecoin | DOGE | 도지코인 | ethereum | 🐕 | 9 |
| usd-coin | USDC | 유에스디씨 | ethereum | 💲 | 10 |
| bitcoin-cash | BCH | 비트코인캐시 | ethereum | Ƀ | 11 |
| cardano | ADA | 카르다노 | ethereum | ♦ | 12 |
| litecoin | LTC | 라이트코인 | ethereum | Ł | 13 |
| ethereum-classic | ETC | 이더리움 클래식 | ethereum | ⟠ | 14 |
| monero | XMR | 모네로 | ethereum | ⊗ | 15 |

同时更新：
- `src/lib/cryptoData.ts` — `BINANCE_SYMBOL_MAP` 添加新币种映射，`mockCoins` 添加 fallback 数据
- `src/hooks/useCryptoData.ts` — 无需修改（已从 DB 动态加载）

## 4. 订单类型扩展
现有 `orders.type` 支持 `buy/sell/lending`。韩元提现将使用 `type: "withdraw"`，`coin_symbol: "KRW"`。

**文件**: `src/pages/AssetsPage.tsx` — 订单列表中处理 `withdraw` 类型显示

## 技术要点
- 韩元提现表单使用已有的 `bank_name`, `account_number`, `account_holder` 字段（orders 表已有）
- 新币种通过 INSERT 工具添加，无需 schema 迁移
- Binance 映射：DOGEUSDT, USDCUSDT（固定1），BCHUSDT, ADAUSDT, LTCUSDT, ETCUSDT, XMRUSDT

