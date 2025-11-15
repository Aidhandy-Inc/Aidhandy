import "./globals.css";
import Navbar from "../components/Navbar.jsx";
import AuthProvider from "@context/AuthContext";

export const metadata = {
  title: "AidHandy",
  description: "Airport & inflight companion service made simple.",
  // Next.js automatically sets the viewport meta tag based on this metadata object.
  // No explicit viewport tag is needed inside the return statement.
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          {/* The content wrapper below uses 'pt-16' (padding-top: 4rem or 64px)
            to create space below the Navbar. This is better than a fixed-height 
            spacer div and allows the main content to take up the full available screen height.
            Adjust 'pt-16' if your Navbar height changes.
          */}
          <main className="pt-16 min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
