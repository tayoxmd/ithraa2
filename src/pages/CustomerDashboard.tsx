import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Booking {
  id: string;
  check_in: string;
  check_out: string;
  total_amount: number;
  status: string;
  hotels: {
    name_ar: string;
  };
}

export default function CustomerDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchBookings();
    }
  }, [user, loading, navigate]);

  const fetchBookings = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('bookings')
      .select('*, hotels(name_ar)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data) setBookings(data as Booking[]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-status-new';
      case 'pending': return 'bg-status-pending';
      case 'confirmed': return 'bg-status-confirmed';
      case 'cancelled': return 'bg-status-cancelled';
      default: return 'bg-muted';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'جديد';
      case 'pending': return 'قيد المراجعة';
      case 'confirmed': return 'مؤكد';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gradient-luxury mb-8">حجوزاتي</h1>
        
        {bookings.length === 0 ? (
          <Card className="card-luxury">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">لا توجد حجوزات حتى الآن</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="card-luxury">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{booking.hotels.name_ar}</CardTitle>
                    <Badge className={getStatusColor(booking.status)}>
                      {getStatusText(booking.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">تاريخ الوصول</p>
                      <p className="font-medium">{new Date(booking.check_in).toLocaleDateString('ar-SA')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">تاريخ المغادرة</p>
                      <p className="font-medium">{new Date(booking.check_out).toLocaleDateString('ar-SA')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">المبلغ الإجمالي</p>
                      <p className="font-medium">{booking.total_amount} ر.س</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
