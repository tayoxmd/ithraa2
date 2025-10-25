import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function BlackMinimalDashboard() {
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
      {/* Dark Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black rounded-lg p-6 border border-gray-800">
        <h1 className="text-3xl font-bold mb-2 text-white">
          {t({ ar: 'لوحة التحكم', en: 'Dashboard' })}
        </h1>
        <p className="text-gray-400">
          {t({ ar: `مرحباً بك ${userRole || ''}`, en: `Welcome ${userRole || ''}` })}
        </p>
      </div>

      {/* Dark Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                {t(stat.title)}
              </CardTitle>
              <stat.icon className="w-5 h-5 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <p className="text-xs text-green-500 mt-1">
                {stat.change} {t({ ar: 'من الشهر الماضي', en: 'from last month' })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">
              {t({ ar: 'الحجوزات الأخيرة', en: 'Recent Bookings' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-600">
              {t({ ar: 'الرسم البياني قريباً', en: 'Chart coming soon' })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">
              {t({ ar: 'توزيع الفنادق', en: 'Hotel Distribution' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-600">
              {t({ ar: 'الرسم البياني قريباً', en: 'Chart coming soon' })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
