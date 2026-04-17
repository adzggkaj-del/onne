import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import AnimatedPage from "@/components/AnimatedPage";
import { Loader2, Eye, EyeOff } from "lucide-react";

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [secondaryPassword, setSecondaryPassword] = useState("");
  const [showSecondaryPassword, setShowSecondaryPassword] = useState(false);

  // Forgot password state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitting, setForgotSubmitting] = useState(false);

  // Redirect if already logged in
  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast({ title: "로그인 실패", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "로그인 성공" });
      navigate("/");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "비밀번호는 6자 이상이어야 합니다", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "비밀번호가 일치하지 않습니다", variant: "destructive" });
      return;
    }
    if (!/^\d{4}$/.test(secondaryPassword)) {
      toast({ title: "출금 비밀번호는 4자리 숫자여야 합니다", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await signUp(email, password, username, phone, secondaryPassword);
    setSubmitting(false);
    if (error) {
      toast({ title: "회원가입 실패", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "회원가입 완료" });
      navigate("/");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: window.location.origin,
    });
    setForgotSubmitting(false);
    if (error) {
      toast({ title: "오류", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "이메일 전송 완료", description: "비밀번호 재설정 링크를 확인해 주세요." });
      setForgotOpen(false);
      setForgotEmail("");
    }
  };

  return (
    <AnimatedPage>
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Card className="w-full max-w-md bg-card border-border/50">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-primary/20">
                <span className="text-lg font-bold text-primary-foreground">X</span>
              </div>
              <span className="text-2xl font-bold tracking-tight">
                Crypto<span className="text-gradient">X</span>
              </span>
            </div>
            <CardTitle className="text-lg"></CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="w-full bg-secondary mb-4">
                <TabsTrigger value="login" className="flex-1">로그인</TabsTrigger>
                <TabsTrigger value="signup" className="flex-1">회원가입</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">이메일</Label>
                    <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 bg-secondary border-border/50" required />
                  </div>
                  <div>
                    <Label className="text-muted-foreground">비밀번호</Label>
                    <div className="relative mt-1">
                      <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-secondary border-border/50 pr-10" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    로그인
                  </Button>
                  <button type="button" onClick={() => { setForgotEmail(email); setForgotOpen(true); }} className="w-full text-sm text-muted-foreground hover:text-primary transition-colors text-center">
                    비밀번호를 잊으셨나요?
                  </button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">사용자명</Label>
                    <Input placeholder="이름" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 bg-secondary border-border/50" />
                  </div>
                  <div>
                    <Label className="text-muted-foreground">이메일</Label>
                    <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 bg-secondary border-border/50" required />
                  </div>
                  <div>
                    <Label className="text-muted-foreground">비밀번호</Label>
                    <div className="relative mt-1">
                      <Input type={showPassword ? "text" : "password"} placeholder="6자 이상" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-secondary border-border/50 pr-10" required minLength={6} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">비밀번호 확인</Label>
                    <div className="relative mt-1">
                      <Input type={showConfirmPassword ? "text" : "password"} placeholder="비밀번호를 다시 입력하세요" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-secondary border-border/50 pr-10" required minLength={6} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">출금 비밀번호</Label>
                    <div className="relative mt-1">
                      <Input type={showSecondaryPassword ? "text" : "password"} placeholder="출금 비밀번호 (4자리 숫자)" value={secondaryPassword} onChange={(e) => setSecondaryPassword(e.target.value.replace(/\D/g, "").slice(0, 4))} className="bg-secondary border-border/50 pr-10" required inputMode="numeric" pattern="\d{4}" maxLength={4} />
                      <button type="button" onClick={() => setShowSecondaryPassword(!showSecondaryPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showSecondaryPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Input type="tel" placeholder="010-0000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 bg-secondary border-border/50" />
                  </div>
                  <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    회원가입
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="bg-card border-border/50">
          <DialogHeader>
            <DialogTitle>비밀번호 재설정</DialogTitle>
            <DialogDescription>가입한 이메일 주소를 입력하면 재설정 링크를 보내드립니다.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <Input type="email" placeholder="you@example.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="bg-secondary border-border/50" required />
            <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={forgotSubmitting}>
              {forgotSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              재설정 링크 전송
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  );
};

export default AuthPage;
