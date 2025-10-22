// supabase/functions/search-companions/index.ts (updated)
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
    const { flight_number, date, airline } = await req.json();

    if (!date) {
      return new Response(
        JSON.stringify({ error: 'Missing date parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Build the query with proper table relationships
    let companionsQuery = supabaseClient
      .from('companions')
      .select(`
        *,
        bookings!inner (
          id,
          flight_number,
          airline_name,
          departure_date,
          arrival_date,
          status,
          seat_number
        )
      `)
      .eq('bookings.departure_date', date)
      .eq('bookings.status', 'confirmed');

    // Apply flight number filter if provided
    if (flight_number && flight_number !== 'Unknown') {
      companionsQuery = companionsQuery.eq('bookings.flight_number', flight_number);
    }

    // Apply airline filter if provided - note the column name is airline_name
    if (airline && airline !== 'Unknown') {
      companionsQuery = companionsQuery.eq('bookings.airline_name', airline);
    }

    const { data: companions, error } = await companionsQuery;

    if (error) {
      console.error('Error fetching companions:', error);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify(companions || []),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Companion search error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});