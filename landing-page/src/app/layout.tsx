import type { Metadata } from "next";
import { Instrument_Sans, Source_Serif_4 } from "next/font/google";
import { StoreProvider } from "@/store/StoreProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Display headings and serif body copy, exposed as CSS variables for the @theme fonts
const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif" });

export const metadata: Metadata = {
  title: "Remind — Gentle reminders. A familiar voice.",
  description:
    "Gentle reminders. A familiar voice. An AI agent that calls you and listens.",
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
        <StoreProvider>
          {children}
          <Toaster closeButton />
        </StoreProvider>
      </body>
    </html>
  );
}
