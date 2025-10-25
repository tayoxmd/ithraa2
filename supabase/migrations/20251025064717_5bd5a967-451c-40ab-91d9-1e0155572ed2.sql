-- Create maintenance_state table
CREATE TABLE IF NOT EXISTS public.maintenance_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN NOT NULL DEFAULT false,
  message TEXT,
  allow_admin_access BOOLEAN NOT NULL DEFAULT true,
  eta_minutes INTEGER,
  activated_by UUID REFERENCES auth.users(id),
  activated_at TIMESTAMP WITH TIME ZONE,
  deactivated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deploy_snapshots table
CREATE TABLE IF NOT EXISTS public.deploy_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commit_sha TEXT NOT NULL,
  snapshot_data JSONB NOT NULL,
  deployed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'success',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id)
);

-- Create maintenance_actions table (enhanced audit)
CREATE TABLE IF NOT EXISTS public.maintenance_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  payload JSONB,
  result TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE,
  log TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create asset_hotfixes table
CREATE TABLE IF NOT EXISTS public.asset_hotfixes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_path TEXT NOT NULL,
  action TEXT NOT NULL,
  previous_url TEXT,
  new_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  applied_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.maintenance_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deploy_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_hotfixes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for maintenance_state
CREATE POLICY "Public can view active maintenance"
ON public.maintenance_state FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage maintenance"
ON public.maintenance_state FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'manager'
    AND active = true
  )
);

-- RLS Policies for deploy_snapshots
CREATE POLICY "Admins can view snapshots"
ON public.deploy_snapshots FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'manager'
    AND active = true
  )
);

CREATE POLICY "Admins can create snapshots"
ON public.deploy_snapshots FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'manager'
    AND active = true
  )
);

-- RLS Policies for maintenance_actions
CREATE POLICY "Admins can view maintenance actions"
ON public.maintenance_actions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'manager'
    AND active = true
  )
);

CREATE POLICY "System can insert maintenance actions"
ON public.maintenance_actions FOR INSERT
WITH CHECK (true);

-- RLS Policies for asset_hotfixes
CREATE POLICY "Admins can manage asset hotfixes"
ON public.asset_hotfixes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'manager'
    AND active = true
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_state_active ON public.maintenance_state(is_active);
CREATE INDEX IF NOT EXISTS idx_deploy_snapshots_deployed_at ON public.deploy_snapshots(deployed_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_actions_user_id ON public.maintenance_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_actions_created_at ON public.maintenance_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_asset_hotfixes_status ON public.asset_hotfixes(status);

-- Create triggers
CREATE TRIGGER update_maintenance_state_updated_at
BEFORE UPDATE ON public.maintenance_state
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_asset_hotfixes_updated_at
BEFORE UPDATE ON public.asset_hotfixes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default maintenance state
INSERT INTO public.maintenance_state (is_active, allow_admin_access)
VALUES (false, true)
ON CONFLICT DO NOTHING;