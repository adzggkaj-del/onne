

# 三处修改计划

## 1. Hero Banner 登录后也显示

**文件**: `src/pages/Index.tsx`

当前第25行 `{!user && (` 条件导致登录后隐藏。只需移除这个条件判断，让 Hero Banner 始终显示。

## 2. 底部合作伙伴 → 全局 Footer 组件

**文件**: 
- 新建 `src/components/Footer.tsx`
- 修改 `src/pages/Index.tsx`（删除 Partners section）
- 修改 `src/components/Layout.tsx`（在 `<Outlet />` 下方引入 Footer）

Footer 内容：
- 合作伙伴 Logo 区（每个 logo 下方加名字文字标签）
- 备案信息区：公司名称、营业执照号、版权声明、联系方式等典型韩国交易所页脚信息
- 分隔线 + "© 2024 CryptoX. All rights reserved." 等

Footer 放在 Layout 的 `<main>` 内部、`<Outlet />` 之后，这样所有页面都能滚动到底部看到。

## 3. 表单页面价格锁定（防止填写时价格跳动）

**文件**: `src/pages/BuyFormPage.tsx`, `src/pages/SellFormPage.tsx`, `src/pages/LendingFormPage.tsx`

**策略**: 在三个表单页面中，当用户开始填写表单（选择了币种且输入了数量或金额）时，**锁定价格快照**，不再跟随 `useCryptoData()` 的实时波动更新。

具体实现：
- 添加 `lockedCoin` state（`CoinData | null`）
- 当用户首次输入数量/金额时，将当前 coin 数据快照存入 `lockedCoin`
- 后续所有价格计算使用 `lockedCoin` 而非实时 `coins` 数据
- 切换币种或重置表单时清除锁定

这样用户在填写过程中看到的价格保持稳定，不会因为实时行情波动导致表单数据不一致。

