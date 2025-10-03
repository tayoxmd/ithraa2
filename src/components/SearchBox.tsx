import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { CalendarIcon, MapPin, Search, Users } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function SearchBox() {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(2);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="card-luxury rounded-2xl p-6 md:p-8 animate-scale-in">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Location */}
          <div className="relative">
            <label className="text-sm font-medium text-foreground mb-2 block">الوجهة</label>
            <div className="relative">
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="إلى أين تريد الذهاب؟"
                className="pr-10 h-12 bg-background/50"
              />
            </div>
          </div>

          {/* Check-in */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">تاريخ الوصول</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-right font-normal bg-background/50",
                    !checkIn && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {checkIn ? format(checkIn, "PPP", { locale: ar }) : "اختر التاريخ"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkIn}
                  onSelect={setCheckIn}
                  initialFocus
                  locale={ar}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Check-out */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">تاريخ المغادرة</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-right font-normal bg-background/50",
                    !checkOut && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {checkOut ? format(checkOut, "PPP", { locale: ar }) : "اختر التاريخ"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={checkOut}
                  onSelect={setCheckOut}
                  initialFocus
                  locale={ar}
                  disabled={(date) => checkIn ? date < checkIn : false}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Guests */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">عدد الضيوف</label>
            <div className="relative">
              <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="number"
                min="1"
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                className="pr-10 h-12 bg-background/50"
              />
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-6">
          <Button className="w-full h-14 text-lg btn-luxury">
            <Search className="ml-2 w-5 h-5" />
            ابحث الآن
          </Button>
        </div>
      </div>
    </div>
  );
}
