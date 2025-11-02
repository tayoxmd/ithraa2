-- سكريبت لإضافة بريد تجريبي
-- 10 بريد وارد، 10 بريد مرسل، 10 مسودات، 10 بريد جنك

-- الحصول على IDs للفلاتر والحالات
DO $$
DECLARE
  inbox_filter_id UUID;
  sent_filter_id UUID;
  trash_filter_id UUID;
  spam_filter_id UUID;
  status_id_1 UUID;
  status_id_2 UUID;
  status_id_3 UUID;
  status_id_4 UUID;
  status_id_5 UUID;
BEGIN
  -- الحصول على IDs للفلاتر
  SELECT id INTO inbox_filter_id FROM public.email_filters WHERE filter_type = 'inbox' LIMIT 1;
  SELECT id INTO sent_filter_id FROM public.email_filters WHERE filter_type = 'sent' LIMIT 1;
  SELECT id INTO trash_filter_id FROM public.email_filters WHERE filter_type = 'trash' LIMIT 1;
  SELECT id INTO spam_filter_id FROM public.email_filters WHERE filter_type = 'spam' LIMIT 1;
  
  -- الحصول على IDs للحالات
  SELECT id INTO status_id_1 FROM public.email_statuses WHERE order_index = 1 LIMIT 1;
  SELECT id INTO status_id_2 FROM public.email_statuses WHERE order_index = 2 LIMIT 1;
  SELECT id INTO status_id_3 FROM public.email_statuses WHERE order_index = 3 LIMIT 1;
  SELECT id INTO status_id_4 FROM public.email_statuses WHERE order_index = 4 LIMIT 1;
  SELECT id INTO status_id_5 FROM public.email_statuses WHERE order_index = 5 LIMIT 1;

  -- 10 بريد وارد (Inbox)
  INSERT INTO public.emails (subject, from_email, from_name, to_email, to_name, body, status, filter_id, status_id, is_read, priority, has_replies, reply_count, created_at) VALUES
    ('استفسار عن حجز غرفة', 'customer1@example.com', 'أحمد محمد', 'info@ithraa.com', 'إثراء للفنادق', 'أود الاستفسار عن توفر غرفة لشخصين بتاريخ 15/12/2024', 'inbox', inbox_filter_id, status_id_1, false, 'high', false, 0, now() - interval '1 day'),
    ('طلب تأكيد الحجز', 'customer2@example.com', 'فاطمة علي', 'reservations@ithraa.com', 'قسم الحجوزات', 'أرجو تأكيد حجزي رقم #12345', 'inbox', inbox_filter_id, status_id_1, false, 'normal', true, 2, now() - interval '2 days'),
    ('شكوى بخصوص الخدمة', 'customer3@example.com', 'خالد حسن', 'support@ithraa.com', 'الدعم الفني', 'لدي شكوى بخصوص الخدمة المقدمة في الفندق', 'inbox', inbox_filter_id, status_id_2, true, 'high', false, 0, now() - interval '3 hours'),
    ('استفسار عن العروض', 'customer4@example.com', 'سارة أحمد', 'marketing@ithraa.com', 'التسويق', 'ما هي العروض المتاحة لهذا الشهر؟', 'inbox', inbox_filter_id, status_id_1, false, 'normal', false, 0, now() - interval '5 hours'),
    ('طلب فاتورة', 'customer5@example.com', 'محمد سالم', 'accounting@ithraa.com', 'المحاسبة', 'أحتاج نسخة من الفاتورة رقم 789', 'inbox', inbox_filter_id, status_id_3, true, 'normal', false, 0, now() - interval '1 day'),
    ('اقتراح للتحسين', 'customer6@example.com', 'ليلى خالد', 'feedback@ithraa.com', 'الملاحظات', 'لدي اقتراحات لتحسين الخدمة', 'inbox', inbox_filter_id, status_id_1, false, 'low', false, 0, now() - interval '6 hours'),
    ('استفسار عن الفعاليات', 'customer7@example.com', 'عمر يوسف', 'events@ithraa.com', 'الفعاليات', 'ما هي الفعاليات القادمة في الفندق؟', 'inbox', inbox_filter_id, status_id_2, true, 'normal', true, 1, now() - interval '2 days'),
    ('طلب خاص', 'customer8@example.com', 'نورا عبدالله', 'special@ithraa.com', 'الطلبات الخاصة', 'أريد طلب خاص لحفل زفافي', 'inbox', inbox_filter_id, status_id_1, false, 'high', false, 0, now() - interval '4 hours'),
    ('استفسار عن المطعم', 'customer9@example.com', 'حسام الدين', 'restaurant@ithraa.com', 'المطعم', 'ما هي أوقات عمل المطعم؟', 'inbox', inbox_filter_id, status_id_1, false, 'normal', false, 0, now() - interval '3 hours'),
    ('شكر وتقدير', 'customer10@example.com', 'رنا إبراهيم', 'info@ithraa.com', 'إثراء للفنادق', 'شكراً لكم على الخدمة الممتازة', 'inbox', inbox_filter_id, status_id_2, true, 'low', false, 0, now() - interval '1 day');

  -- 10 بريد مرسل (Sent)
  INSERT INTO public.emails (subject, from_email, from_name, to_email, to_name, body, status, filter_id, status_id, is_read, priority, has_replies, reply_count, created_at) VALUES
    ('رد على استفسار الحجز', 'info@ithraa.com', 'إثراء للفنادق', 'customer1@example.com', 'أحمد محمد', 'شكراً لاستفسارك، نعم متوفر لدينا غرف', 'sent', sent_filter_id, status_id_2, true, 'normal', true, 1, now() - interval '23 hours'),
    ('تأكيد الحجز', 'reservations@ithraa.com', 'قسم الحجوزات', 'customer2@example.com', 'فاطمة علي', 'تم تأكيد حجزك بنجاح', 'sent', sent_filter_id, status_id_2, true, 'normal', false, 0, now() - interval '2 days'),
    ('رد على الشكوى', 'support@ithraa.com', 'الدعم الفني', 'customer3@example.com', 'خالد حسن', 'نعتذر عن الإزعاج وسنتخذ الإجراءات اللازمة', 'sent', sent_filter_id, status_id_2, true, 'high', false, 0, now() - interval '2 hours'),
    ('عروض خاصة', 'marketing@ithraa.com', 'التسويق', 'customer4@example.com', 'سارة أحمد', 'إليك قائمة بالعروض المتاحة', 'sent', sent_filter_id, status_id_2, true, 'normal', false, 0, now() - interval '4 hours'),
    ('إرسال الفاتورة', 'accounting@ithraa.com', 'المحاسبة', 'customer5@example.com', 'محمد سالم', 'مرفق الفاتورة المطلوبة', 'sent', sent_filter_id, status_id_2, true, 'normal', false, 0, now() - interval '23 hours'),
    ('شكر على الاقتراح', 'feedback@ithraa.com', 'الملاحظات', 'customer6@example.com', 'ليلى خالد', 'شكراً على اقتراحاتك القيمة', 'sent', sent_filter_id, status_id_2, true, 'low', false, 0, now() - interval '5 hours'),
    ('معلومات الفعاليات', 'events@ithraa.com', 'الفعاليات', 'customer7@example.com', 'عمر يوسف', 'إليك قائمة بالفعاليات القادمة', 'sent', sent_filter_id, status_id_2, true, 'normal', false, 0, now() - interval '1 day'),
    ('رد على الطلب الخاص', 'special@ithraa.com', 'الطلبات الخاصة', 'customer8@example.com', 'نورا عبدالله', 'سنتواصل معك قريباً بخصوص طلبك', 'sent', sent_filter_id, status_id_1, false, 'high', false, 0, now() - interval '3 hours'),
    ('معلومات المطعم', 'restaurant@ithraa.com', 'المطعم', 'customer9@example.com', 'حسام الدين', 'أوقات عمل المطعم من 7 صباحاً حتى 11 مساءً', 'sent', sent_filter_id, status_id_2, true, 'normal', false, 0, now() - interval '2 hours'),
    ('رد على الشكر', 'info@ithraa.com', 'إثراء للفنادق', 'customer10@example.com', 'رنا إبراهيم', 'شكراً لك ونتمنى رؤيتك مرة أخرى', 'sent', sent_filter_id, status_id_2, true, 'low', false, 0, now() - interval '23 hours');

  -- 10 مسودات (Drafts)
  INSERT INTO public.emails (subject, from_email, from_name, to_email, to_name, body, status, filter_id, status_id, is_read, priority, has_replies, reply_count, created_at) VALUES
    ('مسودة: عرض خاص جديد', 'marketing@ithraa.com', 'التسويق', 'customers@example.com', 'العملاء', 'نود إعلامكم بعرض خاص جديد...', 'draft', NULL, status_id_1, false, 'normal', false, 0, now() - interval '5 days'),
    ('مسودة: تحديثات الخدمة', 'info@ithraa.com', 'إثراء للفنادق', 'all@example.com', 'الجميع', 'نود إعلامكم بالتحديثات الجديدة...', 'draft', NULL, status_id_1, false, 'normal', false, 0, now() - interval '3 days'),
    ('مسودة: دعوة للفعالية', 'events@ithraa.com', 'الفعاليات', 'vip@example.com', 'الضيوف المميزين', 'نود دعوتكم لحضور فعاليتنا القادمة...', 'draft', NULL, status_id_1, false, 'high', false, 0, now() - interval '2 days'),
    ('مسودة: استطلاع رأي', 'feedback@ithraa.com', 'الملاحظات', 'guests@example.com', 'الضيوف', 'نود معرفة رأيكم في خدماتنا...', 'draft', NULL, status_id_1, false, 'normal', false, 0, now() - interval '4 days'),
    ('مسودة: تذكير بالحجز', 'reservations@ithraa.com', 'قسم الحجوزات', 'upcoming@example.com', 'الحجوزات القادمة', 'نود تذكيركم بحجزكم القادم...', 'draft', NULL, status_id_1, false, 'normal', false, 0, now() - interval '1 day'),
    ('مسودة: شكر بعد الإقامة', 'info@ithraa.com', 'إثراء للفنادق', 'recent@example.com', 'الضيوف الأخيرين', 'شكراً لاختياركم فندقنا...', 'draft', NULL, status_id_1, false, 'low', false, 0, now() - interval '6 days'),
    ('مسودة: إعلان عن صيانة', 'maintenance@ithraa.com', 'الصيانة', 'residents@example.com', 'المقيمين', 'نود إعلامكم بوجود صيانة...', 'draft', NULL, status_id_1, false, 'high', false, 0, now() - interval '3 days'),
    ('مسودة: عرض موسمي', 'marketing@ithraa.com', 'التسويق', 'seasonal@example.com', 'العملاء الموسميين', 'عرض خاص للموسم الجديد...', 'draft', NULL, status_id_1, false, 'normal', false, 0, now() - interval '2 days'),
    ('مسودة: تحديث سياسة', 'legal@ithraa.com', 'القانونية', 'all@example.com', 'الجميع', 'نود إعلامكم بتحديث السياسات...', 'draft', NULL, status_id_1, false, 'normal', false, 0, now() - interval '4 days'),
    ('مسودة: دعوة للتعاون', 'partnerships@ithraa.com', 'الشراكات', 'partner@example.com', 'الشريك', 'نود دعوتكم للتعاون معنا...', 'draft', NULL, status_id_1, false, 'normal', false, 0, now() - interval '1 day');

  -- 10 بريد جنك (Spam)
  INSERT INTO public.emails (subject, from_email, from_name, to_email, to_name, body, status, filter_id, status_id, is_read, priority, has_replies, reply_count, created_at) VALUES
    ('فوزك بمليون دولار!', 'spam1@fake.com', 'صندوق الجوائز', 'info@ithraa.com', 'إثراء للفنادق', 'تهانينا! لقد فزت بمليون دولار!', 'spam', spam_filter_id, status_id_5, false, 'low', false, 0, now() - interval '1 day'),
    ('عرض لا يقاوم!', 'spam2@fake.com', 'تسوق الآن', 'marketing@ithraa.com', 'التسويق', 'عروض رائعة لا تفوتها!', 'spam', spam_filter_id, status_id_5, false, 'low', false, 0, now() - interval '2 days'),
    ('تحسينات رائعة!', 'spam3@fake.com', 'شركة التطوير', 'support@ithraa.com', 'الدعم', 'جرب منتجاتنا الجديدة!', 'spam', spam_filter_id, status_id_5, false, 'low', false, 0, now() - interval '3 hours'),
    ('فرصة ذهبية!', 'spam4@fake.com', 'الاستثمار الذهبي', 'info@ithraa.com', 'إثراء', 'استثمر الآن واكسب الكثير!', 'spam', spam_filter_id, status_id_5, false, 'low', false, 0, now() - interval '5 hours'),
    ('معلومات سرية!', 'spam5@fake.com', 'مصدر سري', 'all@ithraa.com', 'الجميع', 'معلومات حصرية فقط لك!', 'spam', spam_filter_id, status_id_5, false, 'low', false, 0, now() - interval '1 day'),
    ('عرض محدود!', 'spam6@fake.com', 'التجارة الإلكترونية', 'marketing@ithraa.com', 'التسويق', 'عرض محدود لفترة قصيرة!', 'spam', spam_filter_id, status_id_5, false, 'low', false, 0, now() - interval '6 hours'),
    ('رسالة عاجلة!', 'spam7@fake.com', 'مصدر مجهول', 'info@ithraa.com', 'إثراء', 'رسالة عاجلة جداً!', 'spam', spam_filter_id, status_id_5, false, 'low', false, 0, now() - interval '2 days'),
    ('جوائز قيمة!', 'spam8@fake.com', 'المسابقات', 'events@ithraa.com', 'الفعاليات', 'شارك وفز بجوائز قيمة!', 'spam', spam_filter_id, status_id_5, false, 'low', false, 0, now() - interval '4 hours'),
    ('تحديث أمني!', 'spam9@fake.com', 'الأمن السيبراني', 'it@ithraa.com', 'تقنية المعلومات', 'تحديث أمني عاجل!', 'spam', spam_filter_id, status_id_5, false, 'low', false, 0, now() - interval '3 days'),
    ('عرض خاص جداً!', 'spam10@fake.com', 'العروض الحصرية', 'sales@ithraa.com', 'المبيعات', 'عرض خاص جداً لا يعرض مرتين!', 'spam', spam_filter_id, status_id_5, false, 'low', false, 0, now() - interval '1 day');

END $$;

