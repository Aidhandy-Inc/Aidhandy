"use client";
import { useState } from "react";
import { supabase } from "@/libs/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("traveller"); // default
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    // 1️⃣ Send OTP with role in query param
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `http://localhost:3000/dashboard?role=${role}`,
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for the login link!");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-2">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="admin">Admin</option>
          <option value="traveller">Traveller</option>
          <option value="companion">Companion</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">
          Send OTP
        </button>
      </form>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}
