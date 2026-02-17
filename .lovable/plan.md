

## 交互页面独立化：币种列表页与交易表单页分离

### 概述

将买币、卖币、借贷三个页面中的"行情列表 + 内联表单"拆分为两个独立页面：
- **列表页**（`/buy`, `/sell`, `/lending`）：仅展示币种行情列表，点击按钮跳转到交易页
- **交易页**（`/buy/:coinId`, `/sell/:coinId`, `/lending/:coinId`）：独立页面完成所有交互步骤

这样未来币种增多时，列表页不会因为底部表单而影响体验。

---

### 修改内容

#### 1. 新建 3 个交易表单页面

- **`src/pages/BuyFormPage.tsx`**：接收 URL 参数 `coinId`，从 `useCryptoData` 中找到对应币种，展示完整的多步交易表单（选链 -> 数量 -> 收币地址 -> 确认），完成后可返回列表页
- **`src/pages/SellFormPage.tsx`**：同上，包含选链 -> 数量 -> 银行信息 -> 充币地址+QR码 -> 确认
- **`src/pages/LendingFormPage.tsx`**：同上，包含选链 -> 抵押比例滑块 -> 确认

每个页面顶部显示选中币种的信息卡片（图标、名称、当前价格），下方为步骤表单。

#### 2. 简化现有 3 个列表页

- **`src/pages/BuyPage.tsx`**：移除所有内联表单代码和相关 state，"购买"按钮改为 `navigate(`/buy/${coin.id}`)`
- **`src/pages/SellPage.tsx`**：同上，"卖出"按钮改为 `navigate(`/sell/${coin.id}`)`
- **`src/pages/LendingPage.tsx`**：同上，"대출"按钮改为 `navigate(`/lending/${coin.id}`)`

#### 3. 更新路由配置

在 `src/App.tsx` 中添加 3 条新路由：
```text
/buy/:coinId    -> BuyFormPage
/sell/:coinId   -> SellFormPage
/lending/:coinId -> LendingFormPage
```
均包裹在 `ProtectedRoute` 和 `Layout` 中。

---

### 技术细节

**文件变更清单**：
- 新建：`src/pages/BuyFormPage.tsx`
- 新建：`src/pages/SellFormPage.tsx`
- 新建：`src/pages/LendingFormPage.tsx`
- 修改：`src/pages/BuyPage.tsx` -- 移除表单，按钮改为路由跳转
- 修改：`src/pages/SellPage.tsx` -- 同上
- 修改：`src/pages/LendingPage.tsx` -- 同上
- 修改：`src/App.tsx` -- 添加 3 条动态路由

**路由参数获取**：使用 `useParams<{ coinId: string }>()` 从 URL 获取 `coinId`，再从 `useCryptoData()` 中匹配对应币种数据。

**导航方式**：
- 列表页点击按钮使用 `useNavigate()` 跳转
- 交易页"取消"/"返回"按钮使用 `navigate(-1)` 或 `navigate('/buy')` 返回列表
- 交易完成后提供"返回列表"按钮

**交易表单页面结构**：
```text
[返回按钮]
[币种信息卡片：图标 + 名称 + 当前价格]
[步骤指示器：Step 1/2/3/4]
[当前步骤表单内容]
[上一步/下一步 按钮]
```

