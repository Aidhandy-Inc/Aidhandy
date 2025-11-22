// Force this page to be client-side so router can work safely
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (!router) return;
    router.replace("/dashboard");
  }, [router]);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      Redirecting...
    </div>
  );
}
