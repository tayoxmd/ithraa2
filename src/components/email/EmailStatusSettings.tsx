import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Filter, Plus, Trash2, GripVertical, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface EmailStatus {
  id: string;
  name_ar: string;
  name_en: string;
  color: string;
  icon?: string;
  order_index: number;
  is_active: boolean;
}

export function EmailStatusSettings() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statuses, setStatuses] = useState<EmailStatus[]>([]);
  const [newStatus, setNewStatus] = useState({
    name_ar: '',
    name_en: '',
    color: '#3b82f6',
    icon: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_statuses')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setStatuses(data || []);
    } catch (error) {
      console.error('Error fetching statuses:', error);
      toast.error(t({ ar: 'خطأ في جلب الحالات', en: 'Error fetching statuses' }));
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = statuses.findIndex((s) => s.id === active.id);
    const newIndex = statuses.findIndex((s) => s.id === over.id);

    const newStatuses = arrayMove(statuses, oldIndex, newIndex);
    setStatuses(newStatuses);

    // تحديث order_index في قاعدة البيانات
    try {
      const updates = newStatuses.map((status, index) => ({
        id: status.id,
        order_index: index,
      }));

      await Promise.all(
        updates.map((update) =>
          supabase
            .from('email_statuses')
            .update({ order_index: update.order_index })
            .eq('id', update.id)
        )
      );
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(t({ ar: 'خطأ في تحديث الترتيب', en: 'Error updating order' }));
      fetchStatuses(); // إعادة تحميل في حالة الخطأ
    }
  };

  const addStatus = async () => {
    if (!newStatus.name_ar || !newStatus.name_en) {
      toast.error(t({ ar: 'يرجى إدخال اسم الحالة', en: 'Please enter status name' }));
      return;
    }

    try {
      setSaving(true);
      const maxOrder = statuses.length > 0 ? Math.max(...statuses.map((s) => s.order_index)) : -1;

      const { data, error } = await supabase
        .from('email_statuses')
        .insert({
          name_ar: newStatus.name_ar,
          name_en: newStatus.name_en,
          color: newStatus.color,
          icon: newStatus.icon || null,
          order_index: maxOrder + 1,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setStatuses([...statuses, data]);
      setNewStatus({ name_ar: '', name_en: '', color: '#3b82f6', icon: '' });
      toast.success(t({ ar: 'تم إضافة الحالة', en: 'Status added' }));
    } catch (error: any) {
      console.error('Error adding status:', error);
      if (error.code === '23505') {
        toast.error(t({ ar: 'الحالة موجودة بالفعل', en: 'Status already exists' }));
      } else {
        toast.error(t({ ar: 'خطأ في إضافة الحالة', en: 'Error adding status' }));
      }
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, updates: Partial<EmailStatus>) => {
    try {
      const { error } = await supabase
        .from('email_statuses')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setStatuses(statuses.map((s) => (s.id === id ? { ...s, ...updates } : s)));
      toast.success(t({ ar: 'تم تحديث الحالة', en: 'Status updated' }));
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(t({ ar: 'خطأ في تحديث الحالة', en: 'Error updating status' }));
    }
  };

  const deleteStatus = async (id: string) => {
    if (!confirm(t({ ar: 'هل أنت متأكد من حذف هذه الحالة؟', en: 'Are you sure you want to delete this status?' }))) {
      return;
    }

    try {
      const { error } = await supabase.from('email_statuses').delete().eq('id', id);

      if (error) throw error;

      setStatuses(statuses.filter((s) => s.id !== id));
      toast.success(t({ ar: 'تم حذف الحالة', en: 'Status deleted' }));
    } catch (error) {
      console.error('Error deleting status:', error);
      toast.error(t({ ar: 'خطأ في حذف الحالة', en: 'Error deleting status' }));
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            {t({ ar: 'إعدادات حالات البريد', en: 'Email Status Settings' })}
          </CardTitle>
          <CardDescription>
            {t({ ar: 'إدارة حالات البريد والألوان المرتبطة بها', en: 'Manage email statuses and their associated colors' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* إضافة حالة جديدة */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <Label>{t({ ar: 'الاسم بالعربية', en: 'Name (Arabic)' })}</Label>
              <Input
                value={newStatus.name_ar}
                onChange={(e) => setNewStatus({ ...newStatus, name_ar: e.target.value })}
                placeholder={t({ ar: 'مثال: قيد المراجعة', en: 'e.g., Under Review' })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ ar: 'الاسم بالإنجليزية', en: 'Name (English)' })}</Label>
              <Input
                value={newStatus.name_en}
                onChange={(e) => setNewStatus({ ...newStatus, name_en: e.target.value })}
                placeholder={t({ ar: 'e.g., Under Review', en: 'e.g., Under Review' })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ ar: 'اللون', en: 'Color' })}</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={newStatus.color}
                  onChange={(e) => setNewStatus({ ...newStatus, color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={newStatus.color}
                  onChange={(e) => setNewStatus({ ...newStatus, color: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t({ ar: 'الأيقونة (اختياري)', en: 'Icon (Optional)' })}</Label>
              <Input
                value={newStatus.icon}
                onChange={(e) => setNewStatus({ ...newStatus, icon: e.target.value })}
                placeholder="🔍"
              />
            </div>
            <div className="md:col-span-4">
              <Button onClick={addStatus} disabled={saving} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                {t({ ar: 'إضافة حالة', en: 'Add Status' })}
              </Button>
            </div>
          </div>

          {/* قائمة الحالات */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={statuses.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {statuses.map((status) => (
                  <StatusItem
                    key={status.id}
                    status={status}
                    onUpdate={updateStatus}
                    onDelete={deleteStatus}
                    language={language}
                  />
                ))}
                {statuses.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    {t({ ar: 'لا توجد حالات', en: 'No statuses found' })}
                  </p>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusItem({
  status,
  onUpdate,
  onDelete,
  language,
}: {
  status: EmailStatus;
  onUpdate: (id: string, updates: Partial<EmailStatus>) => void;
  onDelete: (id: string) => void;
  language: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState(status);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: status.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    onUpdate(status.id, editedStatus);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 border rounded-lg bg-card"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
        {isEditing ? (
          <>
            <Input
              value={editedStatus.name_ar}
              onChange={(e) => setEditedStatus({ ...editedStatus, name_ar: e.target.value })}
              placeholder="الاسم بالعربية"
            />
            <Input
              value={editedStatus.name_en}
              onChange={(e) => setEditedStatus({ ...editedStatus, name_en: e.target.value })}
              placeholder="Name (English)"
            />
            <div className="flex gap-2">
              <Input
                type="color"
                value={editedStatus.color}
                onChange={(e) => setEditedStatus({ ...editedStatus, color: e.target.value })}
                className="w-20"
              />
              <Input
                type="text"
                value={editedStatus.color}
                onChange={(e) => setEditedStatus({ ...editedStatus, color: e.target.value })}
                className="flex-1"
              />
            </div>
            <Input
              value={editedStatus.icon || ''}
              onChange={(e) => setEditedStatus({ ...editedStatus, icon: e.target.value })}
              placeholder="Icon"
            />
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: status.color }}
              />
              <span>{status.icon || ''}</span>
              <span className="font-medium">
                {language === 'ar' ? status.name_ar : status.name_en}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {language === 'ar' ? status.name_ar : status.name_en}
            </div>
            <div className="text-sm text-muted-foreground">{status.color}</div>
            <div className="flex items-center gap-2">
              <Switch
                checked={status.is_active}
                onCheckedChange={(checked) => onUpdate(status.id, { is_active: checked })}
              />
              <span className="text-sm">
                {status.is_active ? 'نشط' : 'غير نشط'}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
              إلغاء
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              تعديل
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(status.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
