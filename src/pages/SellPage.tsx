import { Tag } from "lucide-react";

const SellPage = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary mb-4">
      <Tag className="h-8 w-8 text-primary-foreground" />
    </div>
    <h1 className="text-2xl font-bold mb-2">코인 판매</h1>
    <p className="text-muted-foreground text-center">보유한 암호화폐를 판매하세요</p>
  </div>
);

export default SellPage;
