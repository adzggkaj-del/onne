const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/50 mt-8">
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
