"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { AuthProvider } from "../context/AuthContext";

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

// Root Layout
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="description" content={metadata.description} />
        <meta name="viewport" content={metadata.viewport} />
        <title>{metadata.title}</title>
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 text-gray-900 antialiased`}>

        {/* Global Auth Wrapper */}
        <AuthProvider>

          {/* NAVIGATION BAR */}
          <nav className="w-full bg-white shadow-sm fixed top-0 left-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

              {/* Logo */}
              <Link href="/" className="text-xl font-semibold text-blue-600">
                AidHandy
              </Link>

              {/* Desktop Menu */}
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
              <MobileMenuButton />
            </div>
          </nav>

          {/* SPACING TO PUSH CONTENT BELOW FIXED NAV */}
          <div className="pt-16"></div>

          {/* MAIN CONTENT */}
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

// MOBILE MENU BUTTON COMPONENT
function MobileMenuButton() {
  const toggleMenu = () => {
    const menu = document.getElementById("mobile-menu");
    menu.classList.toggle("hidden");
  };

  return (
    <>
      {/* Hamburger Icon */}
      <button
        onClick={toggleMenu}
        className="md:hidden focus:outline-none text-gray-700"
      >
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Mobile Dropdown */}
      <div
        id="mobile-menu"
        className="hidden md:hidden absolute top-14 left-0 w-full bg-white shadow-lg py-4 px-6 flex flex-col gap-4 text-base font-medium z-40"
      >
        <Link href="/" className="hover:text-blue-600" onClick={toggleMenu}>Home</Link>
        <Link href="/contact" className="hover:text-blue-600" onClick={toggleMenu}>Contact</Link>
        <Link href="/terms" className="hover:text-blue-600" onClick={toggleMenu}>Terms</Link>
        <Link href="/privacy" className="hover:text-blue-600" onClick={toggleMenu}>Privacy</Link>
        <Link
          href="/auth/login"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-center"
          onClick={toggleMenu}
        >
          Login
        </Link>
      </div>
    </>
  );
}
