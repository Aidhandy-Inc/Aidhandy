"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchAmadeusToken } from "@/libs/amadeusToken";
import { supabase } from "@/libs/supabaseClient";

export default function FlightChecker() {
  const { user, loading } = useAuth();
  const [selectedPath, setSelectedPath] = useState(null); // 1 or 2
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

    if (!user) {
      alert("Please login first!");
      return;
    }
    setSubmitting(true);

    try {
      
      const token = await fetchAmadeusToken(user);
      console.log("Using Amadeus Token:", token);
      if (!token) {
        setResponse({ success: false, message: "Failed to get access token" });
        setSubmitting(false);
        return;
      }

      // 2. Build payload dynamically
      const payload =
        selectedPath === 1
          ? { path: 1, flight_number: userFlight?.flight_number || "" }
          : {
              path: 2,
              departure_airport: flightData.departure_airport,
              destination_airport: flightData.destination_airport,
              preferred_date: flightData.preferred_date || null,
            };


            const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        await supabase.auth.refreshSession();
      }
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
      if (data?.data) {
        setResponse(data.data);
      } else {
        setResponse(null);
      }
    } catch (err) {
      console.error("Error calling API:", err);
      setResponse({ success: false, message: "Error calling API" });
    }

    setSubmitting(false);
  };

  const handleSelectFlight = (flight) => {
    if (!user) {
      alert("Please login first");
      return;
    }
    // open modal instead of saving directly
    setSelectedFlight(flight);
    setShowModal(true);
  };

  const confirmBooking = async () => {
    if (!selectedFlight) return;

    try {
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
        status: "pending_confirmation",
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("bookings")
        .insert([booking])
        .select();

      if (error) throw error;

      alert("✅ Flight selected and saved successfully!");
      console.log("Booking saved:", data);
      setShowModal(false);
      setSelectedBooking(data[0]);
    } catch (err) {
      console.error("Booking save error:", err);
      alert("Error saving booking.");
      setShowModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Checking session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-lg">
          You must be logged in to check flights.
        </p>
      </div>
    );
  }

  const totalFlights = response?.meta?.count || 0;
  const totalPages = Math.ceil(totalFlights / flightsPerPage);

  const startIndex = (currentPage - 1) * flightsPerPage;
  const currentFlights = response?.data?.slice(
    startIndex,
    startIndex + flightsPerPage
  );

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">Flight Checker</h1>

      {/* Step 1: Select path */}
      {!selectedPath && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h2 className="text-xl font-semibold mb-3">Choose System Path</h2>
          <div className="flex flex-col gap-3">
            <button
              className="p-3 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setSelectedPath(1)}
            >
              Path 1 – By Flight Number (Already booked flight)
            </button>
            <button
              className="p-3 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => setSelectedPath(2)}
            >
              Path 2 – By Route (Haven’t booked yet)
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Show fields based on path */}
      {selectedPath && (
        <div className="space-y-4">
          {selectedPath === 1 ? (
            <>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <h2 className="text-xl font-semibold mb-2">
                  Your Booked Flight
                </h2>
                <p>Flight Number: {userFlight?.flight_number || "N/A"}</p>
                <p>Airline: {userFlight?.airline_name || "N/A"}</p>
                <p>Date: {userFlight?.flight_date || "N/A"}</p>
              </div>

              <button
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Checking..." : "Validate & Find Companions"}
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-semibold mb-2">
                Enter Route Details
              </h2>

              <div>
                <label className="block font-medium mb-1">
                  Departure Airport
                </label>
                <input
                  type="text"
                  placeholder="e.g. JFK"
                  className="w-full border p-2 rounded"
                  value={flightData.departure_airport}
                  onChange={(e) =>
                    setFlightData({
                      ...flightData,
                      departure_airport: e.target.value.toUpperCase(),
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Destination Airport
                </label>
                <input
                  type="text"
                  placeholder="e.g. LHR"
                  className="w-full border p-2 rounded"
                  value={flightData.destination_airport}
                  onChange={(e) =>
                    setFlightData({
                      ...flightData,
                      destination_airport: e.target.value.toUpperCase(),
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Preferred Date (Optional)
                </label>
                <input
                  type="date"
                  className="w-full border p-2 rounded"
                  value={flightData.preferred_date}
                  onChange={(e) =>
                    setFlightData({
                      ...flightData,
                      preferred_date: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white p-2 rounded hover:bg-green-700"
                  disabled={submitting}
                >
                  {submitting ? "Checking..." : "Find Companions & Book"}
                </button>
                <button
                  type="button"
                  className="flex-1 bg-gray-400 text-white p-2 rounded hover:bg-gray-500"
                  onClick={() => setSelectedPath(null)}
                >
                  Change Path
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Step 3: Show response */}
      {response && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold text-lg mb-4 text-center">
            Available Flights ({response?.meta?.count || 0})
          </h3>

          {currentFlights?.length > 0 ? (
            currentFlights.map((flight, i) => {
              const firstItinerary = flight.itineraries?.[0];
              const segments = firstItinerary?.segments || [];
              const firstSegment = segments[0];
              const lastSegment = segments[segments.length - 1];

              return (
                <div
                  key={flight.id || i}
                  className="mb-4 p-4 border rounded-lg bg-white shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-semibold text-blue-600">
                      Airline: {flight.validatingAirlineCodes?.[0] || "N/A"}
                    </h4>
                    <p className="text-gray-700 font-medium">
                      Price: {flight.price?.grandTotal} {flight.price?.currency}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p>
                        <strong>From:</strong>{" "}
                        {firstSegment?.departure?.iataCode} (
                        {new Date(firstSegment?.departure?.at).toLocaleString()}
                        )
                      </p>
                      <p>
                        <strong>To:</strong> {lastSegment?.arrival?.iataCode} (
                        {new Date(lastSegment?.arrival?.at).toLocaleString()})
                      </p>
                    </div>

                    <div>
                      <p>
                        <strong>Duration:</strong> {firstItinerary?.duration}
                      </p>
                      <p>
                        <strong>Seats Left:</strong>{" "}
                        {flight.numberOfBookableSeats || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-gray-600">
                    <p>
                      <strong>Ticket Type:</strong>{" "}
                      {flight.travelerPricings?.[0]?.fareOption || "STANDARD"}
                    </p>
                    <p>
                      <strong>Bags:</strong>{" "}
                      {flight.price?.additionalServices?.[0]?.amount
                        ? `${flight.price.additionalServices[0].amount} ${flight.price.currency}`
                        : "Included"}
                    </p>
                  </div>

                  {/* Flight segments */}
                  <div className="mt-3 border-t pt-2">
                    <p className="font-medium text-gray-800 mb-1">
                      Flight Segments:
                    </p>
                    {segments.map((seg, idx) => (
                      <div
                        key={idx}
                        className="text-sm border-l-4 border-blue-500 pl-2 mb-2"
                      >
                        <p>
                          ✈️ {seg.carrierCode} {seg.number} —{" "}
                          {seg.aircraft?.code}
                        </p>
                        <p>
                          {seg.departure?.iataCode} → {seg.arrival?.iataCode}
                        </p>
                        <p>
                          Depart:{" "}
                          {new Date(seg.departure?.at).toLocaleString(
                            undefined,
                            {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }
                          )}
                        </p>
                        <p>
                          Arrive:{" "}
                          {new Date(seg.arrival?.at).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                        <p>Duration: {seg.duration}</p>
                      </div>
                    ))}
                  </div>

                  {/* ✅ Select Flight Button */}
                  <div className="mt-4 text-right">
                    <button
                      onClick={() => handleSelectFlight(flight)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Select This Flight
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-600">No flights found.</p>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-2 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-3 text-center">
              Confirm Flight Booking
            </h3>
            <p className="text-gray-700 text-center mb-6">
              Are you sure you want to book this flight?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmBooking}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Yes, Book
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
