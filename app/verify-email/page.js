import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

export const dynamic = "force-dynamic";

function VerifyEmailFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-2xl font-semibold mb-4">Email Verification</h1>
      <p className="text-lg mb-4">Loading verification status...</p>
    </div>
  );
}

export default function VerifyEmailPage({ searchParams }) {
  const tokenParam = searchParams?.token;
  const token = typeof tokenParam === "string" ? tokenParam : null;

  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailClient token={token} />
    </Suspense>
  );
}