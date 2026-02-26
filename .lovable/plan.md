

# 借贷周期选择 + Tawk.to 客服集成

## 一、借贷周期与利率选择

### 现状
当前借贷页面的期限（30天）和日利率（0.1%）是由后台 `platform_settings` 统一配置的固定值，用户无法选择不同的借贷方案。

### 方案
在借贷表单的第二步（"大出设定"）中，新增借贷周期选择器，提供多个预设方案供用户选择。

**预设借贷方案（前端硬编码 + 后台可配置）：**

| 周期 | 总利率 | 说明 |
|------|--------|------|
| 7天 | 3% | 短期借贷 |
| 15天 | 5% | 中期借贷 |
| 30天 | 8% | 标准借贷 |
| 60天 | 12% | 长期借贷 |

### 需要新增的数据库表

创建 `lending_plans` 表存储借贷方案，管理员可在后台动态配置：

```text
lending_plans:
  id (uuid, PK)
  term_days (integer)       -- 借贷天数
  interest_rate (numeric)   -- 总利率，如 0.05 表示 5%
  label (text)              -- 显示名称，如 "15天 · 5%"
  enabled (boolean)         -- 是否启用
  sort_order (integer)      -- 排序
  created_at (timestamptz)
```

RLS: 所有人可读，管理员可增删改。

### 前端改动

**修改 `src/pages/LendingFormPage.tsx`：**
- 新增状态 `selectedPlan` 用于存储用户选择的借贷方案
- 在 step 1 中，大出比率滑块之前添加借贷周期选择卡片组
- 利息计算改为：`totalInterest = loanKrw * selectedPlan.interestRate`（总利率，非日利率）
- 订单保存时记录选择的期限天数

**新增 `src/hooks/useLendingPlans.ts`：**
- 从 `lending_plans` 表获取启用的借贷方案列表
- 按 `sort_order` 排序

### UI 设计

借贷周期选择器使用卡片网格样式（类似网络选择器），每个选项卡片显示：
- 天数（大字）
- 总利率（醒目颜色）
- 选中状态高亮

---

## 二、Tawk.to 客服集成

### 方案
Tawk.to 只需嵌入一段 JS 脚本即可工作，无需后端改动。

### 改动

**修改 `index.html`：**
- 在 `<body>` 结束标签前插入 Tawk.to 的嵌入脚本

**或者创建 `src/components/TawkToWidget.tsx`（推荐）：**
- 使用 `useEffect` 动态加载 Tawk.to 脚本
- 在 `Layout.tsx` 中引入该组件
- 优点：可控制何时加载（如仅登录后显示），且不污染 index.html

Tawk.to 脚本格式：
```text
var Tawk_API = Tawk_API || {};
var s1 = document.createElement("script");
s1.src = 'https://embed.tawk.to/{PROPERTY_ID}/{WIDGET_ID}';
document.head.appendChild(s1);
```

用户需要在 tawk.to 注册账号并获取 Property ID 和 Widget ID。我们将使用平台设置（`platform_settings` 表）存储这两个值，管理员可在后台配置。

---

## 技术细节 - 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| 数据库迁移 | 新建 | 创建 `lending_plans` 表并插入默认数据 |
| `src/hooks/useLendingPlans.ts` | 新建 | 获取借贷方案列表 |
| `src/pages/LendingFormPage.tsx` | 修改 | 添加周期选择器，更新利息计算逻辑 |
| `src/components/TawkToWidget.tsx` | 新建 | Tawk.to 客服聊天组件 |
| `src/components/Layout.tsx` | 修改 | 引入 TawkToWidget |
| `src/hooks/usePlatformSettings.ts` | 修改 | 添加 tawk_to_property_id 和 tawk_to_widget_id 默认值 |
| `src/pages/admin/AdminSettings.tsx` | 修改 | 添加 Tawk.to 配置和借贷方案管理入口 |

