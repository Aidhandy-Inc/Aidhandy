// app/api/amadeus-flights/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  try {

    const body = await req.json();
    const authHeader = req.headers.get("authorization");

    const response = await fetch(
      "https://vsnarbopoesgolycksfc.supabase.co/functions/v1/amadeus-flights",
      {
        method: "POST", 
        headers: {
          "Authorization": authHeader || `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("❌ JSON parse error:", text);
      return NextResponse.json(
        { error: "Invalid JSON from Edge Function", details: text.slice(0, 200) },
        { status: 500 }
      );
    }

    // Return the response with appropriate status
    return NextResponse.json(data, { status: response.status });

  } catch (err) {
    console.error("💥 API Route Error:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}