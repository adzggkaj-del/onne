const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/50 mt-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-3 text-center">
        <p className="text-xs text-muted-foreground leading-relaxed">
          상호명: CryptoX Co., Ltd. | 대표: 최병준 | 고객센터: 24/7 온라인 지원  
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          주소: 서울특별시 강남구 테헤란로77길 11-10 삼성타워 10층 (06035) | 사업자 등록번호: 365-88-02145
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
           가상자산 사업자 신고번호: 2023-08 | 통신판매업 신고번호: 제2006-서울강남-0692호
        </p>
        <p className="text-[11px] text-muted-foreground/60 pt-2">
          © 2018-2026 CryptoX. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
