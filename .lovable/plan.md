

# 资产页面余额卡片修改

当前两张卡片：
- 第一张"총 자산 잔액"显示所有持仓的韩币市值总和
- 第二张"플랫폼 보너스"显示 `bonus_krw`

需要改为：
- **第一张（韩币余额）**: 标题改为"KRW 잔액"，显示 `profile.bonus_krw`（即用户的韩币余额），副标题改为"한국 원화 잔액"
- **第二张（USDT余额）**: 标题改为"USDT 잔액"，显示 `profile.usdt_balance`，图标改为美元符号，副标题改为"테더 잔액"

## 修改文件

**`src/pages/AssetsPage.tsx`** (lines 118-147)

第一张卡片：
- 标签: `KRW 잔액`
- 值: `formatKRW(bonusKrw)`
- 副标题: `한국 원화 잔액`

第二张卡片：
- 标签: `USDT 잔액`
- 值: `${usdtBalance.toLocaleString()} USDT`（从 `profile?.usdt_balance ?? 0` 获取）
- 图标: 用 `Wallet` 或 `DollarSign` 替换 `Gift`
- 副标题: `테더 잔액`

只需修改这一个文件的余额卡片区域。

