import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, AlertCircle } from 'lucide-react';
import { format, startOfWeek, addDays, eachDayOfInterval, isSameDay, isBefore, isAfter } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

interface RoomAvailabilityCalendarProps {
  roomId: string;
  checkIn?: string;
  checkOut?: string;
  onDateSelect?: (date: Date) => void;
}

interface Booking {
  id: string;
  check_in: string;
  check_out: string;
  status: string;
}

export function RoomAvailabilityCalendar({ 
  roomId, 
  checkIn, 
  checkOut, 
  onDateSelect 
}: RoomAvailabilityCalendarProps) {
  const { t, language } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return startOfWeek(today, { weekStartsOn: language === 'ar' ? 6 : 0 });
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (roomId) {
      loadBookings();
    }
  }, [roomId]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      // Load bookings for this room
      const { data, error } = await supabase
        .from('private_bookings' as any)
        .select('id, check_in, check_out, status')
        .eq('room_id', roomId);

      if (error) throw error;
      setBookings((data as any) || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateStatus = (date: Date): 'available' | 'unavailable' | 'pending' => {
    // Check if date is in any booking
    for (const booking of bookings) {
      const checkInDate = new Date(booking.check_in);
      const checkOutDate = new Date(booking.check_out);
      
      if (isSameDay(date, checkInDate) || isSameDay(date, checkOutDate) ||
          (isAfter(date, checkInDate) && isBefore(date, checkOutDate))) {
        if (booking.status === 'confirmed') {
          return 'unavailable';
        } else if (booking.status === 'new' || booking.status === 'pending') {
          return 'pending';
        }
      }
    }
    return 'available';
  };

  const getDateColor = (date: Date): string => {
    const status = getDateStatus(date);
    switch (status) {
      case 'available':
        return 'bg-green-500 hover:bg-green-600';
      case 'unavailable':
        return 'bg-red-500 hover:bg-red-600';
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-gray-200 hover:bg-gray-300';
    }
  };

  const weekDays = language === 'ar' 
    ? ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج']
    : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const days = eachDayOfInterval({
    start: startDate,
    end: addDays(startDate, 6),
  });

  const nextWeek = () => {
    setStartDate(addDays(startDate, 7));
  };

  const prevWeek = () => {
    setStartDate(addDays(startDate, -7));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {t({ ar: 'توفر الغرفة', en: 'Room Availability' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span>{t({ ar: 'متاح', en: 'Available' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span>{t({ ar: 'غير متاح', en: 'Unavailable' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span>{t({ ar: 'قيد الانتظار', en: 'Pending' })}</span>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={prevWeek}>
            {t({ ar: 'السابق', en: 'Previous' })}
          </Button>
          <span className="font-semibold">
            {format(startDate, 'MMMM yyyy', { locale: language === 'ar' ? ar : enUS })}
          </span>
          <Button variant="outline" size="sm" onClick={nextWeek}>
            {t({ ar: 'التالي', en: 'Next' })}
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Week Days Header */}
          {weekDays.map((day, index) => (
            <div key={index} className="text-center text-xs font-semibold text-muted-foreground p-2">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {days.map((day, index) => {
            const status = getDateStatus(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <button
                key={index}
                onClick={() => onDateSelect?.(day)}
                className={`
                  aspect-square p-1 rounded text-xs font-medium
                  transition-colors
                  ${getDateColor(day)}
                  ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}
                  text-white
                `}
                title={format(day, 'yyyy-MM-dd')}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span>{format(day, 'd')}</span>
                </div>
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="text-center text-sm text-muted-foreground py-2">
            {t({ ar: 'جاري التحميل...', en: 'Loading...' })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

