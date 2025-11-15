import "../globals.css";
import Navbar from "./navbar.jsx";

export const metadata = {
  title: "AidHandy",
  description: "Airport & inflight companion service made simple.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <div style={{ height: "72px" }} />
        {children}
      </body>
    </html>
  );
}
