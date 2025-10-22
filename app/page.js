"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/libs/supabaseClient";
import { useSearchParams } from "next/navigation";
import CompanionProfileForm from "@/components/CompanionProfileForm";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const roleFromQuery = searchParams.get("role");

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companionProfile, setCompanionProfile] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) setUser(session.user);
      setLoading(false);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchOrCreateProfile = async () => {
      if (!user) return;

      let role = roleFromQuery;
      if (!role || !["admin", "traveller", "companion"].includes(role)) {
        role = "traveller";
      }

      const {  data: userData, error  } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }
      if (!userData) {
        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert({
            id: user.id,
            email: user.email,
            role,
            full_name: "",
          })
          .select()
          .single();

        if (insertError) console.error("Error inserting user:", insertError);
        else setProfile(newUser);
      } else {
        setProfile(userData);
      }
      if (role === "companion") {
        const { data: companionData, error: companionError } = await supabase
          .from("companions")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (companionError) console.error("Error fetching companion profile:", companionError);
        
        if (companionData) {
          setCompanionProfile(companionData);
          setProfileComplete(true);
        }
      }
      setLoading(false);
    };

    fetchOrCreateProfile();
  }, [user, roleFromQuery]);

    const handleProfileComplete = (companionData) => {
    setCompanionProfile(companionData);
    setProfileComplete(true);
  };

  if (loading) return <p>Loading...</p>;
  if (!user || !profile) return <p>Please Login First</p>;

  if (profile.role === "companion" && !profileComplete) {
    return <CompanionProfileForm userId={user.id} onComplete={handleProfileComplete} />;
  }

 return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Info Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="space-y-2">
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Full Name:</strong> {profile.full_name || "-"}</p>
            <p><strong>Role:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                profile.role === 'admin' ? 'bg-red-100 text-red-800' :
                profile.role === 'companion' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {profile.role}
              </span>
            </p>
            <p><strong>User ID:</strong> {profile.id}</p>
          </div>
        </div>

        {/* Companion Profile Card */}
        {profile.role === "companion" && companionProfile && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Companion Profile</h2>
            <div className="space-y-2">
              <p><strong>Phone:</strong> {companionProfile.phone}</p>
              <p><strong>Passport:</strong> {companionProfile.passport_number}</p>
              <p><strong>Seat Preference:</strong> {companionProfile.seat_preference}</p>
              <p><strong>Meal Preference:</strong> {companionProfile.meal_preference}</p>

            </div>
          </div>
        )}
      </div>

      {/* Navigation based on role */}
      <div className="mt-8">
        <div className="flex gap-4">
          <button 
            onClick={() => supabase.auth.signOut()}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
