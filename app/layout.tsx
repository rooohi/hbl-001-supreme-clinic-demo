import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}

