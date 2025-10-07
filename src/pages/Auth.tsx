import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Apple, Chrome } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { authSchema } from "@/lib/validations";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Separator } from "@/components/ui/separator";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [emailOrPhone, setEmailOrPhone] = useState("");
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

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${redirectUrl || '/'}`,
      }
    });
    
    if (error) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAppleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}${redirectUrl || '/'}`,
      }
    });
    
    if (error) {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Determine if input is email or phone
        const isEmail = emailOrPhone.includes('@');
        
        if (isEmail) {
          // Login with email
          const { error } = await signIn(emailOrPhone, password, redirectUrl || undefined);
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
          // Login with phone - find user by phone in profiles
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('phone', emailOrPhone)
            .single();
          
          if (profileError || !profileData) {
            toast({
              title: "خطأ في تسجيل الدخول",
              description: "رقم الهاتف غير مسجل",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }

          // Get user email from auth
          const { data: userData } = await supabase.auth.admin.getUserById(profileData.id);
          
          if (userData?.user?.email) {
            const { error } = await signIn(userData.user.email, password, redirectUrl || undefined);
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
          }
        }
      } else {
        // Sign up - email is required in signup
        const validationData = { email: emailOrPhone, password, fullName, phone };
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

        const { error } = await signUp(
          validationResult.data.email, 
          validationResult.data.password, 
          validationResult.data.fullName || '', 
          validationResult.data.phone || '',
          redirectUrl || undefined
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
          if (!redirectUrl) {
            setIsLogin(true);
          }
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
          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-sm">الاسم الكامل</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    placeholder="أدخل اسمك الكامل"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm">رقم الجوال</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required={!isLogin}
                    placeholder="+966 5XX XXX XXX"
                    className="h-10"
                  />
                </div>
              </>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="emailOrPhone" className="text-sm">
                {isLogin ? "البريد الإلكتروني أو رقم الجوال" : "البريد الإلكتروني"}
              </Label>
              <Input
                id="emailOrPhone"
                type={isLogin ? "text" : "email"}
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                required
                placeholder={isLogin ? "example@email.com أو +966XXXXXXXXX" : "example@email.com"}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
                className="h-10"
              />
            </div>
            <Button
              type="submit"
              className="w-full btn-luxury h-11"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" /> : (isLogin ? "تسجيل الدخول" : "إنشاء حساب")}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  أو
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="h-11"
              >
                <Chrome className="w-5 h-5 ml-2" />
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleAppleSignIn}
                disabled={loading}
                className="h-11"
              >
                <Apple className="w-5 h-5 ml-2" />
                Apple
              </Button>
            </div>
          </div>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                navigate(isLogin ? '/auth?mode=signup' : '/auth?mode=login');
              }}
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
