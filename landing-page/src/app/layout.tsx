import type { Metadata } from "next";
import { StoreProvider } from "@/store/StoreProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased">
      <body
        style={{
          fontFamily:
            '"Helvetica Neue", Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
        className="min-h-full flex flex-col bg-white text-[#151515] selection:bg-neutral-200"
      >
        <StoreProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </StoreProvider>
      </body>
    </html>
  );
}
