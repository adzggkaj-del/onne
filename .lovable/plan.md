

# 重写个人资产页充值弹窗

## 方案

完全重写 `src/components/assets/DepositDialog.tsx`，分两步：

**第一步（截图1）— 充值方式选择：**
- 两个 RadioGroup 选项：
  - `원화입금` — 选中后下方显示灰色提示文字"请咨询客服"
  - `암호화폐입금` — 默认选中
- 底部"확인"确认按钮

**第二步 — 确认按钮逻辑：**
- 选择`암호화폐입금` → 关闭弹窗，`navigate('/buy')` 跳转到币种列表页（即截图2，已由 BuyFormPage 实现）
- 选择`원화입금` → toast 提示联系客服，不跳转

## 文件变更

| 文件 | 说明 |
|------|------|
| `src/components/assets/DepositDialog.tsx` | 完全重写：去掉链选择/QR/地址逻辑，改为充值方式 radio 选择 + 确认按钮 |

