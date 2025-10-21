"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/libs/supabaseClient";
import { useSearchParams } from "next/navigation";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const roleFromQuery = searchParams.get("role"); // role from magic link

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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

      // 1️⃣ Ensure role is valid
      let role = roleFromQuery;
      if (!role || !["admin", "traveller", "companion"].includes(role)) {
        role = "traveller"; // fallback
      }

      // 2️⃣ Check if user row exists
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      // 3️⃣ Insert user if not exists
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from("users")
          .insert({
            id: user.id,
            email: user.email,
            role, // exactly matches new_user_role enum
            full_name: "",
          })
          .select()
          .single();

        if (insertError) console.error("Error inserting user:", insertError);
        else setProfile(newData);
      } else {
        setProfile(data);
      }
    };

    fetchOrCreateProfile();
  }, [user, roleFromQuery]);

  if (loading || !user || !profile) return <p>Loading...</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Email: {profile.email}</p>
      <p>Full Name: {profile.full_name || "-"}</p>
      <p>Role: {profile.role}</p>
      <p>User ID: {profile.id}</p>
    </div>
  );
}
