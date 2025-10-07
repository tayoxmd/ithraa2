-- Add meal plan fields to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS meal_plan_name_ar TEXT,
ADD COLUMN IF NOT EXISTS meal_plan_name_en TEXT,
ADD COLUMN IF NOT EXISTS meal_plan_price NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS meal_plan_max_persons INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS meal_plan_extra_price NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS extra_meals INTEGER DEFAULT 0;