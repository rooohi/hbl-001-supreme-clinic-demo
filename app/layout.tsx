import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Supreme Hair & Skin Care | Hubballi",
  description: "Thoughtful, dermatologist-led hair and skin care in Hubballi with simple online appointment booking.",
  openGraph: { title: "Supreme Hair & Skin Care", description: "Thoughtful care. Simple booking.", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "Supreme Hair & Skin Care", description: "Thoughtful care. Simple booking.", images: ["/og.png"] },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
