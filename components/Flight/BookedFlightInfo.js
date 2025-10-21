export default function BookedFlightInfo({ userFlight, handleSubmit, submitting }) {
  return (
    <div>
      <div className="p-4 bg-blue-50 border border-blue-200 rounded mb-4">
        <h2 className="text-xl font-semibold mb-2">Your Booked Flight</h2>
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
    </div>
  );
}
