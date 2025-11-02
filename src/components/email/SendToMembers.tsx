import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, Users, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface User {
  id: string;
  email: string;
  full_name: string | null;
}

interface SendToMembersProps {
  onClose?: () => void;
}

export function SendToMembers({ onClose }: SendToMembersProps = {}) {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sendToAll, setSendToAll] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: '',
    body: '',
    body_html: '',
  });
  const [filter, setFilter] = useState<'all' | 'customers' | 'employees' | 'admins'>('all');

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // جلب البيانات من edge function
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      // جلب جميع المستخدمين من edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'listUsers' })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const responseData = await response.json();
      const authUsers = responseData.users || [];

      // جلب البيانات من profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (profilesError) throw profilesError;

      // تطبيق الفلتر حسب الدور
      let filteredUserIds: string[] = [];
      
      if (filter !== 'all') {
        const roleMap = {
          customers: 'customer',
          employees: 'employee',
          admins: 'admin',
        };
        
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', roleMap[filter]);

        if (userRoles && userRoles.length > 0) {
          filteredUserIds = userRoles.map(ur => ur.user_id);
        } else {
          setUsers([]);
          setLoading(false);
          return;
        }
      }

      // دمج البيانات
      const usersWithEmails: User[] = authUsers
        .filter((authUser: any) => {
          if (filter === 'all') return true;
          return filteredUserIds.includes(authUser.id);
        })
        .filter((authUser: any) => authUser.email) // فقط المستخدمين الذين لديهم بريد إلكتروني
        .map((authUser: any) => {
          const profile = profiles?.find(p => p.id === authUser.id);
          return {
            id: authUser.id,
            email: authUser.email,
            full_name: profile?.full_name || null,
          };
        });

      setUsers(usersWithEmails);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(t({ ar: 'خطأ في جلب المستخدمين', en: 'Error fetching users' }));
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!emailData.subject.trim() || !emailData.body.trim()) {
      toast.error(t({ ar: 'يرجى إدخال الموضوع والمحتوى', en: 'Please enter subject and content' }));
      return;
    }

    const recipients = sendToAll 
      ? users.map(u => ({ id: u.id, email: u.email, name: u.full_name || u.email }))
      : users.filter(u => selectedUsers.includes(u.id)).map(u => ({ id: u.id, email: u.email, name: u.full_name || u.email }));

    if (recipients.length === 0) {
      toast.error(t({ ar: 'يرجى اختيار مستلم واحد على الأقل', en: 'Please select at least one recipient' }));
      return;
    }

    try {
      setSending(true);

      // جلب إعدادات البريد الافتراضية
      const { data: emailSettings } = await supabase
        .from('email_settings')
        .select('from_email, from_name')
        .limit(1)
        .single();

      const fromEmail = emailSettings?.from_email || 'noreply@ithraa.com';
      const fromName = emailSettings?.from_name || 'إثراء ITHRAA';

      // إرسال البريد لكل مستلم
      const emailsToInsert = recipients.map(recipient => ({
        subject: emailData.subject,
        from_email: fromEmail,
        from_name: fromName,
        to_email: recipient.email,
        to_name: recipient.name,
        body: emailData.body,
        body_html: emailData.body_html || emailData.body.replace(/\n/g, '<br>'),
        status: 'sent',
        priority: 'normal',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('emails').insert(emailsToInsert);

      if (error) throw error;

      toast.success(
        t({
          ar: `تم إرسال البريد إلى ${recipients.length} مستلم`,
          en: `Email sent to ${recipients.length} recipient(s)`,
        })
      );

      // مسح النموذج
      setEmailData({ subject: '', body: '', body_html: '' });
      setSelectedUsers([]);
      setSendToAll(false);
      
      // إغلاق الحوار
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      toast.error(t({ ar: 'خطأ في إرسال البريد', en: 'Error sending emails' }));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            {t({ ar: 'إرسال بريد للأعضاء', en: 'Send Email to Members' })}
          </CardTitle>
          <CardDescription>
            {t({
              ar: 'إرسال بريد إلكتروني لجميع الأعضاء المسجلين أو مجموعة محددة',
              en: 'Send email to all registered members or a specific group',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter */}
          <div className="space-y-2">
            <Label>{t({ ar: 'تصفية المستلمين', en: 'Filter Recipients' })}</Label>
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ ar: 'الكل', en: 'All' })}</SelectItem>
                <SelectItem value="customers">{t({ ar: 'العملاء', en: 'Customers' })}</SelectItem>
                <SelectItem value="employees">{t({ ar: 'الموظفين', en: 'Employees' })}</SelectItem>
                <SelectItem value="admins">{t({ ar: 'المديرين', en: 'Admins' })}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Send to All */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label>{t({ ar: 'إرسال للجميع', en: 'Send to All' })}</Label>
                <p className="text-xs text-muted-foreground">
                  {t({
                    ar: `إرسال إلى جميع ${users.length} مستخدم`,
                    en: `Send to all ${users.length} users`,
                  })}
                </p>
              </div>
            </div>
            <Switch
              checked={sendToAll}
              onCheckedChange={setSendToAll}
            />
          </div>

          {/* User Selection */}
          {!sendToAll && (
            <div className="space-y-2">
              <Label>{t({ ar: 'اختر المستلمين', en: 'Select Recipients' })}</Label>
              <div className="max-h-60 overflow-y-auto border rounded-lg p-2 space-y-2">
                {users.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t({ ar: 'لا يوجد مستخدمين', en: 'No users found' })}
                  </p>
                ) : (
                  users.map((user) => {
                    const isSelected = selectedUsers.includes(user.id);
                    return (
                      <div
                        key={user.id}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                          isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                        }`}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          } else {
                            setSelectedUsers([...selectedUsers, user.id]);
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              {user.full_name || user.email}
                            </p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {t({
                  ar: `تم اختيار ${selectedUsers.length} من ${users.length}`,
                  en: `${selectedUsers.length} of ${users.length} selected`,
                })}
              </p>
            </div>
          )}

          {/* Email Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t({ ar: 'الموضوع', en: 'Subject' })}</Label>
              <Input
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                placeholder={t({ ar: 'أدخل موضوع البريد', en: 'Enter email subject' })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ ar: 'المحتوى', en: 'Content' })}</Label>
              <Textarea
                value={emailData.body}
                onChange={(e) => {
                  const body = e.target.value;
                  setEmailData({
                    ...emailData,
                    body,
                    body_html: body.replace(/\n/g, '<br>'),
                  });
                }}
                placeholder={t({ ar: 'أدخل محتوى البريد', en: 'Enter email content' })}
                rows={10}
              />
            </div>
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={sending || (!sendToAll && selectedUsers.length === 0)}
            className="w-full"
            size="lg"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t({ ar: 'جاري الإرسال...', en: 'Sending...' })}
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {t({
                  ar: `إرسال إلى ${sendToAll ? users.length : selectedUsers.length} مستلم`,
                  en: `Send to ${sendToAll ? users.length : selectedUsers.length} recipient(s)`,
                })}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

