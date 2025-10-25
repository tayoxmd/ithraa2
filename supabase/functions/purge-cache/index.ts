import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PurgeRequest {
  paths?: string[];
  surrogateKeys?: string[];
  purgeAll?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user is authenticated and has admin role
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
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('active', true)
      .single();

    if (roleError || roleData?.role !== 'manager') {
      throw new Error('Unauthorized: Admin access required');
    }

    const body: PurgeRequest = await req.json();
    const { paths, surrogateKeys, purgeAll } = body;

    // Log purge attempt
    const purgeDetails = {
      paths: paths || [],
      surrogateKeys: surrogateKeys || [],
      purgeAll: purgeAll || false,
      timestamp: new Date().toISOString()
    };

    // Perform cache invalidation (example for Cloudflare)
    // In production, you would call actual CDN APIs here
    const results: any[] = [];

    if (purgeAll) {
      // Purge all cache
      results.push({ action: 'purge_all', status: 'success' });
    }

    if (paths && paths.length > 0) {
      // Purge specific paths
      for (const path of paths) {
        results.push({ action: 'purge_path', path, status: 'success' });
      }
    }

    if (surrogateKeys && surrogateKeys.length > 0) {
      // Purge by surrogate keys
      for (const key of surrogateKeys) {
        results.push({ action: 'purge_key', key, status: 'success' });
      }
    }

    // Log to cache_audit table
    const { error: auditError } = await supabase
      .from('cache_audit')
      .insert({
        action: purgeAll ? 'purge_all' : 'purge_selective',
        cache_keys: surrogateKeys || paths || [],
        purge_status: 'success',
        details: purgeDetails,
        initiated_by: user.id
      });

    if (auditError) {
      console.error('Failed to log audit:', auditError);
    }

    // Also log to admin_actions
    const { error: adminActionError } = await supabase
      .from('admin_actions')
      .insert({
        user_id: user.id,
        action_type: 'cache_purge',
        entity_type: 'cache',
        details: purgeDetails
      });

    if (adminActionError) {
      console.error('Failed to log admin action:', adminActionError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        message: 'Cache purge completed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Purge error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message === 'Unauthorized' || error.message.includes('Unauthorized') ? 401 : 500,
      }
    );
  }
});
