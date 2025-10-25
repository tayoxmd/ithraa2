-- Fix tasks table structure for kanban system
-- Add missing columns and fix relationships

-- Drop existing foreign key if exists
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_assigned_to_fkey;

-- Add missing columns
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS order_index integer DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category text;

-- Add financial task columns
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_financial boolean DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS amount_total numeric(10,2);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS amount_paid numeric(10,2) DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS amount_remaining numeric(10,2);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS payment_due_date date;

-- Add foreign key for assigned_to properly
ALTER TABLE tasks 
  ADD CONSTRAINT tasks_assigned_to_fkey 
  FOREIGN KEY (assigned_to) 
  REFERENCES auth.users(id) 
  ON DELETE SET NULL;

-- Update task_status enum to match kanban needs
DO $$ BEGIN
  -- Add new status values if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'todo' AND enumtypid = 'task_status'::regtype) THEN
    ALTER TYPE task_status ADD VALUE 'todo';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'in_progress' AND enumtypid = 'task_status'::regtype) THEN
    ALTER TYPE task_status ADD VALUE 'in_progress';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'done' AND enumtypid = 'task_status'::regtype) THEN
    ALTER TYPE task_status ADD VALUE 'done';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'rejected' AND enumtypid = 'task_status'::regtype) THEN
    ALTER TYPE task_status ADD VALUE 'rejected';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'archived' AND enumtypid = 'task_status'::regtype) THEN
    ALTER TYPE task_status ADD VALUE 'archived';
  END IF;
END $$;

-- Add task_category enum
DO $$ BEGIN
  CREATE TYPE task_category AS ENUM ('general', 'financial', 'booking', 'support', 'maintenance');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Update RLS policies for tasks
DROP POLICY IF EXISTS "Staff can create tasks" ON tasks;
DROP POLICY IF EXISTS "Staff can view all tasks" ON tasks;
DROP POLICY IF EXISTS "Staff can update all tasks" ON tasks;
DROP POLICY IF EXISTS "Staff can delete tasks" ON tasks;

-- Allow staff to manage tasks
CREATE POLICY "Staff can create tasks" ON tasks
  FOR INSERT
  WITH CHECK (
    has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'assistant_manager'::app_role, 'employee'::app_role])
  );

CREATE POLICY "Staff can view all tasks" ON tasks
  FOR SELECT
  USING (
    has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'assistant_manager'::app_role, 'employee'::app_role])
    OR assigned_to = auth.uid()
  );

CREATE POLICY "Staff can update all tasks" ON tasks
  FOR UPDATE
  USING (
    has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'assistant_manager'::app_role, 'employee'::app_role])
    OR assigned_to = auth.uid()
  );

CREATE POLICY "Staff can delete tasks" ON tasks
  FOR DELETE
  USING (
    has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'assistant_manager'::app_role])
  );

-- Add RLS policies for task_comments
DROP POLICY IF EXISTS "Staff can view task comments" ON task_comments;
DROP POLICY IF EXISTS "Staff can create task comments" ON task_comments;
DROP POLICY IF EXISTS "Staff can update own comments" ON task_comments;
DROP POLICY IF EXISTS "Staff can delete own comments" ON task_comments;

CREATE POLICY "Staff can view task comments" ON task_comments
  FOR SELECT
  USING (
    has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'assistant_manager'::app_role, 'employee'::app_role])
  );

CREATE POLICY "Staff can create task comments" ON task_comments
  FOR INSERT
  WITH CHECK (
    has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'assistant_manager'::app_role, 'employee'::app_role])
    AND user_id = auth.uid()
  );

CREATE POLICY "Staff can update own comments" ON task_comments
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Staff can delete own comments" ON task_comments
  FOR DELETE
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'manager'::app_role));

-- Add RLS policies for task_attachments
DROP POLICY IF EXISTS "Staff can view task attachments" ON task_attachments;
DROP POLICY IF EXISTS "Staff can upload attachments" ON task_attachments;
DROP POLICY IF EXISTS "Staff can delete own attachments" ON task_attachments;

CREATE POLICY "Staff can view task attachments" ON task_attachments
  FOR SELECT
  USING (
    has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'assistant_manager'::app_role, 'employee'::app_role])
  );

CREATE POLICY "Staff can upload attachments" ON task_attachments
  FOR INSERT
  WITH CHECK (
    has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'assistant_manager'::app_role, 'employee'::app_role])
    AND uploaded_by = auth.uid()
  );

CREATE POLICY "Staff can delete own attachments" ON task_attachments
  FOR DELETE
  USING (uploaded_by = auth.uid() OR has_role(auth.uid(), 'manager'::app_role));

-- Create function to auto-calculate remaining amount
CREATE OR REPLACE FUNCTION calculate_task_remaining_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_financial = true AND NEW.amount_total IS NOT NULL THEN
    NEW.amount_remaining := NEW.amount_total - COALESCE(NEW.amount_paid, 0);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-calculation
DROP TRIGGER IF EXISTS task_calculate_remaining ON tasks;
CREATE TRIGGER task_calculate_remaining
  BEFORE INSERT OR UPDATE OF amount_total, amount_paid
  ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION calculate_task_remaining_amount();