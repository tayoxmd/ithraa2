import { Mail, Phone, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-luxury flex items-center justify-center shadow-luxury">
                <span className="text-2xl font-bold text-white">إ</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">إثراء</span>
                <span className="text-xs text-secondary-foreground/70 tracking-wider">ITHRAA</span>
              </div>
            </div>
            <p className="text-secondary-foreground/80 text-sm leading-relaxed">
              تجربة فاخرة في حجز الفنادق والشقق الفندقية بأفضل الأسعار وأعلى مستويات الخدمة
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  الفنادق
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  العروض
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  من نحن
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  الشروط والأحكام
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">الدعم</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  مركز المساعدة
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  سياسة الإلغاء
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  سياسة الخصوصية
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  اتصل بنا
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">تواصل معنا</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <a href="tel:+966125280777" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  +966125280777
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <a href="mailto:support@ithraa.com" className="text-secondary-foreground/80 hover:text-primary transition-colors">
                  support@ithraa.com
                </a>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <a href="#" className="w-10 h-10 rounded-full bg-secondary-foreground/10 hover:bg-primary transition-colors flex items-center justify-center">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-secondary-foreground/10 hover:bg-primary transition-colors flex items-center justify-center">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-secondary-foreground/10 hover:bg-primary transition-colors flex items-center justify-center">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-secondary-foreground/10 hover:bg-primary transition-colors flex items-center justify-center">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-secondary-foreground/20 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-secondary-foreground/60 text-sm text-center md:text-right">
            © 2025 إثراء ITHRAA. جميع الحقوق محفوظة. | ترخيص رقم: 00000
          </p>
          <p className="text-secondary-foreground/60 text-sm">
            صُنع بـ ❤️ في المملكة العربية السعودية
          </p>
        </div>
      </div>
    </footer>
  );
}
