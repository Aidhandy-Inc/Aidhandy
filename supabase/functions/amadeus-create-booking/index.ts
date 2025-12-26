// supabase/functions/amadeus-create-booking/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const AMADEUS_CLIENT_ID = Deno.env.get("AMADEUS_CLIENT_ID");
const AMADEUS_CLIENT_SECRET = Deno.env.get("AMADEUS_CLIENT_SECRET");
const BASE_URL = "https://test.api.amadeus.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getAmadeusToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) return cachedToken;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: AMADEUS_CLIENT_ID!,
    client_secret: AMADEUS_CLIENT_SECRET!,
  });

  const tokenRes = await fetch(`${BASE_URL}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    console.error("Amadeus token fetch error:", err);
    throw new Error("Failed to get Amadeus token");
  }

  const tokenData = await tokenRes.json();
  cachedToken = tokenData.access_token;
  tokenExpiry = now + tokenData.expires_in * 1000 - 60_000;
  return cachedToken!;
}

serve(async (req) => {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify JWT token
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase admin client to validate user
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const body = await req.json();
    const { flight_offer, travelers, remarks, contacts } = body;

    if (!flight_offer || !travelers || travelers.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: flight_offer, travelers",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check Amadeus credentials
    if (!AMADEUS_CLIENT_ID || !AMADEUS_CLIENT_SECRET) {
      return new Response(
        JSON.stringify({ error: "Amadeus credentials not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = await getAmadeusToken();

    // Amadeus Flight Orders API
    // POST /v1/booking/flight-orders
    const bookingPayload = {
      data: {
        type: "flight-order",
        flightOffers: [flight_offer],
        travelers: travelers.map((t: any, index: number) => ({
          id: `${index + 1}`,
          dateOfBirth: t.date_of_birth || t.dateOfBirth,
          name: {
            firstName: t.first_name || t.firstName,
            lastName: t.last_name || t.lastName,
          },
          gender: t.gender?.toUpperCase() || "MALE",
          contact: {
            emailAddress: t.email || contacts?.[0]?.emailAddress,
            phones: [
              {
                deviceType: "MOBILE",
                countryCallingCode: t.country_code || "1",
                number: t.phone || contacts?.[0]?.phones?.[0]?.number || "0000000000",
              },
            ],
          },
          documents: t.documents || [],
        })),
        remarks: remarks || {
          general: [
            {
              subType: "GENERAL_MISCELLANEOUS",
              text: "ONLINE BOOKING",
            },
          ],
        },
        ticketingAgreement: {
          option: "DELAY_TO_QUEUE",
          dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        },
        contacts: contacts || [
          {
            addresseeName: {
              firstName: travelers[0]?.first_name || travelers[0]?.firstName,
              lastName: travelers[0]?.last_name || travelers[0]?.lastName,
            },
            purpose: "STANDARD",
            phones: [
              {
                deviceType: "MOBILE",
                countryCallingCode: "1",
                number: travelers[0]?.phone || "0000000000",
              },
            ],
            emailAddress: travelers[0]?.email,
          },
        ],
      },
    };

    const bookingRes = await fetch(`${BASE_URL}/v1/booking/flight-orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(bookingPayload),
    });

    const bookingData = await bookingRes.json();

    if (!bookingRes.ok) {
      console.error("Amadeus create booking error:", bookingData);
      return new Response(
        JSON.stringify({
          error: "Amadeus API error",
          details: bookingData,
        }),
        {
          status: bookingRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Successfully created booking
    return new Response(
      JSON.stringify({
        success: true,
        data: bookingData.data,
        booking_reference: bookingData.data?.id,
        pnr: bookingData.data?.associatedRecords?.[0]?.reference,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

/*
To invoke locally:

1. Start your Supabase local dev environment:
   supabase start

2. Call function locally:
   curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/amadeus-create-booking' \
   --header 'Authorization: Bearer <YOUR_SUPABASE_JWT>' \
   --header 'Content-Type: application/json' \
   --data '{
      "flight_offer": { ... },
      "travelers": [{ "first_name": "John", "last_name": "Doe", "email": "john@example.com" }]
    }'

3. Deploy to Supabase:
   supabase functions deploy amadeus-create-booking
*/
