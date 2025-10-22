// components/CompanionProfileForm.jsx
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/libs/supabaseClient";

export default function CompanionProfileForm({ userId, onComplete }) {
  const [userEmail, setUserEmail] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    dob: "",
    passport_number: "",
    seat_preference: "window",
    meal_preference: "regular",
    frequent_flyer_no: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    getUserEmail();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase
        .from("companions")
        .insert([
          {
            user_id: userId,
            email: userEmail,
            full_name: formData.full_name,
            phone: formData.phone,
            dob: formData.dob,
            passport_number: formData.passport_number,
            seat_preference: formData.seat_preference,
            meal_preference: formData.meal_preference,
            frequent_flyer_no: formData.frequent_flyer_no,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setMessage("✅ Companion profile created successfully!");
      onComplete(data);
    } catch (error) {
      console.error("Error creating companion profile:", error);
      setMessage("❌ Error creating profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Complete Your Companion Profile</h2>
      
      {/* Display user email (read-only) */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <p className="text-sm text-gray-600">Registered Email</p>
        <p className="font-medium">{userEmail || "Loading..."}</p>
        <p className="text-xs text-gray-500 mt-1">This email is automatically set from your account</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Personal Information */}
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date of Birth *</label>
            <input
              type="date"
              required
              value={formData.dob}
              onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Passport Number *</label>
            <input
              type="text"
              required
              value={formData.passport_number}
              onChange={(e) => setFormData(prev => ({ ...prev, passport_number: e.target.value }))}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        {/* Travel Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Seat Preference</label>
            <select
              value={formData.seat_preference}
              onChange={(e) => setFormData(prev => ({ ...prev, seat_preference: e.target.value }))}
              className="w-full border p-2 rounded"
            >
              <option value="window">Window</option>
              <option value="aisle">Aisle</option>
              <option value="middle">Middle</option>
              <option value="any">Any</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Meal Preference</label>
            <select
              value={formData.meal_preference}
              onChange={(e) => setFormData(prev => ({ ...prev, meal_preference: e.target.value }))}
              className="w-full border p-2 rounded"
            >
              <option value="regular">Regular</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="gluten_free">Gluten Free</option>
              <option value="halal">Halal</option>
              <option value="kosher">Kosher</option>
            </select>
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <label className="block text-sm font-medium mb-1">Frequent Flyer Number</label>
          <input
            type="text"
            value={formData.frequent_flyer_no}
            onChange={(e) => setFormData(prev => ({ ...prev, frequent_flyer_no: e.target.value }))}
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !userEmail}
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Creating Profile..." : "Complete Companion Profile"}
        </button>

        {message && (
          <p className={`text-center ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}