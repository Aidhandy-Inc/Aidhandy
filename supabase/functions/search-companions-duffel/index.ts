// supabase/functions/search-companions/index.ts (DEBUG VERSION)
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
    console.log('🔍 Received search request:', { flight_number, date, airline });

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

    // DEBUG: First, let's see what's in the companions table
    console.log('📋 Checking companions table...');
    const { data: allCompanions, error: companionsError } = await supabaseClient
      .from('companions')
      .select('*')
      .limit(10);

    console.log('👥 All companions in database:', allCompanions);
    if (companionsError) console.error('Companions query error:', companionsError);

    // DEBUG: Check bookings table
    console.log('📋 Checking bookings table...');
    const { data: allBookings, error: bookingsError } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('status', 'confirmed')
      .limit(10);

    console.log('🎫 All confirmed bookings:', allBookings);
    if (bookingsError) console.error('Bookings query error:', bookingsError);

    // Try the original query but with debug info
    console.log('🔍 Running main companions query...');
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

    // Apply airline filter if provided
    if (airline && airline !== 'Unknown') {
      companionsQuery = companionsQuery.eq('bookings.airline_name', airline);
    }

    const { data: companions, error } = await companionsQuery;

    console.log('✅ Main query result:', {
      companionsFound: companions?.length || 0,
      error: error?.message,
      rawData: companions
    });

    if (error) {
      console.error('Error fetching companions:', error);
      return new Response(
        JSON.stringify({ error: 'Database error', details: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // If no companions found with the join, try alternative approaches
    if (!companions || companions.length === 0) {
      console.log('🔄 No companions found with join, trying alternative query...');
      
      // Alternative 1: Query bookings directly and check if any have companion profiles
      const { data: matchingBookings, error: bookingsError2 } = await supabaseClient
        .from('bookings')
        .select(`
          *,
          profiles:traveler_id (
            id,
            full_name,
            role
          )
        `)
        .eq('departure_date', date)
        .eq('status', 'confirmed')
        .limit(10);

      console.log('🔍 Matching bookings with profiles:', matchingBookings);
      
      // Filter for companions only
      const companionBookings = matchingBookings?.filter(booking => 
        booking.profiles?.role === 'companion'
      ) || [];
      
      console.log('👥 Companion bookings found:', companionBookings.length);
      
      if (companionBookings.length > 0) {
        const transformedCompanions = companionBookings.map(booking => ({
          id: booking.profiles.id,
          full_name: booking.profiles.full_name,
          current_seat: booking.seat_number,
          bookings: {
            flight_number: booking.flight_number,
            departure_date: booking.departure_date,
            seat_number: booking.seat_number,
            airline_name: booking.airline_name
          }
        }));
        
        console.log('✅ Returning transformed companion bookings:', transformedCompanions);
        return new Response(
          JSON.stringify(transformedCompanions),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    console.log(`✅ Returning ${companions?.length || 0} companions`);
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
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});