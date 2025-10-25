import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialStatus?: 'todo' | 'in_progress' | 'done';
  onTaskCreated: () => void;
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  initialStatus = 'todo',
  onTaskCreated,
}: CreateTaskDialogProps) {
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: initialStatus,
    assigned_to: '',
    due_date: undefined as Date | undefined,
    tags: [] as string[],
  });

  useEffect(() => {
    if (open) {
      fetchEmployees();
    }
  }, [open]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, profiles(full_name)')
        .in('role', ['employee', 'admin']);

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error(t({ ar: 'يرجى إدخال عنوان المهمة', en: 'Please enter task title' }));
      return;
    }

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // @ts-ignore - types will update after migration
      const { error } = await supabase.from('tasks').insert([{
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        assigned_to: formData.assigned_to || null,
        due_date: formData.due_date ? formData.due_date.toISOString() : null,
        tags: formData.tags.length > 0 ? formData.tags : null,
        created_by: userData.user.id,
      }]);

      if (error) throw error;

      toast.success(t({ ar: 'تم إنشاء المهمة بنجاح', en: 'Task created successfully' }));
      onTaskCreated();
      onOpenChange(false);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: initialStatus,
        assigned_to: '',
        due_date: undefined,
        tags: [],
      });
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error(t({ ar: 'حدث خطأ أثناء إنشاء المهمة', en: 'Error creating task' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t({ ar: 'إنشاء مهمة جديدة', en: 'Create New Task' })}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              {t({ ar: 'عنوان المهمة', en: 'Task Title' })} *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t({ ar: 'أدخل عنوان المهمة', en: 'Enter task title' })}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              {t({ ar: 'الوصف', en: 'Description' })}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t({ ar: 'أدخل وصف المهمة', en: 'Enter task description' })}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <Label>{t({ ar: 'الأولوية', en: 'Priority' })}</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    {t({ ar: 'منخفضة', en: 'Low' })}
                  </SelectItem>
                  <SelectItem value="medium">
                    {t({ ar: 'متوسطة', en: 'Medium' })}
                  </SelectItem>
                  <SelectItem value="high">
                    {t({ ar: 'عالية', en: 'High' })}
                  </SelectItem>
                  <SelectItem value="urgent">
                    {t({ ar: 'عاجلة', en: 'Urgent' })}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>{t({ ar: 'الحالة', en: 'Status' })}</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">
                    {t({ ar: 'قيد الانتظار', en: 'To Do' })}
                  </SelectItem>
                  <SelectItem value="in_progress">
                    {t({ ar: 'قيد التنفيذ', en: 'In Progress' })}
                  </SelectItem>
                  <SelectItem value="done">
                    {t({ ar: 'مكتمل', en: 'Done' })}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assign To */}
            <div className="space-y-2">
              <Label>{t({ ar: 'تعيين إلى', en: 'Assign To' })}</Label>
              <Select
                value={formData.assigned_to}
                onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t({ ar: 'اختر موظف', en: 'Select employee' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">
                    {t({ ar: 'غير معين', en: 'Unassigned' })}
                  </SelectItem>
                  {employees.map((emp: any) => (
                    <SelectItem key={emp.user_id} value={emp.user_id}>
                      {emp.profiles?.full_name || t({ ar: 'غير معروف', en: 'Unknown' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label>{t({ ar: 'تاريخ الاستحقاق', en: 'Due Date' })}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? (
                      format(formData.due_date, 'PPP', {
                        locale: language === 'ar' ? ar : undefined,
                      })
                    ) : (
                      <span>{t({ ar: 'اختر التاريخ', en: 'Pick a date' })}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.due_date}
                    onSelect={(date) => setFormData({ ...formData, due_date: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">
              {t({ ar: 'الوسوم (افصل بفاصلة)', en: 'Tags (comma separated)' })}
            </Label>
            <Input
              id="tags"
              value={formData.tags.join(', ')}
              onChange={(e) => 
                setFormData({ 
                  ...formData, 
                  tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
                })
              }
              placeholder={t({ ar: 'حجوزات, عاجل, متابعة', en: 'bookings, urgent, follow-up' })}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t({ ar: 'إلغاء', en: 'Cancel' })}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t({ ar: 'إنشاء المهمة', en: 'Create Task' })}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}