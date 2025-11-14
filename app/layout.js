import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "./navbar"; // <— we'll create this next

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AidHandy",
  description: "Airport & inflight companion service made simple.",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }) {
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
          <Navbar />

          <div style={{ height: 72 }} />
          <main>{children}</main>

          <footer className="site-footer">
            © {new Date().getFullYear()} AidHandy — All Rights Reserved
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
