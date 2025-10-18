-- Drop the old function first
DROP FUNCTION IF EXISTS public.create_system_backup();

-- Create comprehensive backup function
CREATE OR REPLACE FUNCTION public.create_system_backup()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_data jsonb;
  v_settings_id uuid;
  v_version int;
BEGIN
  -- جمع نسخة احتياطية شاملة لجميع البيانات
  v_data := jsonb_build_object(
    -- البيانات الأساسية
    'cities', COALESCE((SELECT jsonb_agg(row_to_json(c)) FROM (SELECT * FROM public.cities) c), '[]'::jsonb),
    'hotels', COALESCE((SELECT jsonb_agg(row_to_json(h)) FROM (SELECT * FROM public.hotels) h), '[]'::jsonb),
    'hotel_owners', COALESCE((SELECT jsonb_agg(row_to_json(ho)) FROM public.hotel_owners ho), '[]'::jsonb),
    'hotel_responsible_persons', COALESCE((SELECT jsonb_agg(row_to_json(hrp)) FROM public.hotel_responsible_persons hrp), '[]'::jsonb),
    'hotel_seasonal_pricing', COALESCE((SELECT jsonb_agg(row_to_json(hsp)) FROM public.hotel_seasonal_pricing hsp), '[]'::jsonb),
    
    -- المستخدمون والأدوار
    'profiles', COALESCE((SELECT jsonb_agg(row_to_json(p)) FROM public.profiles p), '[]'::jsonb),
    'user_roles', COALESCE((SELECT jsonb_agg(row_to_json(ur)) FROM public.user_roles ur), '[]'::jsonb),
    'user_guests', COALESCE((SELECT jsonb_agg(row_to_json(ug)) FROM public.user_guests ug), '[]'::jsonb),
    
    -- الحجوزات والمتعلقات
    'bookings', COALESCE((SELECT jsonb_agg(row_to_json(b)) FROM public.bookings b), '[]'::jsonb),
    'booking_actions_log', COALESCE((SELECT jsonb_agg(row_to_json(bal)) FROM public.booking_actions_log bal), '[]'::jsonb),
    'room_availability', COALESCE((SELECT jsonb_agg(row_to_json(ra)) FROM public.room_availability ra), '[]'::jsonb),
    
    -- التقييمات والشكاوى
    'reviews', COALESCE((SELECT jsonb_agg(row_to_json(r)) FROM public.reviews r), '[]'::jsonb),
    'complaints', COALESCE((SELECT jsonb_agg(row_to_json(c)) FROM public.complaints c), '[]'::jsonb),
    
    -- الكوبونات والعروض
    'coupons', COALESCE((SELECT jsonb_agg(row_to_json(co)) FROM public.coupons co), '[]'::jsonb),
    'coupon_hotels', COALESCE((SELECT jsonb_agg(row_to_json(ch)) FROM public.coupon_hotels ch), '[]'::jsonb),
    'coupon_users', COALESCE((SELECT jsonb_agg(row_to_json(cu)) FROM public.coupon_users cu), '[]'::jsonb),
    
    -- نقاط الولاء والإحالات
    'loyalty_points', COALESCE((SELECT jsonb_agg(row_to_json(lp)) FROM public.loyalty_points lp), '[]'::jsonb),
    'referrals', COALESCE((SELECT jsonb_agg(row_to_json(ref)) FROM public.referrals ref), '[]'::jsonb),
    
    -- الموظفون
    'employee_attendance', COALESCE((SELECT jsonb_agg(row_to_json(ea)) FROM public.employee_attendance ea), '[]'::jsonb),
    'employee_salaries', COALESCE((SELECT jsonb_agg(row_to_json(es)) FROM public.employee_salaries es), '[]'::jsonb),
    
    -- المالية
    'financial_transactions', COALESCE((SELECT jsonb_agg(row_to_json(ft)) FROM public.financial_transactions ft WHERE NOT soft_deleted), '[]'::jsonb),
    
    -- الدردشة
    'chat_sessions', COALESCE((SELECT jsonb_agg(row_to_json(cs)) FROM public.chat_sessions cs), '[]'::jsonb),
    'chat_messages', COALESCE((SELECT jsonb_agg(row_to_json(cm)) FROM public.chat_messages cm), '[]'::jsonb),
    
    -- الإشعارات
    'notifications', COALESCE((SELECT jsonb_agg(row_to_json(n)) FROM public.notifications n), '[]'::jsonb),
    
    -- طلبات الشركات
    'company_requests', COALESCE((SELECT jsonb_agg(row_to_json(cr)) FROM public.company_requests cr), '[]'::jsonb),
    
    -- سجلات التدقيق
    'audit_logs', COALESCE((SELECT jsonb_agg(row_to_json(al)) FROM public.audit_logs al), '[]'::jsonb),
    'customer_access_logs', COALESCE((SELECT jsonb_agg(row_to_json(cal)) FROM public.customer_access_logs cal), '[]'::jsonb),
    
    -- إعدادات API
    'api_settings', COALESCE((SELECT jsonb_agg(row_to_json(aps)) FROM public.api_settings aps), '[]'::jsonb),
    'api_requests', COALESCE((SELECT jsonb_agg(row_to_json(apr)) FROM public.api_requests apr), '[]'::jsonb),
    
    -- الإعدادات
    'whatsapp_settings', COALESCE((SELECT jsonb_agg(row_to_json(w)) FROM public.whatsapp_settings w), '[]'::jsonb),
    'pdf_settings', COALESCE((SELECT jsonb_agg(row_to_json(ps)) FROM public.pdf_settings ps), '[]'::jsonb),
    'site_settings', COALESCE((SELECT jsonb_agg(row_to_json(s)) FROM public.site_settings s), '[]'::jsonb)
  );

  -- الحصول على الإعدادات الموجودة
  SELECT id, COALESCE(backup_version, 0) INTO v_settings_id, v_version 
  FROM public.site_settings 
  LIMIT 1;

  -- تحديث أو إدراج
  IF v_settings_id IS NULL THEN
    INSERT INTO public.site_settings (backup_created_at, backup_version, backup_data)
    VALUES (now(), 1, v_data);
  ELSE
    UPDATE public.site_settings
    SET backup_created_at = now(),
        backup_version = v_version + 1,
        backup_data = v_data,
        updated_at = now()
    WHERE id = v_settings_id;
  END IF;
END;
$function$;