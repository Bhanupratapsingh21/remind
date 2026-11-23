import { SiteNav } from "./SiteNav";
import { SiteFooter } from "./SiteFooter";

export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl tracking-[-0.02em] text-zinc-950">{title}</h2>
      <div className="mt-3 space-y-3 font-serif text-[16px] leading-relaxed text-zinc-700">{children}</div>
    </section>
  );
}

export function ContactLine() {
  return SUPPORT_EMAIL ? (
    <p>
      Questions? Write to{" "}
      <a className="underline underline-offset-2" href={`mailto:${SUPPORT_EMAIL}`}>
        {SUPPORT_EMAIL}
      </a>
      .
    </p>
  ) : (
    <p>Questions? Reach us through the contact details on this website.</p>
  );
}

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas text-ink antialiased">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="font-display text-4xl tracking-[-0.03em] text-zinc-950 sm:text-5xl">{title}</h1>
        <p className="mt-2 font-mono text-xs text-zinc-500">Last updated {updated}</p>
        {children}
      </main>
      <SiteFooter showCta={false} />
    </div>
  );
}
