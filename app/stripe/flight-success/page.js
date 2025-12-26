"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/libs/supabaseClient";

export default function FlightSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const session_id = searchParams.get("session_id");
  const [status, setStatus] = useState("Processing your booking...");

  useEffect(() => {
    const finalizeBooking = async () => {
      try {
        // 1. Verify Supabase session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          await supabase.auth.refreshSession();
        }
        const supabaseToken = session?.access_token;
        if (!supabaseToken) {
          setStatus("Please log in again to finalize booking.");
          return;
        }

        // 2. Fetch pending booking from localStorage
        const pendingBooking = JSON.parse(
          localStorage.getItem("pendingBooking")
        );
        if (
          !pendingBooking ||
          !pendingBooking.selectedFlight ||
          !pendingBooking.profile
        ) {
          setStatus("Missing flight or user information.");
          return;
        }

        // Extract all values
        const {
          selectedFlight,
          profile,
          selectedSeat,
          pairingId,
          selectedCompanion,
          stopDescription,
        } = pendingBooking;

        // 3. Create Amadeus booking (after Stripe success)
        const createOrderRes = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/amadeus-create-booking`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseToken}`,
            },
            body: JSON.stringify({
              flight_offer: selectedFlight,
              travelers: [
                {
                  first_name: profile.full_name?.split(" ")[0] || profile.first_name || "Traveller",
                  last_name: profile.full_name?.split(" ").slice(1).join(" ") || profile.last_name || "User",
                  email: profile.email,
                  phone: profile.phone_number || profile.phone || "",
                  date_of_birth: profile.date_of_birth || "1990-01-01",
                  gender: profile.gender || "MALE",
                },
              ],
            }),
          }
        );

        const orderResponse = await createOrderRes.json();
        if (!createOrderRes.ok || !orderResponse.success) {
          console.error("Amadeus order creation failed:", orderResponse);
          setStatus("Failed to create flight booking.");
          alert(orderResponse.error || orderResponse.details?.errors?.[0]?.detail || "Booking failed");
          return;
        }

        const order = orderResponse.data;
        const bookingReference = orderResponse.booking_reference;
        const pnr = orderResponse.pnr;

        console.log("Amadeus order:", order);
        setStatus(`Booking created (Ref: ${pnr || bookingReference})`);

        // 4. Extract segment details from Amadeus format
        const itinerary = order?.itineraries?.[0] || selectedFlight.itineraries?.[0];
        const segments = itinerary?.segments || [];
        const firstSegment = segments[0];
        const lastSegment = segments[segments.length - 1];
        const price = order?.price || selectedFlight.price;

        const booking = {
          traveler_id: profile?.user_id,
          amadeus_order_id: bookingReference,
          pnr: pnr,
          flight_number: firstSegment?.number || "Unknown",
          airline_name: firstSegment?.carrierCode || "Unknown",
          departure_airport:
            `${firstSegment?.departure?.iataCode || ""} - ${firstSegment?.departure?.terminal || ""}`.trim() || "Unknown",
          destination_airport:
            `${lastSegment?.arrival?.iataCode || ""} - ${lastSegment?.arrival?.terminal || ""}`.trim() || "Unknown",
          departure_date: firstSegment?.departure?.at?.split("T")[0] || "",
          arrival_date: lastSegment?.arrival?.at?.split("T")[0] || "",
          seat_number: selectedSeat?.designator || selectedSeat?.number || "TBD",
          status: "confirmed",
          departure_iata: firstSegment?.departure?.iataCode || "Unknown",
          destination_iata: lastSegment?.arrival?.iataCode || "Unknown",
          price: price?.grandTotal || price?.total || selectedFlight.price?.grandTotal || 0,
          stop_description: stopDescription,
          created_at: new Date().toISOString(),
        };

        // 5. Store in Supabase
        const { data: bookingData, error: bookingError } = await supabase
          .from("bookings")
          .insert([booking])
          .select();

        if (bookingError) throw bookingError;

        // 6. Update pairing if applicable
        if (pairingId) {
          await supabase
            .from("pairings")
            .update({
              status: "confirmed",
              seat_number: selectedSeat?.designator || selectedSeat?.number || "TBD",
            })
            .eq("id", pairingId);
        }

        // 7. Send booking confirmation email
        try {
          await supabase.functions.invoke("send-booking-confirmation-email", {
            body: {
              booking_id: bookingData?.[0]?.id,
              user_email: profile.email,
              flight_details: {
                flight_number: booking.flight_number,
                departure_airport: booking.departure_airport,
                destination_airport: booking.destination_airport,
                departure_date: booking.departure_date,
                price: booking.price,
                airline_name: booking.airline_name,
                pnr: pnr,
              },
            },
          });
          console.log("Confirmation email sent");
        } catch (emailError) {
          console.error("Failed to send confirmation email:", emailError);
        }

        // Done!
        alert(
          `Flight booking confirmed!${pnr ? ` PNR: ${pnr}` : ""}` +
            (selectedCompanion
              ? ` Paired with ${selectedCompanion.full_name}!`
              : "")
        );
        setStatus("Booking completed successfully!");
        router.push("/dashboard/Booked-Flights");

        // Cleanup
        localStorage.removeItem("pendingBooking");
      } catch (err) {
        console.error("Booking finalization error:", err);
        setStatus("Error processing booking. Please try again.");
      }
    };

    if (session_id) finalizeBooking();
  }, [session_id, router]);

  return (
    <div className="flex flex-col items-center justify-center h-[80vh]">
      <h1 className="text-3xl font-semibold text-green-600">
        Payment Successful!
      </h1>
      <p className="text-gray-600 mt-4">{status}</p>
    </div>
  );
}
