import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Calendar, Users, Hotel, Mail, MessageCircle, Edit } from "lucide-react";
import { format } from "date-fns";

interface Booking {
  id: string;
  user_id: string;
  hotel_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  rooms: number;
  total_amount: number;
  status: 'new' | 'pending' | 'confirmed' | 'cancelled' | 'rejected';
  payment_status: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
  discount_amount?: number;
  manual_total?: number;
  profiles?: {
    full_name: string;
    phone: string;
  };
  hotels?: {
    name_ar: string;
    name_en: string;
    location: string;
    price_per_night: number;
    max_guests_per_room: number;
    extra_guest_price: number;
    room_type?: 'hotel_rooms' | 'owner_rooms';
  };
}

interface BookingManagementProps {
  bookings: Booking[];
  onUpdate: () => void;
}

export function BookingManagement({ bookings, onUpdate }: BookingManagementProps) {
  const { t, language } = useLanguage();
  const [highlightColors, setHighlightColors] = useState<{ owner: string; hotel: string | null }>({ owner: '#87CEEB', hotel: null });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    check_in: "",
    check_out: "",
    guests: "",
    rooms: "",
    notes: "",
    total_amount: "",
    discount_amount: "",
    manual_total: "",
    room_type: "hotel_rooms" as 'hotel_rooms' | 'owner_rooms',
  });

  const statusColors = {
    new: "bg-blue-500",
    pending: "bg-yellow-500",
    confirmed: "bg-green-500",
    cancelled: "bg-red-500",
    rejected: "bg-red-600",
  };

  const statusLabels = {
    new: { ar: "جديد", en: "New", fr: "Nouveau", es: "Nuevo", ru: "Новый", id: "Baru", ms: "Baharu" },
    pending: { ar: "قيد الانتظار", en: "Pending", fr: "En attente", es: "Pendiente", ru: "В ожидании", id: "Tertunda", ms: "Menunggu" },
    confirmed: { ar: "مؤكد", en: "Confirmed", fr: "Confirmé", es: "Confirmado", ru: "Подтверждено", id: "Dikonfirmasi", ms: "Disahkan" },
    cancelled: { ar: "ملغى", en: "Cancelled", fr: "Annulé", es: "Cancelado", ru: "Отменено", id: "Dibatalkan", ms: "Dibatalkan" },
    rejected: { ar: "مرفوض", en: "Rejected", fr: "Rejeté", es: "Rechazado", ru: "Отклонено", id: "Ditolak", ms: "Ditolak" },
  };

  const calculateTotal = (checkIn: string, checkOut: string, guests: number, rooms: number, hotel: Booking['hotels']) => {
    if (!hotel) return 0;
    
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Check for invalid dates
    if (nights <= 0) return 0;
    
    // Calculate base room price
    let total = nights * hotel.price_per_night * rooms;
    
    // Calculate extra guests charge
    const maxGuestsIncluded = (hotel.max_guests_per_room || 2) * rooms;
    if (guests > maxGuestsIncluded) {
      const extraGuests = guests - maxGuestsIncluded;
      total += extraGuests * (hotel.extra_guest_price || 0) * nights;
    }
    
    return total;
  };

  const handleStatusChange = async (bookingId: string, newStatus: 'new' | 'pending' | 'confirmed' | 'cancelled' | 'rejected') => {
    try {
      // Trim the value to remove any extra quotes or whitespace
      const cleanStatus = newStatus.toString().trim().replace(/^["']|["']$/g, '');
      
      const { error } = await supabase
        .from('bookings')
        .update({ status: cleanStatus as 'new' | 'pending' | 'confirmed' | 'cancelled' | 'rejected' })
        .eq('id', bookingId);

      if (error) {
        console.error('Status update error:', error);
        throw error;
      }

      toast({
        title: t({ ar: "تم التحديث", en: "Updated", fr: "Mis à jour", es: "Actualizado", ru: "Обновлено", id: "Diperbarui", ms: "Dikemas kini" }),
        description: t({ ar: "تم تحديث حالة الطلب", en: "Booking status updated", fr: "Statut de la réservation mis à jour", es: "Estado de la reserva actualizado", ru: "Статус бронирования обновлен", id: "Status pemesanan diperbarui", ms: "Status tempahan dikemas kini" }),
      });

      onUpdate();
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      toast({
        title: t({ ar: "خطأ", en: "Error", fr: "Erreur", es: "Error", ru: "Ошибка", id: "Kesalahan", ms: "Ralat" }),
        description: error.message || t({ ar: "حدث خطأ أثناء التحديث", en: "An error occurred during update" }),
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    const calculatedTotal = calculateTotal(booking.check_in, booking.check_out, booking.guests, booking.rooms, booking.hotels);
    setEditFormData({
      check_in: booking.check_in,
      check_out: booking.check_out,
      guests: booking.guests.toString(),
      rooms: booking.rooms.toString(),
      notes: booking.notes || "",
      total_amount: (booking.manual_total || calculatedTotal).toString(),
      discount_amount: (booking.discount_amount || 0).toString(),
      manual_total: (booking.manual_total || calculatedTotal).toString(),
      room_type: booking.hotels?.room_type || 'hotel_rooms',
    });
    setIsEditDialogOpen(true);
  };

  const handleEditBooking = async () => {
    if (!selectedBooking) return;

    // Validate dates
    const startDate = new Date(editFormData.check_in);
    const endDate = new Date(editFormData.check_out);
    
    if (endDate <= startDate) {
      toast({
        title: t({ ar: "خطأ", en: "Error", fr: "Erreur", es: "Error", ru: "Ошибка", id: "Kesalahan", ms: "Ralat" }),
        description: t({ ar: "تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول", en: "Check-out date must be after check-in date", fr: "La date de départ doit être postérieure à la date d'arrivée", es: "La fecha de salida debe ser posterior a la fecha de entrada", ru: "Дата выезда должна быть позже даты заезда", id: "Tanggal check-out harus setelah tanggal check-in", ms: "Tarikh daftar keluar mesti selepas tarikh daftar masuk" }),
        variant: "destructive",
      });
      return;
    }

    try {
      const discountAmount = parseFloat(editFormData.discount_amount) || 0;
      const manualTotal = parseFloat(editFormData.manual_total) || 0;
      const finalTotal = manualTotal - discountAmount;

      console.log('Updating booking with data:', {
        check_in: editFormData.check_in,
        check_out: editFormData.check_out,
        guests: parseInt(editFormData.guests),
        rooms: parseInt(editFormData.rooms),
        notes: editFormData.notes || null,
        total_amount: finalTotal,
        discount_amount: discountAmount,
        manual_total: manualTotal,
      });

      const { error } = await supabase
        .from('bookings')
        .update({
          check_in: editFormData.check_in,
          check_out: editFormData.check_out,
          guests: parseInt(editFormData.guests),
          rooms: parseInt(editFormData.rooms),
          notes: editFormData.notes || null,
          total_amount: finalTotal,
          discount_amount: discountAmount,
          manual_total: manualTotal,
        })
        .eq('id', selectedBooking.id);

      if (error) {
        console.error('Booking update error:', error);
        throw error;
      }

      toast({
        title: t({ ar: "تم التحديث", en: "Updated", fr: "Mis à jour", es: "Actualizado", ru: "Обновлено", id: "Diperbarui", ms: "Dikemas kini" }),
        description: t({ ar: "تم تحديث معلومات الحجز", en: "Booking information updated", fr: "Informations de réservation mises à jour", es: "Información de reserva actualizada", ru: "Информация о бронировании обновлена", id: "Informasi pemesanan diperbarui", ms: "Maklumat tempahan dikemas kini" }),
      });

      setIsEditDialogOpen(false);
      setSelectedBooking(null);
      onUpdate();
    } catch (error: any) {
      console.error('Error updating booking:', error);
      toast({
        title: t({ ar: "خطأ", en: "Error", fr: "Erreur", es: "Error", ru: "Ошибка", id: "Kesalahan", ms: "Ralat" }),
        description: error.message || t({ ar: "حدث خطأ أثناء تحديث الحجز", en: "An error occurred while updating the booking" }),
        variant: "destructive",
      });
    }
  };

  // Load highlight colors from settings
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('owner_room_color, hotel_room_color')
        .single();
      setHighlightColors({ owner: data?.owner_room_color || '#87CEEB', hotel: data?.hotel_room_color || null });
    })();
  }, []);

  const shareViaWhatsApp = (booking: Booking) => {
    const hotelName = language === 'ar' ? booking.hotels?.name_ar : booking.hotels?.name_en;
    const statusText = t(statusLabels[booking.status]);
    const message = `
${t({ ar: "تفاصيل الحجز", en: "Booking Details", fr: "Détails de la réservation", es: "Detalles de la reserva", ru: "Детали бронирования", id: "Detail Pemesanan", ms: "Butiran Tempahan" })}

${t({ ar: "الفندق:", en: "Hotel:", fr: "Hôtel:", es: "Hotel:", ru: "Отель:", id: "Hotel:", ms: "Hotel:" })} ${hotelName}
${t({ ar: "الموقع:", en: "Location:", fr: "Emplacement:", es: "Ubicación:", ru: "Местоположение:", id: "Lokasi:", ms: "Lokasi:" })} ${booking.hotels?.location}
${t({ ar: "تاريخ الوصول:", en: "Check-in:", fr: "Arrivée:", es: "Entrada:", ru: "Заезд:", id: "Check-in:", ms: "Daftar masuk:" })} ${format(new Date(booking.check_in), "dd/MM/yyyy")}
${t({ ar: "تاريخ المغادرة:", en: "Check-out:", fr: "Départ:", es: "Salida:", ru: "Выезд:", id: "Check-out:", ms: "Daftar keluar:" })} ${format(new Date(booking.check_out), "dd/MM/yyyy")}
${t({ ar: "عدد النزلاء:", en: "Guests:", fr: "Invités:", es: "Huéspedes:", ru: "Гости:", id: "Tamu:", ms: "Tetamu:" })} ${booking.guests}
${t({ ar: "المبلغ الإجمالي:", en: "Total Amount:", fr: "Montant total:", es: "Monto total:", ru: "Общая сумма:", id: "Jumlah Total:", ms: "Jumlah Keseluruhan:" })} ${booking.total_amount} ${t({ ar: "ر.س", en: "SAR", fr: "SAR", es: "SAR", ru: "САР", id: "SAR", ms: "SAR" })}
${t({ ar: "الحالة:", en: "Status:", fr: "Statut:", es: "Estado:", ru: "Статус:", id: "Status:", ms: "Status:" })} ${statusText}
${t({ ar: "طريقة الدفع:", en: "Payment Method:", fr: "Mode de paiement:", es: "Método de pago:", ru: "Способ оплаты:", id: "Metode Pembayaran:", ms: "Kaedah Pembayaran:" })} ${booking.payment_method}
`;

    const encodedMessage = encodeURIComponent(message.trim());
    const phoneNumber = booking.profiles?.phone || "";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = (booking: Booking) => {
    const hotelName = language === 'ar' ? booking.hotels?.name_ar : booking.hotels?.name_en;
    const statusText = t(statusLabels[booking.status]);
    const subject = t({ ar: "تفاصيل حجز الفندق", en: "Hotel Booking Details", fr: "Détails de réservation d'hôtel", es: "Detalles de reserva de hotel", ru: "Детали бронирования отеля", id: "Detail Pemesanan Hotel", ms: "Butiran Tempahan Hotel" });
    const body = `
${t({ ar: "تفاصيل الحجز", en: "Booking Details", fr: "Détails de la réservation", es: "Detalles de la reserva", ru: "Детали бронирования", id: "Detail Pemesanan", ms: "Butiran Tempahan" })}

${t({ ar: "الفندق:", en: "Hotel:", fr: "Hôtel:", es: "Hotel:", ru: "Отель:", id: "Hotel:", ms: "Hotel:" })} ${hotelName}
${t({ ar: "الموقع:", en: "Location:", fr: "Emplacement:", es: "Ubicación:", ru: "Местоположение:", id: "Lokasi:", ms: "Lokasi:" })} ${booking.hotels?.location}
${t({ ar: "تاريخ الوصول:", en: "Check-in:", fr: "Arrivée:", es: "Entrada:", ru: "Заезд:", id: "Check-in:", ms: "Daftar masuk:" })} ${format(new Date(booking.check_in), "dd/MM/yyyy")}
${t({ ar: "تاريخ المغادرة:", en: "Check-out:", fr: "Départ:", es: "Salida:", ru: "Выезд:", id: "Check-out:", ms: "Daftar keluar:" })} ${format(new Date(booking.check_out), "dd/MM/yyyy")}
${t({ ar: "عدد النزلاء:", en: "Guests:", fr: "Invités:", es: "Huéspedes:", ru: "Гости:", id: "Tamu:", ms: "Tetamu:" })} ${booking.guests}
${t({ ar: "المبلغ الإجمالي:", en: "Total Amount:", fr: "Montant total:", es: "Monto total:", ru: "Общая сумма:", id: "Jumlah Total:", ms: "Jumlah Keseluruhan:" })} ${booking.total_amount} ${t({ ar: "ر.س", en: "SAR", fr: "SAR", es: "SAR", ru: "САР", id: "SAR", ms: "SAR" })}
${t({ ar: "الحالة:", en: "Status:", fr: "Statut:", es: "Estado:", ru: "Статус:", id: "Status:", ms: "Status:" })} ${statusText}
${t({ ar: "طريقة الدفع:", en: "Payment Method:", fr: "Mode de paiement:", es: "Método de pago:", ru: "Способ оплаты:", id: "Metode Pembayaran:", ms: "Kaedah Pembayaran:" })} ${booking.payment_method}

${t({ ar: "اسم العميل:", en: "Customer Name:", fr: "Nom du client:", es: "Nombre del cliente:", ru: "Имя клиента:", id: "Nama Pelanggan:", ms: "Nama Pelanggan:" })} ${booking.profiles?.full_name}
${t({ ar: "رقم الهاتف:", en: "Phone Number:", fr: "Numéro de téléphone:", es: "Número de teléfono:", ru: "Номер телефона:", id: "Nomor Telepon:", ms: "Nombor Telefon:" })} ${booking.profiles?.phone}
`;

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.trim())}`;
    window.location.href = mailtoUrl;
  };

  if (bookings.length === 0) {
    return (
      <Card className="card-luxury">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            {t({ ar: "لا توجد طلبات", en: "No bookings", fr: "Aucune réservation", es: "No hay reservas", ru: "Нет бронирований", id: "Tidak ada pemesanan", ms: "Tiada tempahan" })}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {bookings.map((booking) => (
          <Card 
            key={booking.id}
            className="card-luxury"
            style={(booking.hotels?.room_type === 'owner_rooms' ? (highlightColors.owner ? { backgroundColor: highlightColors.owner } : undefined) : (highlightColors.hotel ? { backgroundColor: highlightColors.hotel } : undefined))}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Hotel className="w-5 h-5 text-primary" />
                  <span className="text-lg">
                    {language === 'ar' ? booking.hotels?.name_ar : booking.hotels?.name_en}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[booking.status]}>
                    {t(statusLabels[booking.status])}
                  </Badge>
                  <Select
                    value={booking.status}
                    onValueChange={(value) => handleStatusChange(booking.id, value as 'new' | 'pending' | 'confirmed' | 'cancelled' | 'rejected')}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">{t(statusLabels.new)}</SelectItem>
                      <SelectItem value="pending">{t(statusLabels.pending)}</SelectItem>
                      <SelectItem value="confirmed">{t(statusLabels.confirmed)}</SelectItem>
                      <SelectItem value="cancelled">{t(statusLabels.cancelled)}</SelectItem>
                      <SelectItem value="rejected">{t(statusLabels.rejected)}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{t({ ar: "تاريخ الوصول:", en: "Check-in:", fr: "Arrivée:", es: "Entrada:", ru: "Заезд:", id: "Check-in:", ms: "Daftar masuk:" })}</span>
                    <span>{format(new Date(booking.check_in), "dd/MM/yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{t({ ar: "تاريخ المغادرة:", en: "Check-out:", fr: "Départ:", es: "Salida:", ru: "Выезд:", id: "Check-out:", ms: "Daftar keluar:" })}</span>
                    <span>{format(new Date(booking.check_out), "dd/MM/yyyy")}</span>
                  </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{t({ ar: "عدد النزلاء:", en: "Guests:", fr: "Invités:", es: "Huéspedes:", ru: "Гости:", id: "Tamu:", ms: "Tetamu:" })}</span>
                      <span>{booking.guests}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{t({ ar: "عدد الغرف:", en: "Rooms:", fr: "Chambres:", es: "Habitaciones:", ru: "Номера:", id: "Kamar:", ms: "Bilik:" })}</span>
                      <span>{booking.rooms}</span>
                    </div>
                  <div className="text-sm">
                    <span className="font-semibold">{t({ ar: "المبلغ الإجمالي:", en: "Total Amount:", fr: "Montant total:", es: "Monto total:", ru: "Общая сумма:", id: "Jumlah Total:", ms: "Jumlah Keseluruhan:" })}</span>
                    <span className="text-primary font-bold ml-2">{booking.total_amount} {t({ ar: "ر.س", en: "SAR", fr: "SAR", es: "SAR", ru: "САР", id: "SAR", ms: "SAR" })}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">{t({ ar: "طريقة الدفع:", en: "Payment Method:", fr: "Mode de paiement:", es: "Método de pago:", ru: "Способ оплаты:", id: "Metode Pembayaran:", ms: "Kaedah Pembayaran:" })}</span>
                    <span className="ml-2">{booking.payment_method}</span>
                  </div>
                  {booking.notes && (
                    <div className="text-sm">
                      <span className="font-semibold">{t({ ar: "ملاحظات:", en: "Notes:", fr: "Notes:", es: "Notas:", ru: "Заметки:", id: "Catatan:", ms: "Nota:" })}</span>
                      <p className="text-muted-foreground mt-1">{booking.notes}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">{t({ ar: "معلومات العميل", en: "Customer Information", fr: "Informations client", es: "Información del cliente", ru: "Информация о клиенте", id: "Informasi Pelanggan", ms: "Maklumat Pelanggan" })}</h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-semibold">{t({ ar: "الاسم:", en: "Name:", fr: "Nom:", es: "Nombre:", ru: "Имя:", id: "Nama:", ms: "Nama:" })}</span>
                        <span className="ml-2">{booking.profiles?.full_name}</span>
                      </p>
                      <p>
                        <span className="font-semibold">{t({ ar: "الهاتف:", en: "Phone:", fr: "Téléphone:", es: "Teléfono:", ru: "Телефон:", id: "Telepon:", ms: "Telefon:" })}</span>
                        <span className="ml-2">{booking.profiles?.phone}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(booking)}
                    >
                      <Edit className="w-4 h-4 ml-1" />
                      {t({ ar: "تعديل", en: "Edit", fr: "Modifier", es: "Editar", ru: "Редактировать", id: "Edit", ms: "Edit" })}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareViaWhatsApp(booking)}
                    >
                      <MessageCircle className="w-4 h-4 ml-1" />
                      {t({ ar: "واتساب", en: "WhatsApp", fr: "WhatsApp", es: "WhatsApp", ru: "WhatsApp", id: "WhatsApp", ms: "WhatsApp" })}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareViaEmail(booking)}
                    >
                      <Mail className="w-4 h-4 ml-1" />
                      {t({ ar: "بريد", en: "Email", fr: "E-mail", es: "Correo", ru: "Email", id: "Email", ms: "E-mel" })}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Booking Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t({ ar: "تعديل تفاصيل الحجز", en: "Edit Booking Details", fr: "Modifier les détails de la réservation", es: "Editar detalles de la reserva", ru: "Редактировать детали бронирования", id: "Edit Detail Pemesanan", ms: "Edit Butiran Tempahan" })}</DialogTitle>
            <DialogDescription>
              {t({ ar: "عدل معلومات الحجز", en: "Modify the booking information", fr: "Modifiez les informations de réservation", es: "Modifique la información de la reserva", ru: "Измените информацию о бронировании", id: "Ubah informasi pemesanan", ms: "Ubah maklumat tempahan" })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t({ ar: "تاريخ الوصول", en: "Check-in Date", fr: "Date d'arrivée", es: "Fecha de entrada", ru: "Дата заезда", id: "Tanggal Check-in", ms: "Tarikh Daftar masuk" })}</Label>
                <Input
                  type="date"
                  value={editFormData.check_in}
                  onChange={(e) => {
                    const newTotal = selectedBooking ? calculateTotal(
                      e.target.value,
                      editFormData.check_out,
                      parseInt(editFormData.guests),
                      parseInt(editFormData.rooms),
                      selectedBooking.hotels
                    ) : 0;
                    setEditFormData({ ...editFormData, check_in: e.target.value, total_amount: newTotal.toString() });
                  }}
                />
            </div>
            <div className="space-y-2">
              <Label>{t({ ar: "تاريخ المغادرة", en: "Check-out Date", fr: "Date de départ", es: "Fecha de salida", ru: "Дата выезда", id: "Tanggal Check-out", ms: "Tarikh Daftar keluar" })}</Label>
                <Input
                  type="date"
                  value={editFormData.check_out}
                  onChange={(e) => {
                    const newTotal = selectedBooking ? calculateTotal(
                      editFormData.check_in,
                      e.target.value,
                      parseInt(editFormData.guests),
                      parseInt(editFormData.rooms),
                      selectedBooking.hotels
                    ) : 0;
                    setEditFormData({ ...editFormData, check_out: e.target.value, total_amount: newTotal.toString() });
                  }}
                />
            </div>
            <div className="space-y-2">
              <Label>{t({ ar: "عدد النزلاء", en: "Number of Guests", fr: "Nombre d'invités", es: "Número de huéspedes", ru: "Количество гостей", id: "Jumlah Tamu", ms: "Bilangan Tetamu" })}</Label>
              <Select 
                value={editFormData.guests} 
                onValueChange={(value) => {
                  const newTotal = selectedBooking ? calculateTotal(
                    editFormData.check_in,
                    editFormData.check_out,
                    parseInt(value),
                    parseInt(editFormData.rooms),
                    selectedBooking.hotels
                  ) : 0;
                  setEditFormData({ ...editFormData, guests: value, total_amount: newTotal.toString() });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t({ ar: "عدد الغرف", en: "Number of Rooms", fr: "Nombre de chambres", es: "Número de habitaciones", ru: "Количество номеров", id: "Jumlah Kamar", ms: "Bilangan Bilik" })}</Label>
              <Select 
                value={editFormData.rooms} 
                onValueChange={(value) => {
                  const newTotal = selectedBooking ? calculateTotal(
                    editFormData.check_in,
                    editFormData.check_out,
                    parseInt(editFormData.guests),
                    parseInt(value),
                    selectedBooking.hotels
                  ) : 0;
                  setEditFormData({ ...editFormData, rooms: value, total_amount: newTotal.toString() });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t({ ar: "نوع الغرف", en: "Room Type" })}</Label>
              <Select value={editFormData.room_type} onValueChange={(value: 'hotel_rooms' | 'owner_rooms') => setEditFormData({...editFormData, room_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hotel_rooms">{t({ ar: "غرف فندقية", en: "Hotel Rooms" })}</SelectItem>
                  <SelectItem value="owner_rooms">{t({ ar: "غرف مُلّاك", en: "Owner Rooms" })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t({ ar: "ملاحظات", en: "Notes", fr: "Notes", es: "Notas", ru: "Заметки", id: "Catatan", ms: "Nota" })}</Label>
              <Textarea
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ ar: "قيمة الخصم", en: "Discount Amount" })}</Label>
              <Input
                type="number"
                min="0"
                value={editFormData.discount_amount}
                onChange={(e) => {
                  const discount = parseFloat(e.target.value) || 0;
                  const manual = parseFloat(editFormData.manual_total) || 0;
                  const finalTotal = manual - discount;
                  setEditFormData({ 
                    ...editFormData, 
                    discount_amount: e.target.value,
                    total_amount: finalTotal.toString()
                  });
                }}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                {t({ ar: "أدخل قيمة الخصم إن وجدت", en: "Enter discount amount if applicable" })}
              </p>
            </div>
            <div className="space-y-2">
              <Label>{t({ ar: "المبلغ اليدوي", en: "Manual Total" })}</Label>
              <Input
                type="number"
                min="0"
                value={editFormData.manual_total}
                onChange={(e) => {
                  const manual = parseFloat(e.target.value) || 0;
                  const discount = parseFloat(editFormData.discount_amount) || 0;
                  const finalTotal = manual - discount;
                  setEditFormData({ 
                    ...editFormData, 
                    manual_total: e.target.value,
                    total_amount: finalTotal.toString()
                  });
                }}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                {t({ ar: "أدخل المبلغ يدوياً إذا كنت تريد تعديله", en: "Enter amount manually if you want to modify it" })}
              </p>
            </div>
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{t({ ar: "المبلغ الإجمالي:", en: "Total Amount:", fr: "Montant total:", es: "Monto total:", ru: "Общая сумма:", id: "Jumlah Total:", ms: "Jumlah Keseluruhan:" })}</span>
                <span className="text-primary font-bold text-lg">{editFormData.total_amount} {t({ ar: "ر.س", en: "SAR", fr: "SAR", es: "SAR", ru: "САР", id: "SAR", ms: "SAR" })}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t({ ar: "إلغاء", en: "Cancel", fr: "Annuler", es: "Cancelar", ru: "Отмена", id: "Batal", ms: "Batal" })}
            </Button>
            <Button onClick={handleEditBooking}>
              {t({ ar: "حفظ", en: "Save", fr: "Enregistrer", es: "Guardar", ru: "Сохранить", id: "Simpan", ms: "Simpan" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
