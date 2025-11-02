import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface EmailFilterType {
  id: string;
  name_ar: string;
  name_en: string;
  filter_type: 'inbox' | 'sent' | 'trash' | 'spam' | 'custom';
  criteria: Record<string, any>;
  order_index: number;
  is_active: boolean;
}

export function EmailFilterSettings() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState<EmailFilterType[]>([]);
  const [newFilter, setNewFilter] = useState({
    name_ar: '',
    name_en: '',
    filter_type: 'custom' as 'inbox' | 'sent' | 'trash' | 'spam' | 'custom',
    criteria: {},
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_filters')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setFilters(data || []);
    } catch (error) {
      console.error('Error fetching filters:', error);
      toast.error(t({ ar: 'خطأ في جلب الفلاتر', en: 'Error fetching filters' }));
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = filters.findIndex((f) => f.id === active.id);
    const newIndex = filters.findIndex((f) => f.id === over.id);

    const newFilters = arrayMove(filters, oldIndex, newIndex);
    setFilters(newFilters);

    // تحديث order_index في قاعدة البيانات
    try {
      const updates = newFilters.map((filter, index) => ({
        id: filter.id,
        order_index: index,
      }));

      await Promise.all(
        updates.map((update) =>
          supabase
            .from('email_filters')
            .update({ order_index: update.order_index })
            .eq('id', update.id)
        )
      );
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(t({ ar: 'خطأ في تحديث الترتيب', en: 'Error updating order' }));
      fetchFilters();
    }
  };

  const addFilter = async () => {
    if (!newFilter.name_ar || !newFilter.name_en) {
      toast.error(t({ ar: 'يرجى إدخال اسم الفلتر', en: 'Please enter filter name' }));
      return;
    }

    try {
      setSaving(true);
      const maxOrder = filters.length > 0 ? Math.max(...filters.map((f) => f.order_index)) : -1;

      const { data, error } = await supabase
        .from('email_filters')
        .insert({
          name_ar: newFilter.name_ar,
          name_en: newFilter.name_en,
          filter_type: newFilter.filter_type,
          criteria: newFilter.criteria,
          order_index: maxOrder + 1,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setFilters([...filters, data]);
      setNewFilter({ name_ar: '', name_en: '', filter_type: 'custom', criteria: {} });
      toast.success(t({ ar: 'تم إضافة الفلتر', en: 'Filter added' }));
    } catch (error) {
      console.error('Error adding filter:', error);
      toast.error(t({ ar: 'خطأ في إضافة الفلتر', en: 'Error adding filter' }));
    } finally {
      setSaving(false);
    }
  };

  const updateFilter = async (id: string, updates: Partial<EmailFilterType>) => {
    try {
      const { error } = await supabase
        .from('email_filters')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setFilters(filters.map((f) => (f.id === id ? { ...f, ...updates } : f)));
      toast.success(t({ ar: 'تم تحديث الفلتر', en: 'Filter updated' }));
    } catch (error) {
      console.error('Error updating filter:', error);
      toast.error(t({ ar: 'خطأ في تحديث الفلتر', en: 'Error updating filter' }));
    }
  };

  const deleteFilter = async (id: string) => {
    if (!confirm(t({ ar: 'هل أنت متأكد من حذف هذا الفلتر؟', en: 'Are you sure you want to delete this filter?' }))) {
      return;
    }

    try {
      const { error } = await supabase.from('email_filters').delete().eq('id', id);

      if (error) throw error;

      setFilters(filters.filter((f) => f.id !== id));
      toast.success(t({ ar: 'تم حذف الفلتر', en: 'Filter deleted' }));
    } catch (error) {
      console.error('Error deleting filter:', error);
      toast.error(t({ ar: 'خطأ في حذف الفلتر', en: 'Error deleting filter' }));
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
            {t({ ar: 'إعدادات فلاتر البريد', en: 'Email Filter Settings' })}
          </CardTitle>
          <CardDescription>
            {t({ ar: 'إدارة فلاتر البريد وتخصيصها', en: 'Manage and customize email filters' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* إضافة فلتر جديد */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <Label>{t({ ar: 'الاسم بالعربية', en: 'Name (Arabic)' })}</Label>
              <Input
                value={newFilter.name_ar}
                onChange={(e) => setNewFilter({ ...newFilter, name_ar: e.target.value })}
                placeholder={t({ ar: 'مثال: مهم', en: 'e.g., Important' })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ ar: 'الاسم بالإنجليزية', en: 'Name (English)' })}</Label>
              <Input
                value={newFilter.name_en}
                onChange={(e) => setNewFilter({ ...newFilter, name_en: e.target.value })}
                placeholder={t({ ar: 'e.g., Important', en: 'e.g., Important' })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ ar: 'نوع الفلتر', en: 'Filter Type' })}</Label>
              <Select
                value={newFilter.filter_type}
                onValueChange={(value: any) => setNewFilter({ ...newFilter, filter_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inbox">{t({ ar: 'الوارد', en: 'Inbox' })}</SelectItem>
                  <SelectItem value="sent">{t({ ar: 'الصادر', en: 'Sent' })}</SelectItem>
                  <SelectItem value="trash">{t({ ar: 'المهملات', en: 'Trash' })}</SelectItem>
                  <SelectItem value="spam">{t({ ar: 'السبام', en: 'Spam' })}</SelectItem>
                  <SelectItem value="custom">{t({ ar: 'مخصص', en: 'Custom' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Button onClick={addFilter} disabled={saving} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                {t({ ar: 'إضافة فلتر', en: 'Add Filter' })}
              </Button>
            </div>
          </div>

          {/* قائمة الفلاتر */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filters.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {filters.map((filter) => (
                  <FilterItem
                    key={filter.id}
                    filter={filter}
                    onUpdate={updateFilter}
                    onDelete={deleteFilter}
                    language={language}
                    t={t}
                  />
                ))}
                {filters.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    {t({ ar: 'لا توجد فلاتر', en: 'No filters found' })}
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

function FilterItem({
  filter,
  onUpdate,
  onDelete,
  language,
  t,
}: {
  filter: EmailFilterType;
  onUpdate: (id: string, updates: Partial<EmailFilterType>) => void;
  onDelete: (id: string) => void;
  language: string;
  t: (obj: { ar: string; en: string }) => string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFilter, setEditedFilter] = useState(filter);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: filter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    onUpdate(filter.id, editedFilter);
    setIsEditing(false);
  };

  const filterTypeLabels = {
    inbox: t({ ar: 'الوارد', en: 'Inbox' }),
    sent: t({ ar: 'الصادر', en: 'Sent' }),
    trash: t({ ar: 'المهملات', en: 'Trash' }),
    spam: t({ ar: 'السبام', en: 'Spam' }),
    custom: t({ ar: 'مخصص', en: 'Custom' }),
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

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
        {isEditing ? (
          <>
            <Input
              value={editedFilter.name_ar}
              onChange={(e) => setEditedFilter({ ...editedFilter, name_ar: e.target.value })}
              placeholder="الاسم بالعربية"
            />
            <Input
              value={editedFilter.name_en}
              onChange={(e) => setEditedFilter({ ...editedFilter, name_en: e.target.value })}
              placeholder="Name (English)"
            />
            <Select
              value={editedFilter.filter_type}
              onValueChange={(value: any) => setEditedFilter({ ...editedFilter, filter_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inbox">{t({ ar: 'الوارد', en: 'Inbox' })}</SelectItem>
                <SelectItem value="sent">{t({ ar: 'الصادر', en: 'Sent' })}</SelectItem>
                <SelectItem value="trash">{t({ ar: 'المهملات', en: 'Trash' })}</SelectItem>
                <SelectItem value="spam">{t({ ar: 'السبام', en: 'Spam' })}</SelectItem>
                <SelectItem value="custom">{t({ ar: 'مخصص', en: 'Custom' })}</SelectItem>
              </SelectContent>
            </Select>
          </>
        ) : (
          <>
            <div className="font-medium">
              {language === 'ar' ? filter.name_ar : filter.name_en}
            </div>
            <div className="text-sm text-muted-foreground">
              {filterTypeLabels[filter.filter_type]}
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={filter.is_active}
                onCheckedChange={(checked) => onUpdate(filter.id, { is_active: checked })}
              />
              <span className="text-sm">
                {filter.is_active ? t({ ar: 'نشط', en: 'Active' }) : t({ ar: 'غير نشط', en: 'Inactive' })}
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
              {t({ ar: 'إلغاء', en: 'Cancel' })}
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              {t({ ar: 'تعديل', en: 'Edit' })}
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(filter.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

