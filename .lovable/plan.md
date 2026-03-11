

# 综合修改计划

## 1. 用户最后登录 IP 显示
**问题**: 管理后台用户管理页 IP 列始终显示 "-"。Supabase `auth.users` 表不直接暴露 `last_sign_in_ip`，但 Admin API 的 `listUsers` 返回的用户对象中包含此信息。
**方案**: 修改 Edge Function `get-user-emails` 同时返回用户的最后登录 IP（从 `auth.admin.listUsers` 获取），前端 AdminUsers 页读取并显示。

**文件**:
- `supabase/functions/get-user-emails/index.ts` — 返回 `{ id, email, last_sign_in_ip }` 数据（从 `u.user_metadata` 或 `u` 对象中获取 IP 信息，Supabase Admin API 返回的 user 对象中无直接 ip 字段，需检查 `u.last_sign_in_at` 等；实际方案：存储到 profiles 表的 `last_ip` 字段，通过触发器在每次登录时更新）

**修正方案**: 由于 Supabase Admin API `listUsers` 不直接返回 IP，需要：
1. 在 `profiles` 表添加 `last_ip text` 字段（migration）
2. 前端登录成功后通过第三方 API 获取 IP 并写入 profiles
3. AdminUsers 页面直接从 profiles 读取 `last_ip`

或更简单的方案：使用免费 IP 检测 API，登录时在客户端获取 IP 并更新到 profiles。

**修改文件**:
- DB migration: 添加 `last_ip` 字段到 `profiles`
- `src/hooks/useAuth.ts` — 登录成功后获取 IP 并更新 profile
- `src/pages/admin/AdminUsers.tsx` — 显示 `last_ip` 而非 "-"

## 2. 充值弹窗 UI 与提现弹窗保持一致
**文件**: `src/components/assets/DepositDialog.tsx`
- 使用 `ScrollArea` 包裹内容（与 WithdrawDialog 一致）
- `DialogContent` 使用 `max-w-lg max-h-[90vh] p-0 overflow-hidden` 样式
- 内部使用 `<div className="p-6 space-y-5">` 包裹
- 方法选择卡片使用带图标的 `label` + `RadioGroupItem` 样式（与提现一致：图标 + 标题 + 描述文本，带 border 高亮）
- 按钮使用 `gradient-primary` 样式

## 3. 买币使用余额购买时扣除余额
**文件**: `src/pages/BuyFormPage.tsx`
- 当 `paymentMethod === "krw"` 时（使用韩元余额），在 `handleCreateOrder` 中：
  - 检查 `krwBalance >= totalKrw`，不足时阻止
  - 扣除 `profile.bonus_krw`：`supabase.from("profiles").update({ bonus_krw: profile.bonus_krw - totalKrw }).eq("id", profile.id)`
  - 提交订单后刷新 profile 数据

## 4. 全项目中文清除
需要修改的文件及内容：

### `src/hooks/useWalletAuth.ts` — 全部中文错误消息改韩文
- `"请先安装 MetaMask..."` → `"MetaMask 또는 EVM 지갑 확장 프로그램을 설치해주세요"`
- `"您已取消网络切换..."` → `"네트워크 전환이 취소되었습니다. 다시 시도해주세요"`
- `"切换网络失败"` → `"네트워크 전환 실패"`
- `"请在钱包中手动添加..."` → `"지갑에서 네트워크를 직접 추가한 후 다시 시도해주세요"`
- `"平台收款地址未配置..."` → `"플랫폼 수신 주소가 설정되지 않았습니다. 고객센터에 문의해주세요"`
- `"您已取消授权..."` → `"승인이 취소되었습니다. 다시 시도해주세요"`
- `"授权失败"` → `"승인 실패"`
- TronLink 相关同样翻译
- `"Solana 网络暂不支持..."` → `"Solana 네트워크는 USDT 승인 모드를 지원하지 않습니다. 다른 네트워크를 선택해주세요"`

### `src/components/WalletSelectDialog.tsx` — 对话框标题和描述改韩文
- `"选择钱包"` → `"지갑 선택"`
- `"在钱包中打开"` → `"지갑 앱에서 열기"`
- `"安装钱包"` → `"지갑 설치"`
- 描述文字同样翻译

### `src/pages/admin/AdminUsers.tsx`
- `"⭐ 星表"` → `"⭐ 인증"`, `"星表"` → `"인증"`, `"普通"` → `"일반"`

### `src/pages/BuyFormPage.tsx`, `SellFormPage.tsx`, `LendingFormPage.tsx`
- `"충비"` → `"거래"` (all occurrences — 충비 is a typo/mistranslation)
- `"USDT 충비 기록"` → `"USDT 거래 기록"`
- `"충비 수량"` → `"거래 수량"`, `"충비 상태"` → `"거래 상태"`, `"충비 기록이 없습니다"` → `"거래 기록이 없습니다"`

### `src/pages/LendingFormPage.tsx`
- Line 153: `"충비"` → `"대출"`

## 수정 파일 요약
- `supabase/functions/get-user-emails/index.ts`
- `src/hooks/useAuth.ts`
- `src/hooks/useWalletAuth.ts`
- `src/components/WalletSelectDialog.tsx`
- `src/components/assets/DepositDialog.tsx`
- `src/pages/admin/AdminUsers.tsx`
- `src/pages/BuyFormPage.tsx`
- `src/pages/SellFormPage.tsx`
- `src/pages/LendingFormPage.tsx`
- DB migration: `profiles` 테이블에 `last_ip` 컬럼 추가

