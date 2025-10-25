-- Policies to allow authorized roles to manage hotels and seasonal pricing
-- Hotels
DO $$ BEGIN
  -- Update
  CREATE POLICY "Staff can update hotels" ON public.hotels
  FOR UPDATE
  USING (public.has_any_role(auth.uid(), ARRAY['admin','manager','assistant_manager','employee','specific_financial_manager','visa_manager']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','manager','assistant_manager','employee','specific_financial_manager','visa_manager']::public.app_role[]));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  -- Insert
  CREATE POLICY "Staff can insert hotels" ON public.hotels
  FOR INSERT
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','manager','assistant_manager','employee','specific_financial_manager','visa_manager']::public.app_role[]));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Seasonal pricing
DO $$ BEGIN
  CREATE POLICY "Staff can manage seasonal pricing" ON public.hotel_seasonal_pricing
  FOR ALL
  USING (public.has_any_role(auth.uid(), ARRAY['admin','manager','assistant_manager','employee']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','manager','assistant_manager','employee']::public.app_role[]));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
