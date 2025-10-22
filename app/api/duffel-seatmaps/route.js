
import { NextResponse } from "next/server";
const generateMockSeatmap = (offerId) => ({
  data: [
    {
      id: `seat_map_${offerId}`,
      slice_id: `slice_${offerId}`,
      segment_id: `segment_${offerId}`,
      cabin_class: "economy",
      deck: "lower",
      aircraft: {
        name: "Airbus A320",
        iata_code: "320",
        id: "arc_00009VMF4AhXSSRnQuCk31"
      },
      cabins: [
        {
          name: "Economy",
          cabin_class: "economy",
          starting_row: 1,
          ending_row: 10,
          aisles: 1,
          wings: {
            start_row: 6,
            end_row: 8
          },
          seats: [
            {
              id: "seat_1A",
              designator: "1A",
              name: "1A",
              disclosures: ["exit_row"],
              amenities: ["extra_legroom"],
              available_services: ["seat"],
              proffer_point_id: "point_1",
              fee: {
                amount: "25.00",
                currency: "USD"
              }
            },
            {
              id: "seat_1B",
              designator: "1B",
              name: "1B",
              disclosures: ["exit_row"],
              amenities: ["extra_legroom"],
              available_services: ["seat"],
              proffer_point_id: "point_2"
            },
            {
              id: "seat_1C",
              designator: "1C",
              name: "1C",
              disclosures: ["exit_row"],
              amenities: ["extra_legroom"],
              available_services: ["seat"],
              proffer_point_id: "point_3",
              fee: {
                amount: "25.00",
                currency: "USD"
              }
            },
            {
              id: "seat_2A",
              designator: "2A",
              name: "2A",
              available_services: ["seat"],
              proffer_point_id: "point_4"
            },
            {
              id: "seat_2B",
              designator: "2B",
              name: "2B",
              available_services: ["seat"],
              proffer_point_id: "point_5"
            },
            {
              id: "seat_2C",
              designator: "2C",
              name: "2C",
              available_services: ["seat"],
              proffer_point_id: "point_6"
            }
          ]
        }
      ]
    }
  ]
});

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const { offer_id } = await req.json();

    if (!offer_id) {
      return NextResponse.json({ error: "Missing offer_id" }, { status: 400 });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/duffel-seatmaps`,
      {
        method: 'POST',
        headers: {
          'Authorization': authHeader ,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ offer_id }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // If edge function fails, use mock data
      console.log("❌ Edge function returned error, using mock data");
      const mockData = generateMockSeatmap(offer_id);
      return NextResponse.json(mockData, { status: 200 });
    }

    // If Duffel returns empty data, use mock data
    if (!data.data || data.data.length === 0) {
      const mockData = generateMockSeatmap(offer_id);
      return NextResponse.json(mockData, { status: 200 });
    }

    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Next.js API route error:', error);
    // Return mock data on error
    let offer_id = 'unknown';
    try {
      const body = await req.json();
      offer_id = body.offer_id || 'unknown';
    } catch (e) {
      console.log("Could not parse request body for offer_id");
    }
    const mockData = generateMockSeatmap(offer_id);
    return NextResponse.json(mockData, { status: 200 });
  }
}