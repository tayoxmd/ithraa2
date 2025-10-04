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

    navigate(`/search?${params.toString()}`);
    
    // Call onSearch callback if provided (for scrolling in SearchResults)
    if (onSearch) {
      onSearch();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="card-luxury rounded-2xl p-6 md:p-8 animate-scale-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Location */}
          <div className="relative">
            <label className="text-sm font-medium text-foreground mb-2 block">
              {t('الوجهة', 'Destination')}
            </label>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="h-12 bg-background/50">
                <SelectValue placeholder={t('اختر المدينة', 'Select City')} />
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
          <div className="lg:col-span-2">
            <label className="text-sm font-medium text-foreground mb-2 block">
              {t('تاريخ الوصول والمغادرة', 'Check-in & Check-out')}
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-right font-normal bg-background/50",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "PPP", { locale: ar })} - {format(dateRange.to, "PPP", { locale: ar })}
                      </>
                    ) : (
                      format(dateRange.from, "PPP", { locale: ar })
                    )
                  ) : (
                    t("اختر التواريخ", "Pick dates")
                  )}
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
                    numberOfMonths={2}
                  />
                  {nights > 0 && (
                    <div className="px-3 pb-3 text-sm text-foreground">
                      {t('عدد الأيام', 'Number of days')}: <span className="font-semibold">{nights}</span>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Rooms - Now before Guests */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {t('عدد الغرف', 'Rooms')}
            </label>
            <Select value={rooms} onValueChange={setRooms}>
              <SelectTrigger className="h-12 bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                ))}
                <SelectItem value="custom">{t('أكثر', 'More')}</SelectItem>
              </SelectContent>
            </Select>
            {rooms === 'custom' && (
              <Input
                type="number"
                min="1"
                value={customRooms}
                onChange={(e) => setCustomRooms(e.target.value)}
                placeholder={t('أدخل العدد', 'Enter number')}
                className="mt-2 h-12"
              />
            )}
          </div>

          {/* Guests - Now after Rooms */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              {t('عدد الضيوف', 'Guests')}
            </label>
            <Select value={guests} onValueChange={setGuests}>
              <SelectTrigger className="h-12 bg-background/50">
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
                className="mt-2 h-12"
              />
            )}
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-6">
          <Button onClick={handleSearch} className="w-full h-14 text-lg btn-luxury">
            <Search className="ml-2 w-5 h-5" />
            {t('ابحث الآن', 'Search Now')}
          </Button>
        </div>
      </div>
    </div>
  );
}
