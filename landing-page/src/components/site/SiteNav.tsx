"use client";

import Link from "next/link";

const LINKS = [
  { label: "Product", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Voices", href: "/#voices" },
  { label: "Pricing", href: "/#pricing" },
];

/** The "remind" wordmark, unchanged from the original brand */
export function Wordmark({ href = "/", small = false }: { href?: string; small?: boolean }) {
  return (
    <Link
      href={href}
      className={`font-sans font-bold tracking-tighter text-ink transition-opacity hover:opacity-80 ${small ? "text-lg" : "text-2xl"}`}
    >
      remind
    </Link>
  );
}

/** Marketing nav: wordmark, links, Login / Sign Up (or a custom right slot) */
export function SiteNav({ right, showLinks = true }: { right?: React.ReactNode; showLinks?: boolean }) {
  return (
    <header className="sticky top-0 z-50 bg-canvas/85 backdrop-blur-md">
      <nav className="mx-auto flex h-[68px] max-w-[1880px] items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-10">
          <Wordmark />
          {showLinks && (
            <ul className="hidden items-center gap-6 text-[15px] font-medium text-zinc-800 lg:flex">
              {LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="flex items-center gap-1 hover:text-zinc-500">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          {right ?? (
            <>
              <Link
                href="/login"
                className="rounded-xl border border-zinc-900 px-4 py-2 text-[15px] font-medium text-zinc-900 hover:bg-zinc-100"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-zinc-950 px-4 py-2 text-[15px] font-medium text-white hover:bg-zinc-800"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
