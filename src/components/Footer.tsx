const partners = [
  { name: "Visa", url: "https://primexbt.com/_next/static/media/Visa.937c0a5f.svg" },
  { name: "Mastercard", url: "https://primexbt.com/_next/static/media/Mastercard.7b1f0d2d.svg" },
  { name: "Skrill", url: "https://primexbt.com/_next/static/media/SkrillLogo.eec3e8fc.svg" },
  { name: "Standard Bank", url: "https://primexbt.com/_next/static/media/StandardBankOfSouthAfricaLogo.1fd5dabf.svg" },
  { name: "Neteller", url: "https://primexbt.com/_next/static/media/Neteller.14f4589d.svg" },
  { name: "Binance Pay", url: "https://primexbt.com/_next/static/media/BinancePay.13985e69.svg" },
];

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/50 mt-8">
      {/* Partners */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <h3 className="text-sm font-semibold text-muted-foreground text-center mb-6">파트너</h3>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {partners.map((partner) => (
            <div key={partner.name} className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center h-12 w-12 md:h-16 md:w-16 rounded-full bg-white shadow-sm">
                <img src={partner.url} alt={partner.name} className="h-5 md:h-7 w-auto object-contain" />
              </div>
              <span className="text-[10px] md:text-xs text-muted-foreground">{partner.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border/30" />

      {/* Company info */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-3 text-center">
        <p className="text-xs text-muted-foreground leading-relaxed">
          상호명: CryptoX Co., Ltd. | 대표: 홍길동 | 사업자등록번호: 123-45-67890
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          주소: 서울특별시 강남구 테헤란로 123, 크립토타워 15층 | 고객센터: 1588-0000
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          가상자산 사업자 신고번호: 2024-서울강남-0001 | 통신판매업 신고번호: 제2024-서울강남-12345호
        </p>
        <p className="text-[11px] text-muted-foreground/60 pt-2">
          © {new Date().getFullYear()} CryptoX. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
