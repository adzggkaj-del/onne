

# 修复 Tawk.to 客服聊天窗口不显示的问题

## 问题原因

当前 `TawkToWidget` 组件存在以下问题：

1. **cleanup 过于激进**：组件卸载时移除了脚本标签并调用 `hideWidget()`，但 Tawk.to 内部全局状态（`$_Tawk.init = true`）不会被重置，导致脚本重新加载后跳过初始化
2. **React StrictMode 影响**：开发模式下 effect 会执行两次（mount-unmount-mount），cleanup 破坏了 Tawk 的状态
3. **SPA 路由问题**：`Layout` 组件在路由切换时可能重新挂载，每次 cleanup 都会破坏 Tawk

## 修复方案

修改 `src/components/TawkToWidget.tsx`：

- 移除 cleanup 中删除脚本和隐藏 widget 的逻辑（Tawk.to 脚本只需加载一次，加载后自行管理生命周期）
- 保留防重复加载的检查
- 使用 `window.Tawk_API` 的 `onLoad` 回调确保 widget 显示

## 需要修改的文件

| 文件 | 说明 |
|------|------|
| `src/components/TawkToWidget.tsx` | 简化脚本加载逻辑，移除破坏性的 cleanup |

## 技术细节

修改后的组件将：
- 检查脚本是否已加载（通过 DOM 或全局变量），避免重复加载
- 不在 cleanup 中移除脚本或隐藏 widget
- 初始化 `Tawk_API` 全局变量后再插入脚本

