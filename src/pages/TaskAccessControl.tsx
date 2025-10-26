import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Users, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface RoleAccess {
  role: string;
  role_name_ar: string;
  role_name_en: string;
  canViewTasks: boolean;
  canAccessTaskManager: boolean;
}

export default function TaskAccessControl() {
  const { t, language } = useLanguage();
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [roleAccess, setRoleAccess] = useState<RoleAccess[]>([]);

  const canManage = userRole === 'admin';

  useEffect(() => {
    if (!canManage) {
      navigate('/task-manager');
      return;
    }
    fetchRoleAccess();
  }, [canManage, navigate]);

  const fetchRoleAccess = async () => {
    try {
      const roles = [
        { role: 'employee', name_ar: 'موظف', name_en: 'Employee' },
        { role: 'specific_financial_manager', name_ar: 'مدير حسابات', name_en: 'Financial Manager' },
        { role: 'visa_manager', name_ar: 'مدير تأشيرات', name_en: 'Visa Manager' },
      ];

      const { data: fullAccessData } = await supabase
        .from('task_full_access_users')
        .select('user_id');

      const fullAccessUserIds = new Set(fullAccessData?.map(a => a.user_id) || []);

      const rolesWithAccess: RoleAccess[] = [];
      for (const role of roles) {
        const { data: roleUsers } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', role.role as any)
          .eq('active', true);

        const hasAccess = roleUsers?.some(r => fullAccessUserIds.has(r.user_id)) || false;
        
        rolesWithAccess.push({
          role: role.role,
          role_name_ar: role.name_ar,
          role_name_en: role.name_en,
          canViewTasks: hasAccess,
          canAccessTaskManager: hasAccess,
        });
      }

      setRoleAccess(rolesWithAccess);
    } catch (error) {
      console.error('Error fetching role access:', error);
      toast.error(t({ ar: 'خطأ في جلب البيانات', en: 'Error fetching data' }));
    } finally {
      setLoading(false);
    }
  };

  const toggleRoleAccess = async (role: string) => {
    try {
      const { data: roleUsers } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', role as any)
        .eq('active', true);

      if (!roleUsers || roleUsers.length === 0) {
        toast.info(t({ ar: 'لا يوجد مستخدمون بهذه الرتبة', en: 'No users with this role' }));
        return;
      }

      const userIds = roleUsers.map(r => r.user_id);
      const currentAccess = roleAccess.find(r => r.role === role)?.canAccessTaskManager;

      if (currentAccess) {
        await supabase.from('task_full_access_users').delete().in('user_id', userIds);
      } else {
        const inserts = userIds.map(userId => ({ user_id: userId }));
        await supabase.from('task_full_access_users').upsert(inserts, { onConflict: 'user_id' });
      }

      setRoleAccess(prev => prev.map(r => 
        r.role === role ? { ...r, canViewTasks: !currentAccess, canAccessTaskManager: !currentAccess } : r
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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto p-4 md:p-6 pt-10 md:pt-14">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/task-settings')}
            className="h-10 w-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
              {t({ ar: 'التحكم بالوصول للمهام', en: 'Task Access Control' })}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t({ 
                ar: 'تحديد صلاحيات الوصول للمهام حسب الرتبة الوظيفية',
                en: 'Set task access permissions by role'
              })}
            </p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mb-6 border-blue-500/20 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {t({ ar: 'أنواع الصلاحيات:', en: 'Permission Types:' })}
                </p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>{t({ ar: 'عرض المهام: يمكن للموظفين رؤية المهام المخصصة لهم فقط', en: 'View Tasks: Staff can see their assigned tasks only' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>{t({ ar: 'الوصول الكامل: يمكن الوصول لصفحة المهام الرئيسية وعرض جميع المهام', en: 'Full Access: Can access main task manager and view all tasks' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roles List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t({ ar: 'صلاحيات الرتب الوظيفية', en: 'Role Permissions' })}
            </CardTitle>
            <CardDescription>
              {t({ 
                ar: 'انقر على الدوائر لتغيير صلاحيات الوصول للمهام',
                en: 'Click circles to change task access permissions'
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {roleAccess.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t({ ar: 'لا توجد رتب وظيفية', en: 'No roles found' })}
              </p>
            ) : (
              <div className="space-y-3">
                {roleAccess.map((roleData) => (
                  <div
                    key={roleData.role}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* View Tasks Access Circle */}
                      <button
                        onClick={() => toggleRoleAccess(roleData.role)}
                        className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                          roleData.canAccessTaskManager 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-muted hover:border-green-500'
                        }`}
                        title={t({ ar: 'الوصول للمهام', en: 'Task Access' })}
                      >
                        {roleData.canAccessTaskManager && <Shield className="w-4 h-4 text-white" />}
                      </button>

                      <div>
                        <p className="font-medium">
                          {language === 'ar' ? roleData.role_name_ar : roleData.role_name_en}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {roleData.canAccessTaskManager 
                            ? t({ ar: 'وصول كامل', en: 'Full access' })
                            : roleData.canViewTasks
                            ? t({ ar: 'عرض المهام فقط', en: 'View tasks only' })
                            : t({ ar: 'بدون صلاحيات', en: 'No permissions' })
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            onClick={() => navigate('/task-settings')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t({ ar: 'العودة', en: 'Back' })}
          </Button>
        </div>
      </div>
    </div>
  );
}
