"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/libs/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardHeader from "@/components/Profile/DashboardHeader";
import UserInfoCard from "@/components/Profile/UserInfoCard";
import CompanionProfileCard from "@/components/Profile/CompanionProfileCard";
import QuickActions from "@/components/Profile/QuickActions";
import CompanionProfileForm from "@/components/CompanionProfileForm";
import LoadingState from "@/components/Profile/LoadingState";
import ErrorState from "@/components/Profile/ErrorState";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleFromQuery = searchParams.get("role");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companionProfile, setCompanionProfile] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);

useEffect(() => {
  let mounted = true;
  const initializeDashboard = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (!mounted) return;

      if (sessionError) {
        console.error("Session error:", sessionError);
        setLoading(false);
        return;
      }

      if (!session?.user) {
        setLoading(false);
        return;
      }

      setUser(session.user);
      const { data: userData, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!mounted) return;

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setLoading(false);
        return;
      }
      if (userData) {
        setProfile(userData);
        
        if (userData.role === "companion") {
          const { data: companionData } = await supabase
            .from("companions")
            .select("*")
            .eq("user_id", session.user.id)
            .maybeSingle();

          if (!mounted) return;

          if (companionData) {
            setCompanionProfile(companionData);
            setProfileComplete(true);
          } else {
            setProfileComplete(false);
          }
        }
        setLoading(false);
        return;
      }

      let role = roleFromQuery;
      
      if (!role || !["admin", "traveller", "companion"].includes(role)) {
        console.log("No valid role provided in URL. User must login via magic link.");
        setLoading(false);
        await supabase.auth.signOut();
        router.push('/auth/login?error=invalid_access');
        return;
      }
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          id: session.user.id,
          email: session.user.email,
          role,
          full_name: "",
        })
        .select()
        .single();

      if (!mounted) return;

      if (insertError) {
        console.error("Error inserting user:", insertError);
      } else {
        setProfile(newUser);
        if (role === "companion") {
          setProfileComplete(false);
        }
      }

      setLoading(false);
    } catch (error) {
      if (!mounted) return;
      console.error("Initialization error:", error);
      setLoading(false);
    }
  };

  initializeDashboard();

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (!mounted) return;
      
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        // Re-initialize dashboard on sign in
        initializeDashboard();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    }
  );

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, [roleFromQuery, router]);

  const handleProfileComplete = (companionData) => {
    setCompanionProfile(companionData);
    setProfileComplete(true);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingState />
          {/* <p className="mt-4 text-gray-600">Loading your dashboard...</p> */}
        </div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <ErrorState />
          <p className="mt-4 text-gray-600">Please log in to access your dashboard</p>
          <button 
            onClick={() => router.push('/auth/login')}
            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingState />
          <p className="mt-4 text-gray-600">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  if (profile.role === "companion" && !profileComplete) {
    return (
      <CompanionProfileForm
        userId={user.id}
        onComplete={handleProfileComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* <DashboardHeader profile={profile} /> */}

        <div className="space-y-6">
          <div className="space-y-6">
            {/* <div className="flex justify-end items-center gap-1">
              {profile?.role === "traveller" && (
                <Link
                  href={"/dashboard/Booked-Flights"}
                  className="text-sm font-medium bg-red-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                >
                  Booked Flights
                </Link>
              )}

              <Link
                href={"/dashboard/FlightChecker"}
                className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
              >
                Flight Checker
              </Link>
            </div> */}
            <UserInfoCard profile={profile} />

            {profile.role === "companion" && companionProfile && (
              <CompanionProfileCard companionProfile={companionProfile} />
            )}
          </div>
{/* 
          <QuickActions
            onSignOut={async () => {
              await supabase.auth.signOut();
              router.push("/auth/login");
            }}
            onAdminRedirect={handleDashboardRedirect}
            profile={profile}
          /> */}
        </div>
      </div>
    </div>
  );
}