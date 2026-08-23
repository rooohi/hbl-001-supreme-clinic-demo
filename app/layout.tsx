import type { Metadata } from "next";
import "./globals.css";
import { company } from "@/config/company";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = {
  metadataBase: new URL("https://rooohi.github.io/hbl-001-supreme-clinic-demo"),
  title: `${company.displayName} | Responsible AI Systems for Business`,
  description: "AI agents and connected workflows that help businesses respond, decide and act—with human control built in.",
  openGraph: { title: `${company.displayName} | AI that carries real work forward`, description: "Responsible AI systems for customer operations, teams and connected workflows.", images: ["https://rooohi.github.io/hbl-001-supreme-clinic-demo/og.png"] },
  twitter: { card: "summary_large_image", title: "AI that carries real work forward.", description: "Responsible AI systems, built in Hubballi for India and beyond.", images: ["https://rooohi.github.io/hbl-001-supreme-clinic-demo/og.png"] },
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
      <body><PageTransition>{children}</PageTransition></body>
    </html>
  );
}
