import { ShoppingCart } from "lucide-react";

const BuyPage = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary mb-4">
      <ShoppingCart className="h-8 w-8 text-primary-foreground" />
    </div>
    <h1 className="text-2xl font-bold mb-2">코인 구매</h1>
    <p className="text-muted-foreground text-center">간편하게 암호화폐를 구매하세요</p>
  </div>
);

export default BuyPage;
