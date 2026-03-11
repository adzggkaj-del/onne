import { Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import NotificationPanel from "@/components/NotificationPanel";
import { useNavigate } from "react-router-dom";

const TopNav = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-4 md:px-6">
      {/* Logo - visible on mobile */}
      <div className="flex items-center gap-3 md:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
          <span className="text-sm font-bold text-primary-foreground">C</span>
        </div>
        <span className="text-lg font-bold tracking-tight">
          Crypto<span className="text-gradient">X</span>
        </span>
      </div>

      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <NotificationPanel />
        
        {user ? (
          <>
            <span className="hidden md:inline text-sm text-muted-foreground">
              {profile?.username || user.email?.split("@")[0]}
            </span>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">로그아웃</span>
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" className="hidden md:inline-flex text-muted-foreground hover:text-foreground" onClick={() => navigate("/auth")}>
              로그인
            </Button>
            <Button size="sm" className="gradient-primary text-primary-foreground hover:opacity-90 transition-opacity" onClick={() => navigate("/auth")}>
              <User className="h-4 w-4 mr-1" />
              <span className="hidden md:inline">회원가입</span>
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

export default TopNav;
