// components/Seat/SeatMapModalDuffel.jsx
"use client";
import { useEffect, useState } from "react";

export default function SeatMapModalDuffel({
  showSeatmap,
  setShowSeatmap,
  loadingSeatmap,
  seatmapData,
  selectedSeat,
  setSelectedSeat,
  companions,
  selectedCompanion,
  onSeatSelect,
  onCompanionSelect,
  onConfirmSeat,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState("seatmap"); // "seatmap" or "companions"
  const [filter, setFilter] = useState("all"); // "all", "adjacent", "same-row"

  useEffect(() => {
    if (showSeatmap) {

      setActiveTab("seatmap");
      setFilter("all");
    }
  }, [showSeatmap]);

  if (!showSeatmap) return null;

  const handleClose = () => {
    onClose();
  };

  const handleSeatSelect = (seat) => {
    onSeatSelect(seat);
  };

  const handleCompanionSelect = (companion) => {
    onCompanionSelect(companion);
    // Auto-switch to seatmap when companion is selected
    setActiveTab("seatmap");
  };

  // Filter companions based on seat availability
  const filteredCompanions = companions.filter((companion) => {
    if (filter === "all") return true;
    if (filter === "adjacent") return companion.seatAvailability?.adjacent;
    if (filter === "same-row") return companion.seatAvailability?.sameRow;
    return true;
  });

  // Sort companions by availability (adjacent first, then same row, then others)
  const sortedCompanions = [...filteredCompanions].sort((a, b) => {
    const aScore =
      (a.seatAvailability?.adjacent ? 3 : 0) +
      (a.seatAvailability?.sameRow ? 2 : 0);
    const bScore =
      (b.seatAvailability?.adjacent ? 3 : 0) +
      (b.seatAvailability?.sameRow ? 2 : 0);
    return bScore - aScore;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              Select Your Seat & Find Companions
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b mb-6">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "seatmap"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("seatmap")}
            >
              Seat Map
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "companions"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("companions")}
            >
              Travel Companions ({companions.length})
            </button>
          </div>

          {loadingSeatmap ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2">Loading seatmap and finding companions...</p>
            </div>
          ) : (
            <>
              {/* Seat Map Tab */}
              {activeTab === "seatmap" && (
                <div>
                  <SeatMapDuffel
                    seatmapData={seatmapData}
                    selectedSeat={selectedSeat}
                    onSeatSelect={handleSeatSelect}
                    companions={companions}
                    selectedCompanion={selectedCompanion}
                  />

                  <div className="mt-6 flex justify-between items-center">
                    <div>
                      {selectedSeat && (
                        <div className="bg-blue-50 p-3 rounded">
                          <h4 className="font-semibold">
                            Selected Seat: {selectedSeat.name}
                          </h4>
                          {selectedSeat.fee && (
                            <p>
                              Additional fee: ${selectedSeat.fee.amount}{" "}
                              {selectedSeat.fee.currency}
                            </p>
                          )}
                          {selectedSeat.amenities?.includes(
                            "extra_legroom"
                          ) && (
                            <p className="text-green-600">✅ Extra legroom</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleClose}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={onConfirmSeat}
                        disabled={!selectedSeat}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Confirm Seat
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Companions Tab */}
              {activeTab === "companions" && (
                <div>
                  {/* Filter Controls */}
                  <div className="flex gap-2 mb-4">
                    <button
                      className={`px-3 py-1 rounded-full text-sm ${
                        filter === "all"
                          ? "bg-blue-100 text-blue-600 border border-blue-200"
                          : "bg-gray-100 text-gray-600"
                      }`}
                      onClick={() => setFilter("all")}
                    >
                      All Companions
                    </button>
                    <button
                      className={`px-3 py-1 rounded-full text-sm ${
                        filter === "adjacent"
                          ? "bg-green-100 text-green-600 border border-green-200"
                          : "bg-gray-100 text-gray-600"
                      }`}
                      onClick={() => setFilter("adjacent")}
                    >
                      Adjacent Seats
                    </button>
                    <button
                      className={`px-3 py-1 rounded-full text-sm ${
                        filter === "same-row"
                          ? "bg-purple-100 text-purple-600 border border-purple-200"
                          : "bg-gray-100 text-gray-600"
                      }`}
                      onClick={() => setFilter("same-row")}
                    >
                      Same Row
                    </button>
                  </div>

                  {/* Companions List */}
                  <div className="space-y-3">
                    {sortedCompanions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No companions found for this flight.
                      </div>
                    ) : (
                      sortedCompanions.map((companion) => (
                        <CompanionCard
                          key={companion.id}
                          companion={companion}
                          isSelected={selectedCompanion?.id === companion.id}
                          onSelect={handleCompanionSelect}
                        />
                      ))
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex justify-between items-center">
                    <div>
                      {selectedCompanion && (
                        <div className="bg-green-50 p-3 rounded">
                          <h4 className="font-semibold text-green-700">
                            Selected: {selectedCompanion.full_name}
                          </h4>
                          <p className="text-sm text-green-600">
                            {selectedCompanion.seatAvailability?.note}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveTab("seatmap")}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Back to Seat Map
                      </button>
                      {selectedCompanion && (
                        <button
                          onClick={() => setActiveTab("seatmap")}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Select Seat for Pairing
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Companion Card Component
function CompanionCard({ companion, isSelected, onSelect }) {
  const getAvailabilityBadge = (companion) => {
    if (companion.seatAvailability?.adjacent) {
      return {
        text: "Adjacent Seats",
        color: "bg-green-100 text-green-800",
        badge: "💺💺",
      };
    }
    if (companion.seatAvailability?.sameRow) {
      return {
        text: "Same Row",
        color: "bg-purple-100 text-purple-800",
        badge: "💺",
      };
    }
    return { text: "Nearby", color: "bg-blue-100 text-blue-800", badge: "📍" };
  };

  const availability = getAvailabilityBadge(companion);

  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
      }`}
      onClick={() => onSelect(companion)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {companion.full_name?.charAt(0) || "U"}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {companion.full_name}
            </h3>
            <p className="text-sm text-gray-600">
              {companion.age && `${companion.age} years`}
              {companion.interests && ` • ${companion.interests.join(", ")}`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${availability.color} tooltip-container`}
            title={companion.seatAvailability?.note}
          >
            <span className="mr-1">{availability.badge}</span>
            {availability.text}
          </span>
          {isSelected && <span className="text-blue-500 text-xl">✓</span>}
        </div>
      </div>

      {/* Seat details tooltip on hover */}
      {companion.seatAvailability?.seats && (
        <div className="mt-2 text-xs text-gray-500">
          Available seats: {companion.seatAvailability.seats.join(", ")}
        </div>
      )}
    </div>
  );
}

// Enhanced SeatMapDuffel Component with seat highlighting and filtering
function SeatMapDuffel({
  seatmapData,
  selectedSeat,
  onSeatSelect,
  companions,
  selectedCompanion,
}) {
  if (!seatmapData || !seatmapData.data || seatmapData.data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No seatmap data available
      </div>
    );
  }

  // 🚨 NEW: Check if seat is adjacent/vacant to any companion
  const isAdjacentVacantSeat = (seat) => {
    if (!companions.length) return false;

    const seatMatch = seat.designator.match(/(\d+)([A-Z])/);
    if (!seatMatch) return false;

    const seatRow = parseInt(seatMatch[1]);
    const seatLetter = seatMatch[2];

    // Check if this seat is adjacent to any companion
    return companions.some((companion) => {
      const companionSeat =
        companion.current_seat || companion.bookings?.seat_number;
      if (!companionSeat) return false;

      const companionMatch = companionSeat.match(/(\d+)([A-Z])/);
      if (!companionMatch) return false;

      const companionRow = parseInt(companionMatch[1]);
      const companionLetter = companionMatch[2];

      // Same row and adjacent letter
      if (seatRow !== companionRow) return false;

      const letters = ["A", "B", "C", "D", "E", "F"];
      const companionIndex = letters.indexOf(companionLetter);
      const adjacentLetters = [];
      if (companionIndex > 0) adjacentLetters.push(letters[companionIndex - 1]);
      if (companionIndex < letters.length - 1)
        adjacentLetters.push(letters[companionIndex + 1]);

      return adjacentLetters.includes(seatLetter);
    });
  };

  // 🚨 NEW: Filter seats to show only adjacent/vacant when companion is selected
  const getFilteredSeats = (cabinSeats) => {
    if (!selectedCompanion || !cabinSeats) return cabinSeats;

    const companionSeat =
      selectedCompanion.current_seat || selectedCompanion.bookings?.seat_number;
    if (!companionSeat) return cabinSeats;

    // Extract row and letter from companion seat
    const seatMatch = companionSeat.match(/(\d+)([A-Z])/);
    if (!seatMatch) return cabinSeats;

    const companionRow = parseInt(seatMatch[1]);
    const companionLetter = seatMatch[2];

    // Get adjacent letters
    const letters = ["A", "B", "C", "D", "E", "F"];
    const companionIndex = letters.indexOf(companionLetter);
    const adjacentLetters = [];
    if (companionIndex > 0) adjacentLetters.push(letters[companionIndex - 1]);
    if (companionIndex < letters.length - 1)
      adjacentLetters.push(letters[companionIndex + 1]);

    // Filter seats that are adjacent to selected companion
    return cabinSeats.filter((seat) => {
      if (!seat.available_services.includes("seat")) return false;

      const seatMatch = seat.designator.match(/(\d+)([A-Z])/);
      if (!seatMatch) return false;

      const seatRow = parseInt(seatMatch[1]);
      const seatLetter = seatMatch[2];

      return seatRow === companionRow && adjacentLetters.includes(seatLetter);
    });
  };

  const renderSeat = (seat) => {
    const isSelected = selectedSeat?.id === seat.id;
    const isAvailable = seat.available_services.includes("seat");
    const hasFee = seat.fee;
    const isAdjacent = isAdjacentVacantSeat(seat); // 🚨 NEW: Check if adjacent to any companion

    return (
      <div
        key={seat.id}
        className={`seat ${isSelected ? "selected" : ""} ${
          isAvailable ? "available" : "unavailable"
        } ${hasFee ? "premium" : ""} ${isAdjacent ? "adjacent" : ""}`} // 🚨 NEW: adjacent class
        onClick={() => isAvailable && onSeatSelect(seat)}
        title={`${seat.name} ${hasFee ? `- $${seat.fee?.amount}` : ""} ${
          isAdjacent ? "• Adjacent to companion" : ""
        }`}
      >
        {seat.designator}
      </div>
    );
  };

  const seatsToRender = selectedCompanion
    ? getFilteredSeats(seatmapData.data[0]?.cabins?.[0]?.seats) // 🚨 Filtered when companion selected
    : seatmapData.data[0]?.cabins?.[0]?.seats; // 🚨 All seats when no companion selected

  return (
    <div className="seatmap-container">
      {seatmapData.data.map((seatMap, index) => (
        <div key={seatMap.id || index} className="aircraft-seatmap">
          <div className="aircraft-info mb-4 p-3 bg-gray-50 rounded">
            <strong className="block">{seatMap.aircraft?.name}</strong>
            <span className="text-sm text-gray-600">
              Class: {seatMap.cabins?.[0]?.cabin_class}
            </span>

            {/* 🚨 UPDATED: Show different messages based on state */}
            {selectedCompanion ? (
              <div className="mt-2 p-2 bg-blue-50 rounded">
                <p className="text-sm text-blue-700">
                  💺 Showing seats adjacent to{" "}
                  <strong>{selectedCompanion.full_name}</strong> (Seat{" "}
                  {selectedCompanion.current_seat ||
                    selectedCompanion.bookings?.seat_number}
                  )
                </p>
              </div>
            ) : (
              companions.length > 0 && (
                <div className="mt-2 p-2 bg-green-50 rounded">
                  <p className="text-sm text-green-700">
                    💚 Green highlighted seats are adjacent to available
                    companions
                  </p>
                </div>
              )
            )}
          </div>

          <div className="cabins-container">
            {seatMap.cabins?.map((cabin, cabinIndex) => (
              <div key={cabinIndex} className="cabin mb-6">
                <div className="cabin-header mb-3">
                  <h4 className="font-semibold text-lg">{cabin.name}</h4>
                  {cabin.wings && (
                    <div className="text-sm text-gray-500">
                      Wings: Rows {cabin.wings.start_row}-{cabin.wings.end_row}
                    </div>
                  )}
                </div>

                <div className="seats-grid">
                  {/* 🚨 UPDATED: Use filtered seats only when companion is selected */}
                  {selectedCompanion
                    ? getFilteredSeats(cabin.seats)?.map(renderSeat)
                    : cabin.seats?.map(renderSeat)}
                </div>

                {/* 🚨 UPDATED: Show appropriate message */}
                {selectedCompanion &&
                  getFilteredSeats(cabin.seats)?.length === 0 && (
                    <div className="text-center py-4 text-orange-600 bg-orange-50 rounded">
                      No adjacent seats available next to{" "}
                      {selectedCompanion.full_name}. Please select a different
                      companion or contact support.
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <style jsx>{`
        .seats-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
        }
        .seat {
          width: 40px;
          height: 40px;
          border: 2px solid #ccc;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 0.8em;
          font-weight: bold;
          transition: all 0.2s;
        }
        .seat.available {
          background: #e8f5e8;
          border-color: #4caf50;
        }
        .seat.available:hover {
          background: #c8e6c9;
          transform: scale(1.1);
        }
        .seat.selected {
          background: #2196f3;
          color: white;
          border-color: #1976d2;
        }
        .seat.premium {
          background: #fff3e0;
          border-color: #ff9800;
        }
        .seat.adjacent {
          background: #c8e6c9; /* 🚨 NEW: Light green for adjacent seats */
          border-color: #2e7d32;
          box-shadow: 0 0 8px rgba(46, 125, 50, 0.3);
        }
        .seat.unavailable {
          background: #f5f5f5;
          border-color: #ccc;
          color: #999;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
