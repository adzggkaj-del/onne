

# 取消邮箱验证，注册后直接登录

## 方案

1. **启用 auto-confirm**：通过 `configure-auth` 工具开启自动确认邮箱注册，用户注册后无需验证邮件即可直接登录。

2. **修改注册表单**：在 `AuthPage.tsx` 的注册表单中添加手机号字段，注册成功后自动跳转到首页（而非提示"请检查邮箱"）。

3. **数据库**：在 `profiles` 表中添加 `phone` 列存储手机号（可选）。

## 文件变更

| 文件 | 操作 | 说明 |
|------|------|------|
| Auth 配置 | 修改 | 开启 auto-confirm，跳过邮箱验证 |
| `src/pages/AuthPage.tsx` | 修改 | 添加手机号输入框；注册成功后直接登录跳转首页 |
| 数据库迁移 | 新建 | profiles 表添加 phone 列 |
| `src/hooks/useAuth.ts` | 修改 | signUp 时传递 phone 到 metadata |

