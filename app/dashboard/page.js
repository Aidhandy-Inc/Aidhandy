export const dynamic = "force-dynamic";
export const revalidate = 0;

import DashboardClient from "./components/DashboardClient";
import { getUserAndProfile } from "@/libs/getUserData";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page({ searchParams }) {
  const role = searchParams?.role ?? null;
  const firstName = searchParams?.firstName ?? null;
  const lastName = searchParams?.lastName ?? null;

  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Get authenticated user + profile
  const { user, profile } = await getUserAndProfile(supabase);

  // 🚫 Not authenticated → back to login
  if (!user) {
    redirect("/auth/login");
  }

  let resolvedProfile = profile;

  // Create profile if missing
  if (!resolvedProfile && role) {
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          id: user.id,
          email: user.email,
          role,
          status: role === "traveller" ? "pending" : "active",
        },
      ])
      .select()
      .single();

    if (!error) {
      resolvedProfile = data;
    }
  }

  // Traveller onboarding
  if (
    resolvedProfile?.role === "traveller" &&
    firstName &&
    lastName
  ) {
    const { data: existingTraveller } = await supabase
      .from("travellers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!existingTraveller) {
      await supabase.from("travellers").insert([
        {
          user_id: user.id,
          first_name: firstName,
          last_name: lastName,
        },
      ]);
    }
  }

  // Pending traveller gate
  if (resolvedProfile?.status === "pending") {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Please verify your email, then refresh this page.</p>
      </div>
    );
  }

  // ✅ Always render dashboard
  return (
    <DashboardClient
      user={user}
      profile={resolvedProfile}
      role={resolvedProfile?.role ?? role}
    />
  );
}
