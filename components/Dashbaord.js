"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../libs/supabaseClient";
import BackButton from "./common/BackButton";

const Dashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [companions, setCompanions] = useState([]);
  const [activeTab, setActiveTab] = useState("bookings");
  const [actionLoading, setActionLoading] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    sortBy: "created_at",
    sortOrder: "desc",
  });

  const backgroundImageUrl =
    "https://images.unsplash.com/photo-1557682250-33bd709cbe85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80";

  useEffect(() => {
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;

      if (session) {
        setUser(session.user);
        await fetchUserRole(session.user.id);
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Error checking session:", error);
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) throw error;

      setUserRole(data.role);
      if (data.role === "admin") {
        await fetchAllData();
      } else {
        router.push("/unauthorized");
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      router.push("/unauthorized");
    }
  };

  const fetchAllData = async () => {
    try {
      // Fetch all bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (bookingsError) throw bookingsError;

      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;

      // Fetch all companions
      const { data: companionsData, error: companionsError } = await supabase
        .from("companions")
        .select("*")
        .order("created_at", { ascending: false });

      if (companionsError) throw companionsError;

      setBookings(bookingsData || []);
      setUsers(usersData || []);
      setCompanions(companionsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyFiltersAndSorting = () => {
    let filteredData = [...bookings];

    if (filters.search) {
      filteredData = filteredData.filter(
        (booking) =>
          booking.flight_number?.toLowerCase().includes(filters.search.toLowerCase()) ||
          booking.departure_airport?.toLowerCase().includes(filters.search.toLowerCase()) ||
          booking.arrival_airport?.toLowerCase().includes(filters.search.toLowerCase()) ||
          booking.status?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    filteredData.sort((a, b) => {
      let aValue = a[filters.sortBy];
      let bValue = b[filters.sortBy];

      if (filters.sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filteredData;
  };

  // Companion Approval Functions
  const handleApproveCompanion = async (companionId) => {
    if (!confirm("Are you sure you want to approve this companion?")) return;

    setActionLoading(companionId);
    try {
      const { error } = await supabase
        .from("companions")
        .update({
          is_kyc_approved: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", companionId);

      if (error) throw error;

      // Also update user status to active
      const companion = companions.find((c) => c.id === companionId);
      if (companion?.user_id) {
        await supabase
          .from("users")
          .update({ status: "active", updated_at: new Date().toISOString() })
          .eq("id", companion.user_id);
      }

      await fetchAllData();
      alert("Companion approved successfully!");
    } catch (error) {
      console.error("Error approving companion:", error);
      alert("Failed to approve companion. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectCompanion = async (companionId) => {
    if (!confirm("Are you sure you want to reject this companion?")) return;

    setActionLoading(companionId);
    try {
      const { error } = await supabase
        .from("companions")
        .update({
          is_kyc_approved: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", companionId);

      if (error) throw error;

      await fetchAllData();
      alert("Companion rejected.");
    } catch (error) {
      console.error("Error rejecting companion:", error);
      alert("Failed to reject companion. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  // Booking Status Update Function
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    if (!confirm(`Are you sure you want to change the booking status to "${newStatus}"?`)) return;

    setActionLoading(bookingId);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId);

      if (error) throw error;

      await fetchAllData();
      alert(`Booking status updated to ${newStatus}!`);
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert("Failed to update booking status. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const exportToCSV = () => {
    const filteredData = applyFiltersAndSorting();

    if (filteredData.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = [
      "Booking ID",
      "Traveller ID",
      "Flight Number",
      "Departure Airport",
      "Arrival Airport",
      "Departure Date",
      "Status",
      "Created At",
    ].join(",");

    const rows = filteredData.map((booking) =>
      [
        booking.id,
        `"${booking.traveler_id || "N/A"}"`,
        `"${booking.flight_number || "N/A"}"`,
        `"${booking.departure_airport || "N/A"}"`,
        `"${booking.destination_airport || "N/A"}"`,
        `"${booking.departure_date || "N/A"}"`,
        `"${booking.status || "N/A"}"`,
        `"${new Date(booking.created_at).toLocaleDateString()}"`,
      ].join(",")
    );

    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bookings-export.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const filteredData = applyFiltersAndSorting();

    if (filteredData.length === 0) {
      alert("No data to export");
      return;
    }

    const jsonString = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bookings-export.json";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (userRole !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  const filteredBookings = applyFiltersAndSorting();
  const pendingCompanions = companions.filter((c) => !c.is_kyc_approved);
  const approvedCompanions = companions.filter((c) => c.is_kyc_approved);

  return (
    <div className="min-h-screen relative">
      <img
        src={backgroundImageUrl}
        alt="Dashboard Background"
        className="object-cover absolute inset-0 w-full h-full z-0"
      />

      <div className="min-h-screen relative flex flex-col items-center justify-center z-10 bg-[rgba(0,0,0,0.13)]">
        <div className="flex w-full items-center justify-start lg:px-32 md:px-16 sm:px-8 px-4 pt-4">
          <BackButton text="Back" className="text-white" />
        </div>
        <div className="py-8 w-full lg:px-32 md:px-16 sm:px-8 px-4">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">Welcome, {user?.email}</p>
                <p className="text-sm text-green-600 font-semibold">
                  Role: {userRole}
                </p>
              </div>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  localStorage.removeItem("seenProfileAlert");
                  router.push("/auth/login");
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-lg p-2 mb-6">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("bookings")}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition duration-200 ${
                  activeTab === "bookings"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Bookings ({bookings.length})
              </button>
              <button
                onClick={() => setActiveTab("companions")}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition duration-200 ${
                  activeTab === "companions"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Companions ({companions.length})
                {pendingCompanions.length > 0 && (
                  <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    {pendingCompanions.length} pending
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <>
              {/* Filters and Controls */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search
                    </label>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                      placeholder="Search bookings..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="created_at">Date Created</option>
                      <option value="flight_number">Flight Number</option>
                      <option value="departure_airport">Departure Airport</option>
                      <option value="status">Status</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort Order
                    </label>
                    <select
                      value={filters.sortOrder}
                      onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Export Data
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={exportToCSV}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm transition duration-200"
                      >
                        CSV
                      </button>
                      <button
                        onClick={exportToJSON}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md text-sm transition duration-200"
                      >
                        JSON
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bookings Table */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">
                    All Bookings
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Traveller
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Flight Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {booking.traveler_id?.slice(0, 8) || "N/A"}...
                              </div>
                              <div className="text-sm text-gray-500">
                                Traveller ID
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                <strong>Flight:</strong>{" "}
                                {booking.flight_number || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500">
                                <strong>From:</strong>{" "}
                                {booking.departure_airport || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500">
                                <strong>To:</strong>{" "}
                                {booking.destination_airport || "N/A"}
                              </div>
                              {booking.departure_date && (
                                <div className="text-sm text-gray-500">
                                  <strong>Date:</strong>{" "}
                                  {new Date(booking.departure_date).toLocaleDateString()}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  booking.status === "confirmed"
                                    ? "bg-green-100 text-green-800"
                                    : booking.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : booking.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : booking.status === "refunded"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {booking.status || "Unknown"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(booking.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
                                {booking.status === "pending" && (
                                  <button
                                    onClick={() => handleUpdateBookingStatus(booking.id, "confirmed")}
                                    disabled={actionLoading === booking.id}
                                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
                                  >
                                    {actionLoading === booking.id ? "..." : "Confirm"}
                                  </button>
                                )}
                                {booking.status !== "cancelled" && booking.status !== "refunded" && (
                                  <button
                                    onClick={() => handleUpdateBookingStatus(booking.id, "cancelled")}
                                    disabled={actionLoading === booking.id}
                                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
                                  >
                                    {actionLoading === booking.id ? "..." : "Cancel"}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-4 text-center text-sm text-gray-500"
                          >
                            No bookings found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Companions Tab */}
          {activeTab === "companions" && (
            <>
              {/* Pending Companions */}
              {pendingCompanions.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                  <div className="px-6 py-4 bg-orange-50 border-b border-orange-200">
                    <h2 className="text-xl font-semibold text-orange-800">
                      Pending Approval ({pendingCompanions.length})
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stripe Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pendingCompanions.map((companion) => (
                          <tr key={companion.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {companion.first_name} {companion.last_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {companion.email || "N/A"}
                              {companion.is_email_verified && (
                                <span className="ml-2 text-green-500">Verified</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {companion.phone || "N/A"}
                              {companion.is_phone_verified && (
                                <span className="ml-2 text-green-500">Verified</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  companion.stripe_charges_enabled
                                    ? "bg-green-100 text-green-800"
                                    : companion.stripe_account_id
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {companion.stripe_charges_enabled
                                  ? "Active"
                                  : companion.stripe_account_id
                                  ? "Pending"
                                  : "Not Started"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleApproveCompanion(companion.id)}
                                  disabled={actionLoading === companion.id}
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                                >
                                  {actionLoading === companion.id ? "..." : "Approve"}
                                </button>
                                <button
                                  onClick={() => handleRejectCompanion(companion.id)}
                                  disabled={actionLoading === companion.id}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                                >
                                  {actionLoading === companion.id ? "..." : "Reject"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Approved Companions */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                <div className="px-6 py-4 bg-green-50 border-b border-green-200">
                  <h2 className="text-xl font-semibold text-green-800">
                    Approved Companions ({approvedCompanions.length})
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stripe Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Services</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {approvedCompanions.length > 0 ? (
                        approvedCompanions.map((companion) => (
                          <tr key={companion.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {companion.first_name} {companion.last_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {companion.email || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {companion.phone || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  companion.stripe_charges_enabled
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {companion.stripe_charges_enabled ? "Active" : "Pending Setup"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {companion.service_types?.join(", ") || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => handleRejectCompanion(companion.id)}
                                disabled={actionLoading === companion.id}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                              >
                                {actionLoading === companion.id ? "..." : "Suspend"}
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                            No approved companions yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600">{users.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800">Total Bookings</h3>
              <p className="text-3xl font-bold text-green-600">{bookings.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800">Confirmed</h3>
              <p className="text-3xl font-bold text-green-600">
                {bookings.filter((b) => b.status === "confirmed").length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800">Companions</h3>
              <p className="text-3xl font-bold text-purple-600">{companions.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800">Pending KYC</h3>
              <p className="text-3xl font-bold text-orange-600">{pendingCompanions.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
