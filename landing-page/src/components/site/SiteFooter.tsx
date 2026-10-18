import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Wordmark } from "./SiteNav";

/** Closing call-to-action card plus footer with the original credits */
export function SiteFooter({ showCta = true }: { showCta?: boolean }) {
  return (
    <footer className="px-3 pb-6 sm:px-4">
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

      <div className="mx-auto mt-8 flex max-w-6xl flex-col items-center justify-between gap-5 px-2 pb-4 text-[13px] text-zinc-500 sm:flex-row">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
          <Wordmark small />
          <p>
            © {new Date().getFullYear()} Remind. Created & Developed by{" "}
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
        <div className="flex items-center gap-5">
          <Link href="/dashboard" className="hover:text-zinc-900">
            Dashboard
          </Link>
          <Link href="/login" className="hover:text-zinc-900">
            Sign In
          </Link>
          <Link href="/signup" className="hover:text-zinc-900">
            Sign Up
          </Link>
          <a href="#" className="hover:text-zinc-900">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}
