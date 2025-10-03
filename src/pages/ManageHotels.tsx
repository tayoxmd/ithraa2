import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin, Phone, Star, Calendar, Plus, Edit, Search } from "lucide-react";

interface City {
  id: string;
  name_ar: string;
  name_en: string;
}

interface Hotel {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  city_id: string;
  city_name_ar?: string;
  city_name_en?: string;
  location: string;
  location_url: string;
  contact_phone: string;
  contact_person: string;
  price_per_night: number;
  rating: number;
  images: any;
  active: boolean;
  created_at: string;
  bookings_count?: number;
  max_guests_per_room: number;
  extra_guest_price: number;
}

export default function ManageHotels() {
  const { userRole, loading } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState({
    name_ar: "",
    name_en: "",
    description_ar: "",
    description_en: "",
    city_id: "",
    location: "",
    location_url: "",
    contact_phone: "",
    contact_person: "",
    price_per_night: "",
    rating: "5",
    active: true,
    max_guests_per_room: "2",
    extra_guest_price: "0",
    total_rooms: "10",
    tax_percentage: "15",
  });

  useEffect(() => {
    if (!loading && userRole !== 'admin') {
      navigate('/');
    } else if (!loading) {
      fetchCities();
      fetchHotels();
    }
  }, [userRole, loading, navigate]);

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('id, name_ar, name_en')
        .eq('active', true)
        .order('name_en', { ascending: true });

      if (error) throw error;
      setCities(data || []);
    } catch (error: any) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchHotels = async () => {
    try {
      const { data: hotelsData, error } = await supabase
        .from('hotels')
        .select(`
          *,
          cities (
            name_ar,
            name_en
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get booking counts for each hotel
      const hotelsWithCounts = await Promise.all(
        (hotelsData || []).map(async (hotel: any) => {
          const { count } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('hotel_id', hotel.id);
          
          return {
            ...hotel,
            city_name_ar: hotel.cities?.name_ar,
            city_name_en: hotel.cities?.name_en,
            bookings_count: count || 0
          };
        })
      );

      setHotels(hotelsWithCounts);
      setFilteredHotels(hotelsWithCounts);
    } catch (error: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error", fr: "Erreur", es: "Error", ru: "Ошибка", id: "Kesalahan", ms: "Ralat" }),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const toggleHotelStatus = async (hotelId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('hotels')
        .update({ active: !currentStatus })
        .eq('id', hotelId);

      if (error) throw error;

      // Update local state instead of refetching
      const updatedHotels = hotels.map(h => 
        h.id === hotelId ? { ...h, active: !currentStatus } : h
      );
      setHotels(updatedHotels);
      setFilteredHotels(updatedHotels.filter(h => 
        searchQuery === "" || 
        h.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.contact_person?.toLowerCase().includes(searchQuery.toLowerCase())
      ));

      toast({
        title: t({ ar: "تم التحديث", en: "Updated", fr: "Mis à jour", es: "Actualizado", ru: "Обновлено", id: "Diperbarui", ms: "Dikemas kini" }),
        description: t({ ar: "تم تحديث حالة الفندق", en: "Hotel status updated", fr: "Statut de l'hôtel mis à jour", es: "Estado del hotel actualizado", ru: "Статус отеля обновлен", id: "Status hotel diperbarui", ms: "Status hotel dikemas kini" }),
      });
    } catch (error: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error", fr: "Erreur", es: "Error", ru: "Ошибка", id: "Kesalahan", ms: "Ralat" }),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddHotel = async () => {
    try {
      if (!formData.city_id) {
        toast({
          title: t({ ar: "خطأ", en: "Error", fr: "Erreur", es: "Error", ru: "Ошибка", id: "Kesalahan", ms: "Ralat" }),
          description: t({ ar: "يرجى اختيار المدينة", en: "Please select a city", fr: "Veuillez sélectionner une ville", es: "Por favor seleccione una ciudad", ru: "Пожалуйста, выберите город", id: "Silakan pilih kota", ms: "Sila pilih bandar" }),
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('hotels')
        .insert([{
          ...formData,
          price_per_night: parseFloat(formData.price_per_night),
          rating: parseFloat(formData.rating),
          city_id: formData.city_id,
          max_guests_per_room: parseInt(formData.max_guests_per_room),
          extra_guest_price: parseFloat(formData.extra_guest_price),
          total_rooms: parseInt(formData.total_rooms),
          tax_percentage: parseFloat(formData.tax_percentage),
        }]);

      if (error) throw error;

      toast({
        title: t({ ar: "تم الإضافة", en: "Added", fr: "Ajouté", es: "Agregado", ru: "Добавлено", id: "Ditambahkan", ms: "Ditambah" }),
        description: t({ ar: "تم إضافة الفندق بنجاح", en: "Hotel added successfully", fr: "Hôtel ajouté avec succès", es: "Hotel agregado con éxito", ru: "Отель успешно добавлен", id: "Hotel berhasil ditambahkan", ms: "Hotel berjaya ditambah" }),
      });

      setIsAddDialogOpen(false);
      resetForm();
      fetchHotels();
    } catch (error: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error", fr: "Erreur", es: "Error", ru: "Ошибка", id: "Kesalahan", ms: "Ralat" }),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditHotel = async () => {
    if (!editingHotel) return;

    try {
      const { error } = await supabase
        .from('hotels')
        .update({
          ...formData,
          price_per_night: parseFloat(formData.price_per_night),
          rating: parseFloat(formData.rating),
          max_guests_per_room: parseInt(formData.max_guests_per_room),
          extra_guest_price: parseFloat(formData.extra_guest_price),
          total_rooms: parseInt(formData.total_rooms),
          tax_percentage: parseFloat(formData.tax_percentage),
        })
        .eq('id', editingHotel.id);

      if (error) throw error;

      toast({
        title: t({ ar: "تم التحديث", en: "Updated", fr: "Mis à jour", es: "Actualizado", ru: "Обновлено", id: "Diperbarui", ms: "Dikemas kini" }),
        description: t({ ar: "تم تحديث معلومات الفندق", en: "Hotel information updated", fr: "Informations de l'hôtel mises à jour", es: "Información del hotel actualizada", ru: "Информация об отеле обновлена", id: "Informasi hotel diperbarui", ms: "Maklumat hotel dikemas kini" }),
      });

      setIsEditDialogOpen(false);
      setEditingHotel(null);
      resetForm();
      fetchHotels();
    } catch (error: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error", fr: "Erreur", es: "Error", ru: "Ошибка", id: "Kesalahan", ms: "Ralat" }),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name_ar: hotel.name_ar,
      name_en: hotel.name_en,
      description_ar: hotel.description_ar || "",
      description_en: hotel.description_en || "",
      city_id: hotel.city_id || "",
      location: hotel.location || "",
      location_url: hotel.location_url || "",
      contact_phone: hotel.contact_phone || "",
      contact_person: hotel.contact_person || "",
      price_per_night: hotel.price_per_night.toString(),
      rating: hotel.rating.toString(),
      active: hotel.active,
      max_guests_per_room: hotel.max_guests_per_room.toString(),
      extra_guest_price: hotel.extra_guest_price.toString(),
      total_rooms: (hotel as any).total_rooms?.toString() || "10",
      tax_percentage: (hotel as any).tax_percentage?.toString() || "15",
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name_ar: "",
      name_en: "",
      description_ar: "",
      description_en: "",
      city_id: "",
      location: "",
      location_url: "",
      contact_phone: "",
      contact_person: "",
      price_per_night: "",
      rating: "5",
      active: true,
      max_guests_per_room: "2",
      extra_guest_price: "0",
      total_rooms: "10",
      tax_percentage: "15",
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredHotels(hotels);
    } else {
      const filtered = hotels.filter((hotel) => {
        const searchLower = query.toLowerCase();
        return (
          hotel.name_ar.toLowerCase().includes(searchLower) ||
          hotel.name_en.toLowerCase().includes(searchLower) ||
          hotel.location.toLowerCase().includes(searchLower) ||
          hotel.contact_person?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredHotels(filtered);
    }
  };

  if (loading || loadingData) {
    return <div className="min-h-screen flex items-center justify-center">{t({ ar: "جاري التحميل...", en: "Loading...", fr: "Chargement...", es: "Cargando...", ru: "Загрузка...", id: "Memuat...", ms: "Memuatkan..." })}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4 pt-28">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t({ ar: "العودة", en: "Back", fr: "Retour", es: "Volver", ru: "Назад", id: "Kembali", ms: "Kembali" })}
            </Button>
            <h1 className="text-3xl font-bold text-gradient-luxury">{t({ ar: "إدارة الفنادق", en: "Manage Hotels", fr: "Gérer les hôtels", es: "Gestionar hoteles", ru: "Управление отелями", id: "Kelola Hotel", ms: "Urus Hotel" })}</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t({ ar: "ابحث عن فندق...", en: "Search for a hotel...", fr: "Rechercher un hôtel...", es: "Buscar un hotel...", ru: "Искать отель...", id: "Cari hotel...", ms: "Cari hotel..." })}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pr-10 h-12"
              />
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} className="h-12 whitespace-nowrap">
              <Plus className="w-5 h-5 ml-2" />
              {t({ ar: "إضافة فندق", en: "Add Hotel", fr: "Ajouter un hôtel", es: "Agregar hotel", ru: "Добавить отель", id: "Tambah Hotel", ms: "Tambah Hotel" })}
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {filteredHotels.map((hotel) => (
            <Card key={hotel.id} className="card-luxury">
              <CardHeader>
                <CardTitle className="flex items-center justify-between flex-wrap gap-4">
                  <span>{language === 'ar' ? hotel.name_ar : hotel.name_en}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={hotel.active ? "default" : "secondary"}>
                      {hotel.active ? t({ ar: "نشط", en: "Active", fr: "Actif", es: "Activo", ru: "Активный", id: "Aktif", ms: "Aktif" }) : t({ ar: "غير نشط", en: "Inactive", fr: "Inactif", es: "Inactivo", ru: "Неактивный", id: "Tidak Aktif", ms: "Tidak Aktif" })}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(hotel)}
                      >
                        <Edit className="w-4 h-4 ml-1" />
                        {t({ ar: "تعديل", en: "Edit", fr: "Modifier", es: "Editar", ru: "Редактировать", id: "Edit", ms: "Edit" })}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleHotelStatus(hotel.id, hotel.active)}
                      >
                        {hotel.active ? t({ ar: "إيقاف", en: "Deactivate", fr: "Désactiver", es: "Desactivar", ru: "Деактивировать", id: "Nonaktifkan", ms: "Nyahaktifkan" }) : t({ ar: "تفعيل", en: "Activate", fr: "Activer", es: "Activar", ru: "Активировать", id: "Aktifkan", ms: "Aktifkan" })}
                      </Button>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">{t({ ar: "معلومات الفندق", en: "Hotel Information", fr: "Informations sur l'hôtel", es: "Información del hotel", ru: "Информация об отеле", id: "Informasi Hotel", ms: "Maklumat Hotel" })}</h3>
                      <p className="text-sm text-muted-foreground">{language === 'ar' ? hotel.description_ar : hotel.description_en}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{language === 'ar' ? hotel.city_name_ar : hotel.city_name_en}</span>
                      {hotel.location_url && (
                        <a 
                          href={hotel.location_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          ({t({ ar: "عرض", en: "View", fr: "Voir", es: "Ver", ru: "Просмотр", id: "Lihat", ms: "Lihat" })})
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{hotel.rating} / 5</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <span className="text-primary">{hotel.price_per_night} {t({ ar: "ر.س", en: "SAR", fr: "SAR", es: "SAR", ru: "САР", id: "SAR", ms: "SAR" })}</span>
                      <span className="text-muted-foreground">/ {t({ ar: "ليلة", en: "night", fr: "nuit", es: "noche", ru: "ночь", id: "malam", ms: "malam" })}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">{t({ ar: "معلومات التواصل", en: "Contact Information", fr: "Informations de contact", es: "Información de contacto", ru: "Контактная информация", id: "Informasi Kontak", ms: "Maklumat Hubungan" })}</h3>
                      {hotel.contact_person && (
                        <p className="text-sm mb-2">
                          <span className="font-medium">{t({ ar: "الشخص المسؤول:", en: "Contact Person:", fr: "Personne de contact:", es: "Persona de contacto:", ru: "Контактное лицо:", id: "Orang yang Dapat Dihubungi:", ms: "Orang yang Boleh Dihubungi:" })}</span> {hotel.contact_person}
                        </p>
                      )}
                      {hotel.contact_phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-primary" />
                          <a href={`tel:${hotel.contact_phone}`} className="hover:text-primary">
                            {hotel.contact_phone}
                          </a>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">{t({ ar: "الإحصائيات", en: "Statistics", fr: "Statistiques", es: "Estadísticas", ru: "Статистика", id: "Statistik", ms: "Statistik" })}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>
                            {t({ ar: "عدد الحجوزات:", en: "Total Bookings:", fr: "Réservations totales:", es: "Reservas totales:", ru: "Всего бронирований:", id: "Total Pemesanan:", ms: "Jumlah Tempahan:" })} <strong>{hotel.bookings_count}</strong>
                          </span>
                        </div>
                        <p className="text-muted-foreground">
                          {t({ ar: "تاريخ الإضافة:", en: "Added on:", fr: "Ajouté le:", es: "Agregado el:", ru: "Добавлено:", id: "Ditambahkan pada:", ms: "Ditambah pada:" })} {new Date(hotel.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                        </p>
                      </div>
                    </div>

                    {hotel.images && hotel.images.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">{t({ ar: "الصور", en: "Images", fr: "Images", es: "Imágenes", ru: "Изображения", id: "Gambar", ms: "Imej" })}</h3>
                        <div className="flex gap-2 flex-wrap">
                          {hotel.images.slice(0, 3).map((img: string, idx: number) => (
                            <img 
                              key={idx} 
                              src={img} 
                              alt={`${hotel.name_en} ${idx + 1}`}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          ))}
                          {hotel.images.length > 3 && (
                            <div className="w-20 h-20 bg-secondary rounded-lg flex items-center justify-center text-sm">
                              +{hotel.images.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredHotels.length === 0 && hotels.length > 0 && (
            <Card className="card-luxury">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {t({ ar: "لا توجد نتائج للبحث", en: "No search results", fr: "Aucun résultat de recherche", es: "No hay resultados de búsqueda", ru: "Нет результатов поиска", id: "Tidak ada hasil pencarian", ms: "Tiada hasil carian" })}
                </p>
              </CardContent>
            </Card>
          )}

          {hotels.length === 0 && (
            <Card className="card-luxury">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {t({ ar: "لا توجد فنادق مسجلة حالياً", en: "No hotels registered yet", fr: "Aucun hôtel enregistré pour le moment", es: "No hay hoteles registrados aún", ru: "Пока нет зарегистрированных отелей", id: "Belum ada hotel yang terdaftar", ms: "Tiada hotel yang didaftarkan lagi" })}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Add Hotel Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t({ ar: "إضافة فندق جديد", en: "Add New Hotel", fr: "Ajouter un nouvel hôtel", es: "Agregar nuevo hotel", ru: "Добавить новый отель", id: "Tambah Hotel Baru", ms: "Tambah Hotel Baharu" })}</DialogTitle>
              <DialogDescription>
                {t({ ar: "أدخل معلومات الفندق الجديد", en: "Enter the new hotel information", fr: "Entrez les informations du nouvel hôtel", es: "Ingrese la información del nuevo hotel", ru: "Введите информацию о новом отеле", id: "Masukkan informasi hotel baru", ms: "Masukkan maklumat hotel baharu" })}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ ar: "الاسم بالعربية", en: "Name (Arabic)", fr: "Nom (arabe)", es: "Nombre (árabe)", ru: "Название (арабский)", id: "Nama (Arab)", ms: "Nama (Arab)" })}</Label>
                  <Input value={formData.name_ar} onChange={(e) => setFormData({...formData, name_ar: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>{t({ ar: "الاسم بالإنجليزية", en: "Name (English)", fr: "Nom (anglais)", es: "Nombre (inglés)", ru: "Название (английский)", id: "Nama (Inggris)", ms: "Nama (Inggeris)" })}</Label>
                  <Input value={formData.name_en} onChange={(e) => setFormData({...formData, name_en: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t({ ar: "الوصف بالعربية", en: "Description (Arabic)", fr: "Description (arabe)", es: "Descripción (árabe)", ru: "Описание (арабский)", id: "Deskripsi (Arab)", ms: "Penerangan (Arab)" })}</Label>
                <Textarea value={formData.description_ar} onChange={(e) => setFormData({...formData, description_ar: e.target.value})} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>{t({ ar: "الوصف بالإنجليزية", en: "Description (English)", fr: "Description (anglais)", es: "Descripción (inglés)", ru: "Описание (английский)", id: "Deskripsi (Inggris)", ms: "Penerangan (Inggeris)" })}</Label>
                <Textarea value={formData.description_en} onChange={(e) => setFormData({...formData, description_en: e.target.value})} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ ar: "المدينة", en: "City", fr: "Ville", es: "Ciudad", ru: "Город", id: "Kota", ms: "Bandar" })}</Label>
                  <Select value={formData.city_id} onValueChange={(value) => setFormData({...formData, city_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder={t({ ar: "اختر المدينة", en: "Select city", fr: "Sélectionner la ville", es: "Seleccionar ciudad", ru: "Выбрать город", id: "Pilih kota", ms: "Pilih bandar" })} />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map(city => (
                        <SelectItem key={city.id} value={city.id}>
                          {language === 'ar' ? city.name_ar : city.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t({ ar: "الموقع التفصيلي", en: "Detailed Location", fr: "Emplacement détaillé", es: "Ubicación detallada", ru: "Подробное местоположение", id: "Lokasi Detail", ms: "Lokasi Terperinci" })}</Label>
                  <Input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder={t({ ar: "مثال: حي النسيم", en: "Example: Al Naseem District", fr: "Exemple: Quartier Al Naseem", es: "Ejemplo: Distrito Al Naseem", ru: "Пример: Район Аль-Насим", id: "Contoh: Distrik Al Naseem", ms: "Contoh: Daerah Al Naseem" })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t({ ar: "رابط الموقع", en: "Location URL", fr: "URL de l'emplacement", es: "URL de ubicación", ru: "URL местоположения", id: "URL Lokasi", ms: "URL Lokasi" })}</Label>
                <Input value={formData.location_url} onChange={(e) => setFormData({...formData, location_url: e.target.value})} placeholder="https://maps.google.com/..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ ar: "رقم الهاتف", en: "Phone", fr: "Téléphone", es: "Teléfono", ru: "Телефон", id: "Telepon", ms: "Telefon" })}</Label>
                  <Input value={formData.contact_phone} onChange={(e) => setFormData({...formData, contact_phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>{t({ ar: "الشخص المسؤول", en: "Contact Person", fr: "Personne de contact", es: "Persona de contacto", ru: "Контактное лицо", id: "Orang yang Dapat Dihubungi", ms: "Orang yang Boleh Dihubungi" })}</Label>
                  <Input value={formData.contact_person} onChange={(e) => setFormData({...formData, contact_person: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ ar: "السعر لليلة", en: "Price per Night" })}</Label>
                  <Input type="number" value={formData.price_per_night} onChange={(e) => setFormData({...formData, price_per_night: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>{t({ ar: "التقييم", en: "Rating" })}</Label>
                  <Input type="number" min="0" max="5" step="0.1" value={formData.rating} onChange={(e) => setFormData({...formData, rating: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t({ ar: "عدد الغرف المتاحة", en: "Total Rooms" })}</Label>
                  <Input type="number" min="1" value={formData.total_rooms || "10"} onChange={(e) => setFormData({...formData, total_rooms: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>{t({ ar: "الحد الأقصى للأشخاص في الغرفة", en: "Max Guests per Room" })}</Label>
                  <Input type="number" min="1" value={formData.max_guests_per_room} onChange={(e) => setFormData({...formData, max_guests_per_room: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>{t({ ar: "نسبة الضريبة %", en: "Tax %" })}</Label>
                  <Input type="number" min="0" max="100" value={formData.tax_percentage || "15"} onChange={(e) => setFormData({...formData, tax_percentage: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ ar: "سعر الشخص الإضافي", en: "Extra Guest Price" })}</Label>
                  <Input type="number" min="0" value={formData.extra_guest_price} onChange={(e) => setFormData({...formData, extra_guest_price: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>{t({ ar: "الشخص المسؤول", en: "Responsible Person" })}</Label>
                  <Input value={formData.contact_person} onChange={(e) => setFormData({...formData, contact_person: e.target.value})} placeholder={t({ ar: "اسم المسؤول", en: "Responsible name" })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                {t({ ar: "إلغاء", en: "Cancel", fr: "Annuler", es: "Cancelar", ru: "Отмена", id: "Batal", ms: "Batal" })}
              </Button>
              <Button onClick={handleAddHotel}>
                {t({ ar: "إضافة", en: "Add", fr: "Ajouter", es: "Agregar", ru: "Добавить", id: "Tambah", ms: "Tambah" })}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Hotel Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t({ ar: "تعديل معلومات الفندق", en: "Edit Hotel Information", fr: "Modifier les informations de l'hôtel", es: "Editar información del hotel", ru: "Редактировать информацию об отеле", id: "Edit Informasi Hotel", ms: "Edit Maklumat Hotel" })}</DialogTitle>
              <DialogDescription>
                {t({ ar: "عدل معلومات الفندق", en: "Modify the hotel information", fr: "Modifiez les informations de l'hôtel", es: "Modifique la información del hotel", ru: "Измените информацию об отеле", id: "Ubah informasi hotel", ms: "Ubah maklumat hotel" })}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ ar: "الاسم بالعربية", en: "Name (Arabic)", fr: "Nom (arabe)", es: "Nombre (árabe)", ru: "Название (арабский)", id: "Nama (Arab)", ms: "Nama (Arab)" })}</Label>
                  <Input value={formData.name_ar} onChange={(e) => setFormData({...formData, name_ar: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>{t({ ar: "الاسم بالإنجليزية", en: "Name (English)", fr: "Nom (anglais)", es: "Nombre (inglés)", ru: "Название (английский)", id: "Nama (Inggris)", ms: "Nama (Inggeris)" })}</Label>
                  <Input value={formData.name_en} onChange={(e) => setFormData({...formData, name_en: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t({ ar: "الوصف بالعربية", en: "Description (Arabic)", fr: "Description (arabe)", es: "Descripción (árabe)", ru: "Описание (арабский)", id: "Deskripsi (Arab)", ms: "Penerangan (Arab)" })}</Label>
                <Textarea value={formData.description_ar} onChange={(e) => setFormData({...formData, description_ar: e.target.value})} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>{t({ ar: "الوصف بالإنجليزية", en: "Description (English)", fr: "Description (anglais)", es: "Descripción (inglés)", ru: "Описание (английский)", id: "Deskripsi (Inggris)", ms: "Penerangan (Inggeris)" })}</Label>
                <Textarea value={formData.description_en} onChange={(e) => setFormData({...formData, description_en: e.target.value})} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ ar: "المدينة", en: "City", fr: "Ville", es: "Ciudad", ru: "Город", id: "Kota", ms: "Bandar" })}</Label>
                  <Select value={formData.city_id} onValueChange={(value) => setFormData({...formData, city_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder={t({ ar: "اختر المدينة", en: "Select city", fr: "Sélectionner la ville", es: "Seleccionar ciudad", ru: "Выбрать город", id: "Pilih kota", ms: "Pilih bandar" })} />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map(city => (
                        <SelectItem key={city.id} value={city.id}>
                          {language === 'ar' ? city.name_ar : city.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t({ ar: "الموقع التفصيلي", en: "Detailed Location", fr: "Emplacement détaillé", es: "Ubicación detallada", ru: "Подробное местоположение", id: "Lokasi Detail", ms: "Lokasi Terperinci" })}</Label>
                  <Input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder={t({ ar: "مثال: حي النسيم", en: "Example: Al Naseem District", fr: "Exemple: Quartier Al Naseem", es: "Ejemplo: Distrito Al Naseem", ru: "Пример: Район Аль-Насим", id: "Contoh: Distrik Al Naseem", ms: "Contoh: Daerah Al Naseem" })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t({ ar: "رابط الموقع", en: "Location URL", fr: "URL de l'emplacement", es: "URL de ubicación", ru: "URL местоположения", id: "URL Lokasi", ms: "URL Lokasi" })}</Label>
                <Input value={formData.location_url} onChange={(e) => setFormData({...formData, location_url: e.target.value})} placeholder="https://maps.google.com/..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ ar: "رقم الهاتف", en: "Phone", fr: "Téléphone", es: "Teléfono", ru: "Телефон", id: "Telepon", ms: "Telefon" })}</Label>
                  <Input value={formData.contact_phone} onChange={(e) => setFormData({...formData, contact_phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>{t({ ar: "الشخص المسؤول", en: "Contact Person", fr: "Personne de contact", es: "Persona de contacto", ru: "Контактное лицо", id: "Orang yang Dapat Dihubungi", ms: "Orang yang Boleh Dihubungi" })}</Label>
                  <Input value={formData.contact_person} onChange={(e) => setFormData({...formData, contact_person: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ ar: "السعر لليلة", en: "Price per Night", fr: "Prix par nuit", es: "Precio por noche", ru: "Цена за ночь", id: "Harga per Malam", ms: "Harga setiap Malam" })}</Label>
                  <Input type="number" value={formData.price_per_night} onChange={(e) => setFormData({...formData, price_per_night: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>{t({ ar: "التقييم", en: "Rating", fr: "Évaluation", es: "Calificación", ru: "Рейтинг", id: "Penilaian", ms: "Penilaian" })}</Label>
                  <Input type="number" min="0" max="5" step="0.1" value={formData.rating} onChange={(e) => setFormData({...formData, rating: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ ar: "الحد الأقصى للأشخاص في الغرفة", en: "Max Guests per Room", fr: "Maximum d'invités par chambre", es: "Máximo de huéspedes por habitación", ru: "Макс. гостей в номере", id: "Maks. Tamu per Kamar", ms: "Maks. Tetamu setiap Bilik" })}</Label>
                  <Input type="number" min="1" value={formData.max_guests_per_room} onChange={(e) => setFormData({...formData, max_guests_per_room: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>{t({ ar: "سعر الشخص الإضافي", en: "Extra Guest Price", fr: "Prix par invité supplémentaire", es: "Precio por huésped adicional", ru: "Цена за доп. гостя", id: "Harga Tamu Tambahan", ms: "Harga Tetamu Tambahan" })}</Label>
                  <Input type="number" min="0" value={formData.extra_guest_price} onChange={(e) => setFormData({...formData, extra_guest_price: e.target.value})} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setEditingHotel(null); resetForm(); }}>
                {t({ ar: "إلغاء", en: "Cancel", fr: "Annuler", es: "Cancelar", ru: "Отмена", id: "Batal", ms: "Batal" })}
              </Button>
              <Button onClick={handleEditHotel}>
                {t({ ar: "حفظ", en: "Save", fr: "Enregistrer", es: "Guardar", ru: "Сохранить", id: "Simpan", ms: "Simpan" })}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
