-- إضافة الأدوار الجديدة إلى enum app_role فقط
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'assistant_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'company';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'specific_financial_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'specific_financial_employee';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'visa_department_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'visa_department_employee';