

# 修复方案

## 1. 构建错误修复
`src/components/assets/DepositDialog.tsx` 第 205 行：`class` → `className`

## 2. 购买页面余额不足时按钮优化
`src/pages/BuyFormPage.tsx` Step 2 中，选择银行卡(KRW)支付时：
- 按钮已有 `disabled={submitting || krwBalance < totalKrw}` 逻辑（正确）
- 将按钮文案从 "확인" 改为 **"잔액 부족"**，让用户更清楚知道为什么不能点击
- 添加余额不足的红色提示文字，显示当前余额和所需金额

| 文件 | 变更 |
|------|------|
| `src/components/assets/DepositDialog.tsx` | `class` → `className` |
| `src/pages/BuyFormPage.tsx` | 余额不足按钮文案改为"잔액 부족" + 添加不足提示 |

