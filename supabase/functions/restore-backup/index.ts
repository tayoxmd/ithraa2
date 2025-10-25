// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const { backup } = await req.json();
    if (!backup || typeof backup !== 'object') {
      return new Response('Invalid backup payload', { status: 400, headers: corsHeaders });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

    const upsert = async (table: string, rows: any[], onConflict?: string) => {
      if (!Array.isArray(rows) || rows.length === 0) return;
      const { error } = await supabase.from(table).upsert(rows, { onConflict });
      if (error) throw error;
    };

    await upsert('cities', backup.cities, 'id');
    await upsert('profiles', backup.profiles, 'id');
    await upsert('user_roles', backup.user_roles, 'id');
    await upsert('hotels', backup.hotels, 'id');
    await upsert('hotel_seasonal_pricing', backup.hotel_seasonal_pricing, 'id');
    await upsert('hotel_owners', backup.hotel_owners, 'id');
    await upsert('hotel_responsible_persons', backup.hotel_responsible_persons, 'id');
    await upsert('bookings', backup.bookings, 'id');
    await upsert('room_availability', backup.room_availability, 'id');
    await upsert('booking_actions_log', backup.booking_actions_log, 'id');
    await upsert('reviews', backup.reviews, 'id');
    await upsert('complaints', backup.complaints, 'id');
    await upsert('coupons', backup.coupons, 'id');
    await upsert('coupon_hotels', backup.coupon_hotels, 'id');
    await upsert('coupon_users', backup.coupon_users, 'id');
    await upsert('loyalty_points', backup.loyalty_points, 'id');
    await upsert('referrals', backup.referrals, 'id');
    await upsert('employee_attendance', backup.employee_attendance, 'id');
    await upsert('employee_salaries', backup.employee_salaries, 'id');
    await upsert('financial_transactions', backup.financial_transactions, 'id');
    await upsert('chat_sessions', backup.chat_sessions, 'id');
    await upsert('chat_messages', backup.chat_messages, 'id');
    await upsert('notifications', backup.notifications, 'id');
    await upsert('company_requests', backup.company_requests, 'id');
    await upsert('audit_logs', backup.audit_logs, 'id');
    await upsert('customer_access_logs', backup.customer_access_logs, 'id');
    await upsert('api_settings', backup.api_settings, 'id');
    await upsert('api_requests', backup.api_requests, 'id');
    await upsert('whatsapp_settings', backup.whatsapp_settings, 'id');
    await upsert('pdf_settings', backup.pdf_settings, 'id');
    await upsert('site_settings', backup.site_settings, 'id');

    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e: any) {
    console.error('restore-backup error', e);
    return new Response(e?.message || 'Internal error', { status: 500, headers: corsHeaders });
  }
});