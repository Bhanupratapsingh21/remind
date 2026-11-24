import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Sign up for Remind and get one free test call: an AI agent that phones you at the time you set.",
  alternates: { canonical: "/signup" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
