

# 充值/提现弹窗订单列表分页

## 变更文件

| 文件 | 变更 |
|------|------|
| `src/components/assets/DepositDialog.tsx` | 添加 `page`/`totalCount` state，查询改用 `.range()` + `count: "exact"`，列表底部加分页按钮 |
| `src/components/assets/WithdrawDialog.tsx` | 同上 |

## 统一模式

两个弹窗均采用相同分页逻辑：

1. 新增 `page`（默认 0）、`totalCount` state，`PAGE_SIZE = 10`
2. 查询从 `.limit(20)` 改为 `.select("...", { count: "exact" }).range(page * 10, (page + 1) * 10 - 1)`
3. `useEffect` 依赖加入 `page`
4. 弹窗关闭时 `handleClose` 重置 `page = 0`
5. 订单列表底部添加 上一页/下一页 按钮 + 页码显示
6. 导入 `ChevronLeft, ChevronRight`

