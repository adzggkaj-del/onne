import { Outlet } from "react-router-dom";
import TopNav from "./TopNav";
import AppSidebar from "./AppSidebar";
import MobileTabBar from "./MobileTabBar";

const Layout = () => {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar />
      <div className="flex flex-1 flex-col min-w-0 h-screen">
        <TopNav />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
};

export default Layout;
