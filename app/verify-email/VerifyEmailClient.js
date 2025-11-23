"use client";
import { useEffect, useState } from "react";

export default function VerifyEmailClient({ token }) {
  const [activeToken, setActiveToken] = useState(token ?? null);
  const [status, setStatus] = useState(
    token ? "Verifying your email..." : "Missing verification token."
  );

  useEffect(() => {
    if (token) {
      setActiveToken(token);
      setStatus("Verifying your email...");
    }
  }, [token]);

  useEffect(() => {
    if (!activeToken) return;

    const verifyEmail = async () => {
      try {
        const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/verify-traveller-email`;

        const response = await fetch(functionUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ token: activeToken }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Verification failed");
        }

        if (result.success) {
          setStatus(`✅ Email verified successfully! Welcome ${result.email}`);
        } else {
          setStatus(result.error || "Verification failed");
        }
      } catch (err) {
        console.error("❌ Verification error:", err);

        if (err.message.includes("Failed to fetch")) {
          setStatus("Network error. Please check your internet connection and try again.");
        } else if (err.message.includes("Invalid or expired")) {
          setStatus("Invalid or expired verification link. Please request a new verification email.");
        } else {
          setStatus(`Verification failed: ${err.message}`);
        }
      }
    };

    verifyEmail();
  }, [activeToken]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-2xl font-semibold mb-4">Email Verification. Please be patience</h1>
      <p className="text-lg mb-4">{status}</p>
    </div>
  );
}
