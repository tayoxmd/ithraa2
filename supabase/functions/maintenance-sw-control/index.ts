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
      .single();

    if (roleData?.role !== 'manager') {
      throw new Error('Unauthorized: Admin access required');
    }

    const { action } = await req.json();

    if (!['unregister', 'skip-waiting'].includes(action)) {
      throw new Error('Invalid action');
    }

    // Log the action
    await supabase
      .from('maintenance_actions')
      .insert({
        user_id: user.id,
        action_type: `sw_${action.replace('-', '_')}`,
        payload: { action },
        result: 'success',
        finished_at: new Date().toISOString(),
        log: `Service Worker ${action} triggered by ${user.email}`
      });

    await supabase
      .from('admin_actions')
      .insert({
        user_id: user.id,
        action_type: 'service_worker_control',
        entity_type: 'sw',
        details: { action }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Service Worker ${action} command sent. Clients will receive the command.`,
        action 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('SW control error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message.includes('Unauthorized') ? 401 : 500,
      }
    );
  }
});
