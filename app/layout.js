import "./globals.css";


export const metadata = {
  title: "AidHandy",
  description: "Airport & inflight companion service made simple.",
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
