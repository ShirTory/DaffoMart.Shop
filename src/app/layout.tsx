import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DEFAULT_DESC, DEFAULT_OG, SITE_NAME, SITE_URL } from "@/lib/site";

// Pages build their own canonical/Open Graph/Twitter data with pageMeta() (src/lib/seo.ts); these are the site-wide defaults.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "DaffoMart – Everyday Essentials, Delivered with Care.", template: "%s | DaffoMart" },
  description: DEFAULT_DESC,
  applicationName: SITE_NAME,
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-mark.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_BD", images: [{ url: DEFAULT_OG, width: 1200, height: 630, alt: "DaffoMart – Everyday Essentials, Delivered with Care." }] },
  twitter: { card: "summary_large_image", images: [DEFAULT_OG] },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } } : {}),
};
export const viewport: Viewport = { themeColor: "#1E3A8A", width: "device-width", initialScale: 1 };

// Tells Google the site's name (and the alternate name people may type) so search results show "DaffoMart" for this address.
const siteSchema = [
  { "@context": "https://schema.org", "@type": "WebSite", name: "DaffoMart", alternateName: ["daffomartshop", "DaffoMart Shop", "daffomart"], url: `${SITE_URL}/` },
  { "@context": "https://schema.org", "@type": "Organization", name: "DaffoMart", url: `${SITE_URL}/`, logo: `${SITE_URL}/logo.png` },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }} /></head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
