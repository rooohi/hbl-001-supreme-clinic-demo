import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./product.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  applicationName: "Twacha Clinic OS",
  title: {
    default: "Twacha Clinic OS",
    template: "%s | Twacha Clinic OS",
  },
  description: "The calm operating system for Twacha Skin, Hair, Laser and Cosmetology Centre.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/twacha-logo.png", type: "image/png" }],
    shortcut: "/favicon.svg",
    apple: "/twacha-logo.png",
  },
  openGraph: {
    title: "Twacha Clinic OS",
    description: "Calm care. Clear operations.",
    siteName: "Twacha Clinic OS",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "TWACHA CLINIC OS — Calm care. Clear operations." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Twacha Clinic OS",
    description: "Calm care. Clear operations.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#e7353b",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Providers>{children}</Providers></body></html>;
}
