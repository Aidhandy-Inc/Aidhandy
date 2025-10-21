export default function ConfirmModal({ confirmBooking, cancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg w-96">
        <h3 className="text-xl font-semibold mb-3 text-center">Confirm Flight Booking</h3>
        <p className="text-gray-700 text-center mb-6">Are you sure you want to book this flight?</p>
        <div className="flex justify-center gap-4">
          <button onClick={confirmBooking} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Yes, Book</button>
          <button onClick={cancel} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
        </div>
      </div>
    </div>
  );
}
