import type { Metadata } from "next";
import "./globals.css";
import { company } from "@/config/company";

export const metadata: Metadata = {
  metadataBase: new URL("https://rooohi.github.io/hbl-001-supreme-clinic-demo"),
  title: `${company.displayName} | Practical AI for Business`,
  description: "AI employees and practical automation for businesses in Hubballi, Karnataka and beyond.",
  openGraph: { title: `${company.displayName} | AI that works for your business`, description: "AI employees that answer, qualify, follow up, book and automate repetitive work.", images: ["/hbl-001-supreme-clinic-demo/og.png"] },
  twitter: { card: "summary_large_image", title: "AI that works for your business.", description: "Practical AI automation built in Hubballi.", images: ["/hbl-001-supreme-clinic-demo/og.png"] },
  icons: {
    icon: "/hbl-001-supreme-clinic-demo/favicon.svg",
    shortcut: "/hbl-001-supreme-clinic-demo/favicon.svg",
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
