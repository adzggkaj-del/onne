

# 添加 USDT 欢迎奖励横幅

## 方案

在 Hero Banner 和 Scrolling Transactions 之间插入一个促销横幅，参照截图效果：左侧显示文字"회원가입 즉시 **300 USDT** 환영 보상 받기"（300 USDT 用绿色高亮），右侧显示上传的礼盒图片。

### 实现步骤

1. **复制图片资源**：将 `user-uploads://photo_2026-03-06_12-13-08.jpg`（礼盒图片）复制到 `src/assets/usdt-gift.jpg`。

2. **修改 `src/pages/Index.tsx`**：
   - Import 礼盒图片
   - 在 Hero Banner（第 46 行）和 Scrolling Transactions（第 48 行）之间插入横幅组件
   - 横幅使用 `rounded-2xl` 深色背景卡片，`flex` 布局
   - 移动端：文字在上、图片在下（`flex-col`）；PC 端：文字左、图片右（`md:flex-row`）
   - "300 USDT" 文字使用 `text-green-400 font-bold` 高亮
   - 图片宽度移动端 `w-32`，PC 端 `md:w-48`，居中显示

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/assets/usdt-gift.jpg` | 新建 | 复制礼盒图片 |
| `src/pages/Index.tsx` | 修改 | 在 Hero 和交易现况之间插入促销横幅 |

