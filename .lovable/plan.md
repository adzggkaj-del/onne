

# 卖出页面改造：收款方式选择 + 分页

## 变更文件

`src/pages/SellFormPage.tsx` — 单文件重构

## Step 1 改造

移除当前 Step 1 中的 QR 码/地址展示部分（第 339-362 行），Step 1 只保留：选币、选链、填数量、价格摘要、下一步按钮。

## Step 2 改造（参考 BuyFormPage 的 RadioGroup 模式）

在订单摘要表下方添加 RadioGroup 收款方式选择：

- `"bank"` — 银行卡收款：显示银行卡表单（예금주、은행명、계좌번호）
- `"crypto"` — 加密货币收款：显示 QR 码 + 平台入金地址 + 复制按钮

两种方式都通过 WalletAuthButton 提交：
- 银行卡方式：`canSubmit` 需银行卡信息填写完整
- 加密货币方式：无额外表单要求

新增 state：`const [paymentMethod, setPaymentMethod] = useState("bank")`

`canSubmit` 逻辑调整：银行卡方式需三个字段非空；加密货币方式始终可提交。

## 分页

- 新增 `page` state（默认 0），每页 10 条
- 新增 `totalCount` state
- 查询改用 `select("...", { count: "exact" })` + `.range(page * 10, (page + 1) * 10 - 1)`
- HistorySection 底部添加 上一页/下一页 按钮（使用 Button 组件）
- 显示 "第 X / Y 页"

## 新增 imports

- `RadioGroup, RadioGroupItem` from `@/components/ui/radio-group`

