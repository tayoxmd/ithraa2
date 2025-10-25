import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Shield, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface StaffMember {
  id: string;
  full_name: string;
  role: string;
  hasAccess: boolean;
}

export default function TaskAccessControl() {
  const { t, language } = useLanguage();
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>([]);

  const canManage = userRole === 'admin' || userRole === 'manager';

  useEffect(() => {
    if (!canManage) {
      navigate('/task-manager');
      return;
    }
    fetchStaff();
  }, [canManage, navigate]);

  const fetchStaff = async () => {
    try {
      // Get all staff except managers and assistant_managers (they have access by default)
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['employee', 'specific_financial_manager', 'visa_manager'])
        .eq('active', true);

      if (rolesError) throw rolesError;

      const userIds = rolesData?.map(r => r.user_id) || [];
      if (userIds.length === 0) {
        setStaff([]);
        setLoading(false);
        return;
      }

      // Get profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Get current access list
      const { data: accessData, error: accessError } = await supabase
        .from('task_full_access_users')
        .select('user_id');

      if (accessError) throw accessError;

      const accessUserIds = new Set(accessData?.map(a => a.user_id) || []);

      // Combine data
      const staffList: StaffMember[] = profiles?.map(profile => {
        const roleInfo = rolesData.find(r => r.user_id === profile.id);
        return {
          id: profile.id,
          full_name: profile.full_name || t({ ar: 'غير معروف', en: 'Unknown' }),
          role: roleInfo?.role || '',
          hasAccess: accessUserIds.has(profile.id)
        };
      }) || [];

      setStaff(staffList);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error(t({ ar: 'خطأ في جلب البيانات', en: 'Error fetching data' }));
    } finally {
      setLoading(false);
    }
  };

  const toggleAccess = async (userId: string, currentAccess: boolean) => {
    try {
      if (currentAccess) {
        // Remove access
        const { error } = await supabase
          .from('task_full_access_users')
          .delete()
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Grant access
        const { error } = await supabase
          .from('task_full_access_users')
          .insert({ user_id: userId });

        if (error) throw error;
      }

      // Update local state
      setStaff(prev => prev.map(s => 
        s.id === userId ? { ...s, hasAccess: !currentAccess } : s
      ));

      toast.success(t({ 
        ar: currentAccess ? 'تم إلغاء الصلاحية' : 'تم منح الصلاحية',
        en: currentAccess ? 'Access revoked' : 'Access granted'
      }));
    } catch (error) {
      console.error('Error toggling access:', error);
      toast.error(t({ ar: 'حدث خطأ', en: 'An error occurred' }));
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      employee: { ar: 'موظف', en: 'Employee' },
      specific_financial_manager: { ar: 'مدير الحسابات', en: 'Financial Manager' },
      visa_manager: { ar: 'مدير التأشيرات', en: 'Visa Manager' }
    };
    return labels[role] || { ar: role, en: role };
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
                ar: 'اختر الموظفين الذين يمكنهم الوصول لصفحة المهام الكاملة',
                en: 'Select staff members who can access the full task dashboard'
              })}
            </p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mb-6 border-blue-500/20 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {t({ ar: 'ملاحظة:', en: 'Note:' })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t({ 
                    ar: 'المديرون ومساعدو المديرين لديهم صلاحية الوصول الكامل بشكل افتراضي',
                    en: 'Managers and assistant managers have full access by default'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t({ ar: 'قائمة الموظفين', en: 'Staff List' })}
            </CardTitle>
            <CardDescription>
              {t({ 
                ar: 'اختر الموظفين الذين تريد منحهم صلاحية الوصول',
                en: 'Select staff members you want to grant access to'
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {staff.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t({ ar: 'لا يوجد موظفون', en: 'No staff members found' })}
              </p>
            ) : (
              <div className="space-y-3">
                {staff.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={member.hasAccess}
                        onCheckedChange={() => toggleAccess(member.id, member.hasAccess)}
                      />
                      <div>
                        <p className="font-medium">{member.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {getRoleLabel(member.role)[language === 'ar' ? 'ar' : 'en']}
                        </p>
                      </div>
                    </div>
                    {member.hasAccess && (
                      <Shield className="w-4 h-4 text-green-500" />
                    )}
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
