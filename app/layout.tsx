import type { Metadata } from "next";
import "./globals.css";
import { company } from "@/config/company";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = {
  metadataBase: new URL(company.domain),
  title: `${company.displayName} | Responsible AI Systems for Business`,
  description: "AI roles and connected workflows that turn customer requests into finished work—with permissions, human review and a clear operating record.",
  openGraph: { title: `${company.displayName} | Turn customer requests into finished work`, description: "Responsible AI systems for customer operations, teams and connected workflows.", images: [`${company.domain}/og.png`] },
  twitter: { card: "summary_large_image", title: "Turn customer requests into finished work.", description: "Responsible AI systems, built in Hubballi for India and beyond.", images: [`${company.domain}/og.png`] },
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
    <html lang="en" data-scroll-behavior="smooth">
      <body><PageTransition>{children}</PageTransition></body>
    </html>
  );
}
