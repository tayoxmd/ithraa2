import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, MapPin, Search, Users, Bed } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import type { DateRange } from "react-day-picker";

interface City {
  id: string;
  name_ar: string;
  name_en: string;
}

export function SearchBox({ initialValues, onSearch }: { initialValues?: any, onSearch?: () => void } = {}) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (initialValues?.checkIn && initialValues?.checkOut) {
      return {
        from: new Date(initialValues.checkIn),
        to: new Date(initialValues.checkOut)
      };
    }
    return undefined;
  });
  const [guests, setGuests] = useState(initialValues?.guests || "2");
  const [customGuests, setCustomGuests] = useState("");
  const [rooms, setRooms] = useState(initialValues?.rooms || "1");
  const [customRooms, setCustomRooms] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>(initialValues?.city || "");
  const [cities, setCities] = useState<City[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const nights = dateRange?.from && dateRange?.to 
    ? differenceInDays(dateRange.to, dateRange.from)
    : 0;

  useEffect(() => {
    async function fetchCities() {
      const { data } = await supabase
        .from('cities')
        .select('*')
        .eq('active', true);
      if (data) setCities(data);
    }
    fetchCities();
  }, []);

  const handleSearch = () => {
    if (!selectedCity) {
      toast({
        title: t({ ar: "تنبيه", en: "Warning" }),
        description: t({ ar: "يرجى اختيار المدينة", en: "Please select a city" }),
        variant: "destructive",
      });
      return;
    }

    // Validate dates before search
    if (dateRange?.from && dateRange?.to && dateRange.to <= dateRange.from) {
      toast({
        title: t({ ar: "خطأ في التاريخ", en: "Date Error" }),
        description: t({ ar: "تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول", en: "Check-out date must be after check-in date" }),
        variant: "destructive",
      });
      return;
    }

    const params = new URLSearchParams();
    params.set('city', selectedCity);
    if (dateRange?.from) params.set('checkIn', format(dateRange.from, 'yyyy-MM-dd'));
    if (dateRange?.to) params.set('checkOut', format(dateRange.to, 'yyyy-MM-dd'));
    params.set('guests', guests === 'custom' ? customGuests : guests);
    params.set('rooms', rooms === 'custom' ? customRooms : rooms);

    // Close calendar if open
    setIsCalendarOpen(false);

    navigate(`/search?${params.toString()}`);
    
    // Call onSearch callback if provided (for scrolling in SearchResults)
    if (onSearch) {
      onSearch();
    }
  };

  const numberOfDays = dateRange?.from && dateRange?.to 
    ? differenceInDays(dateRange.to, dateRange.from)
    : 0;

  const displayDateText = dateRange?.from && dateRange?.to
    ? `${format(dateRange.from, "dd MMMM yyyy", { locale: ar })} - ${format(dateRange.to, "dd MMMM yyyy", { locale: ar })} ${numberOfDays > 0 ? `(${t({ ar: numberOfDays === 1 ? "يوم واحد" : numberOfDays === 2 ? "يومان" : `${numberOfDays} أيام`, en: `${numberOfDays} ${numberOfDays === 1 ? "day" : "days"}` })})` : ''}`
    : t({ ar: "اختر التواريخ", en: "Pick dates" });

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="glass-effect rounded-3xl p-4 md:p-6 animate-scale-in shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {/* Location */}
          <div className="relative">
            <label className="text-xs font-medium text-white mb-1.5 block">
              {t('الموقع', 'Location')}
            </label>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/60">
                <SelectValue placeholder={t('إلى أين أنت ذاهب؟', 'Where are you going?')} />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name_ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-xs font-medium text-white mb-1.5 block">
              {t('تاريخ الوصول', 'Check in')}
            </label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-11 justify-start text-right font-normal bg-white/10 border-white/20 text-white",
                    !dateRange && "text-white/60"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  <span className="text-xs">
                    {dateRange?.from ? format(dateRange.from, "dd/MM/yyyy") : t('إضافة تواريخ', 'Add dates')}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div>
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    locale={ar}
                    className="pointer-events-auto"
                    numberOfMonths={1}
                  />
                  <div className="px-3 pb-3 border-t flex items-center justify-between">
                    <span className="text-sm">
                      {t('عدد الأيام', 'Number of days')}: <strong>{numberOfDays}</strong>
                    </span>
                    <Button 
                      size="default"
                      className="min-w-28 h-10 px-6 text-base"
                      onClick={() => setIsCalendarOpen(false)}
                    >
                      {t('موافق', 'OK')}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Check out */}
          <div>
            <label className="text-xs font-medium text-white mb-1.5 block">
              {t('تاريخ المغادرة', 'Check out')}
            </label>
            <Button
              variant="outline"
              className={cn(
                "w-full h-11 justify-start text-right font-normal bg-white/10 border-white/20 text-white",
                !dateRange?.to && "text-white/60"
              )}
              onClick={() => setIsCalendarOpen(true)}
            >
              <CalendarIcon className="ml-2 h-4 w-4" />
              <span className="text-xs">
                {dateRange?.to ? format(dateRange.to, "dd/MM/yyyy") : t('إضافة تواريخ', 'Add dates')}
              </span>
            </Button>
          </div>

          {/* Guests */}
          <div>
            <label className="text-xs font-medium text-white mb-1.5 block">
              {t('الضيوف', 'Guests')}
            </label>
            <Select value={guests} onValueChange={setGuests}>
              <SelectTrigger className="h-11 bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                ))}
                <SelectItem value="custom">{t('أخرى', 'Other')}</SelectItem>
              </SelectContent>
            </Select>
            {guests === 'custom' && (
              <Input
                type="number"
                min="1"
                value={customGuests}
                onChange={(e) => setCustomGuests(e.target.value)}
                placeholder={t('أدخل العدد', 'Enter number')}
                className="mt-2 h-11 bg-white/10 border-white/20 text-white"
              />
            )}
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-4">
          <Button onClick={handleSearch} className="w-full h-12 md:h-14 text-base md:text-lg btn-luxury rounded-full">
            <Search className="ml-2 w-4 h-4 md:w-5 md:h-5" />
            {t('ابحث', 'Search')}
          </Button>
        </div>
      </div>
    </div>
  );
}
