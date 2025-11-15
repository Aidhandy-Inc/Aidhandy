// app/api/amadeus-token/route.js
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req) {
  try {
    const authHeader = req.headers.get("authorization");
    
    if (!authHeader) {
      return NextResponse.json(
        { error: "No authorization token provided" },
        { status: 401 }
      );
    }
    
    const response = await fetch(
      "https://vsnarbopoesgolycksfc.supabase.co/functions/v1/amadeus-oauth",
      {
        method: "GET",
        headers: {
          "Authorization": authHeader,
          "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, // This is required!
          "Content-Type": "application/json",
        },
      }
    );

    const text = await response.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("❌ Parse error:", text);
      return NextResponse.json(
        { error: "Invalid response from Edge Function", details: text },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error("Edge Function error:", data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
    
  } catch (err) {
    console.error("💥 Error:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}