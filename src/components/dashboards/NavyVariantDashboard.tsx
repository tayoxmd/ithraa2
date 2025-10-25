import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function NavyVariantDashboard() {
  const { t } = useLanguage();
  const { userRole } = useAuth();

  const stats = [
    {
      title: { ar: 'إجمالي الحجوزات', en: 'Total Bookings' },
      value: '1,234',
      change: '+12%',
      icon: Calendar,
      color: 'text-primary'
    },
    {
      title: { ar: 'العملاء', en: 'Customers' },
      value: '856',
      change: '+8%',
      icon: Users,
      color: 'text-primary'
    },
    {
      title: { ar: 'الإيرادات', en: 'Revenue' },
      value: '₪245K',
      change: '+15%',
      icon: DollarSign,
      color: 'text-primary'
    },
    {
      title: { ar: 'معدل النمو', en: 'Growth Rate' },
      value: '18%',
      change: '+3%',
      icon: TrendingUp,
      color: 'text-primary'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Primary Color */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-6 border border-primary/20">
        <h1 className="text-3xl font-bold mb-2 text-primary-foreground">
          {t({ ar: 'لوحة التحكم', en: 'Dashboard' })}
        </h1>
        <p className="text-primary-foreground/80">
          {t({ ar: `مرحباً بك ${userRole || ''}`, en: `Welcome ${userRole || ''}` })}
        </p>
      </div>

      {/* Stats Grid with Primary Accent */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t(stat.title)}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-green-500 mt-1">
                {stat.change} {t({ ar: 'من الشهر الماضي', en: 'from last month' })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <CardTitle>
              {t({ ar: 'الحجوزات الأخيرة', en: 'Recent Bookings' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              {t({ ar: 'الرسم البياني قريباً', en: 'Chart coming soon' })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="border-b border-border">
            <CardTitle>
              {t({ ar: 'توزيع الفنادق', en: 'Hotel Distribution' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              {t({ ar: 'الرسم البياني قريباً', en: 'Chart coming soon' })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
