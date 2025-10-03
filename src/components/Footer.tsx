import { Mail, Phone, Facebook, Twitter, Instagram, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.svg";

export function Footer() {
  const { t, language } = useLanguage();
  
  return (
    <footer className="bg-secondary text-secondary-foreground mt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Company Info - Center */}
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src={logo} 
              alt="ITHRAA Logo" 
              className="w-16 h-16 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">
                {t('إثراء', 'ITHRAA')}
              </span>
              <span className="text-sm text-secondary-foreground/70 tracking-wider">
                {language === 'ar' ? 'ITHRAA' : 'إثراء'}
              </span>
            </div>
          </div>
          <p className="text-secondary-foreground/80 text-sm leading-relaxed max-w-2xl">
            {t(
              'تجربة فاخرة في حجز الفنادق والشقق الفندقية بأفضل الأسعار وأعلى مستويات الخدمة',
              'Premium experience in booking hotels and serviced apartments at the best prices and highest service levels'
            )}
          </p>
        </div>

        {/* Support and Contact - Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 max-w-4xl mx-auto">
          {/* Support - Right */}
          <div className="text-center md:text-right">
            <h3 className="text-lg font-bold text-white mb-4">
              {t('الدعم', 'Support')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/complaints" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  {t('الشكاوى', 'Complaints')}
                </Link>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  {t('مركز المساعدة', 'Help Center')}
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  {t('سياسة الإلغاء', 'Cancellation Policy')}
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  {t('سياسة الخصوصية', 'Privacy Policy')}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact - Left */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-white mb-4">
              {t('تواصل معنا', 'Contact Us')}
            </h3>
            <div className="space-y-3 flex flex-col items-center md:items-start">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <a 
                  href="tel:+966505731136" 
                  className="text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  0505731136
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-primary" />
                <a 
                  href="https://wa.me/966505731136" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  {t('واتساب', 'WhatsApp')}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <a 
                  href="mailto:support@ithraa.com" 
                  className="text-secondary-foreground/80 hover:text-primary transition-colors"
                >
                  support@ithraa.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media - Center */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary-foreground/10 hover:bg-primary transition-colors flex items-center justify-center">
            <Facebook className="w-5 h-5" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary-foreground/10 hover:bg-primary transition-colors flex items-center justify-center">
            <Twitter className="w-5 h-5" />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary-foreground/10 hover:bg-primary transition-colors flex items-center justify-center">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="https://wa.me/966505731136" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-secondary-foreground/10 hover:bg-primary transition-colors flex items-center justify-center">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </a>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-secondary-foreground/20 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-secondary-foreground/60 text-sm text-center md:text-right">
            {t(
              '© 2025 إثراء ITHRAA. جميع الحقوق محفوظة.',
              '© 2025 ITHRAA. All rights reserved.'
            )}
          </p>
          <p className="text-secondary-foreground/60 text-sm">
            {t(
              'صُنع بـ ❤️ في المملكة العربية السعودية',
              'Made with ❤️ in Saudi Arabia'
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
