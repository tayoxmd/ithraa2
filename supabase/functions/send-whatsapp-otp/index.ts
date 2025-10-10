import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, countryCode = '+966' } = await req.json();
    
    if (!phone) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create hash of phone number for storage
    const encoder = new TextEncoder();
    const data = encoder.encode(phone);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const phoneHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Store OTP in database
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP valid for 10 minutes

    const { error: dbError } = await supabase
      .from('guest_verifications')
      .insert({
        phone_hash: phoneHash,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
        verified: false
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to store OTP' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send OTP via WhatsApp using asenderapi
    const apiKey = Deno.env.get('ASENDERAPI_KEY');
    const sessionId = Deno.env.get('WHATSAPP_SESSION_ID') || 'd0444686fc3031f48718b8c0d793121d5c0e84cbb80174de9edfdab2354269b1';
    
    if (!apiKey) {
      console.error('ASENDERAPI_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'WhatsApp service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fullPhone = `${countryCode}${phone}`.replace(/\+/g, '');
    const message = `رمز التحقق الخاص بك هو: ${otpCode}\n\nصالح لمدة 10 دقائق.\n\nإثراء للحجز الفندقي`;

    const whatsappResponse = await fetch('https://api.asenderapi.com/api/v1/message/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        sessionId: sessionId,
        to: fullPhone,
        text: message
      })
    });

    if (!whatsappResponse.ok) {
      const errorText = await whatsappResponse.text();
      console.error('WhatsApp API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to send WhatsApp message' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await whatsappResponse.json();
    console.log('WhatsApp OTP sent successfully:', result);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'OTP sent successfully via WhatsApp'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-whatsapp-otp:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
