import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, AlertCircle, Vault, Receipt, Settings, Users, Building2, Hotel, BedDouble } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PrivateAccounting() {
  const { t, language } = useLanguage();
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    profits: 0,
    debts: 0,
    claims: 0,
    vault: 0,
    expenses: 0
  });

  useEffect(() => {
    checkAccess();
    loadStats();
  }, [user]);

  const checkAccess = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if user has access
    const hasManagerRole = userRole === 'manager' || userRole === 'admin';
    
    if (hasManagerRole) {
      setHasAccess(true);
      setLoading(false);
      return;
    }

    // Check if user has been granted access
    const { data, error } = await supabase
      .from('private_account_access')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data && !error) {
      setHasAccess(true);
    } else {
      toast.error(t({ ar: 'ليس لديك صلاحية الوصول', en: 'You do not have access permission' }));
      navigate('/admin-dashboard');
    }
    setLoading(false);
  };

  const loadStats = async () => {
    try {
      // Load transactions
      const { data: transactions } = await supabase
        .from('private_transactions')
        .select('*');

      if (transactions) {
        const revenue = transactions
          .filter(t => t.transaction_type === 'revenue')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        const expenses = transactions
          .filter(t => t.transaction_type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const debts = transactions
          .filter(t => t.transaction_type === 'debt')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const claims = transactions
          .filter(t => t.transaction_type === 'claim')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        // Load vault amount
        const { data: vaultData } = await supabase
          .from('private_vault')
          .select('amount')
          .single();

        const vault = vaultData ? Number(vaultData.amount) : 0;

        setStats({
          total: revenue - expenses,
          profits: revenue - expenses - debts,
          debts,
          claims,
          vault,
          expenses
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">{t({ ar: 'جاري التحميل...', en: 'Loading...' })}</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <Card className="p-4 bg-gradient-to-br from-background to-accent/10 border-accent/20 hover:border-accent/40 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs">
            {trend > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={trend > 0 ? 'text-green-500' : 'text-red-500'}>
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl font-bold">
          {value.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
          <span className="text-sm text-muted-foreground mr-1">{t({ ar: 'ر.س', en: 'SAR' })}</span>
        </p>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin-dashboard')}
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {t({ ar: 'الحسابات الخاصة', en: 'Private Accounting' })}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t({ ar: 'إدارة حسابات الفنادق الخاصة', en: 'Manage private hotel accounts' })}
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/private-accounting/settings')}
            variant="outline"
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            {t({ ar: 'الإعدادات', en: 'Settings' })}
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard
            title={t({ ar: 'الإجمالي', en: 'Total' })}
            value={stats.total}
            icon={DollarSign}
            color="from-blue-500 to-blue-600"
            trend={12}
          />
          <StatCard
            title={t({ ar: 'الأرباح', en: 'Profits' })}
            value={stats.profits}
            icon={TrendingUp}
            color="from-green-500 to-green-600"
            trend={8}
          />
          <StatCard
            title={t({ ar: 'المديونيات', en: 'Debts' })}
            value={stats.debts}
            icon={TrendingDown}
            color="from-red-500 to-red-600"
            trend={-5}
          />
          <StatCard
            title={t({ ar: 'المطالبات', en: 'Claims' })}
            value={stats.claims}
            icon={AlertCircle}
            color="from-orange-500 to-orange-600"
          />
          <StatCard
            title={t({ ar: 'الخزنة', en: 'Vault' })}
            value={stats.vault}
            icon={Vault}
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            title={t({ ar: 'المصروفات', en: 'Expenses' })}
            value={stats.expenses}
            icon={Receipt}
            color="from-gray-500 to-gray-600"
            trend={-3}
          />
        </div>

        {/* Main Content Tabs */}
        <Card className="p-6">
          <Tabs defaultValue="accounts" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              <TabsTrigger value="accounts" className="gap-2">
                <Receipt className="h-4 w-4" />
                {t({ ar: 'الحسابات', en: 'Accounts' })}
              </TabsTrigger>
              <TabsTrigger value="customers" className="gap-2">
                <Users className="h-4 w-4" />
                {t({ ar: 'العملاء', en: 'Customers' })}
              </TabsTrigger>
              <TabsTrigger value="bookings" className="gap-2">
                <Receipt className="h-4 w-4" />
                {t({ ar: 'الطلبات', en: 'Bookings' })}
              </TabsTrigger>
              <TabsTrigger value="owners" className="gap-2">
                <Users className="h-4 w-4" />
                {t({ ar: 'المُلاّك', en: 'Owners' })}
              </TabsTrigger>
              <TabsTrigger value="hotels" className="gap-2">
                <Hotel className="h-4 w-4" />
                {t({ ar: 'الفنادق', en: 'Hotels' })}
              </TabsTrigger>
              <TabsTrigger value="rooms" className="gap-2">
                <BedDouble className="h-4 w-4" />
                {t({ ar: 'الغرف', en: 'Rooms' })}
              </TabsTrigger>
              <TabsTrigger value="vault" className="gap-2">
                <Vault className="h-4 w-4" />
                {t({ ar: 'الخزنة', en: 'Vault' })}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="accounts" className="mt-6">
              <div className="text-center py-12">
                <Receipt className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t({ ar: 'إدارة الحسابات', en: 'Manage Accounts' })}
                </h3>
                <p className="text-muted-foreground">
                  {t({ ar: 'عرض وإدارة جميع حسابات الفنادق الخاصة', en: 'View and manage all private hotel accounts' })}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="customers" className="mt-6">
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t({ ar: 'إدارة العملاء', en: 'Manage Customers' })}
                </h3>
                <p className="text-muted-foreground">
                  {t({ ar: 'عرض وإدارة جميع عملاء الحسابات الخاصة', en: 'View and manage all private customers' })}
                </p>
                <Button 
                  onClick={() => navigate('/private-accounting/customers')} 
                  className="mt-4"
                >
                  {t({ ar: 'إدارة العملاء', en: 'Manage Customers' })}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="bookings" className="mt-6">
              <div className="text-center py-12">
                <Receipt className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t({ ar: 'إدارة الطلبات', en: 'Manage Bookings' })}
                </h3>
                <p className="text-muted-foreground">
                  {t({ ar: 'عرض وإدارة جميع طلبات الحسابات الخاصة', en: 'View and manage all private bookings' })}
                </p>
                <Button 
                  onClick={() => navigate('/private-accounting/bookings')} 
                  className="mt-4"
                >
                  {t({ ar: 'إدارة الطلبات', en: 'Manage Bookings' })}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="owners" className="mt-6">
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t({ ar: 'إدارة المُلاّك', en: 'Manage Owners' })}
                </h3>
                <p className="text-muted-foreground">
                  {t({ ar: 'عرض وإدارة جميع مُلاّك الفنادق', en: 'View and manage all hotel owners' })}
                </p>
                <Button 
                  onClick={() => navigate('/private-accounting/owners')} 
                  className="mt-4"
                >
                  {t({ ar: 'إدارة المُلاّك', en: 'Manage Owners' })}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="hotels" className="mt-6">
              <div className="text-center py-12">
                <Hotel className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t({ ar: 'إدارة الفنادق', en: 'Manage Hotels' })}
                </h3>
                <p className="text-muted-foreground">
                  {t({ ar: 'عرض وإدارة جميع الفنادق الخاصة', en: 'View and manage all private hotels' })}
                </p>
                <Button 
                  onClick={() => navigate('/private-accounting/hotels')} 
                  className="mt-4"
                >
                  {t({ ar: 'إدارة الفنادق', en: 'Manage Hotels' })}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="rooms" className="mt-6">
              <div className="text-center py-12">
                <BedDouble className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t({ ar: 'إدارة الغرف', en: 'Manage Rooms' })}
                </h3>
                <p className="text-muted-foreground">
                  {t({ ar: 'عرض وإدارة جميع الغرف في الفنادق', en: 'View and manage all hotel rooms' })}
                </p>
                <Button 
                  onClick={() => navigate('/private-accounting/rooms')} 
                  className="mt-4"
                >
                  {t({ ar: 'إدارة الغرف', en: 'Manage Rooms' })}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="vault" className="mt-6">
              <div className="text-center py-12">
                <Vault className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t({ ar: 'إدارة الخزنة', en: 'Manage Vault' })}
                </h3>
                <p className="text-muted-foreground">
                  {t({ ar: 'عرض وإدارة خزنة الحسابات الخاصة', en: 'View and manage private accounting vault' })}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}