import { notFound } from "next/navigation";

/** Design playground: available in development only */
export default function DemoUiLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return <>{children}</>;
}
