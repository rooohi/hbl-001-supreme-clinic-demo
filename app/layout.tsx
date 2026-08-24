import type { Metadata } from "next";
import "./globals.css";
import "./v2.css";
import { company } from "@/config/company";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = {
  metadataBase: new URL(company.domain),
  title: { default: `${company.displayName} | AI That Works for Your Business`, template: `%s | ${company.displayName}` },
  description: company.description,
  alternates: { canonical: company.domain },
  keywords: ["operational AI Hubballi","AI agents India","WhatsApp automation","Kannada voice AI","business process automation"],
  authors: [{ name: company.displayName }],
  creator: company.displayName,
  openGraph: { title: `${company.displayName} | AI That Works for Your Business`, description: company.description, images: [`${company.domain}/og.png`] },
  twitter: { card: "summary_large_image", title: "AI that works for your business.", description: "Operational AI systems, built in Hubballi and designed for global scale.", images: [`${company.domain}/og.png`] },
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
      <body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
        "@context":"https://schema.org",
        "@type":["Organization","ProfessionalService"],
        name:company.displayName,
        url:company.domain,
        logo:`${company.domain}/favicon.svg`,
        image:`${company.domain}/og.png`,
        address:{"@type":"PostalAddress",addressLocality:company.city,addressRegion:company.state,addressCountry:"IN"},
        areaServed:[{"@type":"City",name:"Hubballi"},{"@type":"AdministrativeArea",name:"Karnataka"},{"@type":"Country",name:"India"}],
        serviceType:["AI agent implementation","WhatsApp automation","Voice AI","Business process automation","Custom AI development"],
        openingHours:"Mo-Fr 09:00-17:00",
        description:company.description,
      })}}/><PageTransition>{children}</PageTransition></body>
    </html>
  );
}
