-- Step 2: Update existing roles to match code expectations
UPDATE user_roles SET role = 'admin' WHERE role = 'manager';
UPDATE user_roles SET role = 'employee' WHERE role = 'assistantmanager';
UPDATE user_roles SET role = 'customer' WHERE role = 'client';