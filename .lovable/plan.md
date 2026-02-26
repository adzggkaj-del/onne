

# 首页添加合作伙伴 Logo

在首页底部（市场列表下方）新增一个"合作伙伴"展示区域，使用横向排列的 Logo 图片。

## 修改文件

**src/pages/Index.tsx**

在 "인기 코인" 市场列表 section 下方，新增一个合作伙伴 section：

- 标题："파트너" (合作伙伴)
- 6 个 Logo 横向排列，使用 `flex-wrap` 适配移动端
- Logo 以灰度显示（`grayscale opacity-60`），hover 时恢复彩色，增加高级感
- 各 Logo 使用 `<img>` 标签，直接引用提供的外部 SVG URL
- Logo 高度统一为 h-8（桌面端）/ h-6（移动端）

Logo URL 列表：
1. Visa
2. Mastercard
3. Skrill
4. Standard Bank
5. Neteller
6. Binance Pay

## 技术细节

- 不需要数据库变更
- 不需要新依赖
- 仅修改 `src/pages/Index.tsx` 一个文件，在 return 的 JSX 末尾（`</section>` 市场列表之后、`</div>` 之前）插入新 section
