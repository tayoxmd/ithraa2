import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { bookingId } = await req.json();

    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: 'Missing bookingId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch WhatsApp settings
    const { data: whatsappSettings, error: settingsError } = await supabase
      .from('whatsapp_settings')
      .select('send_to_group, group_link')
      .single();

    if (settingsError) {
      console.error('Error fetching WhatsApp settings:', settingsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch WhatsApp settings' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if sending to group is enabled
    if (!whatsappSettings?.send_to_group || !whatsappSettings?.group_link) {
      console.log('WhatsApp group notification disabled or group link not set');
      return new Response(
        JSON.stringify({ message: 'WhatsApp group notification disabled or group link not set' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        hotels:hotel_id (name_ar, name_en, location),
        profiles:user_id (full_name, phone)
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      console.error('Error fetching booking:', bookingError);
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format the message (Arabic)
    const message = `🔔 *حجز جديد*

🏨 *الفندق:* ${booking.hotels?.name_ar || 'غير محدد'}
📍 *الموقع:* ${booking.hotels?.location || 'غير محدد'}

👤 *اسم الضيف:* ${booking.guest_name || booking.profiles?.full_name || 'غير محدد'}
📞 *الهاتف:* ${booking.guest_phone || booking.profiles?.phone || 'غير محدد'}

📅 *تاريخ الوصول:* ${booking.check_in}
📅 *تاريخ المغادرة:* ${booking.check_out}
👥 *عدد النزلاء:* ${booking.guests}
🛏️ *عدد الغرف:* ${booking.rooms}

💰 *المبلغ الإجمالي:* ${booking.total_amount} ر.س
💳 *طريقة الدفع:* ${booking.payment_method}

${booking.meal_plan_name_ar ? `🍽️ *الوجبات:* ${booking.meal_plan_name_ar} (مشمولة لـ ${booking.meal_plan_max_persons} أشخاص)` : ''}
${booking.extra_meals > 0 ? `➕ *وجبات إضافية:* ${booking.extra_meals}` : ''}

${booking.notes ? `📝 *ملاحظات:* ${booking.notes}` : ''}

#حجز_جديد #${booking.booking_number || booking.id.slice(0, 8)}`;

    // Extract group ID from the group link
    // WhatsApp group links usually look like: https://chat.whatsapp.com/XXXXXX
    const groupLinkMatch = whatsappSettings.group_link.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/);
    
    if (!groupLinkMatch) {
      console.error('Invalid WhatsApp group link format');
      return new Response(
        JSON.stringify({ error: 'Invalid WhatsApp group link format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Open WhatsApp with the message
    // Note: This returns a URL that needs to be opened by the client
    // For actual server-side sending, you would need WhatsApp Business API
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    console.log('WhatsApp notification prepared for booking:', bookingId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'WhatsApp notification prepared',
        whatsappUrl,
        groupLink: whatsappSettings.group_link
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in notify-whatsapp-group function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
