import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, Coins, Settings, ShoppingCart, ArrowLeft, TrendingUp, TrendingDown, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "대시보드", end: true },
  { to: "/admin/users", icon: Users, label: "사용자" },
  { to: "/admin/coins", icon: Coins, label: "코인 관리" },
  { to: "/admin/orders/buy", icon: TrendingUp, label: "매수 주문" },
  { to: "/admin/orders/sell", icon: TrendingDown, label: "매도 주문" },
  { to: "/admin/orders/lending", icon: Landmark, label: "대출 주문" },
  { to: "/admin/settings", icon: Settings, label: "설정" },
];

const AdminLayout = () => {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="p-4 border-b border-sidebar-border">
          <h2 className="font-bold text-lg text-gradient">CryptoX Admin</h2>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-2 border-t border-sidebar-border">
          <NavLink to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            사이트로 돌아가기
          </NavLink>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col min-w-0 h-screen">
        <header className="md:hidden flex items-center gap-2 p-3 border-b border-border overflow-x-auto">
          <span className="font-bold text-sm text-gradient whitespace-nowrap mr-2">Admin</span>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                )
              }
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </NavLink>
          ))}
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
