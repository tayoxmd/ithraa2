import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface UserAccess {
  user_id: string;
  full_name: string;
  role: string;
  role_name_ar: string;
  role_name_en: string;
  hasAccess: boolean;
}

export function EmailAccessControl() {
  const { t, language } = useLanguage();
  const { userRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userAccess, setUserAccess] = useState<UserAccess[]>([]);

  const canManage = userRole === 'admin';

  useEffect(() => {
    if (canManage) {
      fetchUserAccess();
    }
  }, [canManage]);

  const fetchUserAccess = async () => {
    try {
      const roleMap = {
        employee: { name_ar: 'موظف', name_en: 'Employee' },
        company: { name_ar: 'شركة', name_en: 'Company' },
        manager: { name_ar: 'مدير', name_en: 'Manager' },
        assistant_manager: { name_ar: 'مدير مساعد', name_en: 'Assistant Manager' },
      };

      const allowedRoles = ['employee', 'company', 'manager', 'assistant_manager'] as const;

      const { data: roleUsers, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id, role, profiles(full_name)')
        .in('role', allowedRoles)
        .eq('active', true);

      if (roleError) throw roleError;

      const { data: fullAccessData } = await supabase
        .from('email_access_users')
        .select('user_id');

      const fullAccessUserIds = new Set(fullAccessData?.map(a => a.user_id) || []);

      const users: UserAccess[] = roleUsers?.map(ru => ({
        user_id: ru.user_id,
        full_name: (ru.profiles as any)?.full_name || t({ ar: 'غير معروف', en: 'Unknown' }),
        role: ru.role,
        role_name_ar: roleMap[ru.role as keyof typeof roleMap]?.name_ar || ru.role,
        role_name_en: roleMap[ru.role as keyof typeof roleMap]?.name_en || ru.role,
        hasAccess: fullAccessUserIds.has(ru.user_id) || ['admin', 'manager'].includes(ru.role),
      })) || [];

      setUserAccess(users);
    } catch (error) {
      console.error('Error fetching user access:', error);
      toast.error(t({ ar: 'خطأ في جلب البيانات', en: 'Error fetching data' }));
    } finally {
      setLoading(false);
    }
  };

  const toggleUserAccess = async (userId: string) => {
    try {
      const currentAccess = userAccess.find(u => u.user_id === userId)?.hasAccess;

      if (currentAccess) {
        await supabase.from('email_access_users').delete().eq('user_id', userId);
      } else {
        await supabase.from('email_access_users').insert({ user_id: userId });
      }

      setUserAccess(prev => prev.map(u => 
        u.user_id === userId ? { ...u, hasAccess: !currentAccess } : u
      ));

      toast.success(t({ 
        ar: currentAccess ? 'تم إلغاء الصلاحية' : 'تم منح الصلاحية',
        en: currentAccess ? 'Access revoked' : 'Access granted'
      }));
    } catch (error) {
      console.error('Error:', error);
      toast.error(t({ ar: 'حدث خطأ', en: 'An error occurred' }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          {t({ ar: 'صلاحيات الوصول للبريد', en: 'Email Access Permissions' })}
        </CardTitle>
        <CardDescription>
          {t({ ar: 'تحديد الموظفين الذين يمكنهم الوصول إلى صفحة البريد', en: 'Set which employees can access the email page' })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {t({ ar: 'ملاحظة:', en: 'Note:' })}
              </p>
              <p className="text-sm text-muted-foreground">
                {t({ 
                  ar: 'المدير فقط يمكنه الوصول إلى صفحة إعدادات البريد. هذه الصفحة للتحكم بصلاحيات الموظفين الآخرين للوصول إلى صفحة البريد الرئيسية.',
                  en: 'Only admin can access email settings page. This page controls access for other staff to the main email page.'
                })}
              </p>
            </div>
          </div>
        </div>

        {userAccess.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {t({ ar: 'لا يوجد مستخدمون', en: 'No users found' })}
          </p>
        ) : (
          <div className="space-y-3">
            {userAccess.map((user) => (
              <div
                key={user.user_id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleUserAccess(user.user_id)}
                    disabled={['admin', 'manager'].includes(user.role)}
                    className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                      user.hasAccess 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-muted hover:border-green-500'
                    } ${['admin', 'manager'].includes(user.role) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    title={t({ ar: 'الوصول للبريد', en: 'Email Access' })}
                  >
                    {user.hasAccess && <Eye className="w-4 h-4 text-white" />}
                  </button>

                  <div className="flex-1">
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'ar' ? user.role_name_ar : user.role_name_en}
                      {' • '}
                      {user.hasAccess 
                        ? t({ ar: 'لديه صلاحية', en: 'Has access' })
                        : t({ ar: 'ليس لديه صلاحية', en: 'No access' })
                      }
                    </p>
                  </div>
                  {user.hasAccess && (
                    <Shield className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


