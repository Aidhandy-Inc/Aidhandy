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
    <div className="max-w-screen-lg mx-auto px-4">

      {/* HERO */}
      <section className="text-center mt-8">
        <span className="inline-block bg-cyan-50 text-cyan-700 border border-cyan-200 px-3 py-1 rounded-full text-xs">
          U.S. launch · ATL · JFK · LAX
        </span>

        <h1 className="text-4xl md:text-5xl font-bold mt-4">
          Together, every flight feels easier.
        </h1>

        <p className="text-gray-600 text-lg max-w-2xl mx-auto mt-4">
          AidHandy connects travelers with vetted companions for airport
          navigation, check-in support, and in-flight reassurance.
        </p>

        <div className="flex justify-center gap-3 mt-6 flex-wrap">
          <a
            href="#book"
            className="bg-blue-500 text-white px-5 py-3 rounded-lg font-semibold"
          >
            Get started
          </a>

          <Link
            href="/privacy"
            className="border border-blue-500 text-blue-500 px-5 py-3 rounded-lg font-semibold"
          >
            Privacy-first operations
          </Link>
        </div>
      </section>

      {/* TRAVELERS & COMPANIONS */}
      <section className="grid md:grid-cols-2 gap-6 mt-12">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="text-blue-500 font-semibold text-xl mb-3">
            For Travelers
          </h2>
          <p>
            Book on-demand support for airport check-in, gate changes, boarding,
            and in-flight reassurance.
          </p>
          <ul className="mt-3 list-disc pl-6">
            <li>SMS/email confirmations</li>
            <li>Companion transparency</li>
            <li>Secure payments</li>
          </ul>
        </div>

        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="text-blue-500 font-semibold text-xl mb-3">
            For Companions
          </h2>
          <p>Offer support on your schedule.</p>
          <ul className="mt-3 list-disc pl-6">
            <li>Clear job timelines</li>
            <li>Fast payouts</li>
            <li>Flight change alerts</li>
          </ul>
        </div>
      </section>

      {/* JOIN SECTION */}
      <section id="book" className="mt-12">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Join as a Companion</h2>
          <p className="mt-2">
            Become part of the AidHandy companion network.
          </p>

          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSfS955PSpGmBXbM7xUatap6uERhr8_rEs5Bj4TgJ-Fy-Pjd3w/viewform?embedded=true"
            width="100%"
            height="1650"
            className="mt-4 border-0"
          ></iframe>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center mt-12 py-6 border-t text-gray-600 text-sm">
        <Link href="/privacy">Privacy</Link> ·{" "}
        <Link href="/terms">Terms</Link> ·{" "}
        <Link href="/contact">Contact</Link>
        <div className="mt-1">
          © {new Date().getFullYear()} AidHandy Inc.
        </div>
      </footer>

      {/* COOKIE BAR */}
      <div
        id="cookie"
        className="fixed bottom-4 left-4 right-4 bg-gray-900 text-gray-200 p-4 rounded-xl hidden"
      >
        We use cookies. See{" "}
        <Link href="/privacy" className="text-blue-300 underline">
          Privacy Policy
        </Link>
        .
        <div className="mt-3 flex gap-3">
          <button
            onClick={() => {
              localStorage.setItem("ah_cookie", "1");
              document.getElementById("cookie").style.display = "none";
            }}
            className="bg-green-500 px-4 py-2 rounded-lg"
          >
            Accept
          </button>

          <button
            onClick={() => {
              localStorage.setItem("ah_cookie", "0");
              document.getElementById("cookie").style.display = "none";
            }}
            className="bg-gray-700 px-4 py-2 rounded-lg"
          >
            Decline
          </button>
        </div>
      </div>

    </div>
  );
}
