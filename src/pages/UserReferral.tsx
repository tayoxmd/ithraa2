import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Share2, Copy, Users, DollarSign } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface ReferredUser {
  id: string;
  full_name: string;
  created_at: string;
  total_bookings: number;
  commission_earned: number;
}

export default function UserReferral() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [totalCommission, setTotalCommission] = useState(0);
  const [totalReferred, setTotalReferred] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchReferralData();
  }, [user]);

  const fetchReferralData = async () => {
    try {
      setLoading(true);

      // Get user's referral code
      const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", user?.id)
        .single();

      if (profile?.referral_code) {
        setReferralCode(profile.referral_code);
        setReferralLink(`${window.location.origin}/auth?ref=${profile.referral_code}`);
      }

      // Get referred users
      const { data: referrals } = await supabase
        .from("referrals")
        .select(`
          id,
          referred_user_id,
          total_bookings,
          commission_earned,
          profiles!referrals_referred_user_id_fkey(full_name, created_at)
        `)
        .eq("referrer_user_id", user?.id);

      if (referrals) {
        const users = referrals.map(r => ({
          id: r.referred_user_id,
          full_name: (r.profiles as any)?.full_name || t({ ar: "غير معروف", en: "Unknown" }),
          created_at: (r.profiles as any)?.created_at || "",
          total_bookings: r.total_bookings,
          commission_earned: r.commission_earned,
        }));
        
        setReferredUsers(users);
        setTotalReferred(users.length);
        setTotalCommission(referrals.reduce((sum, r) => sum + (r.commission_earned || 0), 0));
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: t({ ar: "حدث خطأ في تحميل البيانات", en: "Error loading data" }),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: t({ ar: "تم النسخ", en: "Copied" }),
      description: t({ ar: "تم نسخ رابط الإحالة", en: "Referral link copied" }),
    });
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t({ ar: "رابط الإحالة", en: "Referral Link" }),
          text: t({ ar: "سجل الآن واحصل على خصومات", en: "Sign up now and get discounts" }),
          url: referralLink,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          ← {t({ ar: "رجوع", en: "Back" })}
        </Button>

        <div className="grid gap-6">
          {/* Summary Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t({ ar: "المستخدمون المحالون", en: "Referred Users" })}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalReferred}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t({ ar: "إجمالي العمولة", en: "Total Commission" })}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCommission.toFixed(2)} {t({ ar: "ريال", en: "SAR" })}</div>
              </CardContent>
            </Card>
          </div>

          {/* Referral Link Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t({ ar: "رابط الإحالة الخاص بك", en: "Your Referral Link" })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input value={referralLink} readOnly />
                <Button onClick={copyToClipboard} variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button onClick={shareLink} variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {t({ 
                  ar: "شارك هذا الرابط مع أصدقائك واحصل على عمولة عند قيامهم بالحجز", 
                  en: "Share this link with your friends and earn commission when they book" 
                })}
              </p>
            </CardContent>
          </Card>

          {/* Referred Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t({ ar: "المستخدمون المحالون", en: "Referred Users" })}</CardTitle>
            </CardHeader>
            <CardContent>
              {referredUsers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {t({ ar: "لا توجد إحالات بعد", en: "No referrals yet" })}
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t({ ar: "الاسم", en: "Name" })}</TableHead>
                      <TableHead>{t({ ar: "تاريخ التسجيل", en: "Registration Date" })}</TableHead>
                      <TableHead>{t({ ar: "عدد الحجوزات", en: "Bookings" })}</TableHead>
                      <TableHead>{t({ ar: "العمولة", en: "Commission" })}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.full_name}</TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString('ar-SA')}
                        </TableCell>
                        <TableCell>{user.total_bookings}</TableCell>
                        <TableCell>{user.commission_earned.toFixed(2)} {t({ ar: "ريال", en: "SAR" })}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
