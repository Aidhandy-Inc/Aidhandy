import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

function VerifyEmailFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-2xl font-semibold mb-4">Email Verification</h1>
      <p className="text-lg mb-4">Preparing verification details...</p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailClient />
    </Suspense>
  );
}