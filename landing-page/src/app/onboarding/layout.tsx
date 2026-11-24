import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set up your agent",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
