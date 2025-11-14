"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { AuthProvider } from "../context/AuthContext";
import { useState } from "react";

// Fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata
export const metadata = {
  title: "AidHandy",
  description: "Airport & inflight companion service made simple.",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="description" content={metadata.description} />
        <meta name="viewport" content={metadata.viewport} />
        <title>{metadata.title}</title>
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 text-gray-900 antialiased`}
      >
        <AuthProvider>
          {/* NAVBAR */}
          <nav className="w-full bg-white shadow-sm fixed top-0 left-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

              {/* LOGO */}
              <Link href="/" className="text-xl font-semibold text-blue-600">
                AidHandy
              </Link>

              {/* DESKTOP MENU (HIDDEN ON MOBILE) */}
              <div className="hidden md:flex gap-6 text-sm font-medium items-center">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <Link href="/contact" className="hover:text-blue-600">Contact</Link>
                <Link href="/terms" className="hover:text-blue-600">Terms</Link>
                <Link href="/privacy" className="hover:text-blue-600">Privacy</Link>
                <Link
                  href="/auth/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Login
                </Link>
              </div>

              {/* MOBILE MENU BUTTON */}
              <button
                className="md:hidden text-gray-700"
                onClick={toggleMenu}
              >
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>

            {/* MOBILE DROPDOWN MENU */}
            {mobileOpen && (
              <div
                id="mobile-menu"
                className="md:hidden w-full bg-white shadow-lg py-4 px-6 flex flex-col gap-4 text-base font-medium"
              >
                <Link href="/" onClick={toggleMenu} className="hover:text-blue-600">
                  Home
                </Link>

                <Link href="/contact" onClick={toggleMenu} className="hover:text-blue-600">
                  Contact
                </Link>

                <Link href="/terms" onClick={toggleMenu} className="hover:text-blue-600">
                  Terms
                </Link>

                <Link href="/privacy" onClick={toggleMenu} className="hover:text-blue-600">
                  Privacy
                </Link>

                <Link
                  href="/auth/login"
                  onClick={toggleMenu}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-center"
                >
                  Login
                </Link>
              </div>
            )}
          </nav>

          {/* SPACE BELOW FIXED NAV */}
          <div className="pt-20"></div>

          {/* CONTENT */}
          <main className="min-h-screen">
            {children}
          </main>

          {/* FOOTER */}
          <footer className="w-full py-6 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} AidHandy — All Rights Reserved
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
