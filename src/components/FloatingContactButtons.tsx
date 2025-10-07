import { MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function FloatingContactButtons() {
  const [whatsappNumber, setWhatsappNumber] = useState('+966505731136');
  const [chatLink, setChatLink] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .maybeSingle();
    
    if (data) {
      if (data.whatsapp_number) setWhatsappNumber(data.whatsapp_number);
      if ((data as any).chat_link) {
        setChatLink((data as any).chat_link);
      }
    }
  };

  const handleWhatsAppClick = () => {
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  const handleChatClick = () => {
    if (chatLink) {
      window.open(chatLink, '_blank');
    }
  };

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
      {chatLink && (
        <Button
          size="icon"
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:scale-110 transition-transform"
          onClick={handleChatClick}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
      <Button
        size="icon"
        className="h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#25D366]/90 shadow-lg hover:scale-110 transition-transform"
        onClick={handleWhatsAppClick}
      >
        <Phone className="h-6 w-6" />
      </Button>
    </div>
  );
}
