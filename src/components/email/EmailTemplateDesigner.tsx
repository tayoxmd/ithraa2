import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout, Plus, Trash2, Save, Monitor, Tablet, Smartphone, Type, Image, Link, Minus, GripVertical } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';

interface TemplateComponent {
  id: string;
  component_type: 'text' | 'image' | 'button' | 'divider' | 'spacer' | 'signature' | 'variable';
  content: Record<string, any>;
  order_index: number;
  style: Record<string, any>;
}

interface EmailTemplate {
  id: string;
  name_ar: string;
  name_en: string;
  subject_ar?: string;
  subject_en?: string;
  body_html: string;
  body_text?: string;
  signature_html?: string;
  signature_text?: string;
  is_default: boolean;
  is_active: boolean;
}

export function EmailTemplateDesigner() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [components, setComponents] = useState<TemplateComponent[]>([]);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showComponentLibrary, setShowComponentLibrary] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      fetchComponents(selectedTemplate.id);
    }
  }, [selectedTemplate]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
      if (data && data.length > 0 && !selectedTemplate) {
        setSelectedTemplate(data[0]);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error(t({ ar: 'خطأ في جلب القوالب', en: 'Error fetching templates' }));
    } finally {
      setLoading(false);
    }
  };

  const fetchComponents = async (templateId: string) => {
    try {
      const { data, error } = await supabase
        .from('email_template_components')
        .select('*')
        .eq('template_id', templateId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setComponents(data || []);
    } catch (error) {
      console.error('Error fetching components:', error);
      toast.error(t({ ar: 'خطأ في جلب العناصر', en: 'Error fetching components' }));
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !selectedTemplate) return;

    const oldIndex = components.findIndex((c) => c.id === active.id);
    const newIndex = components.findIndex((c) => c.id === over.id);

    const newComponents = arrayMove(components, oldIndex, newIndex);
    setComponents(newComponents);

    // تحديث order_index في قاعدة البيانات
    try {
      const updates = newComponents.map((comp, index) => ({
        id: comp.id,
        order_index: index,
      }));

      await Promise.all(
        updates.map((update) =>
          supabase
            .from('email_template_components')
            .update({ order_index: update.order_index })
            .eq('id', update.id)
        )
      );
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(t({ ar: 'خطأ في تحديث الترتيب', en: 'Error updating order' }));
      fetchComponents(selectedTemplate.id);
    }
  };

  const addComponent = async (type: TemplateComponent['component_type']) => {
    if (!selectedTemplate) {
      toast.error(t({ ar: 'يرجى اختيار قالب أولاً', en: 'Please select a template first' }));
      return;
    }

    try {
      const maxOrder = components.length > 0 ? Math.max(...components.map((c) => c.order_index)) : -1;

      const defaultContent: Record<string, any> = {
        text: { text: '', align: 'left' },
        image: { src: '', alt: '', width: '100%' },
        button: { text: 'Click Here', url: '#', style: 'primary' },
        divider: { style: 'solid', color: '#e5e7eb' },
        spacer: { height: '20px' },
        signature: { html: '', text: '' },
        variable: { name: '', label: '', type: 'text' },
      };

      const { data, error } = await supabase
        .from('email_template_components')
        .insert({
          template_id: selectedTemplate.id,
          component_type: type,
          content: defaultContent[type] || {},
          order_index: maxOrder + 1,
          style: {},
        })
        .select()
        .single();

      if (error) throw error;

      setComponents([...components, data]);
      toast.success(t({ ar: 'تم إضافة العنصر', en: 'Component added' }));
    } catch (error) {
      console.error('Error adding component:', error);
      toast.error(t({ ar: 'خطأ في إضافة العنصر', en: 'Error adding component' }));
    }
  };

  const updateComponent = async (id: string, updates: Partial<TemplateComponent>) => {
    try {
      const { error } = await supabase
        .from('email_template_components')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setComponents(components.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    } catch (error) {
      console.error('Error updating component:', error);
      toast.error(t({ ar: 'خطأ في تحديث العنصر', en: 'Error updating component' }));
    }
  };

  const deleteComponent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('email_template_components')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setComponents(components.filter((c) => c.id !== id));
      toast.success(t({ ar: 'تم حذف العنصر', en: 'Component deleted' }));
    } catch (error) {
      console.error('Error deleting component:', error);
      toast.error(t({ ar: 'خطأ في حذف العنصر', en: 'Error deleting component' }));
    }
  };

  const createNewTemplate = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          name_ar: 'قالب جديد',
          name_en: 'New Template',
          body_html: '',
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setTemplates([...templates, data]);
      setSelectedTemplate(data);
      setComponents([]);
      toast.success(t({ ar: 'تم إنشاء القالب', en: 'Template created' }));
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error(t({ ar: 'خطأ في إنشاء القالب', en: 'Error creating template' }));
    }
  };

  const saveTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('email_templates')
        .update({
          ...selectedTemplate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedTemplate.id);

      if (error) throw error;

      toast.success(t({ ar: 'تم حفظ القالب', en: 'Template saved' }));
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error(t({ ar: 'خطأ في حفظ القالب', en: 'Error saving template' }));
    } finally {
      setSaving(false);
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
            <Layout className="w-5 h-5" />
            {t({ ar: 'مصمم قوالب البريد المرسل', en: 'Outgoing Email Template Designer' })}
          </CardTitle>
          <CardDescription>
            {t({ ar: 'تصميم قوالب البريد الإلكتروني المرسل مع التواقيع', en: 'Design outgoing email templates with signatures' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* اختيار القالب */}
          <div className="flex items-center gap-4">
            <Select
              value={selectedTemplate?.id || ''}
              onValueChange={(value) => {
                const template = templates.find((t) => t.id === value);
                setSelectedTemplate(template || null);
              }}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder={t({ ar: 'اختر قالب', en: 'Select Template' })} />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {language === 'ar' ? template.name_ar : template.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={createNewTemplate} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              {t({ ar: 'قالب جديد', en: 'New Template' })}
            </Button>
            {selectedTemplate && (
              <Button onClick={saveTemplate} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {t({ ar: 'حفظ', en: 'Save' })}
              </Button>
            )}
          </div>

          {selectedTemplate && (
            <Tabs defaultValue="design" className="space-y-4">
              <TabsList>
                <TabsTrigger value="design">
                  {t({ ar: 'التصميم', en: 'Design' })}
                </TabsTrigger>
                <TabsTrigger value="preview">
                  {t({ ar: 'المعاينة', en: 'Preview' })}
                </TabsTrigger>
                <TabsTrigger value="settings">
                  {t({ ar: 'الإعدادات', en: 'Settings' })}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="design" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {/* مكتبة العناصر */}
                  {showComponentLibrary && (
                    <div className="lg:col-span-1">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            {t({ ar: 'مكتبة العناصر', en: 'Component Library' })}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => addComponent('text')}
                          >
                            <Type className="w-4 h-4 mr-2" />
                            {t({ ar: 'نص', en: 'Text' })}
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => addComponent('image')}
                          >
                            <Image className="w-4 h-4 mr-2" />
                            {t({ ar: 'صورة', en: 'Image' })}
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => addComponent('button')}
                          >
                            <Link className="w-4 h-4 mr-2" />
                            {t({ ar: 'زر', en: 'Button' })}
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => addComponent('divider')}
                          >
                            <Minus className="w-4 h-4 mr-2" />
                            {t({ ar: 'فاصل', en: 'Divider' })}
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => addComponent('spacer')}
                          >
                            <Minus className="w-4 h-4 mr-2" />
                            {t({ ar: 'مسافة', en: 'Spacer' })}
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => addComponent('signature')}
                          >
                            <Layout className="w-4 h-4 mr-2" />
                            {t({ ar: 'توقيع', en: 'Signature' })}
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => addComponent('variable')}
                          >
                            <Type className="w-4 h-4 mr-2" />
                            {t({ ar: 'متغير', en: 'Variable' })}
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* منطقة التصميم */}
                  <div className={`lg:col-span-${showComponentLibrary ? '3' : '4'}`}>
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">
                            {t({ ar: 'منطقة التصميم', en: 'Design Area' })}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPreviewMode('desktop')}
                              className={previewMode === 'desktop' ? 'bg-primary text-primary-foreground' : ''}
                            >
                              <Monitor className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPreviewMode('tablet')}
                              className={previewMode === 'tablet' ? 'bg-primary text-primary-foreground' : ''}
                            >
                              <Tablet className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPreviewMode('mobile')}
                              className={previewMode === 'mobile' ? 'bg-primary text-primary-foreground' : ''}
                            >
                              <Smartphone className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={components.map((c) => c.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <DesignArea
                              previewMode={previewMode}
                              components={components}
                                      onUpdate={updateComponent}
                                      onDelete={deleteComponent}
                                      language={language}
                                      t={t}
                                    />
                          </SortableContext>
                        </DndContext>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview">
                <EmailPreview
                  template={selectedTemplate}
                  components={components}
                  previewMode={previewMode}
                  language={language}
                />
              </TabsContent>

              <TabsContent value="settings">
                <TemplateSettings
                  template={selectedTemplate}
                  onUpdate={(updates) => setSelectedTemplate({ ...selectedTemplate, ...updates })}
                  language={language}
                  t={t}
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DesignArea({
  previewMode,
  components,
  onUpdate,
  onDelete,
  language,
  t,
}: {
  previewMode: 'desktop' | 'tablet' | 'mobile';
  components: TemplateComponent[];
  onUpdate: (id: string, updates: Partial<TemplateComponent>) => void;
  onDelete: (id: string) => void;
  language: string;
  t: (obj: { ar: string; en: string }) => string;
}) {
  const [designSettings, setDesignSettings] = useState<any>(null);

  useEffect(() => {
    const fetchDesignSettings = async () => {
      try {
        const { data } = await supabase
          .from('email_design_settings')
          .select('*')
          .limit(1)
          .single();
        if (data) {
          setDesignSettings(data);
        }
      } catch (error) {
        console.error('Error fetching design settings:', error);
      }
    };
    fetchDesignSettings();
  }, []);

  const getDesignAreaStyles = () => {
    if (!designSettings) {
      const defaults = {
        desktop: { maxWidth: '600px' },
        tablet: { maxWidth: '768px' },
        mobile: { maxWidth: '375px' },
      };
      return defaults[previewMode];
    }

    if (previewMode === 'desktop') {
      return { maxWidth: `${designSettings.desktop_width || 600}px` };
    } else if (previewMode === 'tablet') {
      return { maxWidth: `${designSettings.tablet_width || 768}px` };
    } else {
      return { maxWidth: `${designSettings.mobile_width || 375}px` };
    }
  };

  return (
    <div
      className="border-2 border-dashed rounded-lg p-4 min-h-[400px] bg-muted/20"
      style={{
        ...getDesignAreaStyles(),
        margin: '0 auto',
      }}
    >
      {components.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          {t({ ar: 'اسحب العناصر من المكتبة لبدء التصميم', en: 'Drag components from library to start designing' })}
        </div>
      ) : (
        <div className="space-y-2">
          {components.map((component) => (
            <ComponentItem
              key={component.id}
              component={component}
              onUpdate={onUpdate}
              onDelete={onDelete}
              language={language}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ComponentItem({
  component,
  onUpdate,
  onDelete,
  language,
  t,
}: {
  component: TemplateComponent;
  onUpdate: (id: string, updates: Partial<TemplateComponent>) => void;
  onDelete: (id: string) => void;
  language: string;
  t: (obj: { ar: string; en: string }) => string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(component.content);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    onUpdate(component.id, { content: editedContent });
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 p-3 border rounded-lg bg-card hover:bg-accent/50"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="flex-1">
        {isEditing ? (
          <div className="space-y-2">
            {component.component_type === 'text' && (
              <Textarea
                value={editedContent.text || ''}
                onChange={(e) =>
                  setEditedContent({ ...editedContent, text: e.target.value })
                }
                placeholder={t({ ar: 'أدخل النص', en: 'Enter text' })}
              />
            )}
            {component.component_type === 'image' && (
              <div className="space-y-2">
                <Input
                  value={editedContent.src || ''}
                  onChange={(e) =>
                    setEditedContent({ ...editedContent, src: e.target.value })
                  }
                  placeholder={t({ ar: 'رابط الصورة', en: 'Image URL' })}
                />
                <Input
                  value={editedContent.alt || ''}
                  onChange={(e) =>
                    setEditedContent({ ...editedContent, alt: e.target.value })
                  }
                  placeholder={t({ ar: 'النص البديل', en: 'Alt text' })}
                />
              </div>
            )}
            {component.component_type === 'button' && (
              <div className="space-y-2">
                <Input
                  value={editedContent.text || ''}
                  onChange={(e) =>
                    setEditedContent({ ...editedContent, text: e.target.value })
                  }
                  placeholder={t({ ar: 'نص الزر', en: 'Button text' })}
                />
                <Input
                  value={editedContent.url || ''}
                  onChange={(e) =>
                    setEditedContent({ ...editedContent, url: e.target.value })
                  }
                  placeholder={t({ ar: 'الرابط', en: 'URL' })}
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                {t({ ar: 'حفظ', en: 'Save' })}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                {t({ ar: 'إلغاء', en: 'Cancel' })}
              </Button>
            </div>
          </div>
        ) : (
          <div onClick={() => setIsEditing(true)} className="cursor-pointer">
            {component.component_type === 'text' && (
              <p>{component.content.text || t({ ar: 'نص', en: 'Text' })}</p>
            )}
            {component.component_type === 'image' && (
              <div className="border rounded p-2">
                {component.content.src ? (
                  <img
                    src={component.content.src}
                    alt={component.content.alt}
                    className="max-w-full h-auto"
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">
                    {t({ ar: 'صورة', en: 'Image' })}
                  </p>
                )}
              </div>
            )}
            {component.component_type === 'button' && (
              <Button variant="default">
                {component.content.text || t({ ar: 'زر', en: 'Button' })}
              </Button>
            )}
            {component.component_type === 'divider' && <hr />}
            {component.component_type === 'spacer' && (
              <div style={{ height: component.content.height || '20px' }} />
            )}
            {component.component_type === 'signature' && (
              <div
                dangerouslySetInnerHTML={{
                  __html: component.content.html || '',
                }}
              />
            )}
            {component.component_type === 'variable' && (
              <span className="text-primary">
                {'{{' + (component.content.name || 'variable') + '}}'}
              </span>
            )}
          </div>
        )}
      </div>

      {!isEditing && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(component.id)}
          className="text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

function EmailPreview({
  template,
  components,
  previewMode,
  language,
}: {
  template: EmailTemplate;
  components: TemplateComponent[];
  previewMode: 'desktop' | 'tablet' | 'mobile';
  language: string;
}) {
  const [designSettings, setDesignSettings] = useState<any>(null);

  useEffect(() => {
    const fetchDesignSettings = async () => {
      try {
        const { data } = await supabase
          .from('email_design_settings')
          .select('*')
          .limit(1)
          .single();
        if (data) {
          setDesignSettings(data);
        }
      } catch (error) {
        console.error('Error fetching design settings:', error);
      }
    };
    fetchDesignSettings();
  }, []);

  const getPreviewStyles = () => {
    if (!designSettings) {
      const defaults = {
        desktop: { width: '600px', fontSize: '14px', lineHeight: 1.6, backgroundColor: '#ffffff', color: '#333333' },
        tablet: { width: '768px', fontSize: '16px', lineHeight: 1.6, backgroundColor: '#ffffff', color: '#333333' },
        mobile: { width: '375px', fontSize: '14px', lineHeight: 1.5, backgroundColor: '#ffffff', color: '#333333' },
      };
      return defaults[previewMode];
    }

    if (previewMode === 'desktop') {
      return {
        width: `${designSettings.desktop_width || 600}px`,
        fontSize: `${designSettings.desktop_font_size || 14}px`,
        lineHeight: designSettings.desktop_line_height || 1.6,
        backgroundColor: designSettings.desktop_background_color || '#ffffff',
        color: designSettings.desktop_text_color || '#333333',
      };
    } else if (previewMode === 'tablet') {
      return {
        width: `${designSettings.tablet_width || 768}px`,
        fontSize: `${designSettings.tablet_font_size || 16}px`,
        lineHeight: designSettings.tablet_line_height || 1.6,
        backgroundColor: designSettings.tablet_background_color || '#ffffff',
        color: designSettings.tablet_text_color || '#333333',
      };
    } else {
      return {
        width: `${designSettings.mobile_width || 375}px`,
        fontSize: `${designSettings.mobile_font_size || 14}px`,
        lineHeight: designSettings.mobile_line_height || 1.5,
        backgroundColor: designSettings.mobile_background_color || '#ffffff',
        color: designSettings.mobile_text_color || '#333333',
      };
    }
  };

  const styles = getPreviewStyles();

  return (
    <div className="border rounded-lg p-4 bg-muted/20">
      <div
        className="mx-auto p-6 rounded shadow-lg"
        style={{
          maxWidth: styles.width,
          fontSize: styles.fontSize,
          lineHeight: styles.lineHeight,
          backgroundColor: styles.backgroundColor,
          color: styles.color,
        }}
      >
        <h2 className="text-xl font-bold mb-4">
          {language === 'ar' ? template.subject_ar : template.subject_en || template.name_en}
        </h2>
        <div className="space-y-4">
          {components.map((component) => (
            <div key={component.id}>
              {component.component_type === 'text' && (
                <p style={{ fontSize: styles.fontSize, lineHeight: styles.lineHeight, color: styles.color }}>
                  {component.content.text}
                </p>
              )}
              {component.component_type === 'image' && component.content.src && (
                <img
                  src={component.content.src}
                  alt={component.content.alt}
                  className="max-w-full h-auto"
                  style={{ width: previewMode === 'mobile' ? '100%' : 'auto' }}
                />
              )}
              {component.component_type === 'button' && (
                <a
                  href={component.content.url}
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded"
                  style={{ fontSize: previewMode === 'mobile' ? '14px' : '16px' }}
                >
                  {component.content.text}
                </a>
              )}
              {component.component_type === 'divider' && <hr />}
              {component.component_type === 'spacer' && (
                <div style={{ height: component.content.height || '20px' }} />
              )}
              {component.component_type === 'signature' && (
                <div dangerouslySetInnerHTML={{ __html: component.content.html || '' }} />
              )}
            </div>
          ))}
        </div>
        {template.signature_html && (
          <div
            className="mt-6 pt-4 border-t"
            dangerouslySetInnerHTML={{ __html: template.signature_html }}
          />
        )}
      </div>
    </div>
  );
}

function TemplateSettings({
  template,
  onUpdate,
  language,
  t,
}: {
  template: EmailTemplate;
  onUpdate: (updates: Partial<EmailTemplate>) => void;
  language: string;
  t: (obj: { ar: string; en: string }) => string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t({ ar: 'الاسم بالعربية', en: 'Name (Arabic)' })}</Label>
          <Input
            value={template.name_ar}
            onChange={(e) => onUpdate({ name_ar: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t({ ar: 'الاسم بالإنجليزية', en: 'Name (English)' })}</Label>
          <Input
            value={template.name_en}
            onChange={(e) => onUpdate({ name_en: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t({ ar: 'الموضوع بالعربية', en: 'Subject (Arabic)' })}</Label>
          <Input
            value={template.subject_ar || ''}
            onChange={(e) => onUpdate({ subject_ar: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t({ ar: 'الموضوع بالإنجليزية', en: 'Subject (English)' })}</Label>
          <Input
            value={template.subject_en || ''}
            onChange={(e) => onUpdate({ subject_en: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>{t({ ar: 'التوقيع HTML', en: 'Signature HTML' })}</Label>
        <Textarea
          value={template.signature_html || ''}
          onChange={(e) => onUpdate({ signature_html: e.target.value })}
          rows={6}
          placeholder={t({ ar: 'أدخل HTML للتوقيع', en: 'Enter HTML for signature' })}
        />
      </div>
    </div>
  );
}
