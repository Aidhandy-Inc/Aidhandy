export default function UserInfoCard({ profile }) {
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "companion":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6 border-b border-gray-500 pb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          User Information
        </h2>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeClass(
            profile.role
          )}`}
        >
          {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex gap-2">
          <label className="block text-lg font-semibold text-gray-500 mb-1">
            Email :
          </label>
          <p className="text-gray-800 font-medium">{profile.email}</p>
        </div>
        <div className="flex gap-2">
          <label className="block text-lg font-semibold text-gray-500 mb-1">
            User ID :
          </label>
          <p className="text-gray-800 font-medium text-sm font-mono">
            {profile.id}
          </p>
        </div>
        <div className="flex gap-2">
          <label className="block text-lg font-semibold text-gray-500 mb-1">
            Account Type :
          </label>
          <p className="text-gray-800 font-medium">
            {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
          </p>
        </div>
      </div>
    </div>
  );
}
