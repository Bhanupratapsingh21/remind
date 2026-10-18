import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Wordmark } from "./SiteNav";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Voices", href: "/#voices" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Mobile app", href: "/#app" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/signup" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Contact", href: "mailto:support@remind.app" },
    ],
  },
];

/** Closing call-to-action card plus a proper footer with link columns and credits */
export function SiteFooter({ showCta = true }: { showCta?: boolean }) {
  return (
    <footer id="site-footer" className="px-3 pb-4 sm:px-4">
      {showCta && (
        <div className="relative mx-auto max-w-[1888px] overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#9cc0e6_0%,#d9e4f0_45%,#f3dcc6_100%)] px-6 py-20 text-center">
          <div className="pointer-events-none absolute -top-24 right-[20%] h-72 w-96 rounded-full bg-[radial-gradient(circle,rgba(255,206,150,.7),transparent_70%)] blur-2xl" />
          <div className="relative">
            <h2 className="font-display text-4xl tracking-[-0.03em] text-zinc-950 sm:text-5xl">
              Stop ignoring notifications.
              <br />
              Pick up the call.
            </h2>
            <Link
              href="/signup"
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-zinc-950 px-6 py-3.5 text-[15px] font-medium text-white hover:bg-zinc-800"
            >
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      <div className="mx-auto mt-4 max-w-[1888px] rounded-[28px] bg-white px-6 py-10 sm:px-10 lg:px-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Wordmark />
            <p className="mt-3 max-w-xs font-serif text-[15px] leading-relaxed text-zinc-500">
              The reminder that calls you. An AI agent that rings, listens, and checks things off, so nothing slips.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-400">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-[14px] text-zinc-700 hover:text-zinc-950">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-zinc-100 pt-6 text-[13px] text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Remind. All rights reserved.</p>
          <p>
            Created & developed by{" "}
            <a
              href="https://bpss.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-700 underline underline-offset-2 hover:text-black"
            >
              bpss.in
            </a>{" "}
            &{" "}
            <a
              href="https://www.rambhardwaj.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-700 underline underline-offset-2 hover:text-black"
            >
              rambhardwaj.in
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
