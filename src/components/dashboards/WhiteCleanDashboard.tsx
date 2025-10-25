import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function WhiteCleanDashboard() {
  const { t } = useLanguage();
  const { userRole } = useAuth();

  const stats = [
    {
      title: { ar: 'إجمالي الحجوزات', en: 'Total Bookings' },
      value: '1,234',
      change: '+12%',
      icon: Calendar
    },
    {
      title: { ar: 'العملاء', en: 'Customers' },
      value: '856',
      change: '+8%',
      icon: Users
    },
    {
      title: { ar: 'الإيرادات', en: 'Revenue' },
      value: '₪245K',
      change: '+15%',
      icon: DollarSign
    },
    {
      title: { ar: 'معدل النمو', en: 'Growth Rate' },
      value: '18%',
      change: '+3%',
      icon: TrendingUp
    }
  ];

  return (
    <div className="space-y-6">
      {/* Minimal Header */}
      <div className="border-l-4 border-gray-900 pl-4">
        <h1 className="text-4xl font-light text-gray-900">
          {t({ ar: 'لوحة التحكم', en: 'Dashboard' })}
        </h1>
        <p className="text-gray-500 mt-1">
          {t({ ar: `${userRole || ''}`, en: `${userRole || ''}` })}
        </p>
      </div>

      {/* Clean Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm bg-gray-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-green-600 font-medium">{stat.change}</span>
              </div>
              <div className="text-3xl font-light text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{t(stat.title)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-light">
              {t({ ar: 'الحجوزات الأخيرة', en: 'Recent Bookings' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-64 flex items-center justify-center text-gray-400">
              {t({ ar: 'الرسم البياني قريباً', en: 'Chart coming soon' })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-light">
              {t({ ar: 'توزيع الفنادق', en: 'Hotel Distribution' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-64 flex items-center justify-center text-gray-400">
              {t({ ar: 'الرسم البياني قريباً', en: 'Chart coming soon' })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
