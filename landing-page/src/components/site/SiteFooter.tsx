import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Wordmark } from "./SiteNav";

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

/** Closing call-to-action card, then a warm footer: aurora band, link columns, giant wordmark */
export function SiteFooter({ showCta = true }: { showCta?: boolean }) {
  return (
    <footer id="site-footer" className="px-4 pb-4">
      {showCta && (
        <div className="mx-auto max-w-7xl py-12 sm:py-20">
          <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#9cc0e6_0%,#d9e4f0_45%,#f3dcc6_100%)] px-6 py-24 text-center sm:py-32">
            <div className="pointer-events-none absolute -top-24 right-[20%] h-72 w-96 rounded-full bg-[radial-gradient(circle,rgba(255,206,150,.7),transparent_70%)] blur-2xl" />
            <div className="relative">
              <h2 className="font-display text-4xl tracking-[-0.03em] text-zinc-950 sm:text-5xl md:text-6xl">
                Stop ignoring notifications.
                <br />
                Pick up the call.
              </h2>
              <p className="mx-auto mt-5 max-w-md font-serif text-[17px] text-zinc-700">
                Your first reminder call is free. No app, no card, no setup beyond a phone number.
              </p>
              <Link
                href="/signup"
                className="mt-9 inline-flex items-center gap-2 rounded-2xl bg-zinc-950 px-7 py-4 text-[15px] font-medium text-white hover:bg-zinc-800"
              >
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-[#fbe9dc] text-zinc-950">
        {/* aurora band: night sky melting into the warm page */}
        <div
          aria-hidden
          className="relative h-48 overflow-hidden bg-[linear-gradient(180deg,#121830_0%,#2a2744_38%,#8d5c5a_66%,#f0c7a9_86%,#fbe9dc_100%)] sm:h-56"
        >
          <span className="absolute left-[18%] top-[30%] h-56 w-[36rem] rounded-full bg-[#7aaad9]/50 blur-3xl" />
          <span className="absolute left-[46%] top-[42%] h-48 w-[30rem] rounded-full bg-[#f6a76a]/70 blur-3xl" />
          <span className="absolute right-[6%] top-[22%] h-56 w-[32rem] rounded-full bg-[#5b6fb8]/40 blur-3xl" />
          <span className="absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,transparent,#fbe9dc)]" />
        </div>

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
