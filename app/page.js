"use client";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: "#0f172a",
        color: "#e5e7eb",
      }}
    >
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>
        AIDHANDY DIAGNOSTIC PAGE
      </h1>
      <p style={{ fontSize: 18, marginBottom: 8 }}>
        If you are seeing this, the Next.js app from GitHub is what
        <strong> aidhandy.com </strong> is actually serving.
      </p>
      <p style={{ fontSize: 16, opacity: 0.8 }}>
        If you still see the old “How it works · Contact · Terms · Privacy ·
        Book a Companion” header and hero instead of this screen, then this
        repo is NOT the one connected to your production domain.
      </p>
    </div>
  );
}
