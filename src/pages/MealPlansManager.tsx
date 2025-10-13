import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, ArrowLeft, UtensilsCrossed } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MealPlan {
  name_ar: string;
  name_en: string;
  price: number;
  max_persons: number;
  extra_price: number;
}

interface Hotel {
  id: string;
  name_ar: string;
  name_en: string;
  meal_plans: any;
}

export default function MealPlansManager() {
  const { t, language } = useLanguage();
  const { userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<string>("");
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newMealPlan, setNewMealPlan] = useState<MealPlan>({
    name_ar: "",
    name_en: "",
    price: 0,
    max_persons: 2,
    extra_price: 0,
  });

  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/');
      return;
    }
    fetchHotels();
  }, [userRole]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hotels')
        .select('id, name_ar, name_en, meal_plans')
        .order('name_ar', { ascending: true });

      if (error) throw error;
      
      // Parse meal_plans from JSON if needed
      const parsedData = (data || []).map(hotel => ({
        ...hotel,
        meal_plans: Array.isArray(hotel.meal_plans) ? hotel.meal_plans : []
      }));
      
      setHotels(parsedData);
    } catch (error: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleHotelSelect = (hotelId: string) => {
    setSelectedHotelId(hotelId);
    const hotel = hotels.find(h => h.id === hotelId);
    setSelectedHotel(hotel || null);
  };

  const handleAddMealPlan = async () => {
    if (!selectedHotel) return;

    try {
      const currentMealPlans = Array.isArray(selectedHotel.meal_plans) ? selectedHotel.meal_plans : [];
      const updatedMealPlans = [...currentMealPlans, newMealPlan];

      const { error } = await supabase
        .from('hotels')
        .update({ meal_plans: JSON.parse(JSON.stringify(updatedMealPlans)) })
        .eq('id', selectedHotel.id);

      if (error) throw error;

      toast({
        title: t({ ar: "تمت الإضافة", en: "Added" }),
        description: t({ ar: "تمت إضافة الوجبة بنجاح", en: "Meal plan added successfully" }),
      });

      setDialogOpen(false);
      setNewMealPlan({
        name_ar: "",
        name_en: "",
        price: 0,
        max_persons: 2,
        extra_price: 0,
      });
      fetchHotels();
    } catch (error: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteMealPlan = async (index: number) => {
    if (!selectedHotel) return;

    try {
      const currentMealPlans = Array.isArray(selectedHotel.meal_plans) ? selectedHotel.meal_plans : [];
      const updatedMealPlans = currentMealPlans.filter((_: any, i: number) => i !== index);

      const { error } = await supabase
        .from('hotels')
        .update({ meal_plans: JSON.parse(JSON.stringify(updatedMealPlans)) })
        .eq('id', selectedHotel.id);

      if (error) throw error;

      toast({
        title: t({ ar: "تم الحذف", en: "Deleted" }),
        description: t({ ar: "تم حذف الوجبة بنجاح", en: "Meal plan deleted successfully" }),
      });

      fetchHotels();
    } catch (error: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t({ ar: "العودة", en: "Back" })}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                {t({ ar: "إدارة الوجبات", en: "Meal Plans Management" })}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>{t({ ar: "اختر الفندق", en: "Select Hotel" })}</Label>
              <Select value={selectedHotelId} onValueChange={handleHotelSelect}>
                <SelectTrigger>
                  <SelectValue placeholder={t({ ar: "اختر فندق", en: "Select a hotel" })} />
                </SelectTrigger>
                <SelectContent>
                  {hotels.map((hotel) => (
                    <SelectItem key={hotel.id} value={hotel.id}>
                      {language === 'ar' ? hotel.name_ar : hotel.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedHotel && (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    {t({ ar: "الوجبات المتاحة", en: "Available Meal Plans" })}
                  </h3>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t({ ar: "إضافة وجبة", en: "Add Meal Plan" })}
                  </Button>
                </div>

                <div className="space-y-4">
                  {selectedHotel.meal_plans?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {t({ ar: "لا توجد وجبات مضافة", en: "No meal plans added" })}
                    </div>
                  ) : (
                    selectedHotel.meal_plans?.map((meal, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2 flex-1">
                              <h4 className="font-semibold text-lg">
                                {language === 'ar' ? meal.name_ar : meal.name_en}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">
                                    {t({ ar: "السعر:", en: "Price:" })}
                                  </span>
                                  <span className="font-medium mr-2">
                                    {meal.price} {t({ ar: "ر.س", en: "SAR" })}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    {t({ ar: "عدد الأشخاص:", en: "Max Persons:" })}
                                  </span>
                                  <span className="font-medium mr-2">{meal.max_persons}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    {t({ ar: "سعر الإضافي:", en: "Extra Price:" })}
                                  </span>
                                  <span className="font-medium mr-2">
                                    {meal.extra_price} {t({ ar: "ر.س", en: "SAR" })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteMealPlan(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t({ ar: "إضافة وجبة جديدة", en: "Add New Meal Plan" })}</DialogTitle>
            <DialogDescription>
              {t({ 
                ar: "أدخل تفاصيل الوجبة الجديدة", 
                en: "Enter the details of the new meal plan" 
              })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t({ ar: "اسم الوجبة (عربي)", en: "Meal Name (Arabic)" })}</Label>
              <Input
                value={newMealPlan.name_ar}
                onChange={(e) => setNewMealPlan({ ...newMealPlan, name_ar: e.target.value })}
                placeholder={t({ ar: "مثال: إفطار + غداء + عشاء", en: "Example: Breakfast + Lunch + Dinner" })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t({ ar: "اسم الوجبة (إنجليزي)", en: "Meal Name (English)" })}</Label>
              <Input
                value={newMealPlan.name_en}
                onChange={(e) => setNewMealPlan({ ...newMealPlan, name_en: e.target.value })}
                placeholder="Example: Breakfast + Lunch + Dinner"
              />
            </div>

            <div className="space-y-2">
              <Label>{t({ ar: "السعر (ر.س)", en: "Price (SAR)" })}</Label>
              <Input
                type="number"
                value={newMealPlan.price}
                onChange={(e) => setNewMealPlan({ ...newMealPlan, price: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t({ ar: "عدد الأشخاص", en: "Max Persons" })}</Label>
              <Input
                type="number"
                value={newMealPlan.max_persons}
                onChange={(e) => setNewMealPlan({ ...newMealPlan, max_persons: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t({ ar: "سعر الشخص الإضافي (ر.س)", en: "Extra Person Price (SAR)" })}</Label>
              <Input
                type="number"
                value={newMealPlan.extra_price}
                onChange={(e) => setNewMealPlan({ ...newMealPlan, extra_price: Number(e.target.value) })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t({ ar: "إلغاء", en: "Cancel" })}
            </Button>
            <Button 
              onClick={handleAddMealPlan}
              disabled={!newMealPlan.name_ar || !newMealPlan.name_en}
            >
              {t({ ar: "إضافة", en: "Add" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
