import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Unauthorized');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user has manager role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('active', true)
      .maybeSingle();

    if (!roleData || roleData.role !== 'manager') {
      throw new Error('Unauthorized: Admin access required');
    }

    const { on, message, allowAdminAccess, eta } = await req.json();

    // Get current state
    const { data: currentState } = await supabase
      .from('maintenance_state')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Update or insert maintenance state
    const maintenanceData: any = {
      is_active: on,
      message: message || null,
      allow_admin_access: allowAdminAccess ?? true,
      eta_minutes: eta || null,
      updated_at: new Date().toISOString()
    };

    if (on) {
      maintenanceData.activated_by = user.id;
      maintenanceData.activated_at = new Date().toISOString();
    } else {
      maintenanceData.deactivated_at = new Date().toISOString();
    }

    let result;
    if (currentState) {
      const { data, error } = await supabase
        .from('maintenance_state')
        .update(maintenanceData)
        .eq('id', currentState.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('maintenance_state')
        .insert(maintenanceData)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }

    // Log action
    await supabase
      .from('maintenance_actions')
      .insert({
        user_id: user.id,
        action_type: on ? 'maintenance_enabled' : 'maintenance_disabled',
        payload: { message, allowAdminAccess, eta },
        result: 'success',
        finished_at: new Date().toISOString(),
        log: `Maintenance mode ${on ? 'enabled' : 'disabled'} by ${user.email}`
      });

    // Also log to admin_actions
    await supabase
      .from('admin_actions')
      .insert({
        user_id: user.id,
        action_type: 'maintenance_toggle',
        entity_type: 'maintenance',
        details: { on, message, allowAdminAccess, eta }
      });

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Maintenance toggle error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message.includes('Unauthorized') ? 401 : 500,
      }
    );
  }
});
