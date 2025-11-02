import { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Settings, ArrowLeft, Home, Mail, Filter, Inbox, Trash2, AlertTriangle, Search, X, Calendar, User, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmailColumn } from '@/components/email/EmailColumn';
import { EmailCard } from '@/components/email/EmailCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { Email, EmailStatus, EmailFilter, EmailTag } from '@/types/email';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { useEmailSync } from '@/hooks/useEmailSync';
import { EmailDetailDialog } from '@/components/email/EmailDetailDialog';
import { exportEmailsToCSV, exportEmailsToJSON } from '@/utils/emailExport';
import { Download, Mail as MailIcon, Send } from 'lucide-react';
import { SendToMembers } from '@/components/email/SendToMembers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function EmailManager() {
  const { t, language } = useLanguage();
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [emails, setEmails] = useState<Email[]>([]);
  const [activeEmail, setActiveEmail] = useState<Email | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [designTheme, setDesignTheme] = useState<'design1' | 'design2' | 'design3' | 'design4' | 'design5'>('design2');
  const [emailStatuses, setEmailStatuses] = useState<EmailStatus[]>([]);
  const [emailFilters, setEmailFilters] = useState<EmailFilter[]>([]);
  const [loadingStatuses, setLoadingStatuses] = useState(true);
  const [emailColors, setEmailColors] = useState({
    inbox_color: '#3b82f6',
    sent_color: '#10b981',
    trash_color: '#ef4444',
    spam_color: '#f59e0b',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    fromEmail: '',
    fromName: '',
    priority: '' as '' | 'low' | 'normal' | 'high',
    dateFrom: '',
    dateTo: '',
    tags: [] as string[],
  });
  const [emailTags, setEmailTags] = useState<EmailTag[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [showSendToMembersDialog, setShowSendToMembersDialog] = useState(false);

  const canManageSettings = userRole === 'admin';

  // Email Notifications
  useEmailNotifications(() => {
    fetchEmails();
  });

  // Email Auto Sync - أسرع (كل 30 ثانية)
  const { syncNow } = useEmailSync(() => {
    fetchEmails();
  }, {
    enabled: true,
    interval: 30, // كل 30 ثانية (أسرع)
  });

  // Keyboard Shortcuts
  useKeyboardShortcuts([
    {
      key: 'f',
      ctrl: true,
      action: () => setShowAdvancedFilters(!showAdvancedFilters),
      description: 'Toggle advanced filters',
    },
    {
      key: 'k',
      ctrl: true,
      action: () => {
        const searchInput = document.querySelector('input[type="text"][placeholder*="بحث"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      },
      description: 'Focus search',
    },
    {
      key: 'r',
      ctrl: true,
      action: () => {
        fetchEmails();
        toast.success(t({ ar: 'تم تحديث البريد', en: 'Emails refreshed' }));
      },
      description: 'Refresh emails',
    },
  ]);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    checkAccess();
    loadDesignTheme();
  }, [user, userRole]);

  useEffect(() => {
    if (hasAccess) {
      fetchEmailStatuses();
      fetchEmailFilters();
      fetchEmailColors();
      fetchEmailTags();
    }
  }, [hasAccess]);

  const fetchEmailTags = async () => {
    try {
      const { data, error } = await supabase
        .from('email_tags')
        .select('id, name_ar, name_en, color')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmailTags(data || []);
    } catch (error) {
      console.error('Error fetching email tags:', error);
    }
  };

  useEffect(() => {
    if (hasAccess && emailStatuses.length > 0) {
      fetchEmails();
    }
  }, [hasAccess, selectedFilter, emailStatuses]);

  const loadDesignTheme = async () => {
    try {
      const { data } = await supabase
        .from('email_settings')
        .select('design_theme')
        .single();
      
      if (data?.design_theme) {
        setDesignTheme(data.design_theme as 'design1' | 'design2' | 'design3' | 'design4' | 'design5');
      }
    } catch (error) {
      console.error('Error loading design theme:', error);
    }
  };

  const checkAccess = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const hasAdminAccess = ['admin', 'manager', 'assistant_manager'].includes(userRole || '');
      
      if (hasAdminAccess) {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('email_access_users')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setHasAccess(true);
      } else {
        toast.error(t({ ar: 'ليس لديك صلاحية الوصول لهذه الصفحة', en: 'You do not have access to this page' }));
        navigate('/admin-dashboard');
      }
    } catch (error) {
      console.error('Error checking access:', error);
      toast.error(t({ ar: 'حدث خطأ', en: 'An error occurred' }));
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from('email_statuses')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setEmailStatuses(data || []);
    } catch (error) {
      console.error('Error fetching email statuses:', error);
      toast.error(t({ ar: 'خطأ في جلب حالات البريد', en: 'Error fetching email statuses' }));
    } finally {
      setLoadingStatuses(false);
    }
  };

  const fetchEmailFilters = async () => {
    try {
      const { data, error } = await supabase
        .from('email_filters')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setEmailFilters((data || []) as EmailFilter[]);
      
      // تهيئة الفلتر المحدد بفلتر الوارد إذا كان موجوداً
      if (data && data.length > 0) {
        const inboxFilter = data.find(f => f.filter_type === 'inbox');
        if (inboxFilter) {
          setSelectedFilter(inboxFilter.id);
        } else {
          setSelectedFilter(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching email filters:', error);
      toast.error(t({ ar: 'خطأ في جلب فلاتر البريد', en: 'Error fetching email filters' }));
    }
  };

  const fetchEmailColors = async () => {
    try {
      const { data, error } = await supabase
        .from('email_settings')
        .select('inbox_color, sent_color, trash_color, spam_color')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setEmailColors({
          inbox_color: data.inbox_color || '#3b82f6',
          sent_color: data.sent_color || '#10b981',
          trash_color: data.trash_color || '#ef4444',
          spam_color: data.spam_color || '#f59e0b',
        });
      }
    } catch (error) {
      console.error('Error fetching email colors:', error);
    }
  };

  const fetchEmails = async () => {
    try {
      setLoading(true);
      
      // جلب إعدادات عدد البريد لكل صفحة
      const { data: featureSettings } = await supabase
        .from('email_feature_settings' as any)
        .select('max_emails_per_page')
        .limit(1)
        .maybeSingle();
      
      const maxEmails = (featureSettings as any)?.max_emails_per_page || 50;
      
      let query = supabase
        .from('emails')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(maxEmails);

      // استخدام filter_id إذا كان موجوداً
      if (selectedFilter !== 'all') {
        const filter = emailFilters.find(f => f.id === selectedFilter || f.filter_type === selectedFilter);
        if (filter) {
          if (filter.filter_type === 'custom') {
            // للفلتر المخصص، عرض كل الرسائل
          } else {
            query = query.eq('status', filter.filter_type);
          }
        } else {
          query = query.eq('status', selectedFilter);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setEmails((data || []) as Email[]);
    } catch (error) {
      console.error('Error fetching emails:', error);
      toast.error(t({ ar: 'خطأ في جلب البريد', en: 'Error fetching emails' }));
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const email = emails.find((e) => e.id === event.active.id);
    setActiveEmail(email || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveEmail(null);
      return;
    }

    const activeEmail = emails.find((e) => e.id === active.id);
    if (!activeEmail) {
      setActiveEmail(null);
      return;
    }

    const overColumn = columns.find((col) => col.id === over.id);
    if (overColumn && activeEmail.status_id !== overColumn.id) {
      await updateEmailStatus(activeEmail.id, overColumn.id);
    }

    setActiveEmail(null);
  };

  const updateEmailStatus = async (emailId: string, newStatusId: string) => {
    try {
      const status = emailStatuses.find(s => s.id === newStatusId);
      if (!status) {
        throw new Error('Status not found');
      }

      const { error } = await supabase
        .from('emails')
        .update({ 
          status_id: newStatusId,
          status: status.name_en.toLowerCase().replace(/\s+/g, '_'),
          updated_at: new Date().toISOString() 
        })
        .eq('id', emailId);

      if (error) throw error;

      setEmails((prev) =>
        prev.map((email) =>
          email.id === emailId ? { ...email, status_id: newStatusId, status: status.name_en.toLowerCase().replace(/\s+/g, '_') } : email
        )
      );

      toast.success(t({ ar: 'تم تحديث حالة البريد', en: 'Email status updated' }));
    } catch (error) {
      console.error('Error updating email status:', error);
      toast.error(t({ ar: 'خطأ في تحديث حالة البريد', en: 'Error updating email status' }));
    }
  };

  const columns = useMemo(() => {
    return emailStatuses.map((status) => ({
      id: status.id,
      title: `${status.icon || ''} ${language === 'ar' ? status.name_ar : status.name_en}`,
      color: status.color,
    }));
  }, [emailStatuses, language]);

  const filteredEmails = useMemo(() => {
    let filtered = emails;

    // تطبيق فلتر الحالة
    if (selectedFilter !== 'all') {
      const filter = emailFilters.find(f => f.id === selectedFilter || f.filter_type === selectedFilter);
      if (filter && filter.filter_type === 'custom') {
        filtered = emails;
      } else {
        filtered = emails.filter((e) => {
          if (filter) {
            return e.status === filter.filter_type || e.filter_id === filter.id;
          }
          return e.status === selectedFilter;
        });
      }
    }

    // تطبيق البحث السريع
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((e) => {
        return (
          e.subject.toLowerCase().includes(query) ||
          e.body.toLowerCase().includes(query) ||
          e.from_email.toLowerCase().includes(query) ||
          e.from_name.toLowerCase().includes(query) ||
          e.to_email.toLowerCase().includes(query) ||
          e.to_name.toLowerCase().includes(query)
        );
      });
    }

    // تطبيق الفلاتر المتقدمة
    if (advancedFilters.fromEmail) {
      filtered = filtered.filter((e) =>
        e.from_email.toLowerCase().includes(advancedFilters.fromEmail.toLowerCase())
      );
    }
    if (advancedFilters.fromName) {
      filtered = filtered.filter((e) =>
        e.from_name.toLowerCase().includes(advancedFilters.fromName.toLowerCase())
      );
    }
    if (advancedFilters.priority) {
      filtered = filtered.filter((e) => e.priority === advancedFilters.priority);
    }
    if (advancedFilters.dateFrom) {
      filtered = filtered.filter((e) => {
        const emailDate = new Date(e.created_at);
        const filterDate = new Date(advancedFilters.dateFrom);
        return emailDate >= filterDate;
      });
    }
    if (advancedFilters.dateTo) {
      filtered = filtered.filter((e) => {
        const emailDate = new Date(e.created_at);
        const filterDate = new Date(advancedFilters.dateTo);
        filterDate.setHours(23, 59, 59, 999);
        return emailDate <= filterDate;
      });
    }
    if (advancedFilters.tags.length > 0) {
      filtered = filtered.filter((e) => {
        const emailTags = (e as any).tags || [];
        return advancedFilters.tags.some((tag) => emailTags.includes(tag));
      });
    }

    return filtered;
  }, [emails, selectedFilter, emailFilters, searchQuery, advancedFilters]);

  if (loading || loadingStatuses) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-muted/30 to-background overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 px-3 md:px-6 py-2 md:py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="h-6 w-6"
              >
                <ArrowLeft className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="h-6 w-6"
              >
                <Home className="w-3 h-3" />
              </Button>
              <h1 className="text-base md:text-lg font-semibold">
                {t({ ar: 'البريد', en: 'Email' })}
              </h1>
              {canManageSettings && userRole === 'admin' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/email-settings')}
                  className="h-8 gap-1.5 ml-2"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-xs">
                    {t({ ar: 'إعدادات البريد', en: 'Email Settings' })}
                  </span>
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 flex-1 max-w-md ml-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t({ ar: 'بحث في البريد...', en: 'Search emails...' })}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-8 h-8 text-sm"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-8 w-8"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Export Selected Emails */}
              {selectedEmails.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5">
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-xs">
                        {t({ ar: `تصدير (${selectedEmails.length})`, en: `Export (${selectedEmails.length})` })}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => {
                        const emailsToExport = emails.filter((e) => selectedEmails.includes(e.id));
                        exportEmailsToCSV(emailsToExport);
                        setSelectedEmails([]);
                      }}
                    >
                      {t({ ar: 'تصدير CSV', en: 'Export CSV' })}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const emailsToExport = emails.filter((e) => selectedEmails.includes(e.id));
                        exportEmailsToJSON(emailsToExport);
                        setSelectedEmails([]);
                      }}
                    >
                      {t({ ar: 'تصدير JSON', en: 'Export JSON' })}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {/* Send to Members Button */}
              {canManageSettings && (
                <Dialog open={showSendToMembersDialog} onOpenChange={setShowSendToMembersDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-xs">
                        {t({ ar: 'إرسال للأعضاء', en: 'Send to Members' })}
                      </span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {t({ ar: 'إرسال بريد للأعضاء', en: 'Send Email to Members' })}
                      </DialogTitle>
                      <DialogDescription>
                        {t({
                          ar: 'إرسال بريد إلكتروني لجميع الأعضاء المسجلين',
                          en: 'Send email to all registered members',
                        })}
                      </DialogDescription>
                    </DialogHeader>
                    <SendToMembers onClose={() => setShowSendToMembersDialog(false)} />
                  </DialogContent>
                </Dialog>
              )}
              {/* Sync Button */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => syncNow()}
              >
                <MailIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">
                  {t({ ar: 'مزامنة', en: 'Sync' })}
                </span>
              </Button>
              {/* Advanced Filters Button */}
              <Button
                variant={showAdvancedFilters ? 'default' : 'outline'}
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">
                  {t({ ar: 'فلاتر متقدمة', en: 'Advanced Filters' })}
                </span>
              </Button>
              {/* Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5">
                    <Filter className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-xs">
                      {(() => {
                        const filter = emailFilters.find(f => f.id === selectedFilter || f.filter_type === selectedFilter);
                        return filter ? (language === 'ar' ? filter.name_ar : filter.name_en) : t({ ar: 'الكل', en: 'All' });
                      })()}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {emailFilters.map((filter) => (
                    <DropdownMenuItem 
                      key={filter.id} 
                      onClick={() => setSelectedFilter(filter.id)}
                    >
                      {filter.filter_type === 'inbox' && <Inbox className="w-4 h-4 mr-2" />}
                      {filter.filter_type === 'sent' && <Send className="w-4 h-4 mr-2" />}
                      {filter.filter_type === 'trash' && <Trash2 className="w-4 h-4 mr-2" />}
                      {filter.filter_type === 'spam' && <AlertTriangle className="w-4 h-4 mr-2" />}
                      {filter.filter_type === 'custom' && <Mail className="w-4 h-4 mr-2" />}
                      {language === 'ar' ? filter.name_ar : filter.name_en}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="flex-shrink-0 px-3 md:px-6 py-3 border-b bg-muted/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {t({ ar: 'البريد الإلكتروني للمرسل', en: 'Sender Email' })}
                </Label>
                <Input
                  type="email"
                  placeholder={t({ ar: 'البحث بالبريد...', en: 'Search by email...' })}
                  value={advancedFilters.fromEmail}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, fromEmail: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {t({ ar: 'اسم المرسل', en: 'Sender Name' })}
                </Label>
                <Input
                  type="text"
                  placeholder={t({ ar: 'البحث بالاسم...', en: 'Search by name...' })}
                  value={advancedFilters.fromName}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, fromName: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {t({ ar: 'الأولوية', en: 'Priority' })}
                </Label>
                <Select
                  value={advancedFilters.priority}
                  onValueChange={(value: any) => setAdvancedFilters({ ...advancedFilters, priority: value })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder={t({ ar: 'الكل', en: 'All' })} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t({ ar: 'الكل', en: 'All' })}</SelectItem>
                    <SelectItem value="low">{t({ ar: 'منخفضة', en: 'Low' })}</SelectItem>
                    <SelectItem value="normal">{t({ ar: 'عادية', en: 'Normal' })}</SelectItem>
                    <SelectItem value="high">{t({ ar: 'عالية', en: 'High' })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {t({ ar: 'من تاريخ', en: 'From Date' })}
                </Label>
                <Input
                  type="date"
                  value={advancedFilters.dateFrom}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateFrom: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {t({ ar: 'إلى تاريخ', en: 'To Date' })}
                </Label>
                <Input
                  type="date"
                  value={advancedFilters.dateTo}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateTo: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            {/* Tags Filter */}
            {emailTags.length > 0 && (
              <div className="space-y-2 mt-2">
                <Label className="text-xs flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {t({ ar: 'العلامات', en: 'Tags' })}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {emailTags.map((tag) => {
                    const isSelected = advancedFilters.tags.includes(tag.id);
                    return (
                      <Button
                        key={tag.id}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          if (isSelected) {
                            setAdvancedFilters({
                              ...advancedFilters,
                              tags: advancedFilters.tags.filter((id) => id !== tag.id),
                            });
                          } else {
                            setAdvancedFilters({
                              ...advancedFilters,
                              tags: [...advancedFilters.tags, tag.id],
                            });
                          }
                        }}
                        style={
                          isSelected
                            ? {
                                backgroundColor: tag.color,
                                color: 'white',
                                borderColor: tag.color,
                              }
                            : {
                                borderColor: tag.color,
                                color: tag.color,
                              }
                        }
                      >
                        {language === 'ar' ? tag.name_ar : tag.name_en}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex items-center justify-end gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAdvancedFilters({
                    fromEmail: '',
                    fromName: '',
                    priority: '',
                    dateFrom: '',
                    dateTo: '',
                    tags: [],
                  });
                }}
                className="h-7 text-xs"
              >
                {t({ ar: 'مسح الفلاتر', en: 'Clear Filters' })}
              </Button>
            </div>
          </div>
        )}

        {/* Kanban Board */}
        <div className="flex-1 overflow-hidden p-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {columns.length > 0 ? (
              <div className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
                {columns.map((column) => (
                  <EmailColumn
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    color={column.color}
                    emails={filteredEmails.filter((e) => e.status_id === column.id) as Email[]}
                    onEmailClick={(email: Email) => setSelectedEmail(email)}
                    selectedEmails={selectedEmails}
                    onEmailSelect={(emailId, selected) => {
                      if (selected) {
                        setSelectedEmails([...selectedEmails, emailId]);
                      } else {
                        setSelectedEmails(selectedEmails.filter((id) => id !== emailId));
                      }
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  {t({ ar: 'لا توجد حالات بريد متاحة. يرجى إضافة حالات من إعدادات البريد.', en: 'No email statuses available. Please add statuses from email settings.' })}
                </p>
              </div>
            )}
            <DragOverlay>
              {activeEmail ? (
                <EmailCard email={activeEmail} isDragging />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Email Detail Dialog */}
        <EmailDetailDialog
          email={selectedEmail}
          open={!!selectedEmail}
          onOpenChange={(open) => {
            if (!open) setSelectedEmail(null);
          }}
          onEmailUpdated={() => {
            fetchEmails();
          }}
        />
      </div>
    </div>
  );
}

