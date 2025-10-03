import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin, Phone, Star, Calendar, Plus, Edit, Search } from "lucide-react";

interface Hotel {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
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
}

export default function ManageHotels() {
  const { userRole, loading } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!loading && userRole !== 'admin') {
      navigate('/');
    } else if (!loading) {
      fetchHotels();
    }
  }, [userRole, loading, navigate]);

  const fetchHotels = async () => {
    try {
      const { data: hotelsData, error } = await supabase
        .from('hotels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get booking counts for each hotel
      const hotelsWithCounts = await Promise.all(
        (hotelsData || []).map(async (hotel) => {
          const { count } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('hotel_id', hotel.id);
          
          return {
            ...hotel,
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

      toast({
        title: t({ ar: "تم التحديث", en: "Updated", fr: "Mis à jour", es: "Actualizado", ru: "Обновлено", id: "Diperbarui", ms: "Dikemas kini" }),
        description: t({ ar: "تم تحديث حالة الفندق", en: "Hotel status updated", fr: "Statut de l'hôtel mis à jour", es: "Estado del hotel actualizado", ru: "Статус отеля обновлен", id: "Status hotel diperbarui", ms: "Status hotel dikemas kini" }),
      });

      fetchHotels();
    } catch (error: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error", fr: "Erreur", es: "Error", ru: "Ошибка", id: "Kesalahan", ms: "Ralat" }),
        description: error.message,
        variant: "destructive",
      });
    }
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
            <Button onClick={() => toast({ title: t({ ar: "قريباً", en: "Coming Soon", fr: "Bientôt", es: "Próximamente", ru: "Скоро", id: "Segera", ms: "Akan Datang" }), description: t({ ar: "سيتم إضافة هذه الميزة قريباً", en: "This feature will be added soon", fr: "Cette fonctionnalité sera ajoutée bientôt", es: "Esta función se agregará pronto", ru: "Эта функция будет добавлена в ближайшее время", id: "Fitur ini akan segera ditambahkan", ms: "Ciri ini akan ditambah tidak lama lagi" }) })} className="h-12 whitespace-nowrap">
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
                        onClick={() => toast({ title: t({ ar: "قريباً", en: "Coming Soon", fr: "Bientôt", es: "Próximamente", ru: "Скоро", id: "Segera", ms: "Akan Datang" }), description: t({ ar: "سيتم إضافة هذه الميزة قريباً", en: "This feature will be added soon", fr: "Cette fonctionnalité sera ajoutée bientôt", es: "Esta función se agregará pronto", ru: "Эта функция будет добавлена в ближайшее время", id: "Fitur ini akan segera ditambahkan", ms: "Ciri ini akan ditambah tidak lama lagi" }) })}
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
                      <span>{hotel.location}</span>
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
      </div>
    </div>
  );
}
