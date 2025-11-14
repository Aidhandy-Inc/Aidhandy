"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="navbar-wrapper">
        <div className="navbar-inner">
          <Link href="/" className="nav-logo">
            AidHandy
          </Link>

          {/* Desktop */}
          <div className="nav-links">
            <Link href="/">Home</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/auth/login" className="nav-cta">Login</Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="nav-mobile-btn"
            onClick={() => setOpen(!open)}
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`nav-mobile-menu ${open ? "active" : ""}`}>
        <Link href="/" onClick={() => setOpen(false)}>Home</Link>
        <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
        <Link href="/terms" onClick={() => setOpen(false)}>Terms</Link>
        <Link href="/privacy" onClick={() => setOpen(false)}>Privacy</Link>
        <Link href="/auth/login" onClick={() => setOpen(false)} className="nav-cta">
          Login
        </Link>
      </div>

      {/* Spacer to avoid overlap */}
      <div style={{ height: 72 }}></div>
    </>
  );
}
