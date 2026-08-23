import type { Metadata } from "next";
import "./globals.css";
import { company } from "@/config/company";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = {
  metadataBase: new URL(company.domain),
  title: { default: `${company.displayName} | Responsible AI Systems for Business`, template: `%s | ${company.displayName}` },
  description: "AI roles and connected workflows that turn customer requests into finished work—with permissions, human review and a clear operating record.",
  alternates: { canonical: company.domain },
  keywords: ["AI automation Hubballi","AI agents India","WhatsApp automation","Kannada voice AI","business process automation"],
  authors: [{ name: company.founder.name }],
  creator: company.founder.name,
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
      <body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
        "@context":"https://schema.org",
        "@type":["Organization","ProfessionalService"],
        name:company.displayName,
        url:company.domain,
        logo:`${company.domain}/favicon.svg`,
        image:`${company.domain}/og.png`,
        telephone:company.phoneE164,
        founder:{"@type":"Person",name:company.founder.name,jobTitle:company.founder.role},
        address:{"@type":"PostalAddress",addressLocality:company.city,addressRegion:company.state,addressCountry:"IN"},
        areaServed:[{"@type":"City",name:"Hubballi"},{"@type":"AdministrativeArea",name:"Karnataka"},{"@type":"Country",name:"India"}],
        serviceType:["AI agent implementation","WhatsApp automation","Voice AI","Business process automation","Custom AI development"],
        openingHours:"Mo-Fr 09:00-17:00",
        description:company.description,
      })}}/><PageTransition>{children}</PageTransition></body>
    </html>
  );
}
