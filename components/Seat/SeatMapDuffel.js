// components/Flight/SeatMap.jsx
const SeatMap = ({ seatmapData, selectedSeat, onSeatSelect }) => {
  if (!seatmapData || !seatmapData.data || seatmapData.data.length === 0) {
    return <div className="text-center py-8 text-gray-500">No seatmap data available</div>;
  }

  const renderSeat = (seat) => {
    const isSelected = selectedSeat?.id === seat.id;
    const isAvailable = seat.available_services.includes('seat');
    const hasFee = seat.fee;
    
    return (
      <div
        key={seat.id}
        className={`seat ${isSelected ? 'selected' : ''} ${
          isAvailable ? 'available' : 'unavailable'
        } ${hasFee ? 'premium' : ''}`}
        onClick={() => isAvailable && onSeatSelect(seat)}
        title={`${seat.name} ${hasFee ? `- $${seat.fee?.amount}` : ''}`}
      >
        {seat.designator}
      </div>
    );
  };

  return (
    <div className="seatmap-container">
      {seatmapData.data.map((seatMap, index) => (
        <div key={seatMap.id || index} className="aircraft-seatmap">
          <div className="aircraft-info mb-4 p-3 bg-gray-50 rounded">
            <strong className="block">{seatMap.aircraft?.name}</strong>
            <span className="text-sm text-gray-600">Class: {seatMap.cabins?.[0]?.cabin_class}</span>
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
                  {cabin.seats?.map(renderSeat)}
                </div>
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
        .seat.unavailable {
          background: #f5f5f5;
          border-color: #ccc;
          color: #999;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default SeatMap;