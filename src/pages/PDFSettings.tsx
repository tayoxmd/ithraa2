import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { FileText, Plus, Trash2, Eye, RefreshCw, Save, Palette, Layout, Type, Settings, MousePointer, Square, Circle as CircleIcon, Image as ImageIcon, Trash } from "lucide-react";
import { logAuditEvent } from "@/utils/auditLogger";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { generateBookingPDF } from "@/utils/pdfGenerator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Canvas as FabricCanvas, IText, Rect, Circle, FabricImage } from "fabric";
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

interface ResponsiblePerson {
  name: string;
  email: string;
  phone: string;
  position: string;
}

interface PDFSettings {
  id?: string;
  company_logo_url?: string;
  company_description_ar?: string;
  company_description_en?: string;
  terms_ar?: string;
  terms_en?: string;
  cancellation_policy_ar?: string;
  cancellation_policy_en?: string;
  bank_name?: string;
  bank_account_number?: string;
  iban?: string;
  bank_location?: string;
  responsible_persons?: ResponsiblePerson[];
  contact_numbers?: string[];
  
  // Font settings
  primary_font?: string;
  secondary_font?: string;
  font_size_header?: number;
  font_size_title?: number;
  font_size_body?: number;
  font_size_small?: number;
  
  // Color settings
  primary_color?: string;
  secondary_color?: string;
  text_color?: string;
  header_bg_color?: string;
  footer_bg_color?: string;
  
  // Layout settings
  header_height?: number;
  footer_height?: number;
  logo_width?: number;
  logo_height?: number;
  logo_position_x?: number;
  logo_position_y?: number;
  
  // Content positioning
  booking_number_x?: number;
  booking_number_y?: number;
  title_y?: number;
  client_info_y?: number;
  booking_table_y?: number;
  price_section_y?: number;
  bank_details_y?: number;
  terms_y?: number;
  
  // Margins and spacing
  page_margin_left?: number;
  page_margin_right?: number;
  section_spacing?: number;
  line_height?: number;
  
  // Show/hide sections
  show_logo?: boolean;
  show_company_description?: boolean;
  show_bank_details?: boolean;
  show_terms?: boolean;
  show_responsible_persons?: boolean;
  show_footer_info?: boolean;
  
  // Additional content
  header_text_en?: string;
  header_text_ar?: string;
  footer_company_name_en?: string;
  footer_company_name_ar?: string;
  company_license?: string;
  company_vat?: string;
  company_cr?: string;
  
  // SVG Logos
  header_logo_svg_en?: string;
  header_logo_svg_ar?: string;
  footer_logo_svg_en?: string;
  footer_logo_svg_ar?: string;
  
  // Hotel Confirmation Number Display Settings
  hotel_confirmation_font_size?: number;
  hotel_confirmation_font_family?: string;
  hotel_confirmation_text_color?: string;
  hotel_confirmation_border_color?: string;
  hotel_confirmation_border_width?: number;
  hotel_confirmation_box_x?: number;
  hotel_confirmation_box_y?: number;
  hotel_confirmation_box_width?: number;
  hotel_confirmation_box_height?: number;
  hotel_confirmation_box_padding?: number;
  hotel_confirmation_box_border_radius?: number;
}

