import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Edit, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";

interface SeasonalPrice {
  id: string;
  hotel_id: string;
  season_name_ar: string;
  season_name_en: string;
  start_date: string;
  end_date: string;
  price_per_night: number;
  is_available: boolean;
}

export default function SeasonalPricing() {
  const { userRole, loading } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hotelId = searchParams.get('hotelId');
  
  const [hotel, setHotel] = useState<any>(null);
  const [prices, setPrices] = useState<SeasonalPrice[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<SeasonalPrice | null>(null);
  const [formData, setFormData] = useState({
    season_name_ar: "",
    season_name_en: "",
    start_date: "",
    end_date: "",
    price_per_night: "",
    is_available: true,
  });

  useEffect(() => {
    if (!loading && userRole !== 'admin') {
      navigate('/');
    } else if (!loading && hotelId) {
      fetchHotel();
      fetchPrices();
    }
  }, [userRole, loading, navigate, hotelId]);

  const fetchHotel = async () => {
    try {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('id', hotelId)
        .single();

      if (error) throw error;
      setHotel(data);
    } catch (error: any) {
      console.error('Error fetching hotel:', error);
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchPrices = async () => {
    try {
      const { data, error } = await supabase
        .from('hotel_seasonal_pricing')
        .select('*')
        .eq('hotel_id', hotelId)
        .order('start_date', { ascending: true });

      if (error) throw error;
      setPrices(data || []);
    } catch (error: any) {
      console.error('Error fetching prices:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.season_name_ar || !formData.season_name_en || !formData.start_date || !formData.end_date || !formData.price_per_night) {
        toast({
          title: t({ ar: "خطأ", en: "Error" }),
          description: t({ ar: "يرجى ملء جميع الحقول", en: "Please fill all fields" }),
          variant: "destructive",
        });
        return;
      }

      const priceData = {
        hotel_id: hotelId,
        season_name_ar: formData.season_name_ar,
        season_name_en: formData.season_name_en,
        start_date: formData.start_date,
        end_date: formData.end_date,
        price_per_night: parseFloat(formData.price_per_night),
        is_available: formData.is_available,
      };

      if (editingPrice) {
        const { error } = await supabase
          .from('hotel_seasonal_pricing')
          .update(priceData)
          .eq('id', editingPrice.id);

        if (error) throw error;
        toast({
          title: t({ ar: "تم التحديث", en: "Updated" }),
          description: t({ ar: "تم تحديث التسعير الموسمي", en: "Seasonal pricing updated" }),
        });
      } else {
        const { error } = await supabase
          .from('hotel_seasonal_pricing')
          .insert([priceData]);

        if (error) throw error;
        toast({
          title: t({ ar: "تم الإضافة", en: "Added" }),
          description: t({ ar: "تم إضافة التسعير الموسمي", en: "Seasonal pricing added" }),
        });
      }

      setIsDialogOpen(false);
      setEditingPrice(null);
      resetForm();
      fetchPrices();
    } catch (error: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t({ ar: "هل أنت متأكد من الحذف؟", en: "Are you sure you want to delete?" }))) return;

    try {
      const { error } = await supabase
        .from('hotel_seasonal_pricing')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: t({ ar: "تم الحذف", en: "Deleted" }),
        description: t({ ar: "تم حذف التسعير الموسمي", en: "Seasonal pricing deleted" }),
      });
      fetchPrices();
    } catch (error: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (price: SeasonalPrice) => {
    setEditingPrice(price);
    setFormData({
      season_name_ar: price.season_name_ar,
      season_name_en: price.season_name_en,
      start_date: price.start_date,
      end_date: price.end_date,
      price_per_night: price.price_per_night.toString(),
      is_available: price.is_available,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      season_name_ar: "",
      season_name_en: "",
      start_date: "",
      end_date: "",
      price_per_night: "",
      is_available: true,
    });
  };

  if (loading || loadingData) {
    return <div className="min-h-screen flex items-center justify-center">{t({ ar: "جاري التحميل...", en: "Loading..." })}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/manage-hotels')}
          className="mb-4"
        >
          <ArrowLeft className="ml-2 w-4 h-4" />
          {t({ ar: "العودة", en: "Back" })}
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {t({ ar: "تخصيص الأسعار الموسمية", en: "Seasonal Pricing" })}
          </h1>
          {hotel && (
            <p className="text-muted-foreground">
              {language === 'ar' ? hotel.name_ar : hotel.name_en}
            </p>
          )}
        </div>

        <Card className="card-luxury mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t({ ar: "الأسعار الموسمية", en: "Seasonal Prices" })}</CardTitle>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="gap-2">
                <Plus className="w-4 h-4" />
                {t({ ar: "إضافة موسم جديد", en: "Add Season" })}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {prices.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {t({ ar: "لا توجد أسعار موسمية", en: "No seasonal prices" })}
              </p>
            ) : (
              <div className="space-y-4">
                {prices.map((price) => (
                  <Card key={price.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold">
                            {language === 'ar' ? price.season_name_ar : price.season_name_en}
                          </h3>
                          {!price.is_available && (
                            <Badge variant="secondary">{t({ ar: "غير متاح", en: "Unavailable" })}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(price.start_date), 'yyyy-MM-dd')}</span>
                          </div>
                          <span>→</span>
                          <span>{format(new Date(price.end_date), 'yyyy-MM-dd')}</span>
                          <span className="mr-4">|</span>
                          <span className="text-primary font-bold">
                            {price.price_per_night} {t({ ar: 'ر.س / ليلة', en: 'SAR / night' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(price)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(price.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPrice 
                  ? t({ ar: "تعديل التسعير الموسمي", en: "Edit Seasonal Pricing" })
                  : t({ ar: "إضافة تسعير موسمي", en: "Add Seasonal Pricing" })
                }
              </DialogTitle>
              <DialogDescription>
                {t({ ar: "حدد الموسم والتواريخ والسعر", en: "Define the season, dates, and price" })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>{t({ ar: "اسم الموسم (عربي)", en: "Season Name (Arabic)" })}</Label>
                <Input
                  value={formData.season_name_ar}
                  onChange={(e) => setFormData({ ...formData, season_name_ar: e.target.value })}
                  placeholder={t({ ar: "مثال: موسم الحج", en: "Example: Hajj Season" })}
                />
              </div>

              <div>
                <Label>{t({ ar: "اسم الموسم (إنجليزي)", en: "Season Name (English)" })}</Label>
                <Input
                  value={formData.season_name_en}
                  onChange={(e) => setFormData({ ...formData, season_name_en: e.target.value })}
                  placeholder="Example: Hajj Season"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t({ ar: "تاريخ البداية", en: "Start Date" })}</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t({ ar: "تاريخ النهاية", en: "End Date" })}</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>{t({ ar: "السعر لليلة الواحدة", en: "Price per Night" })}</Label>
                <Input
                  type="number"
                  value={formData.price_per_night}
                  onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_available" className="text-sm">
                  {t({ ar: "متاح للحجز", en: "Available for booking" })}
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t({ ar: "إلغاء", en: "Cancel" })}
              </Button>
              <Button onClick={handleSubmit}>
                {t({ ar: "حفظ", en: "Save" })}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  );
}
