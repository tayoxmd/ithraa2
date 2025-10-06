import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Wifi, Coffee, Utensils, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const hotelImages = images && Array.isArray(images) && images.length > 0 ? images : [image];
  
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + hotelImages.length) % hotelImages.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % hotelImages.length);
  };
  
  return (
    <Card className="card-luxury overflow-hidden hover-lift cursor-pointer group animate-fade-in">
      {/* Image */}
      <div className="relative h-64 overflow-hidden rounded-t-2xl" onClick={() => navigate(`/hotel/${id}`)}>
        <img
          src={hotelImages[currentImageIndex]}
          alt={name}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between text-white">
            <div>
              <h3 className="text-lg font-bold mb-0.5">{name}</h3>
              <div className="flex items-center gap-1 text-sm">
                <MapPin className="w-3 h-3" />
                <span>{location}</span>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-primary text-primary" />
              <span className="text-sm font-bold">{rating}</span>
            </div>
          </div>
        </div>
        
      </div>

      <CardContent className="p-4">
        {/* Price & CTA */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-sm text-muted-foreground">AED</span>
              <span className="text-2xl font-bold text-white">{price}</span>
            </div>
            <p className="text-xs text-muted-foreground">{nameEn}</p>
          </div>
          <Button 
            size="sm" 
            className="btn-luxury rounded-lg px-4"
            onClick={() => navigate(`/hotel/${id}`)}
          >
            احجز
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
