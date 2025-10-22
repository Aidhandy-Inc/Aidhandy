import { NextResponse } from "next/server";
import { supabase } from "@/libs/supabaseClient";

export async function POST(req) {
  try {
    const body = await req.json();
    
    const { data: pairing, error } = await supabase
      .from('pairings')
      .insert([{
        traveler_id: body.traveler_id,
        companion_id: body.companion_id,
        airline_name: body.airline_name,
        flight_number: body.flight_number,
        flight_date: body.flight_date,
        seat_number: body.seat_number,
        status: 'pending_payment'
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(pairing);
    
  } catch (error) {
    console.error('Pairing creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create pairing' },
      { status: 500 }
    );
  }
}