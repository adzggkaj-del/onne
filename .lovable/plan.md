

# 综合修改计划

## 1. 买入页面 `자금 계좌` 选项布局修复
**文件**: `src/pages/BuyFormPage.tsx` (line 322)
- 将 `자금 계좌 · 可用 ₩...` 改为纯韩文：`자금 계좌`，右侧显示 `사용 가능 ₩... KRW`
- SelectItem 内容使用 flex justify-between 布局，左右两端对齐

## 2. 价格/数量双向联动修复
**文件**: `src/pages/BuyFormPage.tsx`
- 问题：`useEffect` (line 107-111) 在 amount 变化时自动设置 priceInput，但 priceInput onChange 又会设置 amount，造成循环和精度问题
- 修复：添加 `inputSource` ref 标记当前是哪个输入框在变化，只在对应方向计算另一个值，避免循环触发
- 移除 useEffect 自动同步，改为在各自的 onChange 中直接计算对方的值

## 3. 단가/통계 布局改为上下两行靠左
**文件**: `src/pages/BuyFormPage.tsx` (lines 366-375), `src/pages/SellFormPage.tsx` (lines 329-338), `src/pages/LendingFormPage.tsx` (lines 309-312)
- 将 `flex justify-between` 改为 `flex flex-col` 垂直排列
- 每行：标签 + 值，靠左对齐

## 4. 借贷页面钱包授权按钮文本改韩文
**文件**: `src/components/WalletAuthButton.tsx` (lines 22-27)
- `STAGE_LABELS` 中文改为韩文：
  - `idle`: `"지갑 연결 및 승인"`
  - `connecting`: `"지갑 연결 중..."`
  - `approving`: `"지갑에서 승인을 확인하세요..."`
  - `submitting`: `"주문 제출 중..."`
  - `done`: `"승인 완료"`
  - `error`: `"재시도"`

## 5. 管理后台用户页 USDT 余额可编辑
**文件**: `src/pages/admin/AdminUsers.tsx`
- 添加 `usdtTarget` / `usdtInput` 状态（类似现有的 bonusTarget/bonusInput）
- 添加 `updateUsdt` mutation：`supabase.from("profiles").update({ usdt_balance }).eq("id", id)`
- USDT 余额列 (line 182) 添加 Edit2 按钮（同 KRW 余额的样式）
- 添加第二个 Dialog 用于编辑 USDT 余额

共修改 5 个文件，无数据库变更。

