"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Home() {
  // Cookie banner
  useEffect(() => {
    if (localStorage.getItem("ah_cookie") === null) {
      const el = document.getElementById("cookie");
      if (el) el.style.display = "block";
    }
  }, []);

  // Facebook Pixel
  useEffect(() => {
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      "script",
      "https://connect.facebook.net/en_US/fbevents.js"
    );

    window.fbq("init", "1195389679143314");
    window.fbq("track", "PageView");
  }, []);

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 16px" }}>

      {/* STRUCTURED DATA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "AidHandy Inc.",
            url: "https://www.aidhandy.com",
            contactPoint: [
              {
                "@type": "ContactPoint",
                email: "support@aidhandy.com",
                areaServed: "US",
              },
            ],
          }),
        }}
      />

      {/* NO SCRIPT */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=1195389679143314&ev=PageView&noscript=1"
          alt="pixel"
        />
      </noscript>

      {/* HERO SECTION */}
      <section style={heroSection}>
        <span style={badgeStyle}>U.S. launch · ATL · JFK · LAX</span>

        <h1 style={heroTitle}>Together, every flight feels easier.</h1>

        <p style={heroText}>
          AidHandy connects travelers with vetted companions for airport
          navigation, check-in support, and in-flight reassurance.
        </p>

        <div style={ctaRow}>
          <a href="#book" style={primaryBtn}>Get started</a>
          <Link href="/privacy" style={ghostBtn}>Privacy-first operations</Link>
        </div>
      </section>

      {/* TRAVELERS & COMPANIONS */}
      <section style={{ marginTop: 40 }}>
        <div style={cardGrid}>
          <div style={card}>
            <h2 style={cardTitle}>For Travelers</h2>
            <p>
              Book on-demand support for airport check-in, gate changes, 
              boarding, and in-flight reassurance.
            </p>
            <ul style={ulClean}>
              <li>SMS/email confirmations</li>
              <li>Companion transparency</li>
              <li>Secure payments</li>
            </ul>
          </div>

          <div style={card}>
            <h2 style={cardTitle}>For Companions</h2>
            <p>
              Offer support on your schedule. AidHandy handles payments so
              you can focus on travelers.
            </p>
            <ul style={ulClean}>
              <li>Clear job timelines</li>
              <li>Fast payouts</li>
              <li>Flight change alerts</li>
            </ul>
          </div>
        </div>
      </section>

      {/* JOIN AS COMPANION */}
      <section id="book" style={{ marginTop: 40 }}>
        <div style={card}>
          <h2>Join as a Companion</h2>
          <p>Become part of the AidHandy companion network.</p>

          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSfS955PSpGmBXbM7xUatap6uERhr8_rEs5Bj4TgJ-Fy-Pjd3w/viewform?embedded=true"
            width="100%"
            height="1650"
            style={{ border: 0, marginTop: 12 }}
          ></iframe>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={footerStyle}>
        <div>
          <Link href="/privacy">Privacy</Link> ·{" "}
          <Link href="/terms">Terms</Link> ·{" "}
          <Link href="/contact">Contact</Link>
        </div>
        <div style={{ marginTop: 4, fontSize: 12, color: "#777" }}>
          © {new Date().getFullYear()} AidHandy Inc.
        </div>
      </footer>

      {/* COOKIE BANNER */}
      <div id="cookie" style={cookieBar}>
        We use cookies. See{" "}
        <Link href="/privacy" style={{ color: "#93c5fd" }}>
          Privacy Policy
        </Link>
        .
        <div style={{ marginTop: 10, display: "flex", gap: 12 }}>
          <button
            onClick={() => {
              localStorage.setItem("ah_cookie", "1");
              document.getElementById("cookie").style.display = "none";
            }}
            style={okBtn}
          >
            Accept
          </button>

          <button
            onClick={() => {
              localStorage.setItem("ah_cookie", "0");
              document.getElementById("cookie").style.display = "none";
            }}
            style={declineBtn}
          >
            Decline
          </button>
        </div>
      </div>

    </div>
  );
}

/* ---------------- STYLES ---------------- */

const heroSection = {
  marginTop: 20,
  textAlign: "center",
};

const badgeStyle = {
  background: "#ECFEFF",
  padding: "6px 12px",
  borderRadius: 999,
  fontSize: 12,
  border: "1px solid #bae6fd",
  color: "#0369a1",
};

const heroTitle = {
  fontSize: "clamp(28px, 6vw, 44px)",
  marginTop: 16,
  fontWeight: 700,
};

const heroText = {
  fontSize: 18,
  color: "#555",
  marginTop: 10,
  maxWidth: 700,
  marginLeft: "auto",
  marginRight: "auto",
};

const ctaRow = {
  marginTop: 20,
  display: "flex",
  justifyContent: "center",
  gap: 12,
  flexWrap: "wrap",
};

const primaryBtn = {
  background: "#1D9FD8",
  color: "#fff",
  padding: "10px 18px",
  borderRadius: 8,
  fontWeight: 600,
  textDecoration: "none",
};

const ghostBtn = {
  padding: "10px 18px",
  borderRadius: 8,
  border: "1px solid #1D9FD8",
  color: "#1D9FD8",
  textDecoration: "none",
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 20,
};

const card = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
  background: "#fff",
};

const cardTitle = {
  color: "#1D9FD8",
  marginBottom: 12,
};

const ulClean = { paddingLeft: 18, marginTop: 12 };

const footerStyle = {
  padding: 24,
  marginTop: 40,
  borderTop: "1px solid #e5e7eb",
  textAlign: "center",
};

const cookieBar = {
  position: "fixed",
  bottom: 16,
  left: 16,
  right: 16,
  background: "#0b1220",
  color: "#e5e7eb",
  borderRadius: 14,
  padding: 14,
  display: "none",
  zIndex: 50,
};

const okBtn = {
  background: "#22c55e",
  border: "none",
  padding: "10px 14px",
  fontWeight: 600,
  borderRadius: 10,
};

const declineBtn = {
  background: "#334155",
  border: "none",
  padding: "10px 14px",
  fontWeight: 600,
  borderRadius: 10,
};
