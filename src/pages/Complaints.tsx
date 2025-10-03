import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { MessageSquare } from "lucide-react";

export default function Complaints() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !description.trim()) {
      toast({
        title: t({ ar: "خطأ", en: "Error", fr: "Erreur", es: "Error", ru: "Ошибка", id: "Kesalahan", ms: "Ralat" }),
        description: t({ ar: "يرجى ملء جميع الحقول المطلوبة", en: "Please fill all required fields", fr: "Veuillez remplir tous les champs requis", es: "Por favor complete todos los campos requeridos", ru: "Пожалуйста, заполните все обязательные поля", id: "Harap isi semua bidang yang diperlukan", ms: "Sila isi semua medan yang diperlukan" }),
        variant: "destructive",
      });
      return;
    }

    if (!user && !phone.trim()) {
      toast({
        title: t({ ar: "خطأ", en: "Error", fr: "Erreur", es: "Error", ru: "Ошибка", id: "Kesalahan", ms: "Ralat" }),
        description: t({ ar: "يرجى إدخال رقم الجوال للتواصل", en: "Please enter phone number for contact", fr: "Veuillez entrer le numéro de téléphone pour contact", es: "Por favor ingrese número de teléfono para contacto", ru: "Пожалуйста, введите номер телефона для связи", id: "Harap masukkan nomor telepon untuk kontak", ms: "Sila masukkan nombor telefon untuk hubungan" }),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const complaintData: any = {
        subject: subject.trim(),
        description: description.trim(),
        status: 'new',
      };

      if (user) {
        complaintData.user_id = user.id;
      } else {
        // For non-logged in users, store phone in description
        complaintData.description = `${description.trim()}\n\nرقم الجوال / Phone: ${phone.trim()}`;
        // We need a temporary user_id - we'll use a special UUID for anonymous complaints
        complaintData.user_id = '00000000-0000-0000-0000-000000000000';
      }

      const { error } = await supabase
        .from('complaints')
        .insert([complaintData]);

      if (error) throw error;

      toast({
        title: t({ ar: "تم إرسال الشكوى", en: "Complaint Submitted", fr: "Plainte soumise", es: "Queja enviada", ru: "Жалоба отправлена", id: "Keluhan Dikirim", ms: "Aduan Dihantar" }),
        description: t({ ar: "سيتم الرد عليك قريباً", en: "You will receive a response soon", fr: "Vous recevrez une réponse bientôt", es: "Recibirá una respuesta pronto", ru: "Вы получите ответ в ближайшее время", id: "Anda akan menerima tanggapan segera", ms: "Anda akan menerima respons tidak lama lagi" }),
      });

      setSubject("");
      setDescription("");
      setPhone("");
      
      if (user) {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error", fr: "Erreur", es: "Error", ru: "Ошибка", id: "Kesalahan", ms: "Ralat" }),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-28 pb-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <MessageSquare className="w-6 h-6 text-primary" />
                {t({ ar: "تقديم شكوى", en: "Submit a Complaint", fr: "Soumettre une plainte", es: "Enviar una queja", ru: "Подать жалобу", id: "Kirim Keluhan", ms: "Hantar Aduan" })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="subject">
                    {t({ ar: "الموضوع", en: "Subject", fr: "Sujet", es: "Asunto", ru: "Тема", id: "Subjek", ms: "Subjek" })} *
                  </Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder={t({ ar: "عنوان الشكوى", en: "Complaint title", fr: "Titre de la plainte", es: "Título de la queja", ru: "Заголовок жалобы", id: "Judul keluhan", ms: "Tajuk aduan" })}
                    required
                  />
                </div>

                {!user && (
                  <div>
                    <Label htmlFor="phone">
                      {t({ ar: "رقم الجوال", en: "Phone Number", fr: "Numéro de téléphone", es: "Número de teléfono", ru: "Номер телефона", id: "Nomor Telepon", ms: "Nombor Telefon" })} *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t({ ar: "05XXXXXXXX", en: "05XXXXXXXX", fr: "05XXXXXXXX", es: "05XXXXXXXX", ru: "05XXXXXXXX", id: "05XXXXXXXX", ms: "05XXXXXXXX" })}
                      required
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="description">
                    {t({ ar: "التفاصيل", en: "Details", fr: "Détails", es: "Detalles", ru: "Детали", id: "Detail", ms: "Butiran" })} *
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t({ ar: "اشرح شكواك بالتفصيل...", en: "Explain your complaint in detail...", fr: "Expliquez votre plainte en détail...", es: "Explique su queja en detalle...", ru: "Объясните вашу жалобу подробно...", id: "Jelaskan keluhan Anda secara detail...", ms: "Terangkan aduan anda dengan terperinci..." })}
                    rows={8}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t({ ar: "جاري الإرسال...", en: "Submitting...", fr: "Soumission...", es: "Enviando...", ru: "Отправка...", id: "Mengirim...", ms: "Menghantar..." }) : t({ ar: "إرسال الشكوى", en: "Submit Complaint", fr: "Soumettre la plainte", es: "Enviar queja", ru: "Отправить жалобу", id: "Kirim Keluhan", ms: "Hantar Aduan" })}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
