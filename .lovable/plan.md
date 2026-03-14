

# 卖币页面流程调整

## 变更文件
`src/pages/SellFormPage.tsx`

## 新流程

**Step 1**：选币 → 选链 → 填数量 → 显示价格摘要 → **显示 QR 码和平台地址**（选链后即展示） → 下一步

**Step 2**：订单摘要表 → 收款方式 RadioGroup：
- 银行卡：显示银行卡表单（예금주/은행명/계좌번호）+ WalletAuthButton
- 加密货币：**不显示任何额外内容**，直接显示 WalletAuthButton 授权

## 具体改动

1. **Step 1（第 335-379 行区域）**：在数量/价格摘要和"下一步"按钮之间，插入 QR 码 + 地址 + 复制按钮（从当前 Step 2 第 460-481 行移过来），条件为 `platformAddress` 存在时显示

2. **Step 2（第 459-482 行）**：移除 crypto 方式下的 QR 码/地址展示块，加密货币选项下不再显示任何内容，WalletAuthButton 直接可用

