import type { Metadata, Viewport } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
import { Instrument_Sans, Source_Serif_4 } from "next/font/google";
import { StoreProvider } from "@/store/StoreProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Display headings and serif body copy, exposed as CSS variables for the @theme fonts
const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: "%s · Remind" },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "AI reminder call",
    "reminder phone call",
    "voice reminder app",
    "AI assistant that calls you",
    "medicine reminder call",
    "wake up call reminder",
    "Hinglish AI voice",
    "reminder app India",
    "accountability call",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f7f1ea",
};

/** Structured data so search engines understand the product and its prices */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  url: SITE_URL,
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web, any phone",
  description: SITE_DESCRIPTION,
  offers: [
    { "@type": "Offer", name: "Basic", price: "199", priceCurrency: "INR", category: "subscription" },
    { "@type": "Offer", name: "Pro", price: "499", priceCurrency: "INR", category: "subscription" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${instrumentSans.variable} ${sourceSerif.variable} h-full antialiased`}>
      <body
        style={{
          fontFamily:
            '"Helvetica Neue", Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
        className="min-h-full flex flex-col bg-canvas text-[#151515] selection:bg-amber-100"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, () => String.fromCharCode(92) + "u003c") }}
        />
        <StoreProvider>
          {children}
          <Toaster closeButton />
        </StoreProvider>
      </body>
    </html>
  );
}
