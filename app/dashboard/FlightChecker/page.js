"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchAmadeusToken } from "@/libs/amadeusToken";
import { supabase } from "@/libs/supabaseClient";
import PathSelector from "@/components/Flight/PathSelector";
import RouteForm from "@/components/Flight/RouteForm";
import FlightList from "@/components/Flight/FlightList";
import ConfirmModal from "@/components/Flight/ConfirmModal";
import BookedFlightInfo from "@/components/Flight/BookedFlightInfo";
import DuffelFlightList from "@/components/Flight/DuffelFlightList";
import SeatMapModalDuffel from "@/components/Seat/SeatMapModalDuffel";
import { getUserRole } from "@/utils/getUserRole";

export default function FlightChecker() {
  const { user, loading } = useAuth();
  const [selectedPath, setSelectedPath] = useState(null);
  const [flightData, setFlightData] = useState({
    departure_airport: "",
    destination_airport: "",
    preferred_date: "",
  });
  const [response, setResponse] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [userFlight, setUserFlight] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const flightsPerPage = 10;

  // Seatmap and companion states
  const [seatmapData, setSeatmapData] = useState(null);
  const [loadingSeatmap, setLoadingSeatmap] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showSeatmap, setShowSeatmap] = useState(false);
  const [companions, setCompanions] = useState([]);
  const [selectedCompanion, setSelectedCompanion] = useState(null);
  const [pairingId, setPairingId] = useState(null);

  // ! Flight Search Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please login first!");
    setSubmitting(true);
    // ! For Duffel Flight Search
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) await supabase.auth.refreshSession();
      const supabaseToken = session?.access_token;
      const searchData = {
        data: {
          slices: [
            {
              origin: flightData.departure_airport,
              destination: flightData.destination_airport,
              departure_date: flightData.preferred_date,
            },
          ],
          passengers: [{ type: "adult" }],
          cabin_class: "economy",
        },
      };
      const res = await fetch("/api/duffel-flights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseToken}`,
        },
        body: JSON.stringify(searchData),
      });

      const data = await res.json();

      if (!res.ok) {
        setResponse({
          success: false,
          message: data.errors?.[0]?.message || "Duffel API error",
        });
      } else {
        setResponse(data.data || null);
      }
    } catch (err) {
      console.error("Duffel flight search error:", err);
      setResponse({ success: false, message: "Error fetching Duffel flights" });
    } finally {
      setSubmitting(false);
    }
    // ! For Amadeus Flight Search
    // try {
    //   const token = await fetchAmadeusToken(user);
    //   if (!token) {
    //     setResponse({ success: false, message: "Failed to get access token" });
    //     setSubmitting(false);
    //     return;
    //   }

    //   const payload =
    //     selectedPath === 1
    //       ? { path: 1, flight_number: userFlight?.flight_number || "" }
    //       : {
    //           path: 2,
    //           departure_airport: flightData.departure_airport,
    //           destination_airport: flightData.destination_airport,
    //           preferred_date: flightData.preferred_date || null,
    //         };

    //   const {
    //     data: { session },
    //   } = await supabase.auth.getSession();
    //   if (!session) await supabase.auth.refreshSession();
    //   const supabaseToken = session?.access_token;

    //   const res = await fetch("/api/amadeus-flights", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${supabaseToken}`,
    //     },
    //     body: JSON.stringify(payload),
    //   });

    //   const data = await res.json();
    //   setResponse(data?.data || null);
    // } catch (err) {
    //   console.error("Error calling API:", err);
    //   setResponse({ success: false, message: "Error calling API" });
    // }
    setSubmitting(false);
  };

  // ! Flight Selection Handler
  const handleSelectFlight = async (flight) => {
    if (!user) return alert("Please login first");
    setSelectedFlight(flight);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) await supabase.auth.refreshSession();
      const supabaseToken = session?.access_token;

      // Get role from database
      const userRole = await getUserRole(session.user.id);

      setLoadingSeatmap(true);

      // 1. Fetch seatmap (both travelers and companions need this)
      const seatmapRes = await fetch("/api/duffel-seatmaps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseToken}`,
        },
        body: JSON.stringify({ offer_id: flight.id }),
      });

      const seatmapData = await seatmapRes.json();

      if (!seatmapRes.ok) {
        alert(
          `Seatmap fetch failed: ${
            seatmapData.errors?.[0]?.message || "Unknown error"
          }`
        );
        return;
      }

      // 2. Extract flight details (both need this)
      const firstSlice = flight.slices?.[0];
      const firstSegment = firstSlice?.segments?.[0];

      let flightNumber = "Unknown";
      let flightDate = flightData.preferred_date;
      let airlineCode = "Unknown";

      if (firstSegment) {
        flightNumber =
          firstSegment.marketing_carrier_flight_number ||
          firstSegment.number ||
          flight.id;
        flightDate = firstSegment.departing_at?.split("T")[0] || flightDate;
        airlineCode =
          firstSegment.marketing_carrier?.iata_code ||
          flight.owner?.iata_code ||
          "Unknown";
      }

      let companionsData = [];

      // 3. ONLY search for companions if user is a traveler
      if (userRole === "traveller") {
        const flightDetails = {
          flight_number: flightNumber,
          date: flightDate,
          airline: airlineCode,
        };

        // Call our API route to search for companions
        const companionsRes = await fetch("/api/search-companions-duffel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseToken}`,
          },
          body: JSON.stringify(flightDetails),
        });

        // Handle non-JSON responses
        const contentType = companionsRes.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const textResponse = await companionsRes.text();
          console.error(
            "❌ Non-JSON response:",
            textResponse.substring(0, 200)
          );
          throw new Error("Server returned non-JSON response");
        }

        const companionsResult = await companionsRes.json();

        if (companionsRes.ok && companionsResult.success) {
          companionsData = companionsResult.companions || [];
          console.log(
            `✅ Found ${companionsData.length} companions for traveler`
          );
        } else {
          console.error("❌ Companion search failed:", companionsResult);
          // Show user-friendly error
          const errorMessage =
            companionsResult.details ||
            companionsResult.error ||
            "Companion search failed";
          alert(`Companion search error: ${errorMessage}`);
        }
      } else {
        console.log(`👤 User is ${userRole}, skipping companion search`);
      }
      setSeatmapData(seatmapData);
      setCompanions(companionsData);
      setShowSeatmap(true);

      // Show appropriate message based on role
      if (userRole === "traveller") {
        console.log("✅ Seatmap with companions fetched for traveler");
      } else {
        console.log("✅ Seatmap fetched for companion (no companion search)");
      }
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      alert("Error fetching flight data. Please try again.");
    } finally {
      setLoadingSeatmap(false);
    }
  };
  const handleSeatSelect = (seat) => {
    setSelectedSeat(seat);
  };
  const handleCompanionSelect = async (companion) => {
  setSelectedCompanion(companion);
  
  // Get user role to prevent companions from pairing with companions
  const userRole = await getUserRole(user.id);
  
  // Prevent companions from booking other companions
  if (userRole === "companion") {
    alert("Companions cannot book other companions. You are already a helper!");
    setSelectedCompanion(null);
    return;
  }
  
  alert(`✅ Selected ${companion.full_name}! Now select an adjacent seat to complete pairing.`);
};
const handleConfirmSeat = async () => {  // ✅ Make it async
  if (!selectedSeat) {
    alert("Please select a seat first");
    return;
  }

  try {
    // If companion is selected, CREATE PAIRING HERE
    if (selectedCompanion) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const supabaseToken = session?.access_token;

      // Prepare pairing data
      const firstSlice = selectedFlight.slices?.[0];
      const firstSegment = firstSlice?.segments?.[0];

      if (!firstSegment) {
        alert("Cannot create pairing: Invalid flight data");
        return;
      }

      const pairingData = {
        traveler_id: user.id,
        companion_id: selectedCompanion.id,
        airline_name: selectedFlight.owner?.iata_code || "Unknown",
        flight_number:
          firstSegment.marketing_carrier_flight_number || 
          firstSegment.number ||
          "Unknown",
        flight_date:
          firstSegment.departing_at?.split("T")[0] ||
          flightData.preferred_date,
        seat_number: selectedSeat?.name || "TBD",
        status: "pending_payment",
      };

      // Create pairing
      const res = await fetch("/api/pairings-duffel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseToken}`,
        },
        body: JSON.stringify(pairingData),
      });

      const pairingResult = await res.json();

      if (res.ok) {
        setPairingId(pairingResult.id);
        alert(`✅ Paired with ${selectedCompanion.full_name}! Proceed to payment.`);
      } else {
        alert(`Pairing failed: ${pairingResult.error}`);
        return; // Don't proceed if pairing fails
      }
    }

    // Show modal after pairing is created (or if no companion selected)
    setShowSeatmap(false);
    setShowModal(true);
    
  } catch (error) {
    console.error("Pairing error:", error);
    alert("Error creating pairing.");
  }
};
  // const handleCompanionSelect = async (companion) => {
  //   setSelectedCompanion(companion);

  //   // Create pairing immediately when companion is selected
  //   try {
  //     const {
  //       data: { session },
  //     } = await supabase.auth.getSession();
  //     const supabaseToken = session?.access_token;

  //     // Get user role to prevent companions from pairing with companions
  //     const userRole = await getUserRole(session.user.id);

  //     // Prevent companions from booking other companions
  //     if (userRole === "companion") {
  //       alert(
  //         "Companions cannot book other companions. You are already a helper!"
  //       );
  //       setSelectedCompanion(null);
  //       return;
  //     }

  //     // 🚨 FIX: Use slices instead of itineraries (Duffel structure)
  //     const firstSlice = selectedFlight.slices?.[0];
  //     const firstSegment = firstSlice?.segments?.[0];

  //     if (!firstSegment) {
  //       alert("Cannot create pairing: Invalid flight data");
  //       return;
  //     }

  //     const pairingData = {
  //       traveler_id: user.id,
  //       companion_id: companion.id,
  //       airline_name: selectedFlight.owner?.iata_code || "Unknown",
  //       flight_number:
  //         firstSegment.marketing_carrier_flight_number || 
  //         firstSegment.number ||
  //         "Unknown",
  //       flight_date:
  //         firstSegment.departing_at?.split("T")[0] ||
  //         flightData.preferred_date,
  //       seat_number: selectedSeat?.name || "TBD",
  //       status: "pending_payment",
  //     };

  //     const res = await fetch("/api/pairings-duffel", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${supabaseToken}`,
  //       },
  //       body: JSON.stringify(pairingData),
  //     });

  //     const pairingResult = await res.json();

  //     if (res.ok) {
  //       setPairingId(pairingResult.id);
  //       alert(`✅ Paired with ${companion.full_name}! Proceed to payment.`);
  //     } else {
  //       alert(`Pairing failed: ${pairingResult.error}`);
  //     }
  //   } catch (error) {
  //     console.error("Pairing error:", error);
  //     alert("Error creating pairing.");
  //   }
  // };
  // const handleConfirmSeat = () => {
  //   if (!selectedSeat) {
  //     alert("Please select a seat first");
  //     return;
  //   }

  //   // If companion is selected, we already created pairing
  //   if (selectedCompanion && pairingId) {
  //     setShowSeatmap(false);
  //     setShowModal(true);
  //   } else {
  //     setShowSeatmap(false);
  //     setShowModal(true);
  //   }
  // };
  const confirmBooking = async () => {
    if (!selectedFlight) return;

    const firstSlice = selectedFlight.slices?.[0];
    const segments = firstSlice?.segments || [];
    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];

    // Safe data extraction using slices structure
    const booking = {
      traveler_id: user.id,
      flight_number:
        firstSegment?.marketing_carrier_flight_number ||
        firstSegment?.number ||
        "Unknown",
      airline_name:
        firstSegment?.marketing_carrier?.iata_code ||
        selectedFlight.owner?.iata_code ||
        "Unknown",
      departure_date:
        firstSegment?.departing_at?.split("T")[0] ||
        firstSegment?.departure?.at?.split("T")[0] ||
        flightData.preferred_date,
      arrival_date:
        lastSegment?.arriving_at?.split("T")[0] ||
        lastSegment?.arrival?.at?.split("T")[0] ||
        flightData.preferred_date,
      seat_number: selectedSeat?.name || "TBD",
      status: "confirmed",
      created_at: new Date().toISOString(),
    };

    try {
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert([booking])
        .select();

      if (bookingError) throw bookingError;
      // 🚨 FIX: Update companion with booking_id
      const userRole = await getUserRole(user.id);
      if (userRole === "companion") {
        const { error: companionError } = await supabase
          .from("companions")
          .update({
            booking_id: bookingData[0].id,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (companionError) {
          console.error("Companion update error:", companionError);
        } else {
          console.log("✅ Companion booking_id updated:", bookingData[0].id);
        }
      }

      // 2. If paired with companion, update pairing status
      if (pairingId) {
        const { error: pairingError } = await supabase
          .from("pairings")
          .update({
            status: "confirmed",
            seat_number: selectedSeat?.name || "TBD",
          })
          .eq("id", pairingId);

        if (pairingError) throw pairingError;
      }

      alert(
        "✅ Flight booked successfully!" +
          (selectedCompanion
            ? ` Paired with ${selectedCompanion.full_name}!`
            : "")
      );

      setSelectedBooking(bookingData[0]);
      setShowModal(false);

      // Reset states
      setSeatmapData(null);
      setSelectedSeat(null);
      setShowSeatmap(false);
      setSelectedCompanion(null);
      setPairingId(null);
      setCompanions([]);
    } catch (err) {
      console.error("Booking save error:", err);
      alert("Error saving booking.");
      setShowModal(false);
    }
  };

  const handleClose = () => {
  // Reset all states when closing modal
  setShowSeatmap(false);
  setSelectedSeat(null);
  setSelectedCompanion(null);
  setPairingId(null);
  setCompanions([]);
  setSeatmapData(null);
};

  if (loading) return <p>Checking session...</p>;
  if (!user) return <p>You must be logged in to check flights.</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">Flight Checker</h1>
      {!selectedPath && <PathSelector setSelectedPath={setSelectedPath} />}
      {selectedPath === 1 && (
        <BookedFlightInfo
          userFlight={userFlight}
          handleSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
      {selectedPath === 2 && (
        <RouteForm
          flightData={flightData}
          setFlightData={setFlightData}
          handleSubmit={handleSubmit}
          submitting={submitting}
          setSelectedPath={setSelectedPath}
        />
      )}
      {/* {response && response.length > 0 && (
        <FlightList
          response={response}
          currentPage={1}
          setCurrentPage={() => {}}
          flightsPerPage={10}
          handleSelectFlight={handleSelectFlight}
        />
      )} */}
      {response && response.offers && response.offers.length > 0 && (
        <DuffelFlightList
          offers={response}
          handleSelectFlight={handleSelectFlight}
        />
      )}
      <SeatMapModalDuffel
        showSeatmap={showSeatmap}
        setShowSeatmap={setShowSeatmap}
        loadingSeatmap={loadingSeatmap}
        seatmapData={seatmapData}
        selectedSeat={selectedSeat}
        setSelectedSeat={setSelectedSeat}
        companions={companions}
        selectedCompanion={selectedCompanion}
        onSeatSelect={handleSeatSelect}
        onCompanionSelect={handleCompanionSelect}
        onConfirmSeat={handleConfirmSeat}
        onClose={handleClose}
      />
      {showModal && (
        <ConfirmModal
          confirmBooking={confirmBooking}
          cancel={() => setShowModal(false)}
          selectedSeat={selectedSeat}
          selectedCompanion={selectedCompanion}
        />
      )}
    </div>
  );
}
