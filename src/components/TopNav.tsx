import { Search, Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
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

      {/* Search */}
      <div className="hidden md:flex relative max-w-md flex-1 mx-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="코인 검색..."
          className="pl-10 bg-secondary border-border/50 focus:border-primary/50"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
        </Button>
        
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
