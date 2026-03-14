

# 为买币、借贷、资产页面添加订单分页

卖出页面已有分页实现，其他三个页面需要采用相同模式。

## 变更概览

| 文件 | 变更 |
|------|------|
| `src/pages/BuyFormPage.tsx` | 添加 `page`/`totalCount` state，查询改用 `.range()` + `count: "exact"`，HistorySection 底部加分页按钮 |
| `src/pages/LendingFormPage.tsx` | 同上模式，添加分页 state 和 UI |
| `src/pages/AssetsPage.tsx` | 同上模式，服务端分页替换 `limit(50)`，底部加分页按钮 |

## 统一模式（参考 SellFormPage 现有实现）

每个页面：
1. 新增 `PAGE_SIZE = 10` 常量、`page` state（默认 0）、`totalCount` state
2. 查询改为 `select("...", { count: "exact" }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)`
3. `useEffect` 依赖加入 `page`
4. 历史列表底部添加 上一页/下一页 按钮 + 页码显示（与 SellFormPage 第 224-246 行相同 UI）
5. 导入 `ChevronLeft, ChevronRight`

### AssetsPage 特殊处理
- 当前使用 `orderFilter` 做客户端过滤，改为服务端过滤：当 filter 不是 `all` 时加 `.eq("type", orderFilter)`
- `orderFilter` 变化时重置 `page = 0`
- 移除客户端 `filteredOrders`，直接用 `orders` 渲染

