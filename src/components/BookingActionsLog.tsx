import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Clock, User } from "lucide-react";

interface BookingAction {
  id: string;
  booking_id: string;
  user_id: string;
  action_type: string;
  old_value: string | null;
  new_value: string | null;
  notes: string | null;
  created_at: string;
}

interface BookingActionsLogProps {
  bookingId: string;
  open: boolean;
  onClose: () => void;
}

export function BookingActionsLog({ bookingId, open, onClose }: BookingActionsLogProps) {
  const { t, language } = useLanguage();
  const [actions, setActions] = useState<BookingAction[]>([]);
  const [userNames, setUserNames] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && bookingId) {
      fetchActions();
    }
  }, [open, bookingId]);

  const fetchActions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('booking_actions_log')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setActions(data);
        
        // Fetch user names
        const userIds = [...new Set(data.map(a => a.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        if (profiles) {
          const names: { [key: string]: string } = {};
          profiles.forEach(p => {
            names[p.id] = p.full_name || t({ ar: "مستخدم", en: "User" });
          });
          setUserNames(names);
        }
      }
    } catch (error) {
      console.error('Error fetching booking actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (actionType: string) => {
    const labels: { [key: string]: { ar: string; en: string } } = {
      status_change: { ar: "تغيير الحالة", en: "Status Change" },
      payment_status_change: { ar: "تغيير حالة الدفع", en: "Payment Status Change" },
      hotel_confirmation: { ar: "رقم التأكيد الفندقي", en: "Hotel Confirmation Number" },
      amount_change: { ar: "تغيير المبلغ", en: "Amount Change" },
    };
    return labels[actionType] ? t(labels[actionType]) : actionType;
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: { ar: string; en: string } } = {
      new: { ar: "جديد", en: "New" },
      pending: { ar: "قيد الانتظار", en: "Pending" },
      confirmed: { ar: "مؤكد", en: "Confirmed" },
      cancelled: { ar: "ملغي", en: "Cancelled" },
      rejected: { ar: "مرفوض", en: "Rejected" },
      paid: { ar: "مدفوع", en: "Paid" },
      partially_paid: { ar: "مدفوع جزئياً", en: "Partially Paid" },
      unpaid: { ar: "غير مدفوع", en: "Unpaid" },
    };
    return labels[status] ? t(labels[status]) : status;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {t({ ar: "سجل إجراءات الطلب", en: "Booking Actions Log" })}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t({ ar: "جاري التحميل...", en: "Loading..." })}
            </div>
          ) : actions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t({ ar: "لا توجد إجراءات مسجلة", en: "No actions recorded" })}
            </div>
          ) : (
            <div className="space-y-4">
              {actions.map((action) => (
                <div
                  key={action.id}
                  className="border rounded-lg p-4 bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {getActionLabel(action.action_type)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(
                        new Date(action.created_at),
                        "dd/MM/yyyy - HH:mm",
                        { locale: language === 'ar' ? ar : undefined }
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {userNames[action.user_id] || t({ ar: "مستخدم", en: "User" })}
                    </span>
                  </div>

                  {action.action_type === "amount_change" ? (
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {t({ ar: "من:", en: "From:" })}
                        </span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {action.old_value}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {t({ ar: "إلى:", en: "To:" })}
                        </span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {action.new_value}
                        </code>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">
                        {action.old_value && (
                          <>
                            <Badge variant="outline" className="mr-2">
                              {getStatusLabel(action.old_value)}
                            </Badge>
                            →
                          </>
                        )}
                      </span>
                      <Badge>
                        {action.new_value ? getStatusLabel(action.new_value) : action.new_value}
                      </Badge>
                    </div>
                  )}

                  {action.notes && (
                    <div className="mt-2 text-xs text-muted-foreground italic">
                      {action.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
