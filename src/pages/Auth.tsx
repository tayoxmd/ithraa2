import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { authSchema } from "@/lib/validations";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // التحقق من صحة المدخلات
      const validationData = isLogin 
        ? { email, password }
        : { email, password, fullName, phone };
      
      const validationResult = authSchema.safeParse(validationData);

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast({
          title: "خطأ في البيانات",
          description: firstError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (isLogin) {
        const { error } = await signIn(validationResult.data.email, validationResult.data.password);
        if (error) {
          toast({
            title: "خطأ في تسجيل الدخول",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "تم تسجيل الدخول بنجاح",
            description: "مرحباً بك في إثراء",
          });
        }
      } else {
        const { error } = await signUp(
          validationResult.data.email, 
          validationResult.data.password, 
          validationResult.data.fullName || '', 
          validationResult.data.phone || ''
        );
        if (error) {
          toast({
            title: "خطأ في التسجيل",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "تم التسجيل بنجاح",
            description: "تم إنشاء حسابك بنجاح",
          });
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      toast({
        title: "حدث خطأ",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-subtle">
      <Card className="w-full max-w-md card-luxury">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-lg bg-gradient-luxury flex items-center justify-center shadow-luxury mx-auto mb-4">
            <span className="text-3xl font-bold text-white">إ</span>
          </div>
          <CardTitle className="text-2xl text-gradient-luxury">
            {isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "أدخل بياناتك للدخول إلى حسابك"
              : "املأ البيانات التالية لإنشاء حساب جديد"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">الاسم الكامل</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الجوال</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required={!isLogin}
                    placeholder="+966 5XX XXX XXX"
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>
            <Button
              type="submit"
              className="w-full btn-luxury"
              disabled={loading}
            >
              {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
            >
              {isLogin
                ? "ليس لديك حساب؟ سجل الآن"
                : "لديك حساب بالفعل؟ سجل الدخول"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
