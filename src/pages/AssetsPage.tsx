import { Wallet } from "lucide-react";

const AssetsPage = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary mb-4">
      <Wallet className="h-8 w-8 text-primary-foreground" />
    </div>
    <h1 className="text-2xl font-bold mb-2">내 자산</h1>
    <p className="text-muted-foreground text-center">자산 현황을 확인하세요</p>
  </div>
);

export default AssetsPage;
