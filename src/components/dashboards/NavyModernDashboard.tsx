import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function NavyModernDashboard() {
  const { t } = useLanguage();
  const { userRole } = useAuth();

  const stats = [
    {
      title: { ar: 'إجمالي الحجوزات', en: 'Total Bookings' },
      value: '1,234',
      change: '+12%',
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      title: { ar: 'العملاء', en: 'Customers' },
      value: '856',
      change: '+8%',
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: { ar: 'الإيرادات', en: 'Revenue' },
      value: '₪245K',
      change: '+15%',
      icon: DollarSign,
      color: 'text-purple-600'
    },
    {
      title: { ar: 'معدل النمو', en: 'Growth Rate' },
      value: '18%',
      change: '+3%',
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {t({ ar: 'لوحة التحكم', en: 'Dashboard' })}
        </h1>
        <p className="text-blue-100">
          {t({ ar: `مرحباً بك ${userRole || ''}`, en: `Welcome ${userRole || ''}` })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t(stat.title)}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-green-600 mt-1">
                {stat.change} {t({ ar: 'من الشهر الماضي', en: 'from last month' })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ ar: 'الحجوزات الأخيرة', en: 'Recent Bookings' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              {t({ ar: 'الرسم البياني قريباً', en: 'Chart coming soon' })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ ar: 'توزيع الفنادق', en: 'Hotel Distribution' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              {t({ ar: 'الرسم البياني قريباً', en: 'Chart coming soon' })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
