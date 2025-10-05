import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Wifi, Coffee, Utensils, Images } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ImageGallery } from "@/components/ImageGallery";

interface HotelCardProps {
  id: string;
  name: string;
  nameEn: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  images?: string[];
  featured?: boolean;
}

export function HotelCard({ id, name, nameEn, location, price, rating, image, images, featured }: HotelCardProps) {
  const navigate = useNavigate();
  const [galleryOpen, setGalleryOpen] = useState(false);
  
  const hotelImages = images && Array.isArray(images) && images.length > 0 ? images : [image];
  
  return (
    <>
      <Card className="card-luxury overflow-hidden hover-lift cursor-pointer group animate-fade-in">
        {/* Image */}
        <div className="relative h-56 overflow-hidden" onClick={() => navigate(`/hotel/${id}`)}>
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {featured && (
            <Badge className="absolute top-4 right-4 bg-gradient-luxury border-0 shadow-luxury">
              عرض مميز
            </Badge>
          )}
          <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span className="text-sm font-bold">{rating}</span>
          </div>
          {hotelImages.length > 1 && (
            <Button
              size="sm"
              variant="secondary"
              className="absolute bottom-4 left-4 gap-2 h-8 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setGalleryOpen(true);
              }}
            >
              <Images className="w-3 h-3" />
              {hotelImages.length} صور
            </Button>
          )}
        </div>

      <CardContent className="p-5">
        {/* Title */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-foreground mb-1">{name}</h3>
          <p className="text-sm text-muted-foreground">{nameEn}</p>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{location}</span>
        </div>

        {/* Amenities */}
        <div className="flex items-center gap-3 mb-4">
          <Wifi className="w-4 h-4 text-muted-foreground" />
          <Coffee className="w-4 h-4 text-muted-foreground" />
          <Utensils className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">{price}</span>
              <span className="text-sm text-muted-foreground">ريال / ليلة</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="font-semibold text-foreground">{Math.round(price * 1.15)}</span> ريال <span className="text-[10px]">شامل الضريبة</span>
            </div>
          </div>
          <Button 
            size="sm" 
            className="btn-luxury"
            onClick={() => navigate(`/hotel/${id}`)}
          >
            احجز الآن
          </Button>
        </div>
      </CardContent>
    </Card>
    
    <ImageGallery
      images={hotelImages}
      open={galleryOpen}
      onClose={() => setGalleryOpen(false)}
      initialIndex={0}
    />
    </>
  );
}
