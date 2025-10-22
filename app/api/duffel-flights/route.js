// app/api/duffel-flights/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    
    const body = await req.json();
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/duffel-flights`,
      {
        method: 'POST',
        headers: {
          'Authorization': authHeader || `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Edge function error', details: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Next.js API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}