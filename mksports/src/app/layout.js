import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata = {
  title: "MKSports",
  description: "sports for everyone",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} font-sans antialiased`} style={{
          fontFamily:
            "'Plus Jakarta Sans', var(--font-plus-jakarta), sans-serif",
        }}>
        {children}
      </body>
    </html>
  );
}
