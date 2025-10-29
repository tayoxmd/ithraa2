-- Add contract/temporary flags and price to private entities
ALTER TABLE public.private_owners
  ADD COLUMN IF NOT EXISTS is_contract boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_temporary boolean DEFAULT false;

ALTER TABLE public.private_hotels
  ADD COLUMN IF NOT EXISTS is_contract boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_temporary boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS price_per_night numeric DEFAULT 0;