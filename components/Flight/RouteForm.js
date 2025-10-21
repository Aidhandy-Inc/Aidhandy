export default function RouteForm({ flightData, setFlightData, handleSubmit, submitting, setSelectedPath }) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">Enter Route Details</h2>

      <div>
        <label className="block font-medium mb-1">Departure Airport</label>
        <input
          type="text"
          placeholder="e.g. JFK"
          className="w-full border p-2 rounded"
          value={flightData.departure_airport}
          onChange={(e) => setFlightData({ ...flightData, departure_airport: e.target.value.toUpperCase() })}
          required
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Destination Airport</label>
        <input
          type="text"
          placeholder="e.g. LHR"
          className="w-full border p-2 rounded"
          value={flightData.destination_airport}
          onChange={(e) => setFlightData({ ...flightData, destination_airport: e.target.value.toUpperCase() })}
          required
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Preferred Date (Optional)</label>
        <input
          type="date"
          className="w-full border p-2 rounded"
          value={flightData.preferred_date}
          onChange={(e) => setFlightData({ ...flightData, preferred_date: e.target.value })}
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
  );
}
