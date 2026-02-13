import { Home, ShoppingCart, Tag, Landmark, Wallet } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const tabs = [
  { title: "홈", url: "/", icon: Home },
  { title: "구매", url: "/buy", icon: ShoppingCart },
  { title: "판매", url: "/sell", icon: Tag },
  { title: "대출", url: "/lending", icon: Landmark },
  { title: "자산", url: "/assets", icon: Wallet },
];

const MobileTabBar = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-border bg-background/95 backdrop-blur-xl safe-area-bottom">
      {tabs.map((tab) => (
        <NavLink
          key={tab.url}
          to={tab.url}
          end={tab.url === "/"}
          className="flex flex-1 flex-col items-center gap-0.5 py-2 text-muted-foreground transition-colors"
          activeClassName="text-primary"
        >
          <tab.icon className="h-5 w-5" />
          <span className="text-[10px] font-medium">{tab.title}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileTabBar;
