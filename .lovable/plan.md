

# 添加 MetaMask + 修正钱包 Logo

## 变更

### `src/components/WalletSelectDialog.tsx`

1. **添加 MetaMask 钱包** — 放在 EVM 区域，点击行为与 WalletConnect 相同（打开 Web3Modal），因为 MetaMask 本身就在 Web3Modal 的钱包列表中
2. **替换 emoji 为真实 Logo** — 使用各钱包官方 CDN logo 图片替代 🔷🟦🟣 等 emoji：
   - TronLink: `https://cdn.tronlink.org/logo.png` 风格的官方图标
   - imToken: 官方 logo
   - TokenPocket: 官方 logo  
   - MetaMask: 官方狐狸 logo
   - WalletConnect: 官方蓝色 logo

使用 `<img>` 标签加载各钱包的官方 SVG/PNG logo（来自公共 CDN 或直接内联 SVG），并设置 `onError` 回退到文字首字母。

### 结构调整

EVM 区域从只有 WalletConnect 变为：
- MetaMask（调用 `onSelectWalletConnect`）
- WalletConnect（调用 `onSelectWalletConnect`）

两者最终都通过 Web3Modal 连接，但给用户明确的 MetaMask 入口。

