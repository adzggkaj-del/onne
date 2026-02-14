

## 认证页面功能完善计划

### 1. 修复数据库触发器（关键问题）

`handle_new_user` 函数已存在但触发器未绑定，注册时 profile 不会自动创建。需要创建数据库迁移：

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. 已登录用户自动重定向

在 `AuthPage` 顶部添加判断：如果 `useAuth()` 返回已登录用户，使用 `<Navigate to="/" />` 自动跳转回首页。

### 3. 密码可见性切换

为登录和注册的密码输入框添加眼睛图标按钮（`Eye` / `EyeOff`），点击切换 `type="password"` 和 `type="text"`。

### 4. 忘记密码功能

- 在登录表单下方添加"비밀번호를 잊으셨나요?"链接
- 点击后显示一个简单的邮箱输入对话框
- 调用 `supabase.auth.resetPasswordForEmail()` 发送重置邮件

### 5. 注册成功后切换到登录Tab

注册成功后调用 `setTab("login")` 并清空表单，引导用户登录。

### 6. 确认密码字段

在注册表单中添加"비밀번호 확인"字段，提交前校验两次密码是否一致。

### 技术细节

**修改文件**：
- `supabase/migrations/` — 新建迁移文件，创建触发器
- `src/pages/AuthPage.tsx` — 添加以上所有UI功能

**不修改的文件**：
- `src/hooks/useAuth.ts` — 已有 `resetPasswordForEmail` 可通过 supabase 直接调用
- `supabase/config.toml`、`client.ts`、`types.ts` — 自动生成，不修改

