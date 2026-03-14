

# 卖币页面银行卡收款提交按钮调整

## 变更文件
`src/pages/SellFormPage.tsx`

## 改动

Step 2 底部按钮区域（第 486-496 行）：

- **银行卡收款**：替换 `WalletAuthButton` 为普通 `Button`，文案"확인 제출"（确认提交），点击调用 `handleCreateOrder()`（无 txHash/walletFrom 参数），disabled 条件同 `!canSubmit`
- **加密货币收款**：保持现有 `WalletAuthButton` 不变

```tsx
{selectedChain && (
  paymentMethod === "bank" ? (
    <Button
      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12 font-semibold"
      disabled={!canSubmit || submitting}
      onClick={() => handleCreateOrder()}
    >
      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "확인 제출"}
    </Button>
  ) : (
    <WalletAuthButton ... />
  )
)}
```

