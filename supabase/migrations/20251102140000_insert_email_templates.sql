-- إدراج قوالب بريد متنوعة

DO $$
DECLARE
  template1_id UUID;
  template2_id UUID;
  template3_id UUID;
  template4_id UUID;
  template5_id UUID;
BEGIN
  -- قالب 1: قالب ترحيبي
  INSERT INTO public.email_templates (name_ar, name_en, subject_ar, subject_en, body_html, is_active, is_default)
  VALUES (
    'قالب ترحيبي',
    'Welcome Template',
    'مرحباً بك في إثراء للفنادق',
    'Welcome to ITHRAA Hotels',
    '<html><body style="font-family: Arial, sans-serif; padding: 20px;"><h1 style="color: #3b82f6;">مرحباً بك!</h1><p>نشكرك على اختيارك لإثراء للفنادق. نحن سعداء بخدمتك.</p></body></html>',
    true,
    false
  )
  RETURNING id INTO template1_id;

  -- قالب 2: قالب تأكيد الحجز
  INSERT INTO public.email_templates (name_ar, name_en, subject_ar, subject_en, body_html, is_active, is_default)
  VALUES (
    'قالب تأكيد الحجز',
    'Booking Confirmation Template',
    'تأكيد حجزك في إثراء للفنادق',
    'Your Booking Confirmation at ITHRAA Hotels',
    '<html><body style="font-family: Arial, sans-serif; padding: 20px;"><h1 style="color: #10b981;">تم تأكيد حجزك</h1><p>عزيزي/عزيزتي {{customer_name}}،</p><p>نود إعلامك بأن حجزك تم تأكيده بنجاح.</p><p>رقم الحجز: {{booking_number}}</p><p>تاريخ الوصول: {{check_in_date}}</p><p>تاريخ المغادرة: {{check_out_date}}</p></body></html>',
    true,
    true
  )
  RETURNING id INTO template2_id;

  -- قالب 3: قالب إشعار الاستفسار
  INSERT INTO public.email_templates (name_ar, name_en, subject_ar, subject_en, body_html, is_active, is_default)
  VALUES (
    'قالب إشعار الاستفسار',
    'Inquiry Notification Template',
    'رد على استفسارك',
    'Response to Your Inquiry',
    '<html><body style="font-family: Arial, sans-serif; padding: 20px;"><h1 style="color: #f59e0b;">شكراً لاستفسارك</h1><p>عزيزي/عزيزتي {{customer_name}}،</p><p>نشكرك على استفسارك وسنقوم بالرد عليك في أقرب وقت ممكن.</p><p>رقم الاستفسار: {{inquiry_number}}</p></body></html>',
    true,
    false
  )
  RETURNING id INTO template3_id;

  -- قالب 4: قالب تذكير
  INSERT INTO public.email_templates (name_ar, name_en, subject_ar, subject_en, body_html, is_active, is_default)
  VALUES (
    'قالب تذكير',
    'Reminder Template',
    'تذكير بخصوص حجزك',
    'Reminder About Your Booking',
    '<html><body style="font-family: Arial, sans-serif; padding: 20px;"><h1 style="color: #ef4444;">تذكير مهم</h1><p>عزيزي/عزيزتي {{customer_name}}،</p><p>نود تذكيرك بأن حجزك في {{hotel_name}} بتاريخ {{booking_date}}.</p><p>نتمنى رؤيتك قريباً!</p></body></html>',
    true,
    false
  )
  RETURNING id INTO template4_id;

  -- قالب 5: قالب شكر بعد الإقامة
  INSERT INTO public.email_templates (name_ar, name_en, subject_ar, subject_en, body_html, is_active, is_default)
  VALUES (
    'قالب شكر بعد الإقامة',
    'Thank You After Stay Template',
    'شكراً لك على اختيارك إثراء للفنادق',
    'Thank You for Choosing ITHRAA Hotels',
    '<html><body style="font-family: Arial, sans-serif; padding: 20px;"><h1 style="color: #10b981;">شكراً لك!</h1><p>عزيزي/عزيزتي {{customer_name}}،</p><p>نشكرك على اختيارك لإثراء للفنادق ونتمنى أن تكون إقامتك ممتعة.</p><p>نود معرفة رأيك في خدماتنا من خلال ملء استطلاع الرأي: <a href="{{survey_link}}">اضغط هنا</a></p><p>نتمنى رؤيتك مرة أخرى قريباً!</p></body></html>',
    true,
    false
  )
  RETURNING id INTO template5_id;

  -- إضافة عناصر للقالب 1 (ترحيبي)
  INSERT INTO public.email_template_components (template_id, component_type, content, order_index, style)
  VALUES
    (template1_id, 'text', '{"text": "مرحباً بك في إثراء للفنادق!", "align": "center"}'::jsonb, 0, '{"fontSize": "24px", "fontWeight": "bold", "color": "#3b82f6"}'::jsonb),
    (template1_id, 'spacer', '{"height": "20px"}'::jsonb, 1, '{}'::jsonb),
    (template1_id, 'text', '{"text": "نشكرك على اختيارك لنا. نحن ملتزمون بتقديم أفضل الخدمات لك.", "align": "left"}'::jsonb, 2, '{"fontSize": "16px", "lineHeight": "1.6"}'::jsonb);

  -- إضافة عناصر للقالب 2 (تأكيد الحجز)
  INSERT INTO public.email_template_components (template_id, component_type, content, order_index, style)
  VALUES
    (template2_id, 'text', '{"text": "تم تأكيد حجزك بنجاح", "align": "center"}'::jsonb, 0, '{"fontSize": "24px", "fontWeight": "bold", "color": "#10b981"}'::jsonb),
    (template2_id, 'divider', '{"style": "solid", "color": "#e5e7eb"}'::jsonb, 1, '{}'::jsonb),
    (template2_id, 'text', '{"text": "عزيزي/عزيزتي {{customer_name}}", "align": "left"}'::jsonb, 2, '{"fontSize": "16px"}'::jsonb),
    (template2_id, 'text', '{"text": "رقم الحجز: {{booking_number}}", "align": "left"}'::jsonb, 3, '{"fontSize": "14px", "fontWeight": "bold"}'::jsonb),
    (template2_id, 'text', '{"text": "تاريخ الوصول: {{check_in_date}}", "align": "left"}'::jsonb, 4, '{"fontSize": "14px"}'::jsonb),
    (template2_id, 'text', '{"text": "تاريخ المغادرة: {{check_out_date}}", "align": "left"}'::jsonb, 5, '{"fontSize": "14px"}'::jsonb),
    (template2_id, 'button', '{"text": "عرض تفاصيل الحجز", "url": "{{booking_link}}", "style": "primary"}'::jsonb, 6, '{}'::jsonb);

  -- إضافة عناصر للقالب 3 (إشعار الاستفسار)
  INSERT INTO public.email_template_components (template_id, component_type, content, order_index, style)
  VALUES
    (template3_id, 'text', '{"text": "شكراً لاستفسارك", "align": "center"}'::jsonb, 0, '{"fontSize": "24px", "fontWeight": "bold", "color": "#f59e0b"}'::jsonb),
    (template3_id, 'spacer', '{"height": "20px"}'::jsonb, 1, '{}'::jsonb),
    (template3_id, 'text', '{"text": "عزيزي/عزيزتي {{customer_name}}،", "align": "left"}'::jsonb, 2, '{"fontSize": "16px"}'::jsonb),
    (template3_id, 'text', '{"text": "نشكرك على استفسارك وسنقوم بالرد عليك في أقرب وقت ممكن.", "align": "left"}'::jsonb, 3, '{"fontSize": "14px", "lineHeight": "1.6"}'::jsonb);

  -- إضافة عناصر للقالب 4 (تذكير)
  INSERT INTO public.email_template_components (template_id, component_type, content, order_index, style)
  VALUES
    (template4_id, 'text', '{"text": "تذكير مهم", "align": "center"}'::jsonb, 0, '{"fontSize": "24px", "fontWeight": "bold", "color": "#ef4444"}'::jsonb),
    (template4_id, 'divider', '{"style": "solid", "color": "#e5e7eb"}'::jsonb, 1, '{}'::jsonb),
    (template4_id, 'text', '{"text": "عزيزي/عزيزتي {{customer_name}}،", "align": "left"}'::jsonb, 2, '{"fontSize": "16px"}'::jsonb),
    (template4_id, 'text', '{"text": "نود تذكيرك بأن حجزك في {{hotel_name}} بتاريخ {{booking_date}}.", "align": "left"}'::jsonb, 3, '{"fontSize": "14px", "lineHeight": "1.6"}'::jsonb),
    (template4_id, 'text', '{"text": "نتمنى رؤيتك قريباً!", "align": "left"}'::jsonb, 4, '{"fontSize": "14px"}'::jsonb);

  -- إضافة عناصر للقالب 5 (شكر بعد الإقامة)
  INSERT INTO public.email_template_components (template_id, component_type, content, order_index, style)
  VALUES
    (template5_id, 'text', '{"text": "شكراً لك!", "align": "center"}'::jsonb, 0, '{"fontSize": "24px", "fontWeight": "bold", "color": "#10b981"}'::jsonb),
    (template5_id, 'spacer', '{"height": "20px"}'::jsonb, 1, '{}'::jsonb),
    (template5_id, 'text', '{"text": "عزيزي/عزيزتي {{customer_name}}،", "align": "left"}'::jsonb, 2, '{"fontSize": "16px"}'::jsonb),
    (template5_id, 'text', '{"text": "نشكرك على اختيارك لإثراء للفنادق ونتمنى أن تكون إقامتك ممتعة.", "align": "left"}'::jsonb, 3, '{"fontSize": "14px", "lineHeight": "1.6"}'::jsonb),
    (template5_id, 'text', '{"text": "نود معرفة رأيك في خدماتنا:", "align": "left"}'::jsonb, 4, '{"fontSize": "14px"}'::jsonb),
    (template5_id, 'button', '{"text": "ملء استطلاع الرأي", "url": "{{survey_link}}", "style": "primary"}'::jsonb, 5, '{}'::jsonb),
    (template5_id, 'spacer', '{"height": "20px"}'::jsonb, 6, '{}'::jsonb),
    (template5_id, 'text', '{"text": "نتمنى رؤيتك مرة أخرى قريباً!", "align": "left"}'::jsonb, 7, '{"fontSize": "14px"}'::jsonb);

END $$;

