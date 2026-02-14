import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import AnimatedPage from "@/components/AnimatedPage";
import { Loader2 } from "lucide-react";

const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);
    const { error } = await signUp(email, password, username);
    setSubmitting(false);
    if (error) {
      toast({ title: "회원가입 실패", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "회원가입 완료", description: "이메일을 확인해 주세요." });
    }
  };

  return (
    <AnimatedPage>
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Card className="w-full max-w-md bg-card border-border/50">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-primary/20">
                <span className="text-lg font-bold text-primary-foreground">C</span>
              </div>
              <span className="text-2xl font-bold tracking-tight">
                Crypto<span className="text-gradient">X</span>
              </span>
            </div>
            <CardTitle className="text-lg">계정에 로그인하세요</CardTitle>
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
                    <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 bg-secondary border-border/50" required />
                  </div>
                  <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    로그인
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">사용자명</Label>
                    <Input placeholder="닉네임" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 bg-secondary border-border/50" />
                  </div>
                  <div>
                    <Label className="text-muted-foreground">이메일</Label>
                    <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 bg-secondary border-border/50" required />
                  </div>
                  <div>
                    <Label className="text-muted-foreground">비밀번호</Label>
                    <Input type="password" placeholder="6자 이상" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 bg-secondary border-border/50" required minLength={6} />
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
    </AnimatedPage>
  );
};

export default AuthPage;
