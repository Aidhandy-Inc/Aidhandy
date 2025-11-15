'use client'; 
// This directive is required because we use the useState hook, making this a Client Component.

import React, { useState } from 'react';

const Navbar = () => {
  // State to control the visibility of the mobile menu
  const [isOpen, setIsOpen] = useState(false);

  // Define navigation links for easier maintenance
  const links = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
  ];

  return (
    // 'fixed w-full top-0 z-50' keeps the navbar at the top and ensures it covers content below
    <header className="fixed w-full top-0 z-50 bg-gray-800 text-white shadow-lg">
      <div className="p-4 flex flex-wrap justify-between items-center">
        
        {/* Logo/Title */}
        <h1 className="text-xl font-bold">Aidhandy</h1>
        
        {/* Hamburger/Menu Button (visible ONLY on mobile screens, md:hidden) */}
        <button 
          className="md:hidden p-2 rounded-md hover:bg-gray-700 focus:outline-none" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          {/* Toggle icon based on isOpen state */}
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          )}
        </button>

        {/* Desktop Links (Hidden on mobile, visible on medium screens and larger: hidden md:flex) */}
        <nav className="hidden md:flex space-x-4">
          {links.map(link => (
            <a key={link.name} href={link.href} className="hover:text-blue-400 transition duration-150">
              {link.name}
            </a>
          ))}
        </nav>
      </div>

      {/* Collapsible Mobile Menu (Visible only when 'isOpen' is true AND below medium screens) */}
      <nav className={`w-full md:hidden ${isOpen ? 'block' : 'hidden'} bg-gray-700 border-t border-gray-600`}>
        <div className="flex flex-col space-y-1 p-2">
          {links.map(link => (
            <a 
              key={link.name} 
              href={link.href} 
              className="block py-2 px-4 rounded-md hover:bg-gray-600 transition duration-150"
              onClick={() => setIsOpen(false)} // Close menu on click
            >
              {link.name}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
