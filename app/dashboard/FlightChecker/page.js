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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please login first!");
    setSubmitting(true);

    try {
      const token = await fetchAmadeusToken(user);
      if (!token) {
        setResponse({ success: false, message: "Failed to get access token" });
        setSubmitting(false);
        return;
      }

      const payload =
        selectedPath === 1
          ? { path: 1, flight_number: userFlight?.flight_number || "" }
          : {
              path: 2,
              departure_airport: flightData.departure_airport,
              destination_airport: flightData.destination_airport,
              preferred_date: flightData.preferred_date || null,
            };

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) await supabase.auth.refreshSession();
      const supabaseToken = session?.access_token;

      const res = await fetch("/api/amadeus-flights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setResponse(data?.data || null);
    } catch (err) {
      console.error("Error calling API:", err);
      setResponse({ success: false, message: "Error calling API" });
    }

    setSubmitting(false);
  };

  const handleSelectFlight = (flight) => {
    if (!user) return alert("Please login first");
    setSelectedFlight(flight);
    setShowModal(true);
  };

  const confirmBooking = async () => {
    if (!selectedFlight) return;
    const flight = selectedFlight;
    const firstItinerary = flight.itineraries?.[0];
    const segments = firstItinerary?.segments || [];
    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];

    const booking = {
      traveler_id: user.id,
      flight_number: firstSegment.number,
      airline_name: flight.validatingAirlineCodes?.[0],
      departure_date: firstSegment.departure.at.split("T")[0],
      arrival_date: lastSegment.arrival.at.split("T")[0],
      seat_number: null,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from("bookings")
        .insert([booking])
        .select();
      if (error) throw error;
      alert("✅ Flight selected and saved successfully!");
      setSelectedBooking(data[0]);
      setShowModal(false);
    } catch (err) {
      console.error("Booking save error:", err);
      alert("Error saving booking.");
      setShowModal(false);
    }
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

      {response && (
        <FlightList
          response={response}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          flightsPerPage={flightsPerPage}
          handleSelectFlight={handleSelectFlight}
        />
      )}

      {showModal && (
        <ConfirmModal
          confirmBooking={confirmBooking}
          cancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
