

# 修改 Hero 标题换行与字号

将第 26-28 行的 `<h1>` 修改为：
- "안전하고 빠른" 在第一行
- "암호화폐 거래소" 在第二行，使用 `<br />` 换行，并用 `text-2xl md:text-4xl` 放大

```tsx
<h1 className="text-xl md:text-3xl font-bold mb-5 leading-tight">
  안전하고 빠른
  <br />
  <span className="text-gradient text-2xl md:text-4xl">암호화폐 거래소</span>
</h1>
```

| 文件 | 说明 |
|------|------|
| `src/pages/Index.tsx` | 第 26-28 行，标题换行并放大后半部分 |

