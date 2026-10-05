import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";

import "./globals.css";
import { getContactMethods, getSiteSettings } from "@/db/queries/site";
import { isConfiguredContact } from "@/lib/contact/is-configured-contact";
import { getSiteOrigin } from "@/lib/site-origin";
import { serializeJsonLd } from "@/lib/json-ld";
import { getDefaultSocialImageMetadata } from "@/lib/seo/default-social-image";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  const [settings, socialImages] = await Promise.all([getSiteSettings(), getDefaultSocialImageMetadata()]);
  const origin = await getSiteOrigin(settings);
  const siteName = settings?.siteName || "Portfolio";
  return {
    metadataBase: origin ?? undefined,
    title: { default: siteName, template: `%s | ${siteName}` },
    description: settings?.siteDescription ?? settings?.shortDescription ?? "Personal portfolio, projects, and technical writing.",
    openGraph: {
      type: "website",
      siteName,
      title: siteName,
      description: settings?.siteDescription ?? settings?.shortDescription ?? "Personal portfolio, projects, and technical writing.",
      ...(origin ? { url: origin.toString() } : {}),
      ...(socialImages ? { images: socialImages } : {}),
    },
    twitter: socialImages ? { card: "summary_large_image", images: socialImages.map((image) => image.url) } : { card: "summary" },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Suspense fallback={null}>
          <SiteStructuredData />
        </Suspense>
        {children}
      </body>
    </html>
  );
}

async function SiteStructuredData() {
  const [settings, origin, methods] = await Promise.all([getSiteSettings(), getSiteOrigin(), getContactMethods()]);
  const sameAs = methods.filter((method) => ["github", "linkedin", "x"].includes(method.type) && isConfiguredContact(method)).map((method) => method.url).filter((url): url is string => Boolean(url));
  const identity = settings ? {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: settings.siteName, ...(origin ? { url: origin.toString() } : {}) },
      { "@type": "Person", name: settings.personName, ...(origin ? { url: origin.toString() } : {}), ...(sameAs.length ? { sameAs } : {}) },
    ],
  } : null;

  return identity ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(identity) }} /> : null;
}
