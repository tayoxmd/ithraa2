import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  Undo, 
  Redo, 
  Eye, 
  EyeOff, 
  Smartphone, 
  Tablet, 
  Monitor,
  Type,
  Image as ImageIcon,
  Code,
  Layout,
  Settings as SettingsIcon,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface PageElement {
  id: string;
  type: 'text' | 'image' | 'code' | 'box' | 'field';
  content: string;
  styles: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    padding?: number;
    margin?: number;
    width?: number;
    height?: number;
    mobile?: {
      fontSize?: number;
      padding?: number;
      margin?: number;
      width?: number;
      height?: number;
      display?: 'block' | 'none';
    };
    tablet?: {
      fontSize?: number;
      padding?: number;
      margin?: number;
      width?: number;
      height?: number;
      display?: 'block' | 'none';
    };
    desktop?: {
      fontSize?: number;
      padding?: number;
      margin?: number;
      width?: number;
      height?: number;
      display?: 'block' | 'none';
    };
  };
  position: { x: number; y: number };
  visible: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
}

interface HistoryState {
  elements: PageElement[];
  timestamp: number;
}

export function PageBuilder() {
  const { t } = useLanguage();
  const [elements, setElements] = useState<PageElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPageData();
  }, []);

  const loadPageData = async () => {
    try {
      const { data, error } = await supabase
        .from('page_builder_data')
        .select('*')
        .eq('page_type', 'homepage')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.elements) {
        const loadedElements = Array.isArray(data.elements) ? data.elements : [];
        setElements(loadedElements);
        addToHistory(loadedElements);
      }
    } catch (error) {
      console.error('Error loading page data:', error);
      toast.error(t({ ar: 'خطأ في تحميل البيانات', en: 'Error loading data' }));
    } finally {
      setLoading(false);
    }
  };

  const addToHistory = (newElements: PageElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      elements: JSON.parse(JSON.stringify(newElements)),
      timestamp: Date.now(),
    });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements(JSON.parse(JSON.stringify(history[newIndex].elements)));
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements(JSON.parse(JSON.stringify(history[newIndex].elements)));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('page_builder_data')
        .upsert({
          page_type: 'homepage',
          elements: elements,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      addToHistory(elements);
      toast.success(t({ ar: 'تم الحفظ بنجاح', en: 'Saved successfully' }));
    } catch (error) {
      console.error('Error saving:', error);
      toast.error(t({ ar: 'خطأ في الحفظ', en: 'Error saving' }));
    } finally {
      setSaving(false);
    }
  };

  const handleElementChange = (elementId: string, updates: Partial<PageElement>) => {
    const newElements = elements.map(el =>
      el.id === elementId ? { ...el, ...updates } : el
    );
    setElements(newElements);
    addToHistory(newElements);
  };

  const handleAddElement = (type: PageElement['type']) => {
    const newElement: PageElement = {
      id: `element-${Date.now()}`,
      type,
      content: type === 'text' ? 'نص جديد' : type === 'image' ? '' : '',
      styles: {
        fontSize: 16,
        fontFamily: 'Cairo',
        color: '#000000',
        backgroundColor: '#ffffff',
        padding: 10,
        margin: 10,
        mobile: { display: 'block' },
        tablet: { display: 'block' },
        desktop: { display: 'block' },
      },
      position: { x: 50, y: 50 },
      visible: {
        mobile: true,
        tablet: true,
        desktop: true,
      },
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements);
    setSelectedElement(newElement.id);
  };

  const handleDeleteElement = (elementId: string) => {
    const newElements = elements.filter(el => el.id !== elementId);
    setElements(newElements);
    addToHistory(newElements);
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
  };

  const getPreviewStyles = (element: PageElement) => {
    const baseStyles = element.styles;
    const deviceStyles = baseStyles[previewMode] || {};
    
    return {
      fontSize: deviceStyles.fontSize || baseStyles.fontSize || 16,
      fontFamily: baseStyles.fontFamily || 'Cairo',
      color: baseStyles.color || '#000000',
      backgroundColor: baseStyles.backgroundColor || '#ffffff',
      padding: `${deviceStyles.padding || baseStyles.padding || 10}px`,
      margin: `${deviceStyles.margin || baseStyles.margin || 10}px`,
      width: deviceStyles.width || baseStyles.width ? `${deviceStyles.width || baseStyles.width}px` : 'auto',
      height: deviceStyles.height || baseStyles.height ? `${deviceStyles.height || baseStyles.height}px` : 'auto',
      display: element.visible[previewMode] ? (deviceStyles.display || 'block') : 'none',
      position: 'relative' as const,
    };
  };

  const selectedElementData = elements.find(el => el.id === selectedElement);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Layout className="w-5 h-5" />
              {t({ ar: 'منشئ الصفحات', en: 'Page Builder' })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
              >
                <Redo className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? t({ ar: 'جاري الحفظ...', en: 'Saving...' }) : t({ ar: 'حفظ', en: 'Save' })}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Label>{t({ ar: 'وضع المعاينة:', en: 'Preview Mode:' })}</Label>
              <div className="flex gap-1">
                <Button
                  variant={previewMode === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('mobile')}
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
                <Button
                  variant={previewMode === 'tablet' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('tablet')}
                >
                  <Tablet className="w-4 h-4" />
                </Button>
                <Button
                  variant={previewMode === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('desktop')}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Label>{t({ ar: 'إضافة عنصر:', en: 'Add Element:' })}</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddElement('text')}
              >
                <Type className="w-4 h-4 mr-1" />
                {t({ ar: 'نص', en: 'Text' })}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddElement('image')}
              >
                <ImageIcon className="w-4 h-4 mr-1" />
                {t({ ar: 'صورة', en: 'Image' })}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddElement('box')}
              >
                <Layout className="w-4 h-4 mr-1" />
                {t({ ar: 'صندوق', en: 'Box' })}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddElement('field')}
              >
                <Code className="w-4 h-4 mr-1" />
                {t({ ar: 'حقل', en: 'Field' })}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview Panel */}
        <div className={`lg:col-span-2 ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-4' : ''}`}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {t({ ar: 'معاينة مباشرة', en: 'Live Preview' })} ({previewMode})
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div
                ref={previewRef}
                className={`border-2 border-dashed border-border rounded-lg p-8 bg-muted/30 min-h-[600px] ${
                  previewMode === 'mobile' ? 'max-w-sm mx-auto' :
                  previewMode === 'tablet' ? 'max-w-2xl mx-auto' :
                  'w-full'
                }`}
                style={{
                  backgroundColor: '#f5f5f5',
                }}
              >
                {elements.length === 0 ? (
                  <div className="text-center text-muted-foreground py-20">
                    {t({ ar: 'لا توجد عناصر. أضف عنصراً للبدء.', en: 'No elements. Add an element to start.' })}
                  </div>
                ) : (
                  elements.map((element) => {
                    const styles = getPreviewStyles(element);
                    return (
                      <div
                        key={element.id}
                        onClick={() => setSelectedElement(element.id)}
                        className={`mb-4 cursor-pointer transition-all ${
                          selectedElement === element.id ? 'ring-2 ring-primary' : ''
                        }`}
                        style={styles}
                      >
                        {element.type === 'text' && (
                          <div>{element.content}</div>
                        )}
                        {element.type === 'image' && (
                          <div className="bg-gray-200 p-4 text-center text-gray-500">
                            {element.content ? (
                              <img src={element.content} alt="" className="max-w-full h-auto" />
                            ) : (
                              t({ ar: 'ضع رابط الصورة هنا', en: 'Place image URL here' })
                            )}
                          </div>
                        )}
                        {element.type === 'box' && (
                          <div className="border-2 border-dashed p-4">
                            {element.content || t({ ar: 'محتوى الصندوق', en: 'Box Content' })}
                          </div>
                        )}
                        {element.type === 'field' && (
                          <div className="border p-2">
                            {element.content || t({ ar: 'محتوى الحقل', en: 'Field Content' })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Properties Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedElementData
                  ? t({ ar: 'خصائص العنصر', en: 'Element Properties' })
                  : t({ ar: 'لا يوجد عنصر محدد', en: 'No Element Selected' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedElementData ? (
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="general">{t({ ar: 'عام', en: 'General' })}</TabsTrigger>
                    <TabsTrigger value="styles">{t({ ar: 'التنسيق', en: 'Styles' })}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-4 mt-4">
                    <div>
                      <Label>{t({ ar: 'المحتوى', en: 'Content' })}</Label>
                      <Input
                        value={selectedElementData.content}
                        onChange={(e) =>
                          handleElementChange(selectedElementData.id, { content: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>{t({ ar: 'الظهور', en: 'Visibility' })}</Label>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center gap-2">
                            <Smartphone className="w-4 h-4" />
                            {t({ ar: 'الجوال', en: 'Mobile' })}
                          </span>
                          <Switch
                            checked={selectedElementData.visible.mobile}
                            onCheckedChange={(checked) =>
                              handleElementChange(selectedElementData.id, {
                                visible: { ...selectedElementData.visible, mobile: checked },
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center gap-2">
                            <Tablet className="w-4 h-4" />
                            {t({ ar: 'التابلت', en: 'Tablet' })}
                          </span>
                          <Switch
                            checked={selectedElementData.visible.tablet}
                            onCheckedChange={(checked) =>
                              handleElementChange(selectedElementData.id, {
                                visible: { ...selectedElementData.visible, tablet: checked },
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center gap-2">
                            <Monitor className="w-4 h-4" />
                            {t({ ar: 'سطح المكتب', en: 'Desktop' })}
                          </span>
                          <Switch
                            checked={selectedElementData.visible.desktop}
                            onCheckedChange={(checked) =>
                              handleElementChange(selectedElementData.id, {
                                visible: { ...selectedElementData.visible, desktop: checked },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => handleDeleteElement(selectedElementData.id)}
                    >
                      {t({ ar: 'حذف العنصر', en: 'Delete Element' })}
                    </Button>
                  </TabsContent>

                  <TabsContent value="styles" className="space-y-4 mt-4">
                    <div>
                      <Label>{t({ ar: 'خط', en: 'Font Family' })}</Label>
                      <Select
                        value={selectedElementData.styles.fontFamily || 'Cairo'}
                        onValueChange={(value) =>
                          handleElementChange(selectedElementData.id, {
                            styles: { ...selectedElementData.styles, fontFamily: value },
                          })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cairo">Cairo</SelectItem>
                          <SelectItem value="Tajawal">Tajawal</SelectItem>
                          <SelectItem value="Almarai">Almarai</SelectItem>
                          <SelectItem value="Arial">Arial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>{t({ ar: 'حجم الخط', en: 'Font Size' })} ({previewMode})</Label>
                      <Input
                        type="number"
                        value={
                          selectedElementData.styles[previewMode]?.fontSize ||
                          selectedElementData.styles.fontSize ||
                          16
                        }
                        onChange={(e) =>
                          handleElementChange(selectedElementData.id, {
                            styles: {
                              ...selectedElementData.styles,
                              [previewMode]: {
                                ...selectedElementData.styles[previewMode],
                                fontSize: parseInt(e.target.value) || 16,
                              },
                            },
                          })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>{t({ ar: 'اللون', en: 'Color' })}</Label>
                      <Input
                        type="color"
                        value={selectedElementData.styles.color || '#000000'}
                        onChange={(e) =>
                          handleElementChange(selectedElementData.id, {
                            styles: { ...selectedElementData.styles, color: e.target.value },
                          })
                        }
                        className="mt-1 h-10"
                      />
                    </div>

                    <div>
                      <Label>{t({ ar: 'خلفية', en: 'Background' })}</Label>
                      <Input
                        type="color"
                        value={selectedElementData.styles.backgroundColor || '#ffffff'}
                        onChange={(e) =>
                          handleElementChange(selectedElementData.id, {
                            styles: { ...selectedElementData.styles, backgroundColor: e.target.value },
                          })
                        }
                        className="mt-1 h-10"
                      />
                    </div>

                    <div>
                      <Label>{t({ ar: 'المسافة الداخلية', en: 'Padding' })} ({previewMode})</Label>
                      <Input
                        type="number"
                        value={
                          selectedElementData.styles[previewMode]?.padding ||
                          selectedElementData.styles.padding ||
                          10
                        }
                        onChange={(e) =>
                          handleElementChange(selectedElementData.id, {
                            styles: {
                              ...selectedElementData.styles,
                              [previewMode]: {
                                ...selectedElementData.styles[previewMode],
                                padding: parseInt(e.target.value) || 10,
                              },
                            },
                          })
                        }
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>{t({ ar: 'العرض', en: 'Width' })} ({previewMode})</Label>
                      <Input
                        type="number"
                        value={
                          selectedElementData.styles[previewMode]?.width ||
                          selectedElementData.styles.width ||
                          ''
                        }
                        onChange={(e) =>
                          handleElementChange(selectedElementData.id, {
                            styles: {
                              ...selectedElementData.styles,
                              [previewMode]: {
                                ...selectedElementData.styles[previewMode],
                                width: parseInt(e.target.value) || undefined,
                              },
                            },
                          })
                        }
                        className="mt-1"
                        placeholder={t({ ar: 'تلقائي', en: 'Auto' })}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t({ ar: 'اختر عنصراً من المعاينة لتعديله', en: 'Select an element from preview to edit' })}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

