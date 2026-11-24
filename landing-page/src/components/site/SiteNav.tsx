"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { useAppSelector } from "@/store";
import api from "@/lib/api";

const LINKS = [
  { label: "Product", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Voices", href: "/#voices" },
  { label: "Pricing", href: "/#pricing" },
];

/** Distance in px the page must scroll before the bar turns into a floating pill */
const FLOAT_AFTER = 20;

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

/* Scroll position as an external store: false on the server and on the first client render */
function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}
const scrolledSnapshot = () => window.scrollY > FLOAT_AFTER;
const scrolledServerSnapshot = () => false;

function useScrolled() {
  return useSyncExternalStore(subscribeScroll, scrolledSnapshot, scrolledServerSnapshot);
}

/**
 * Whether the visitor has a session. Uses the Redux user when there is one; otherwise asks the
 * backend once via GET /auth/me (the cookie is httpOnly, so only the API can tell). Any failure
 * means "logged out". Never redirects.
 */
function useSignedIn(enabled: boolean) {
  const { user, isLoading } = useAppSelector((s) => s.auth);
  const [remote, setRemote] = useState(false);

  useEffect(() => {
    // Wait for the store to read localStorage first; skip the request when we already know
    if (!enabled || isLoading || user) return;
    let cancelled = false;
    api
      .get("/auth/me")
      .then((res) => {
        if (!cancelled && res.data?.data?.user) setRemote(true);
      })
      .catch(() => {
        /* logged out, expired or offline: keep the Log in / Sign up buttons */
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, isLoading, user]);

  return enabled && (Boolean(user) || remote);
}

function AuthButtons({ signedIn }: { signedIn: boolean }) {
  const base = "whitespace-nowrap rounded-xl px-3 py-2 text-[14px] font-medium transition-colors sm:px-4 sm:text-[15px]";
  if (signedIn) {
    return (
      <Link
        href="/dashboard"
        className={`${base} inline-flex items-center justify-center gap-1.5 bg-zinc-950 text-white hover:bg-zinc-800`}
      >
        Dashboard
        <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }
  return (
    <>
      <Link
        href="/login"
        className={`${base} border border-zinc-900 text-zinc-900 hover:bg-zinc-100`}
      >
        Log in
      </Link>
      <Link href="/signup" className={`${base} bg-zinc-950 text-white hover:bg-zinc-800`}>
        Sign up
      </Link>
    </>
  );
}

/**
 * Marketing nav: wordmark, links, Log in / Sign up (or Dashboard when signed in, or a custom
 * right slot). Sits flat at the top of the page and turns into a floating pill once scrolled.
 */
export function SiteNav({ right, showLinks = true }: { right?: React.ReactNode; showLinks?: boolean }) {
  const scrolled = useScrolled();
  const signedIn = useSignedIn(!right);
  const [menuOpen, setMenuOpen] = useState(false);
  const floating = scrolled || menuOpen;
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      {/* Keeps the page from jumping: the real bar is fixed and takes no space */}
      <div aria-hidden className="h-[68px]" />

      <header
        className={`pointer-events-none fixed inset-x-0 top-0 z-50 transition-[padding] duration-300 ease-out ${
          floating ? "px-4 pt-3 sm:px-6" : "px-0 pt-0"
        }`}
      >
        <div
          className={`pointer-events-auto mx-auto border transition-all duration-300 ease-out ${
            floating
              ? "max-w-[1180px] rounded-[22px] border-white/70 bg-canvas/75 shadow-[0_10px_40px_-14px_rgba(80,50,20,.35)] backdrop-blur-xl"
              : "max-w-[1880px] rounded-none border-transparent bg-canvas/80 shadow-none backdrop-blur-md"
          }`}
        >
          <nav
            aria-label="Main"
            className={`flex items-center justify-between transition-[height,padding] duration-300 ease-out ${
              floating ? "h-[56px] pl-5 pr-2.5 sm:pl-6" : "h-[68px] px-5 sm:px-8"
            }`}
          >
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

            <div className="flex items-center gap-2">
              {right ?? (
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  <AuthButtons signedIn={signedIn} />
                </div>
              )}
              {!right && showLinks && (
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-expanded={menuOpen}
                  aria-controls="site-mobile-menu"
                  aria-label={menuOpen ? "Close menu" : "Open menu"}
                  className="grid h-10 w-9 shrink-0 place-items-center rounded-xl text-zinc-900 hover:bg-zinc-900/5 lg:hidden"
                >
                  {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              )}
            </div>
          </nav>

          {!right && showLinks && menuOpen && (
            <div id="site-mobile-menu" className="border-t border-zinc-900/5 px-3 pb-3 pt-2 lg:hidden">
              <ul className="flex flex-col">
                {LINKS.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      onClick={closeMenu}
                      className="block rounded-xl px-3 py-2.5 text-[16px] font-medium text-zinc-800 hover:bg-zinc-900/5"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
