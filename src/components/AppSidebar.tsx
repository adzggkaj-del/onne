import { Home, ShoppingCart, Tag, Landmark, Wallet } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";

const navItems = [
  { title: "홈", url: "/", icon: Home },
  { title: "코인 구매", url: "/buy", icon: ShoppingCart },
  { title: "코인 판매", url: "/sell", icon: Tag },
  { title: "대출", url: "/lending", icon: Landmark },
  { title: "자산", url: "/assets", icon: Wallet },
];

const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-60 border-r border-border bg-sidebar h-screen shrink-0 sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-primary/20">
          <span className="text-base font-bold text-primary-foreground">C</span>
        </div>
        <span className="text-xl font-bold tracking-tight">
          Crypto<span className="text-gradient">X</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.url;
          return (
            <NavLink
              key={item.url}
              to={item.url}
              end
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? ""
                  : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
              }`}
              activeClassName="gradient-primary text-primary-foreground shadow-md shadow-primary/20"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>


    </aside>
  );
};

export default AppSidebar;
