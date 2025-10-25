-- Step 1: Add new enum values
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'employee';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'customer';