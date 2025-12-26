import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
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
}

export async function getUserAndProfile() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { user: null, profile: null };
  }

  let profile = null;

  // First, try to find in travellers
  const { data: traveller, error: travellerError } = await supabase
    .from("travellers")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (traveller && !travellerError) {
    profile = { ...traveller, type: "traveller" };
  } else {
    // If not found, try companions
    const { data: companion, error: companionError } = await supabase
      .from("companions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (companion && !companionError) {
      profile = { ...companion, type: "companion" };
    }
  }

  // Always fetch user status from users table
  const { data: userRecord, error: userRecordError } = await supabase
    .from("users")
    .select("status, email, role")
    .eq("id", user.id)
    .single();

  // If no traveller/companion profile found yet, still build a fallback profile from user record
  if (!profile && userRecord) {
    profile = {
      ...userRecord,
      type: "user",
    };
  } else if (profile && userRecord) {
    // merge user status, email, and role into profile
    profile = { ...profile, status: userRecord.status, email: userRecord.email, role: userRecord.role };
  }

  return { user, profile };
}
