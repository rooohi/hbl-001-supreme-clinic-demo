import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "{{BRAND_NAME}} | AI Automation Company in Hubballi",
  description: "AI employees and practical automation for businesses in Hubballi, Karnataka and beyond.",
  openGraph: { title: "AI that works for your business.", description: "AI employees that answer, qualify, follow up, book and automate repetitive work.", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "AI that works for your business.", description: "Practical AI automation built in Hubballi.", images: ["/og.png"] },
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
