import { Suspense } from "react";
import FlightSuccessClient from "./FlightSuccessClient";

export const dynamic = "force-dynamic";

function FlightSuccessFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh]">
      <h1 className="text-3xl font-semibold text-green-600">
        🎉 Payment Successful!
      </h1>
      <p className="text-gray-600 mt-4">Finalizing your booking...</p>
    </div>
  );
}

export default function FlightSuccess() {
  return (
    <Suspense fallback={<FlightSuccessFallback />}>
      <FlightSuccessClient />
    </Suspense>
  );
}
