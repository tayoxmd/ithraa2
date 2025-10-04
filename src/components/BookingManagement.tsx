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
  payment_status: 'paid' | 'partially_paid' | 'unpaid';
  amount_paid: number;
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
    tax_percentage: number;
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
    amount_paid: "",
    room_type: "hotel_rooms" as 'hotel_rooms' | 'owner_rooms',
  });

  const statusColors = {
    new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    confirmed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    rejected: "bg-red-200 text-red-900 dark:bg-red-950 dark:text-red-300",
  };

  const paymentStatusColors = {
    paid: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    partially_paid: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
    unpaid: "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900",
  };

  const statusLabels = {
    new: { ar: "جديد", en: "New" },
    pending: { ar: "قيد الانتظار", en: "Pending" },
    confirmed: { ar: "مؤكد", en: "Confirmed" },
    cancelled: { ar: "ملغى", en: "Cancelled" },
    rejected: { ar: "مرفوض", en: "Rejected" },
  };

  const paymentStatusLabels = {
    paid: { ar: "مدفوع", en: "Paid" },
    partially_paid: { ar: "مدفوع جزئيًا", en: "Partially Paid" },
    unpaid: { ar: "غير مدفوع", en: "Unpaid" },
  };

  const calculateTotal = (checkIn: string, checkOut: string, guests: number, rooms: number, hotel: Booking['hotels']) => {
    if (!hotel) return 0;
    
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) return 0;
    
    // Get tax rate (0 means no tax)
    const taxRate = (hotel.tax_percentage && hotel.tax_percentage > 0) ? hotel.tax_percentage : 0;
    
    // Calculate base room price
    let subtotal = nights * hotel.price_per_night * rooms;
    
    // Calculate extra guests charge
    const maxGuestsIncluded = (hotel.max_guests_per_room || 2) * rooms;
    if (guests > maxGuestsIncluded) {
      const extraGuests = guests - maxGuestsIncluded;
      subtotal += extraGuests * (hotel.extra_guest_price || 0) * nights;
    }
    
    // Add tax
    const tax = taxRate > 0 ? (subtotal * taxRate / 100) : 0;
    return subtotal + tax;
  };

  const handleStatusChange = async (bookingId: string, newStatus: 'new' | 'pending' | 'confirmed' | 'cancelled' | 'rejected') => {
    try {
      const cleanStatus = newStatus.toString().trim().replace(/^["']|["']$/g, '');
      
      const { error } = await supabase
        .from('bookings')
        .update({ status: cleanStatus as 'new' | 'pending' | 'confirmed' | 'cancelled' | 'rejected' })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: t({ ar: "تم التحديث", en: "Updated" }),
        description: t({ ar: "تم تحديث حالة الطلب", en: "Booking status updated" }),
      });

      onUpdate();
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message || t({ ar: "حدث خطأ أثناء التحديث", en: "An error occurred during update" }),
        variant: "destructive",
      });
    }
  };

  const handlePaymentStatusChange = async (bookingId: string, newPaymentStatus: 'paid' | 'partially_paid' | 'unpaid') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ payment_status: newPaymentStatus })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: t({ ar: "تم التحديث", en: "Updated" }),
        description: t({ ar: "تم تحديث حالة الدفع", en: "Payment status updated" }),
      });

      onUpdate();
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
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
      amount_paid: (booking.amount_paid || 0).toString(),
      room_type: booking.hotels?.room_type || 'hotel_rooms',
    });
    setIsEditDialogOpen(true);
  };

  const handleEditBooking = async () => {
    if (!selectedBooking) return;

    const startDate = new Date(editFormData.check_in);
    const endDate = new Date(editFormData.check_out);
    
    if (endDate <= startDate) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: t({ ar: "تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول", en: "Check-out date must be after check-in date" }),
        variant: "destructive",
      });
      return;
    }

    try {
      const discountAmount = parseFloat(editFormData.discount_amount) || 0;
      const manualTotal = parseFloat(editFormData.manual_total) || 0;
      const amountPaid = parseFloat(editFormData.amount_paid) || 0;
      const finalTotal = manualTotal - discountAmount;

      // Determine payment status based on amount paid
      let paymentStatus: 'paid' | 'partially_paid' | 'unpaid' = 'unpaid';
      if (amountPaid >= finalTotal) {
        paymentStatus = 'paid';
      } else if (amountPaid > 0) {
        paymentStatus = 'partially_paid';
      }

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
          amount_paid: amountPaid,
          payment_status: paymentStatus,
        })
        .eq('id', selectedBooking.id);

      if (error) throw error;

      toast({
        title: t({ ar: "تم التحديث", en: "Updated" }),
        description: t({ ar: "تم تحديث معلومات الحجز", en: "Booking information updated" }),
      });

      setIsEditDialogOpen(false);
      setSelectedBooking(null);
      onUpdate();
    } catch (error: any) {
      console.error('Error updating booking:', error);
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message || t({ ar: "حدث خطأ أثناء تحديث الحجز", en: "An error occurred while updating the booking" }),
        variant: "destructive",
      });
    }
  };

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
    const paymentStatusText = t(paymentStatusLabels[booking.payment_status]);
    
    let paymentInfo = '';
    if (booking.payment_status === 'partially_paid') {
      const remaining = booking.total_amount - booking.amount_paid;
      paymentInfo = `\n${t({ ar: "المبلغ المدفوع:", en: "Amount Paid:" })} ${booking.amount_paid} ${t({ ar: "ر.س", en: "SAR" })}\n${t({ ar: "المبلغ المتبقي:", en: "Remaining Amount:" })} ${remaining} ${t({ ar: "ر.س", en: "SAR" })}`;
    }
    
    const message = `
${t({ ar: "تفاصيل الحجز", en: "Booking Details" })}

${t({ ar: "الفندق:", en: "Hotel:" })} ${hotelName}
${t({ ar: "الموقع:", en: "Location:" })} ${booking.hotels?.location}
${t({ ar: "تاريخ الوصول:", en: "Check-in:" })} ${format(new Date(booking.check_in), "dd/MM/yyyy")}
${t({ ar: "تاريخ المغادرة:", en: "Check-out:" })} ${format(new Date(booking.check_out), "dd/MM/yyyy")}
${t({ ar: "عدد النزلاء:", en: "Guests:" })} ${booking.guests}
${t({ ar: "المبلغ الإجمالي:", en: "Total Amount:" })} ${booking.total_amount} ${t({ ar: "ر.س", en: "SAR" })}
${t({ ar: "الحالة:", en: "Status:" })} ${statusText}
${t({ ar: "حالة الدفع:", en: "Payment Status:" })} ${paymentStatusText}${paymentInfo}
${t({ ar: "طريقة الدفع:", en: "Payment Method:" })} ${booking.payment_method}
`;

    const encodedMessage = encodeURIComponent(message.trim());
    const phoneNumber = booking.profiles?.phone || "";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = (booking: Booking) => {
    const hotelName = language === 'ar' ? booking.hotels?.name_ar : booking.hotels?.name_en;
    const statusText = t(statusLabels[booking.status]);
    const paymentStatusText = t(paymentStatusLabels[booking.payment_status]);
    const subject = t({ ar: "تفاصيل حجز الفندق", en: "Hotel Booking Details" });
    
    let paymentInfo = '';
    if (booking.payment_status === 'partially_paid') {
      const remaining = booking.total_amount - booking.amount_paid;
      paymentInfo = `\n${t({ ar: "المبلغ المدفوع:", en: "Amount Paid:" })} ${booking.amount_paid} ${t({ ar: "ر.س", en: "SAR" })}\n${t({ ar: "المبلغ المتبقي:", en: "Remaining Amount:" })} ${remaining} ${t({ ar: "ر.س", en: "SAR" })}`;
    }
    
    const body = `
${t({ ar: "تفاصيل الحجز", en: "Booking Details" })}

${t({ ar: "الفندق:", en: "Hotel:" })} ${hotelName}
${t({ ar: "الموقع:", en: "Location:" })} ${booking.hotels?.location}
${t({ ar: "تاريخ الوصول:", en: "Check-in:" })} ${format(new Date(booking.check_in), "dd/MM/yyyy")}
${t({ ar: "تاريخ المغادرة:", en: "Check-out:" })} ${format(new Date(booking.check_out), "dd/MM/yyyy")}
${t({ ar: "عدد النزلاء:", en: "Guests:" })} ${booking.guests}
${t({ ar: "المبلغ الإجمالي:", en: "Total Amount:" })} ${booking.total_amount} ${t({ ar: "ر.س", en: "SAR" })}
${t({ ar: "الحالة:", en: "Status:" })} ${statusText}
${t({ ar: "حالة الدفع:", en: "Payment Status:" })} ${paymentStatusText}${paymentInfo}
${t({ ar: "طريقة الدفع:", en: "Payment Method:" })} ${booking.payment_method}

${t({ ar: "اسم العميل:", en: "Customer Name:" })} ${booking.profiles?.full_name}
${t({ ar: "رقم الهاتف:", en: "Phone Number:" })} ${booking.profiles?.phone}
`;

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.trim())}`;
    window.location.href = mailtoUrl;
  };

  if (bookings.length === 0) {
    return (
      <Card className="card-luxury">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            {t({ ar: "لا توجد طلبات", en: "No bookings" })}
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
                <div className="flex items-center gap-2 flex-wrap">
                  <Select
                    value={booking.status}
                    onValueChange={(value) => handleStatusChange(booking.id, value as any)}
                  >
                    <SelectTrigger className={`w-[140px] h-8 ${statusColors[booking.status]}`}>
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
                  <Select
                    value={booking.payment_status}
                    onValueChange={(value) => handlePaymentStatusChange(booking.id, value as any)}
                  >
                    <SelectTrigger className={`w-[160px] h-8 ${paymentStatusColors[booking.payment_status]}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">{t(paymentStatusLabels.paid)}</SelectItem>
                      <SelectItem value="partially_paid">{t(paymentStatusLabels.partially_paid)}</SelectItem>
                      <SelectItem value="unpaid">{t(paymentStatusLabels.unpaid)}</SelectItem>
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
                    <span className="font-semibold">{t({ ar: "تاريخ الوصول:", en: "Check-in:" })}</span>
                    <span>{format(new Date(booking.check_in), "dd/MM/yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{t({ ar: "تاريخ المغادرة:", en: "Check-out:" })}</span>
                    <span>{format(new Date(booking.check_out), "dd/MM/yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{t({ ar: "عدد النزلاء:", en: "Guests:" })}</span>
                    <span>{booking.guests}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{t({ ar: "عدد الغرف:", en: "Rooms:" })}</span>
                    <span>{booking.rooms}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">{t({ ar: "المبلغ الإجمالي:", en: "Total Amount:" })}</span>
                    <span className="text-primary font-bold ml-2">{booking.total_amount} {t({ ar: "ر.س", en: "SAR" })}</span>
                  </div>
                  {booking.payment_status === 'partially_paid' && (
                    <>
                      <div className="text-sm">
                        <span className="font-semibold">{t({ ar: "المبلغ المدفوع:", en: "Amount Paid:" })}</span>
                        <span className="text-green-600 font-bold ml-2">{booking.amount_paid} {t({ ar: "ر.س", en: "SAR" })}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">{t({ ar: "المبلغ المتبقي:", en: "Remaining:" })}</span>
                        <span className="text-red-600 font-bold ml-2">{booking.total_amount - booking.amount_paid} {t({ ar: "ر.س", en: "SAR" })}</span>
                      </div>
                    </>
                  )}
                  <div className="text-sm">
                    <span className="font-semibold">{t({ ar: "طريقة الدفع:", en: "Payment Method:" })}</span>
                    <span className="ml-2">{booking.payment_method}</span>
                  </div>
                  {booking.notes && (
                    <div className="text-sm">
                      <span className="font-semibold">{t({ ar: "ملاحظات:", en: "Notes:" })}</span>
                      <p className="text-muted-foreground mt-1">{booking.notes}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">{t({ ar: "معلومات العميل", en: "Customer Information" })}</h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-semibold">{t({ ar: "الاسم:", en: "Name:" })}</span>
                        <span className="ml-2">{booking.profiles?.full_name}</span>
                      </p>
                      <p>
                        <span className="font-semibold">{t({ ar: "الهاتف:", en: "Phone:" })}</span>
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
                      {t({ ar: "تعديل", en: "Edit" })}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareViaWhatsApp(booking)}
                    >
                      <MessageCircle className="w-4 h-4 ml-1" />
                      {t({ ar: "واتساب", en: "WhatsApp" })}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareViaEmail(booking)}
                    >
                      <Mail className="w-4 h-4 ml-1" />
                      {t({ ar: "بريد", en: "Email" })}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t({ ar: "تعديل تفاصيل الحجز", en: "Edit Booking Details" })}</DialogTitle>
            <DialogDescription>
              {t({ ar: "عدل معلومات الحجز", en: "Modify the booking information" })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t({ ar: "تاريخ الوصول", en: "Check-in Date" })}</Label>
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
                  setEditFormData({ ...editFormData, check_in: e.target.value, manual_total: newTotal.toString(), total_amount: newTotal.toString() });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ ar: "تاريخ المغادرة", en: "Check-out Date" })}</Label>
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
                  setEditFormData({ ...editFormData, check_out: e.target.value, manual_total: newTotal.toString(), total_amount: newTotal.toString() });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ ar: "عدد النزلاء", en: "Number of Guests" })}</Label>
              <Input
                type="number"
                min="1"
                value={editFormData.guests}
                onChange={(e) => {
                  const newTotal = selectedBooking ? calculateTotal(
                    editFormData.check_in,
                    editFormData.check_out,
                    parseInt(e.target.value),
                    parseInt(editFormData.rooms),
                    selectedBooking.hotels
                  ) : 0;
                  setEditFormData({ ...editFormData, guests: e.target.value, manual_total: newTotal.toString(), total_amount: newTotal.toString() });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ ar: "عدد الغرف", en: "Number of Rooms" })}</Label>
              <Input
                type="number"
                min="1"
                value={editFormData.rooms}
                onChange={(e) => {
                  const newTotal = selectedBooking ? calculateTotal(
                    editFormData.check_in,
                    editFormData.check_out,
                    parseInt(editFormData.guests),
                    parseInt(e.target.value),
                    selectedBooking.hotels
                  ) : 0;
                  setEditFormData({ ...editFormData, rooms: e.target.value, manual_total: newTotal.toString(), total_amount: newTotal.toString() });
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ ar: "المبلغ الإجمالي", en: "Total Amount" })}</Label>
              <Input
                type="number"
                value={editFormData.manual_total}
                onChange={(e) => setEditFormData({ ...editFormData, manual_total: e.target.value, total_amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ ar: "مبلغ الخصم", en: "Discount Amount" })}</Label>
              <Input
                type="number"
                value={editFormData.discount_amount}
                onChange={(e) => setEditFormData({ ...editFormData, discount_amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ ar: "المبلغ المدفوع", en: "Amount Paid" })}</Label>
              <Input
                type="number"
                value={editFormData.amount_paid}
                onChange={(e) => setEditFormData({ ...editFormData, amount_paid: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ ar: "ملاحظات", en: "Notes" })}</Label>
              <Textarea
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t({ ar: "إلغاء", en: "Cancel" })}
            </Button>
            <Button onClick={handleEditBooking} className="btn-luxury">
              {t({ ar: "حفظ التغييرات", en: "Save Changes" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}