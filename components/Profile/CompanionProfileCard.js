export default function CompanionProfileCard({ companionProfile }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Companion Profile</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
            <p className="text-gray-800 font-medium">{companionProfile.phone}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Passport Number</label>
            <p className="text-gray-800 font-medium">{companionProfile.passport_number}</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Seat Preference</label>
            <p className="text-gray-800 font-medium">{companionProfile.seat_preference}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Meal Preference</label>
            <p className="text-gray-800 font-medium">{companionProfile.meal_preference}</p>
          </div>
        </div>
      </div>
    </div>
  );
}