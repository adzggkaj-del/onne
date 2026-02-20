
## 个人资产页面功能完善

### 当前问题诊断

| 功能 | 现状 | 问题 |
|------|------|------|
| 总资产余额 | 硬编码 `0` | `useUserBalance` 存在但未被连接到页面 |
| 平台赠金 | 硬编码 `150,000 KRW` | 数据库无对应字段，与真实数据完全脱节 |
| 充值按钮 | 点击无响应 | 无弹窗/无逻辑 |
| 提现按钮 | 点击无响应 | 无弹窗/无逻辑 |
| QR码按钮 | 点击无响应 | 无弹窗/无逻辑 |
| 余额计算逻辑 | `useUserBalance` 按完成订单聚合 | 逻辑正确但未接入 UI |

---

### 改进目标

```text
总资产价值 = Σ(持仓数量 × 当前市价)        ← 基于 useUserBalance + useCryptoData
平台赠金   = profiles.bonus_krw              ← 管理员可在后台用户管理中设置
充值弹窗   = 显示平台钱包地址 + QR码        ← 复用 SellFormPage 的 DEPOSIT_ADDRESSES
提现弹窗   = 用户填写提现申请信息           ← 生成提现申请订单
QR码弹窗   = 显示用户 UID 的收款二维码      ← 供其他用户转账时扫描
```

---

### 第一步：数据库 — 为 profiles 表新增 bonus_krw 字段

通过数据库迁移，在 `profiles` 表中添加：
- `bonus_krw numeric NOT NULL DEFAULT 0` — 平台赠金余额（单位：KRW），管理员可调整

---

### 第二步：修改 `src/pages/AssetsPage.tsx`

**2.1 接入真实余额计算**
- 引入 `useUserBalance` 和 `useCryptoData`
- 计算总资产价值：`Σ(coinBalances[coinId] × coins.find(coinId).priceKrw)`
- `총 자산 잔액` 卡片显示真实计算值，加载中显示骨架屏

**2.2 接入真实平台赠金**
- `useAuth` 中的 `profile` 已包含 profiles 表的所有字段
- `플랫폼 보너스` 读取 `profile.bonus_krw`（新增字段），格式化为 KRW

**2.3 持仓明细展示**
- 在余额卡片下方，若有持仓则新增"코인 보유 현황" 区块
- 每行显示：币种图标 + 名称 + 数量 + 折合 KRW 价值

**2.4 充值弹窗（충전）**
- 使用 Dialog 组件
- 步骤一：选择区块链（ethereum/bsc/tron/solana/polygon）
- 步骤二：显示对应充值地址 + 通过 `https://api.qrserver.com` 生成 QR 码图片
- 复制地址按钮 + 警告提示（只充相同链的资产）

**2.5 提现弹窗（출금）**
- 使用 Dialog 组件
- 填写：银行名称、账号、户名、提现金额
- 提交后插入一条 `type: "withdraw"` 的待处理工单（复用 orders 表，status 默认 `대기`）

**2.6 QR码弹窗（QR코드）**
- 显示当前用户的 `uid_display` + 邮箱的二维码
- 使用 `api.qrserver.com` 生成，方便其他用户扫码识别

**2.7 전환 按钮**
- 暂时显示"准备中"的 Toast，不做实际功能

---

### 第三步：修改 `src/pages/admin/AdminUsers.tsx`

在用户管理表格中新增：
- **赠金列**：显示当前 `bonus_krw` 值
- **编辑赠金**：点击后弹出输入框，管理员可以设置该用户的赠金金额
- 通过 `supabase.from("profiles").update({ bonus_krw })` 保存

---

### 第四步：修改 `src/hooks/useAuth.ts` — Profile 类型更新

在 `Profile` interface 中补充 `bonus_krw: number` 字段，确保类型安全。

---

### 文件变更清单

| 类型 | 文件 | 说明 |
|------|------|------|
| DB 迁移 | profiles 表 | 新增 `bonus_krw` 字段 |
| 修改 | `src/hooks/useAuth.ts` | Profile 接口补充 `bonus_krw` |
| 修改 | `src/pages/AssetsPage.tsx` | 接入真实余额、赠金、三个弹窗功能 |
| 修改 | `src/pages/admin/AdminUsers.tsx` | 增加赠金显示与编辑功能 |

---

### QR 码生成方案说明

项目未安装 qrcode 相关库，使用免费公共 API 生成：
```
https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=<内容>
```
不需要安装额外依赖，通过 `<img>` 标签直接渲染。

---

### 余额计算逻辑说明

`useUserBalance` 现有逻辑正确——仅聚合 `status = '완료'` 的订单：
- 买入：`coinBalance[coinId] += amount`
- 卖出：`coinBalance[coinId] -= amount`

总资产 KRW 折算：
```typescript
const totalKrw = Object.entries(coinBalances).reduce((sum, [coinId, qty]) => {
  const coin = coins.find(c => c.id === coinId);
  return sum + qty * (coin?.priceKrw ?? 0);
}, 0);
```

