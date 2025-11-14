"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const toggleMenu = () => setOpen(!open);

  return (
    <nav className="top-nav">
      <div className="top-nav-inner">
        <Link href="/" className="nav-logo">
          AidHandy
        </Link>

        {/* Desktop */}
        <div className="nav-desktop-links">
          <Link href="/">Home</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/auth/login" className="nav-cta">
            Login
          </Link>
        </div>

        {/* Mobile button */}
        <button className="nav-mobile-btn" onClick={toggleMenu}>
          ☰
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="nav-mobile-menu">
          <Link href="/" onClick={toggleMenu}>Home</Link>
          <Link href="/contact" onClick={toggleMenu}>Contact</Link>
          <Link href="/terms" onClick={toggleMenu}>Terms</Link>
          <Link href="/privacy" onClick={toggleMenu}>Privacy</Link>
          <Link href="/auth/login" onClick={toggleMenu} className="nav-cta">
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}
