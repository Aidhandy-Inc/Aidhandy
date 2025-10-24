export default function ErrorState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="bg-red-100 text-red-600 p-4 rounded-lg max-w-md">
          <p className="font-semibold">Error loading profile</p>
          <p className="text-sm mt-1">Please try refreshing the page</p>
        </div>
      </div>
    </div>
  );
}