export default function PDFSettings() {
  const { userRole, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<PDFSettings>({
    responsible_persons: [],
    contact_numbers: [],
    primary_font: 'helvetica',
    secondary_font: 'helvetica',
    font_size_header: 18,
    font_size_title: 14,
    font_size_body: 10,
    font_size_small: 8,
    primary_color: '75,0,130',
    secondary_color: '245,245,245',
    text_color: '0,0,0',
    header_bg_color: '75,0,130',
    footer_bg_color: '75,0,130',
    header_height: 30,
    footer_height: 20,
    logo_width: 40,
    logo_height: 20,
    logo_position_x: 15,
    logo_position_y: 5,
    booking_number_x: 160,
    booking_number_y: 15,
    title_y: 38,
    client_info_y: 60,
    booking_table_y: 105,
    price_section_y: 150,
    bank_details_y: 180,
    terms_y: 220,
    page_margin_left: 15,
    page_margin_right: 15,
    section_spacing: 10,
    line_height: 6,
    show_logo: true,
    show_company_description: true,
    show_bank_details: true,
    show_terms: true,
    show_responsible_persons: true,
    show_footer_info: true,
    header_text_en: 'CONFIRMATION',
    header_text_ar: 'تأكيد',
    footer_company_name_en: 'Ethraa Company for Tourist Accommodation',
    footer_company_name_ar: 'شركة إثراء للإيواء السياحي',
    company_license: '73105372',
    company_vat: '302006094600003',
    company_cr: '4031285856',
    hotel_confirmation_font_size: 12,
    hotel_confirmation_font_family: 'helvetica',
    hotel_confirmation_text_color: '75,0,130',
    hotel_confirmation_border_color: '75,0,130',
    hotel_confirmation_border_width: 1,
    hotel_confirmation_box_x: 15,
    hotel_confirmation_box_y: 38,
    hotel_confirmation_box_width: 180,
    hotel_confirmation_box_height: 12,
    hotel_confirmation_box_padding: 3,
    hotel_confirmation_box_border_radius: 4
  });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTab, setActiveTab] = useState("content");
  const [editorTool, setEditorTool] = useState<"select" | "text" | "rect" | "circle" | "image">("select");
  const [editorColor, setEditorColor] = useState("#000000");
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (userRole !== 'admin') {
        navigate('/');
        return;
      }
      fetchSettings();
    }
  }, [userRole, loading, navigate]);

  // Initialize PDF.js worker
  useEffect(() => {
    (pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;
  }, []);

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvas) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 595, // A4 width in points
      height: 842, // A4 height in points
      backgroundColor: "#ffffff",
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  // Auto-generate preview on mount and settings change
  useEffect(() => {
    if (settings.id && !loadingSettings) {
      const timer = setTimeout(() => {
        generatePreview();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [settings, loadingSettings]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('pdf_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        const parseJsonField = (field: any, defaultValue: any) => {
          if (!field) return defaultValue;
          if (typeof field === 'string') {
            try {
              return JSON.parse(field);
            } catch {
              return defaultValue;
            }
          }
          return Array.isArray(field) ? field : defaultValue;
        };

        setSettings({
          ...data,
          responsible_persons: parseJsonField(data.responsible_persons, []),
          contact_numbers: parseJsonField(data.contact_numbers, [])
        });
      }
    } catch (error) {
      console.error('Error fetching PDF settings:', error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { id, ...settingsData } = settings;
      
      const dataToSave = {
        ...settingsData,
        responsible_persons: JSON.stringify(settingsData.responsible_persons || []),
        contact_numbers: JSON.stringify(settingsData.contact_numbers || [])
      };

      if (id) {
        const { error } = await supabase
          .from('pdf_settings')
          .update(dataToSave as any)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('pdf_settings')
          .insert([dataToSave as any]);

        if (error) throw error;
      }

      toast({
        title: t({ ar: "تم الحفظ بنجاح", en: "Saved Successfully" }),
        description: t({ ar: "تم حفظ إعدادات PDF بنجاح", en: "PDF settings saved successfully" }),
      });

      logAuditEvent('UPDATE', 'pdf_settings', id, { settings: settingsData }).catch(() => {});

      fetchSettings();
      
      // تحديث المعاينة تلقائياً
      if (showPreview) {
        generatePreview();
      }
    } catch (error) {
      console.error('Error saving PDF settings:', error);
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: t({ ar: "حدث خطأ أثناء الحفظ", en: "An error occurred while saving" }),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addResponsiblePerson = () => {
    setSettings({
      ...settings,
      responsible_persons: [
        ...(settings.responsible_persons || []),
        { name: '', email: '', phone: '', position: 'Reservation' }
      ]
    });
  };

  const removeResponsiblePerson = (index: number) => {
    const persons = [...(settings.responsible_persons || [])];
    persons.splice(index, 1);
    setSettings({ ...settings, responsible_persons: persons });
  };

  const updateResponsiblePerson = (index: number, field: keyof ResponsiblePerson, value: string) => {
    const persons = [...(settings.responsible_persons || [])];
    persons[index] = { ...persons[index], [field]: value };
    setSettings({ ...settings, responsible_persons: persons });
  };

  const addContactNumber = () => {
    setSettings({
      ...settings,
      contact_numbers: [...(settings.contact_numbers || []), '']
    });
  };

  const removeContactNumber = (index: number) => {
    const numbers = [...(settings.contact_numbers || [])];
    numbers.splice(index, 1);
    setSettings({ ...settings, contact_numbers: numbers });
  };

  const updateContactNumber = (index: number, value: string) => {
    const numbers = [...(settings.contact_numbers || [])];
    numbers[index] = value;
    setSettings({ ...settings, contact_numbers: numbers });
  };

  const generatePreview = async () => {
    if (isGeneratingPreview) return;
    
    try {
      setIsGeneratingPreview(true);

      const sampleData = {
        bookingNumber: 12345,
        hotelConfirmationNumber: "HTL-2024-001",
        guestName: settings.responsible_persons?.[0]?.name || "John Doe",
        clientName: "Sample Client",
        clientEmail: settings.responsible_persons?.[0]?.email || "client@example.com",
        clientPhone: settings.contact_numbers?.[0] || "+966501234567",
        hotelNameEn: "Sample Hotel",
        hotelNameAr: "فندق نموذجي",
        hotelLocation: "Riyadh, Saudi Arabia",
        hotelLocationUrl: "https://maps.google.com",
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        nights: 3,
        rooms: 2,
        guests: 4,
        baseGuests: 4,
        extraGuests: 0,
        roomType: "Standard",
        pricePerNight: 500,
        subtotal: 3000,
        extraGuestCharge: 0,
        discountAmount: 0,
        netAmount: 3000,
        vatAmount: 450,
        totalAmount: 3450,
        paymentMethod: "Bank Transfer",
        notes: "Sample booking for preview",
        confirmedBy: settings.responsible_persons?.[0] || {
          name: "Reservation Department",
          email: "reservations@example.com",
          phone: "+966501234567",
          position: "Reservation"
        },
        customerPageUrl: window.location.origin + "/customer-dashboard",
        pdfSettings: settings
      };

      const pdf = await generateBookingPDF(sampleData);
      const pdfBlob = pdf.output('arraybuffer');
      
      // Load PDF into canvas using PDF.js
      const loadingTask = pdfjsLib.getDocument({ data: pdfBlob });
      const pdfDoc = await loadingTask.promise;
      const page = await pdfDoc.getPage(1);
      
      const viewport = page.getViewport({ scale: 1.0 });
      
      if (fabricCanvas) {
        fabricCanvas.setDimensions({
          width: viewport.width,
          height: viewport.height
        });
        
        // Render PDF page to a temporary canvas
        const tempCanvas = document.createElement('canvas');
        const context = tempCanvas.getContext('2d');
        tempCanvas.width = viewport.width;
        tempCanvas.height = viewport.height;
        
        if (context) {
          await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: tempCanvas
          }).promise;
          
          // Convert to fabric image and set as background
          const imgData = tempCanvas.toDataURL();
          const img = await FabricImage.fromURL(imgData);
          fabricCanvas.backgroundImage = img;
          fabricCanvas.renderAll();
        }
      }
      
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating preview:', error);
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: t({ ar: `حدث خطأ: ${error.message}`, en: `Error: ${error.message}` }),
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleEditorToolClick = (tool: typeof editorTool) => {
    setEditorTool(tool);

    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = false;

    if (tool === "text") {
      const text = new IText(t({ ar: "انقر للتحرير", en: "Click to edit" }), {
        left: 100,
        top: 100,
        fill: editorColor,
        fontSize: 20,
        fontFamily: 'Arial'
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
    } else if (tool === "rect") {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: editorColor,
        width: 100,
        height: 60,
      });
      fabricCanvas.add(rect);
      fabricCanvas.setActiveObject(rect);
    } else if (tool === "circle") {
      const circle = new Circle({
        left: 100,
        top: 100,
        fill: editorColor,
        radius: 50,
      });
      fabricCanvas.add(circle);
      fabricCanvas.setActiveObject(circle);
    }
    
    fabricCanvas.renderAll();
  };

  const handleClearAnnotations = () => {
    if (!fabricCanvas) return;
    
    const objects = fabricCanvas.getObjects();
    objects.forEach(obj => {
      if (!(obj === fabricCanvas.backgroundImage)) {
        fabricCanvas.remove(obj);
      }
    });
    fabricCanvas.renderAll();
    
    toast({
      title: t({ ar: "تم المسح", en: "Cleared" }),
      description: t({ ar: "تم مسح جميع التعديلات", en: "All annotations cleared" }),
    });
  };

  if (loading || loadingSettings) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  const ColorInput = ({ label, value, onChange, doneText, manualText }: { 
    label: string; 
    value: string; 
    onChange: (v: string) => void;
    doneText: string;
    manualText: string;
  }) => {
    const [r, g, b] = (value || '0,0,0').split(',').map(v => parseInt(v.trim()));
    const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    const [open, setOpen] = useState(false);
    
    const handleHexChange = (hex: string) => {
      const cleanHex = hex.replace('#', '');
      const r = parseInt(cleanHex.substr(0, 2), 16);
      const g = parseInt(cleanHex.substr(2, 2), 16);
      const b = parseInt(cleanHex.substr(4, 2), 16);
      onChange(`${r},${g},${b}`);
    };
    
    return (
      <div className="space-y-2">
        <Label className="mb-3 block">{label}</Label>
        <div className="flex gap-3 items-start">
          <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="w-20 h-20 rounded-lg border-2 border-border shadow-sm hover:scale-105 transition-transform cursor-pointer flex-shrink-0"
                style={{ backgroundColor: hexColor }}
              />
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-3 bg-background z-50 pointer-events-auto" 
              align="start"
              onInteractOutside={(e) => {
                e.preventDefault();
              }}
              onPointerDownOutside={(e) => {
                e.preventDefault();
              }}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div onPointerDown={(e) => e.stopPropagation()}>
                <HexColorPicker
                  color={hexColor}
                  onChange={handleHexChange}
                />
                <div className="mt-3 flex gap-2">
                  <Input
                    type="text"
                    value={hexColor}
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="font-mono text-sm"
                    placeholder="#000000"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setOpen(false)}
                  >
                    {doneText}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground mb-1 block">
              {manualText}
            </Label>
            <Input
              value={hexColor}
              onChange={(e) => handleHexChange(e.target.value)}
              placeholder="#FFFFFF"
              className="font-mono"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8" />
            {t({ ar: "نظام تصميم ملفات PDF", en: "PDF Design System" })}
          </h1>
          <div className="flex gap-2">
            <Button
              onClick={generatePreview}
              variant="outline"
              className="flex items-center gap-2"
            >
              {showPreview ? <RefreshCw className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {t({ ar: showPreview ? "تحديث المعاينة" : "معاينة", en: showPreview ? "Refresh" : "Preview" })}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? t({ ar: "جاري الحفظ...", en: "Saving..." }) : t({ ar: "حفظ", en: "Save" })}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Settings Tabs */}
          <Card className="card-luxury lg:col-span-5">
            <CardHeader>
              <CardTitle className="text-xl">
                {t({ ar: "إعدادات التصميم", en: "Design Settings" })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-5 w-full mb-4">
                  <TabsTrigger value="content" className="text-xs">
                    <FileText className="w-4 h-4 mr-1" />
                    {t({ ar: "المحتوى", en: "Content" })}
                  </TabsTrigger>
                  <TabsTrigger value="colors" className="text-xs">
                    <Palette className="w-4 h-4 mr-1" />
                    {t({ ar: "الألوان", en: "Colors" })}
                  </TabsTrigger>
                  <TabsTrigger value="fonts" className="text-xs">
                    <Type className="w-4 h-4 mr-1" />
                    {t({ ar: "الخطوط", en: "Fonts" })}
                  </TabsTrigger>
                  <TabsTrigger value="layout" className="text-xs">
                    <Layout className="w-4 h-4 mr-1" />
                    {t({ ar: "التخطيط", en: "Layout" })}
                  </TabsTrigger>
                  <TabsTrigger value="visibility" className="text-xs">
                    <Settings className="w-4 h-4 mr-1" />
                    {t({ ar: "العرض", en: "Display" })}
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[calc(100vh-320px)]">
                  {/* Content Tab */}
                  <TabsContent value="content" className="space-y-6 pr-4">
                    {/* Company Info */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        {t({ ar: "معلومات الشركة", en: "Company Information" })}
                      </h3>
                      
                      <div>
                        <Label>{t({ ar: "رابط الشعار", en: "Logo URL" })}</Label>
                        <Input
                          value={settings.company_logo_url || ''}
                          onChange={(e) => setSettings({ ...settings, company_logo_url: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>

                      <div>
                        <Label>{t({ ar: "وصف الشركة (عربي)", en: "Description (Arabic)" })}</Label>
                        <Textarea
                          value={settings.company_description_ar || ''}
                          onChange={(e) => setSettings({ ...settings, company_description_ar: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label>{t({ ar: "وصف الشركة (إنجليزي)", en: "Description (English)" })}</Label>
                        <Textarea
                          value={settings.company_description_en || ''}
                          onChange={(e) => setSettings({ ...settings, company_description_en: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>{t({ ar: "رقم الترخيص", en: "License #" })}</Label>
                          <Input
                            value={settings.company_license || ''}
                            onChange={(e) => setSettings({ ...settings, company_license: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>{t({ ar: "رقم الضريبة", en: "VAT #" })}</Label>
                          <Input
                            value={settings.company_vat || ''}
                            onChange={(e) => setSettings({ ...settings, company_vat: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>{t({ ar: "رقم السجل التجاري", en: "CR #" })}</Label>
                        <Input
                          value={settings.company_cr || ''}
                          onChange={(e) => setSettings({ ...settings, company_cr: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Header & Footer Text */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        {t({ ar: "نصوص الرأس والتذييل", en: "Header & Footer Text" })}
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>{t({ ar: "نص الرأس (عربي)", en: "Header (Arabic)" })}</Label>
                          <Input
                            value={settings.header_text_ar || ''}
                            onChange={(e) => setSettings({ ...settings, header_text_ar: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>{t({ ar: "نص الرأس (إنجليزي)", en: "Header (English)" })}</Label>
                          <Input
                            value={settings.header_text_en || ''}
                            onChange={(e) => setSettings({ ...settings, header_text_en: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>{t({ ar: "اسم الشركة بالتذييل (عربي)", en: "Footer Name (Arabic)" })}</Label>
                          <Input
                            value={settings.footer_company_name_ar || ''}
                            onChange={(e) => setSettings({ ...settings, footer_company_name_ar: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>{t({ ar: "اسم الشركة بالتذييل (إنجليزي)", en: "Footer Name (English)" })}</Label>
                          <Input
                            value={settings.footer_company_name_en || ''}
                            onChange={(e) => setSettings({ ...settings, footer_company_name_en: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* SVG Logos */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        {t({ ar: "شعارات SVG", en: "SVG Logos" })}
                      </h3>
                      
                      <div>
                        <Label>{t({ ar: "شعار الهيدر (عربي) - كود SVG", en: "Header Logo (Arabic) - SVG Code" })}</Label>
                        <Textarea
                          value={settings.header_logo_svg_ar || ''}
                          onChange={(e) => setSettings({ ...settings, header_logo_svg_ar: e.target.value })}
                          rows={3}
                          placeholder="<svg>...</svg>"
                          className="font-mono text-xs"
                        />
                      </div>

                      <div>
                        <Label>{t({ ar: "شعار الهيدر (إنجليزي) - كود SVG", en: "Header Logo (English) - SVG Code" })}</Label>
                        <Textarea
                          value={settings.header_logo_svg_en || ''}
                          onChange={(e) => setSettings({ ...settings, header_logo_svg_en: e.target.value })}
                          rows={3}
                          placeholder="<svg>...</svg>"
                          className="font-mono text-xs"
                        />
                      </div>

                      <div>
                        <Label>{t({ ar: "شعار الفوتر (عربي) - كود SVG", en: "Footer Logo (Arabic) - SVG Code" })}</Label>
                        <Textarea
                          value={settings.footer_logo_svg_ar || ''}
                          onChange={(e) => setSettings({ ...settings, footer_logo_svg_ar: e.target.value })}
                          rows={3}
                          placeholder="<svg>...</svg>"
                          className="font-mono text-xs"
                        />
                      </div>

                      <div>
                        <Label>{t({ ar: "شعار الفوتر (إنجليزي) - كود SVG", en: "Footer Logo (English) - SVG Code" })}</Label>
                        <Textarea
                          value={settings.footer_logo_svg_en || ''}
                          onChange={(e) => setSettings({ ...settings, footer_logo_svg_en: e.target.value })}
                          rows={3}
                          placeholder="<svg>...</svg>"
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>

                    {/* Bank Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        {t({ ar: "تفاصيل البنك", en: "Bank Details" })}
                      </h3>
                      
                      <div>
                        <Label>{t({ ar: "اسم البنك", en: "Bank Name" })}</Label>
                        <Input
                          value={settings.bank_name || ''}
                          onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label>{t({ ar: "رقم الحساB", en: "Account Number" })}</Label>
                        <Input
                          value={settings.bank_account_number || ''}
                          onChange={(e) => setSettings({ ...settings, bank_account_number: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label>{t({ ar: "رقم الآيبان", en: "IBAN" })}</Label>
                        <Input
                          value={settings.iban || ''}
                          onChange={(e) => setSettings({ ...settings, iban: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label>{t({ ar: "موقع البنك", en: "Bank Location" })}</Label>
                        <Input
                          value={settings.bank_location || ''}
                          onChange={(e) => setSettings({ ...settings, bank_location: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Terms */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        {t({ ar: "الشروط والأحكام", en: "Terms & Conditions" })}
                      </h3>
                      
                      <div>
                        <Label>{t({ ar: "الشروط (عربي)", en: "Terms (Arabic)" })}</Label>
                        <Textarea
                          value={settings.terms_ar || ''}
                          onChange={(e) => setSettings({ ...settings, terms_ar: e.target.value })}
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label>{t({ ar: "الشروط (إنجليزي)", en: "Terms (English)" })}</Label>
                        <Textarea
                          value={settings.terms_en || ''}
                          onChange={(e) => setSettings({ ...settings, terms_en: e.target.value })}
                          rows={4}
                        />
                      </div>
                    </div>

                    {/* Cancellation Policy */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        {t({ ar: "سياسة الإلغاء", en: "Cancellation Policy" })}
                      </h3>
                      
                      <div>
                        <Label>{t({ ar: "سياسة الإلغاء (عربي)", en: "Policy (Arabic)" })}</Label>
                        <Textarea
                          value={settings.cancellation_policy_ar || ''}
                          onChange={(e) => setSettings({ ...settings, cancellation_policy_ar: e.target.value })}
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label>{t({ ar: "سياسة الإلغاء (إنجليزي)", en: "Policy (English)" })}</Label>
                        <Textarea
                          value={settings.cancellation_policy_en || ''}
                          onChange={(e) => setSettings({ ...settings, cancellation_policy_en: e.target.value })}
                          rows={4}
                        />
                      </div>
                    </div>

                    {/* Responsible Persons */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h3 className="text-lg font-semibold">
                          {t({ ar: "الأشخاص المسؤولين", en: "Responsible Persons" })}
                        </h3>
                        <Button onClick={addResponsiblePerson} size="sm" variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          {t({ ar: "إضافة", en: "Add" })}
                        </Button>
                      </div>

                      {settings.responsible_persons?.map((person, index) => (
                        <Card key={index} className="p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">
                              {t({ ar: "شخص", en: "Person" })} {index + 1}
                            </h4>
                            <Button
                              onClick={() => removeResponsiblePerson(index)}
                              size="sm"
                              variant="destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label>{t({ ar: "الاسم", en: "Name" })}</Label>
                              <Input
                                value={person.name}
                                onChange={(e) => updateResponsiblePerson(index, 'name', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>{t({ ar: "البريد", en: "Email" })}</Label>
                              <Input
                                type="email"
                                value={person.email}
                                onChange={(e) => updateResponsiblePerson(index, 'email', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>{t({ ar: "الجوال", en: "Phone" })}</Label>
                              <Input
                                value={person.phone}
                                onChange={(e) => updateResponsiblePerson(index, 'phone', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>{t({ ar: "المسمى", en: "Position" })}</Label>
                              <Input
                                value={person.position}
                                onChange={(e) => updateResponsiblePerson(index, 'position', e.target.value)}
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* Contact Numbers */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h3 className="text-lg font-semibold">
                          {t({ ar: "أرقام التواصل", en: "Contact Numbers" })}
                        </h3>
                        <Button onClick={addContactNumber} size="sm" variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          {t({ ar: "إضافة", en: "Add" })}
                        </Button>
                      </div>

                      {settings.contact_numbers?.map((number, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={number}
                            onChange={(e) => updateContactNumber(index, e.target.value)}
                            placeholder="+966..."
                            className="flex-1"
                          />
                          <Button
                            onClick={() => removeContactNumber(index)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Colors Tab */}
                  <TabsContent value="colors" className="space-y-6 pr-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        {t({ ar: "الألوان الأساسية", en: "Primary Colors" })}
                      </h3>
                      
                      <ColorInput
                        label={t({ ar: "اللون الأساسي", en: "Primary Color" })}
                        value={settings.primary_color || '75,0,130'}
                        onChange={(v) => setSettings({ ...settings, primary_color: v })}
                        doneText={t({ ar: "تم", en: "Done" })}
                        manualText={t({ ar: "أو أدخل يدوياً", en: "Or enter manually" })}
                      />

                      <ColorInput
                        label={t({ ar: "اللون الثانوي", en: "Secondary Color" })}
                        value={settings.secondary_color || '245,245,245'}
                        onChange={(v) => setSettings({ ...settings, secondary_color: v })}
                        doneText={t({ ar: "تم", en: "Done" })}
                        manualText={t({ ar: "أو أدخل يدوياً", en: "Or enter manually" })}
                      />

                      <ColorInput
                        label={t({ ar: "لون النص", en: "Text Color" })}
                        value={settings.text_color || '0,0,0'}
                        onChange={(v) => setSettings({ ...settings, text_color: v })}
                        doneText={t({ ar: "تم", en: "Done" })}
                        manualText={t({ ar: "أو أدخل يدوياً", en: "Or enter manually" })}
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        {t({ ar: "ألوان الخلفية", en: "Background Colors" })}
                      </h3>
                      
                      <ColorInput
                        label={t({ ar: "خلفية الرأس", en: "Header Background" })}
                        value={settings.header_bg_color || '75,0,130'}
                        onChange={(v) => setSettings({ ...settings, header_bg_color: v })}
                        doneText={t({ ar: "تم", en: "Done" })}
                        manualText={t({ ar: "أو أدخل يدوياً", en: "Or enter manually" })}
                      />

                      <ColorInput
                        label={t({ ar: "خلفية التذييل", en: "Footer Background" })}
                        value={settings.footer_bg_color || '75,0,130'}
                        onChange={(v) => setSettings({ ...settings, footer_bg_color: v })}
                        doneText={t({ ar: "تم", en: "Done" })}
                        manualText={t({ ar: "أو أدخل يدوياً", en: "Or enter manually" })}
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        {t({ ar: "ألوان رقم تأكيد الفندق", en: "Hotel Confirmation # Colors" })}
                      </h3>
                      
                      <ColorInput
                        label={t({ ar: "لون النص", en: "Text Color" })}
                        value={settings.hotel_confirmation_text_color || '75,0,130'}
                        onChange={(v) => setSettings({ ...settings, hotel_confirmation_text_color: v })}
                        doneText={t({ ar: "تم", en: "Done" })}
                        manualText={t({ ar: "أو أدخل يدوياً", en: "Or enter manually" })}
                      />

                      <ColorInput
                        label={t({ ar: "لون الإطار", en: "Border Color" })}
                        value={settings.hotel_confirmation_border_color || '75,0,130'}
                        onChange={(v) => setSettings({ ...settings, hotel_confirmation_border_color: v })}
                        doneText={t({ ar: "تم", en: "Done" })}
                        manualText={t({ ar: "أو أدخل يدوياً", en: "Or enter manually" })}
                      />
                    </div>
                  </TabsContent>

                  {/* Fonts Tab */}
                  <TabsContent value="fonts" className="space-y-6 pr-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        {t({ ar: "أحجام الخطوط", en: "Font Sizes" })}
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>{t({ ar: "حجم العنوان الرئيسي", en: "Header Size" })}</Label>
                          <Input
                            type="number"
                            value={settings.font_size_header || 18}
                            onChange={(e) => setSettings({ ...settings, font_size_header: parseInt(e.target.value) })}
                            min="10"
                            max="30"
                          />
                        </div>
                        <div>
                          <Label>{t({ ar: "حجم العنوان الفرعي", en: "Title Size" })}</Label>
                          <Input
                            type="number"
                            value={settings.font_size_title || 14}
                            onChange={(e) => setSettings({ ...settings, font_size_title: parseInt(e.target.value) })}
                            min="8"
                            max="20"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>{t({ ar: "حجم النص الأساسي", en: "Body Size" })}</Label>
                          <Input
                            type="number"
                            value={settings.font_size_body || 10}
                            onChange={(e) => setSettings({ ...settings, font_size_body: parseInt(e.target.value) })}
                            min="6"
                            max="16"
                          />
                        </div>
                        <div>
                          <Label>{t({ ar: "حجم النص الصغير", en: "Small Size" })}</Label>
                          <Input
                            type="number"
                            value={settings.font_size_small || 8}
                            onChange={(e) => setSettings({ ...settings, font_size_small: parseInt(e.target.value) })}
                            min="4"
                            max="12"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        {t({ ar: "خط رقم تأكيد الفندق", en: "Hotel Confirmation # Font" })}
                      </h3>
                      
                      <div>
                        <Label>{t({ ar: "حجم الخط", en: "Font Size" })}</Label>
                        <Input
                          type="number"
                          value={settings.hotel_confirmation_font_size || 12}
                          onChange={(e) => setSettings({ ...settings, hotel_confirmation_font_size: parseInt(e.target.value) })}
                          min="8"
                          max="24"
                        />
                      </div>

                      <div>
                        <Label>{t({ ar: "نوع الخط", en: "Font Family" })}</Label>
                        <Input
                          value={settings.hotel_confirmation_font_family || 'helvetica'}
                          onChange={(e) => setSettings({ ...settings, hotel_confirmation_font_family: e.target.value })}
                          placeholder="helvetica, courier, times"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Layout Tab */}
                  <TabsContent value="layout" className="space-y-6 pr-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        {t({ ar: "أبعاد الرأس والتذييل", en: "Header & Footer Dimensions" })}
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>{t({ ar: "ارتفاع الرأس", en: "Header Height" })}</Label>
                          <Input
                            type="number"
                            value={settings.header_height || 30}
                            onChange={(e) => setSettings({ ...settings, header_height: parseInt(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>{t({ ar: "ارتفاع التذييل", en: "Footer Height" })}</Label>
                          <Input
                            type="number"
                            value={settings.footer_height || 20}
                            onChange={(e) => setSettings({ ...settings, footer_height: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        {t({ ar: "موضع الشعار", en: "Logo Position" })}
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>{t({ ar: "عرض الشعار", en: "Logo Width" })}</Label>
                          <Input
                            type="number"
                            value={settings.logo_width || 40}
                            onChange={(e) => setSettings({ ...settings, logo_width: parseInt(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>{t({ ar: "ارتفاع الشعار", en: "Logo Height" })}</Label>
                          <Input
                            type="number"
                            value={settings.logo_height || 20}
                            onChange={(e) => setSettings({ ...settings, logo_height: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>{t({ ar: "موضع X", en: "Position X" })}</Label>
                          <Input
                            type="number"
                            value={settings.logo_position_x || 15}
                            onChange={(e) => setSettings({ ...settings, logo_position_x: parseInt(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>{t({ ar: "موضع Y", en: "Position Y" })}</Label>
                          <Input
                            type="number"
                            value={settings.logo_position_y || 5}
                            onChange={(e) => setSettings({ ...settings, logo_position_y: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        {t({ ar: "مواضع المحتوى (Y)", en: "Content Positions (Y)" })}
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>{t({ ar: "رقم الحجز Y", en: "Booking# Y" })}</Label>
                          <Input
                            type="number"
                            value={settings.booking_number_y || 15}
                            onChange={(e) => setSettings({ ...settings, booking_number_y: parseInt(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>{t({ ar: "العنوان Y", en: "Title Y" })}</Label>
                          <Input
                            type="number"
                            value={settings.title_y || 38}
                            onChange={(e) => setSettings({ ...settings, title_y: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>{t({ ar: "معلومات العميل Y", en: "Client Info Y" })}</Label>
                          <Input
                            type="number"
                            value={settings.client_info_y || 60}
                            onChange={(e) => setSettings({ ...settings, client_info_y: parseInt(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>{t({ ar: "جدول الحجز Y", en: "Booking Table Y" })}</Label>
                          <Input
                            type="number"
                            value={settings.booking_table_y || 105}
                            onChange={(e) => setSettings({ ...settings, booking_table_y: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>{t({ ar: "الأسعار Y", en: "Prices Y" })}</Label>
                          <Input
                            type="number"
                            value={settings.price_section_y || 150}
                            onChange={(e) => setSettings({ ...settings, price_section_y: parseInt(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>{t({ ar: "البنك Y", en: "Bank Y" })}</Label>
                          <Input
                            type="number"
                            value={settings.bank_details_y || 180}
                            onChange={(e) => setSettings({ ...settings, bank_details_y: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>{t({ ar: "الشروط Y", en: "Terms Y" })}</Label>
                        <Input
                          type="number"
                          value={settings.terms_y || 220}
                          onChange={(e) => setSettings({ ...settings, terms_y: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        {t({ ar: "الهوامش والمسافات", en: "Margins & Spacing" })}
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>{t({ ar: "الهامش الأيسر", en: "Left Margin" })}</Label>
                          <Input
                            type="number"
                            value={settings.page_margin_left || 15}
                            onChange={(e) => setSettings({ ...settings, page_margin_left: parseInt(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>{t({ ar: "الهامش الأيمن", en: "Right Margin" })}</Label>
                          <Input
                            type="number"
                            value={settings.page_margin_right || 15}
                            onChange={(e) => setSettings({ ...settings, page_margin_right: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>{t({ ar: "المسافة بين الأقسام", en: "Section Spacing" })}</Label>
                          <Input
                            type="number"
                            value={settings.section_spacing || 10}
                            onChange={(e) => setSettings({ ...settings, section_spacing: parseInt(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>{t({ ar: "ارتفاع السطر", en: "Line Height" })}</Label>
                          <Input
                            type="number"
                            value={settings.line_height || 6}
                            onChange={(e) => setSettings({ ...settings, line_height: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        {t({ ar: "إطار رقم تأكيد الفندق", en: "Hotel Confirmation # Box" })}
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>{t({ ar: "الموضع X", en: "Position X" })}</Label>
                          <Input
                            type="number"
                            value={settings.hotel_confirmation_box_x || 15}
                            onChange={(e) => setSettings({ ...settings, hotel_confirmation_box_x: parseInt(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>{t({ ar: "الموضع Y", en: "Position Y" })}</Label>
                          <Input
                            type="number"
                            value={settings.hotel_confirmation_box_y || 38}
                            onChange={(e) => setSettings({ ...settings, hotel_confirmation_box_y: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>{t({ ar: "العرض", en: "Width" })}</Label>
                          <Input
                            type="number"
                            value={settings.hotel_confirmation_box_width || 180}
                            onChange={(e) => setSettings({ ...settings, hotel_confirmation_box_width: parseInt(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>{t({ ar: "الارتفاع", en: "Height" })}</Label>
                          <Input
                            type="number"
                            value={settings.hotel_confirmation_box_height || 12}
                            onChange={(e) => setSettings({ ...settings, hotel_confirmation_box_height: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label>{t({ ar: "سمك الإطار", en: "Border Width" })}</Label>
                          <Input
                            type="number"
                            step="0.5"
                            value={settings.hotel_confirmation_border_width || 1}
                            onChange={(e) => setSettings({ ...settings, hotel_confirmation_border_width: parseFloat(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>{t({ ar: "المسافة الداخلية", en: "Padding" })}</Label>
                          <Input
                            type="number"
                            value={settings.hotel_confirmation_box_padding || 3}
                            onChange={(e) => setSettings({ ...settings, hotel_confirmation_box_padding: parseInt(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>{t({ ar: "استدارة الزوايا", en: "Border Radius" })}</Label>
                          <Input
                            type="number"
                            value={settings.hotel_confirmation_box_border_radius || 4}
                            onChange={(e) => setSettings({ ...settings, hotel_confirmation_box_border_radius: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Visibility Tab */}
                  <TabsContent value="visibility" className="space-y-6 pr-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2">
                        {t({ ar: "إظهار/إخفاء الأقسام", en: "Show/Hide Sections" })}
                      </h3>
                      
                      <div className="flex items-center justify-between py-2">
                        <Label>{t({ ar: "عرض الشعار", en: "Show Logo" })}</Label>
                        <Switch
                          checked={settings.show_logo}
                          onCheckedChange={(checked) => setSettings({ ...settings, show_logo: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <Label>{t({ ar: "عرض وصف الشركة", en: "Show Company Description" })}</Label>
                        <Switch
                          checked={settings.show_company_description}
                          onCheckedChange={(checked) => setSettings({ ...settings, show_company_description: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <Label>{t({ ar: "عرض تفاصيل البنك", en: "Show Bank Details" })}</Label>
                        <Switch
                          checked={settings.show_bank_details}
                          onCheckedChange={(checked) => setSettings({ ...settings, show_bank_details: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <Label>{t({ ar: "عرض الشروط", en: "Show Terms" })}</Label>
                        <Switch
                          checked={settings.show_terms}
                          onCheckedChange={(checked) => setSettings({ ...settings, show_terms: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <Label>{t({ ar: "عرض المسؤولين", en: "Show Responsible Persons" })}</Label>
                        <Switch
                          checked={settings.show_responsible_persons}
                          onCheckedChange={(checked) => setSettings({ ...settings, show_responsible_persons: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <Label>{t({ ar: "عرض معلومات التذييل", en: "Show Footer Info" })}</Label>
                        <Switch
                          checked={settings.show_footer_info}
                          onCheckedChange={(checked) => setSettings({ ...settings, show_footer_info: checked })}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </CardContent>
          </Card>

          {/* Live Preview & Editor */}
          <Card className="card-luxury lg:col-span-7">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  {t({ ar: "المعاينة المباشرة والتحرير", en: "Live Preview & Editor" })}
                </CardTitle>
                <Button
                  onClick={generatePreview}
                  size="sm"
                  variant="outline"
                  disabled={isGeneratingPreview}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isGeneratingPreview ? 'animate-spin' : ''}`} />
                  {t({ ar: "تحديث", en: "Refresh" })}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Editor Toolbar */}
              <div className="flex flex-wrap gap-2 mb-4 p-3 bg-muted rounded-lg">
                <Button
                  size="sm"
                  variant={editorTool === "select" ? "default" : "outline"}
                  onClick={() => handleEditorToolClick("select")}
                >
                  <MousePointer className="w-4 h-4 mr-2" />
                  {t({ ar: "تحديد", en: "Select" })}
                </Button>
                <Button
                  size="sm"
                  variant={editorTool === "text" ? "default" : "outline"}
                  onClick={() => handleEditorToolClick("text")}
                >
                  <Type className="w-4 h-4 mr-2" />
                  {t({ ar: "نص", en: "Text" })}
                </Button>
                <Button
                  size="sm"
                  variant={editorTool === "rect" ? "default" : "outline"}
                  onClick={() => handleEditorToolClick("rect")}
                >
                  <Square className="w-4 h-4 mr-2" />
                  {t({ ar: "مربع", en: "Rectangle" })}
                </Button>
                <Button
                  size="sm"
                  variant={editorTool === "circle" ? "default" : "outline"}
                  onClick={() => handleEditorToolClick("circle")}
                >
                  <CircleIcon className="w-4 h-4 mr-2" />
                  {t({ ar: "دائرة", en: "Circle" })}
                </Button>
                
                <div className="flex items-center gap-2 ml-auto">
                  <Label className="text-sm">{t({ ar: "اللون:", en: "Color:" })}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className="w-10 h-10 rounded border-2 border-border"
                        style={{ backgroundColor: editorColor }}
                      />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3">
                      <HexColorPicker color={editorColor} onChange={setEditorColor} />
                    </PopoverContent>
                  </Popover>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleClearAnnotations}
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    {t({ ar: "مسح التعديلات", en: "Clear" })}
                  </Button>
                </div>
              </div>

              {/* Canvas */}
              <div className="border rounded-lg overflow-auto bg-gray-50 p-4" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                {isGeneratingPreview ? (
                  <div className="flex items-center justify-center" style={{ height: '842px' }}>
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <canvas ref={canvasRef} className="shadow-lg mx-auto" />
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-3 text-center">
                {t({ 
                  ar: "استخدم الأدوات أعلاه لإضافة نصوص وأشكال على PDF. يمكنك سحب وإفلات العناصر لتحريكها.", 
                  en: "Use the tools above to add text and shapes to the PDF. Drag and drop elements to move them." 
                })}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}