"use client";

import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/libs/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import Card from "@/components/common/Card";
import InputField from "@/components/common/InputField";
import Heading from "@/components/common/Heading";
import Button from "@/components/common/Button";

export const dynamic = "force-dynamic";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("traveller");
  const [type, setType] = useState("login");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();

  const [travellerFields, setTravellerFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  /* -------------------- EFFECT: SESSION CHECK -------------------- */
  useEffect(() => {
    const roleFromParams = searchParams.get("role");
    const typeFromParams = searchParams.get("type");

    if (roleFromParams) setRole(roleFromParams);
    if (typeFromParams) setType(typeFromParams);

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        router.push("/dashboard");
      }

      setCheckingSession(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        router.push("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, searchParams]);

  /* -------------------- HANDLERS -------------------- */

  const handleTravellerChange = (field) => (e) => {
    setTravellerFields((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleTravellerSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { firstName, lastName, email } = travellerFields;

    if (!firstName || !lastName || !email) {
      setLoading(false);
      setMessage("Please fill in all fields.");
      return;
    }

    const redirectTo = `${baseUrl}/auth/callback?role=${role}&firstName=${encodeURIComponent(
      firstName
    )}&lastName=${encodeURIComponent(lastName)}&email=${encodeURIComponent(
      email
    )}`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for the login link!");
    }

    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const redirectTo = `${baseUrl}/auth/callback?role=${role}`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for the login link!");
    }

    setLoading(false);
  };

  /* -------------------- LOADING STATE -------------------- */

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1d9fd8] mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const headingText =
    type === "signup" ? "Create Your Account" : "Welcome Back";
  const subText =
    type === "signup"
      ? "Sign up to get started with your journey"
      : "Please login to continue";

  /* -------------------- RENDER -------------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      {type === "signup" && role === "traveller" ? (
        <div className="flex flex-col items-center">
          <Heading title="Traveller Sign Up" className="text-4xl font-bold" />
          <Card className="w-full max-w-3xl">
            <InputField
              label="First Name"
              value={travellerFields.firstName}
              onChange={handleTravellerChange("firstName")}
            />
            <InputField
              label="Last Name"
              value={travellerFields.lastName}
              onChange={handleTravellerChange("lastName")}
            />
            <InputField
              label="Email"
              value={travellerFields.email}
              onChange={handleTravellerChange("email")}
            />

            {message && <p className="text-center mt-2">{message}</p>}

            <Button
              onClick={handleTravellerSignup}
              disabled={loading}
              className="mt-4 w-full"
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </Card>
        </div>
      ) : (
        <Card className="max-w-lg w-full">
          <h1 className="text-2xl font-bold text-center">{headingText}</h1>
          <p className="text-center text-gray-600 mt-2">{subText}</p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1d9fd8] text-white py-2 rounded"
            >
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
          </form>

          {message && (
            <div className="mt-4 text-center text-sm text-gray-700">
              {message}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

/* -------------------- SUSPENSE WRAPPER -------------------- */

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
