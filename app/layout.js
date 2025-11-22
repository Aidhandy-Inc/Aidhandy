// This file must stay SERVER-SIDE.
// Do not import useRouter, useEffect, or Supabase here.

import "./globals.css";

export const metadata = {
  title: "AidHandy",
  description: "Together, every flight feels easier.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
