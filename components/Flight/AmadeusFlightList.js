import { useState } from "react";

export default function AmadeusFlightList({ offers, dictionaries, handleSelectFlight }) {
  const [currentPage, setCurrentPage] = useState(1);
  const flightsPerPage = 10;

  // Pagination calculations
  const totalPages = Math.ceil(offers.length / flightsPerPage);
  const startIndex = (currentPage - 1) * flightsPerPage;
  const endIndex = startIndex + flightsPerPage;
  const currentFlights = offers.slice(startIndex, endIndex);

  // Helper to get carrier name from dictionaries
  const getCarrierName = (code) => {
    return dictionaries?.carriers?.[code] || code;
  };

  // Helper to get aircraft name from dictionaries
  const getAircraftName = (code) => {
    return dictionaries?.aircraft?.[code] || code;
  };

  // Format date time
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format duration (PT2H30M -> 2h 30m)
  const formatDuration = (duration) => {
    if (!duration) return "";
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return duration;

    const hours = match[1] ? match[1].replace("H", "h ") : "";
    const minutes = match[2] ? match[2].replace("M", "m") : "";
    return hours + minutes;
  };

  if (!offers || offers.length === 0) {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded">
        <p className="text-center text-gray-600">No flights found</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">
        Available Flights ({offers.length})
      </h2>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {currentFlights.map((offer) => {
          const itinerary = offer.itineraries[0];
          const segments = itinerary.segments || [];
          const firstSegment = segments[0];
          const lastSegment = segments[segments.length - 1];
          const price = offer.price;
          const carrierCode = firstSegment?.carrierCode;

          return (
            <div
              key={offer.id}
              className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 bg-white hover:border-blue-300"
            >
              {/* Airline and Price Header */}
              <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-blue-50 rounded-lg">
                    <span className="text-xl font-bold text-blue-600">
                      {carrierCode}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-base">
                      {getCarrierName(carrierCode)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {carrierCode}{firstSegment?.number}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">
                    {price.currency} {price.grandTotal || price.total}
                  </p>
                  {price.base && (
                    <p className="text-xs text-gray-500 mt-1">
                      Base: {price.base}
                    </p>
                  )}
                </div>
              </div>

              {/* Flight Route */}
              <div className="grid grid-cols-3 gap-4 items-center mb-4 py-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Departure</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {firstSegment.departure.iataCode}
                  </p>
                  <p className="font-medium text-sm text-gray-700">
                    {formatDateTime(firstSegment.departure.at)}
                  </p>
                  {firstSegment.departure.terminal && (
                    <p className="text-xs text-gray-500 mt-1">
                      Terminal {firstSegment.departure.terminal}
                    </p>
                  )}
                </div>

                <div className="text-center px-2">
                  <p className="text-xs font-medium text-gray-600 mb-2">
                    {formatDuration(itinerary.duration)}
                  </p>
                  <div className="flex items-center justify-center">
                    <div className="h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 flex-1 rounded"></div>
                    <div className="mx-2 bg-blue-100 rounded-full p-1.5">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                    </div>
                    <div className="h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 flex-1 rounded"></div>
                  </div>
                  <p className="text-xs font-medium text-gray-600 mt-2">
                    {segments.length === 1
                      ? "Direct Flight"
                      : `${segments.length - 1} Stop${segments.length > 2 ? "s" : ""}`}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Arrival</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {lastSegment.arrival.iataCode}
                  </p>
                  <p className="font-medium text-sm text-gray-700">
                    {formatDateTime(lastSegment.arrival.at)}
                  </p>
                  {lastSegment.arrival.terminal && (
                    <p className="text-xs text-gray-500 mt-1">
                      Terminal {lastSegment.arrival.terminal}
                    </p>
                  )}
                </div>
              </div>

              {/* Segments Detail (if connecting flights) */}
              {segments.length > 1 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="font-semibold text-gray-800 mb-2 text-sm flex items-center gap-2">
                    <span className="text-blue-600">Connecting Flights:</span>
                  </p>
                  <div className="space-y-1">
                    {segments.map((seg, idx) => (
                      <div key={idx} className="flex items-center text-xs text-gray-700 bg-white px-2 py-1.5 rounded">
                        <span className="font-medium">{seg.departure.iataCode}</span>
                        <span className="mx-2 text-gray-400">-</span>
                        <span className="font-medium">{seg.arrival.iataCode}</span>
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="text-blue-600 font-medium">
                          {seg.carrierCode}{seg.number}
                        </span>
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="text-gray-500">
                          {getAircraftName(seg.aircraft?.code)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium">
                  {offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || "Economy"}
                </span>
                {offer.numberOfBookableSeats && (
                  <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium">
                    {offer.numberOfBookableSeats} seats left
                  </span>
                )}
                {firstSegment.aircraft?.code && (
                  <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium">
                    {getAircraftName(firstSegment.aircraft.code)}
                  </span>
                )}
              </div>

              {/* Select Button */}
              <button
                onClick={() => handleSelectFlight(offer)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Select Flight
              </button>

              {/* Last Ticketing Date */}
              {offer.lastTicketingDate && (
                <p className="text-xs text-gray-500 text-center mt-3 flex items-center justify-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Book by: {offer.lastTicketingDate}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-gray-50 text-blue-600 border-blue-300"
            }`}
          >
            Previous
          </button>

          <span className="text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-gray-50 text-blue-600 border-blue-300"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
