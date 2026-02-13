import { Landmark } from "lucide-react";

const LendingPage = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary mb-4">
      <Landmark className="h-8 w-8 text-primary-foreground" />
    </div>
    <h1 className="text-2xl font-bold mb-2">대출</h1>
    <p className="text-muted-foreground text-center">암호화폐 담보 대출 서비스</p>
  </div>
);

export default LendingPage;
