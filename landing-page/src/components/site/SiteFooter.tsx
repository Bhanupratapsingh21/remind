import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Wordmark } from "./SiteNav";
import { Aurora } from "./Aurora";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Features", href: "/#features" },
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
    title: "Resources",
    links: [
      { label: "Terms of Use", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Support", href: "#" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "X (Twitter)", href: "#" },
      { label: "Instagram", href: "#" },
      { label: "LinkedIn", href: "#" },
    ],
  },
];

/** Footer: the closing call-to-action sits in a night-sky aurora band that melts into a peach card with link columns and a giant wordmark */
export function SiteFooter({ showCta = true }: { showCta?: boolean }) {
  return (
    <footer id="site-footer" className="px-4 pb-4 pt-12 sm:pt-20">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-peach text-zinc-950">
        <Aurora className={showCta ? "min-h-[26rem] sm:min-h-[30rem]" : "h-48 sm:h-56"}>
          {showCta && (
            <div className="flex min-h-[26rem] flex-col items-center justify-center px-6 pb-24 pt-16 text-center sm:min-h-[30rem]">
              <h2 className="font-display text-4xl tracking-[-0.03em] text-white sm:text-5xl md:text-6xl">
                Stop ignoring notifications.
                <br />
                Pick up the call.
              </h2>
              <p className="mx-auto mt-5 max-w-md font-serif text-[17px] text-white/70">
                Your first reminder call is free. No app, no card, no setup beyond a phone number.
              </p>
              <Link
                href="/signup"
                className="mt-9 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-[15px] font-medium text-zinc-950 shadow-[0_20px_50px_-20px_rgba(246,167,106,.8)] hover:bg-amber-50"
              >
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </Aurora>

        <div className="px-6 pb-4 pt-6 sm:px-10 lg:px-14">
          <div className="grid gap-10 md:grid-cols-[1.3fr_repeat(4,minmax(0,1fr))]">
            <div>
              <Wordmark small />
              <p className="mt-3 max-w-[16rem] font-serif text-[15px] leading-relaxed text-zinc-600">
                The reminder that calls you.
              </p>
            </div>

            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-[13px] text-zinc-500">{col.title}</p>
                <ul className="mt-3 space-y-2">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-[14px] text-zinc-900 hover:text-zinc-500">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col gap-2 text-[13px] text-zinc-500 sm:flex-row sm:items-end sm:justify-between">
            <p>© {new Date().getFullYear()} Remind. All rights reserved.</p>
            <p>
              Created & developed by{" "}
              <a
                href="https://bpss.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-800 underline underline-offset-2 hover:text-black"
              >
                bpss.in
              </a>{" "}
              &{" "}
              <a
                href="https://www.rambhardwaj.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-800 underline underline-offset-2 hover:text-black"
              >
                rambhardwaj.in
              </a>
            </p>
          </div>
        </div>

        {/* giant wordmark, cropped by the card's bottom edge */}
        <p
          aria-hidden
          className="pointer-events-none -mb-[0.26em] select-none text-right font-sans text-[clamp(6rem,22vw,19rem)] font-bold leading-[0.85] tracking-[-0.06em] text-zinc-950 pr-4 sm:pr-8"
        >
          remind
        </p>
      </div>
    </footer>
  );
}
