// supabase/functions/duffel-flights/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');

    let user = null;
    let isAnonymous = true;

    // Try to verify JWT token if provided
    if (authHeader) {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      try {
        const { data: { user: authenticatedUser }, error } = await supabaseAdmin.auth.getUser(
          authHeader.replace('Bearer ', '')
        );

        if (!error && authenticatedUser) {
          user = authenticatedUser;
          isAnonymous = false;
        }
      } catch (authError) {
        // If authentication fails, continue as anonymous user
        console.log('Authentication failed, treating as anonymous user');
      }
    }

    // Proceed with Duffel API call (works for both logged-in and anonymous users)
    const { data } = await req.json();

    // Validate required fields
    if (!data || !data.slices || !data.passengers) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: data, slices, passengers' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const DUFFEL_API_URL = 'https://api.duffel.com/air/offer_requests';
    const DUFFEL_TOKEN = Deno.env.get('DUFFEL_SANDBOX_TOKEN');

    if (!DUFFEL_TOKEN) {
      return new Response(
        JSON.stringify({ error: 'Duffel token not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const response = await fetch(DUFFEL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DUFFEL_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Duffel-Version': 'v2',
      },
      body: JSON.stringify({ data }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: 'Duffel API error',
          details: responseData
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Optional: Add user info to response (for analytics/tracking)
    const finalResponse = {
      ...responseData,
      metadata: {
        isAnonymous,
        userId: user?.id || null,
      }
    };

    return new Response(
      JSON.stringify(finalResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
