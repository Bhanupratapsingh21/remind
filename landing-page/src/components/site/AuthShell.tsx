"use client";

import { Aurora } from "./Aurora";

interface AuthShellProps {
  /** Shown top-right of the form column (e.g. a "back" action) */
  topRight?: React.ReactNode;
  /** Line under the form card (e.g. "Don't have an account?") */
  footer?: React.ReactNode;
  /** Big line on the side panel */
  tagline?: string;
  children: React.ReactNode;
}

/**
 * Split layout for login / signup / onboarding. Left: the footer's aurora panel with the
 * tagline and a giant cropped wordmark (hidden on small screens). Right: a white form card
 * that runs flush to the right edge of the window like a strap.
 */
export function AuthShell({ topRight, footer, tagline = "Your reminders, now with a voice.", children }: AuthShellProps) {
  return (
    <div className="grid min-h-screen bg-canvas p-3 text-ink antialiased selection:bg-amber-100 sm:p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-4 lg:pr-0">
      {/* Aurora panel: gradient fills the whole panel, tagline sits at its exact centre */}
      <aside className="relative hidden overflow-hidden rounded-[28px] bg-peach text-zinc-950 lg:block">
        <div className="absolute inset-0">
          <Aurora className="h-full" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
          <p className="max-w-sm font-display text-4xl leading-[1.1] tracking-[-0.03em] text-white">{tagline}</p>
          <p className="mt-3 max-w-xs font-serif text-[16px] text-white/70">
            It calls, it listens, and it checks things off for you.
          </p>
        </div>
        {/* giant wordmark, cropped by the panel's bottom edge */}
        <p
          aria-hidden
          className="pointer-events-none absolute -bottom-[0.26em] right-5 select-none font-sans text-[clamp(6rem,14vw,13rem)] font-bold leading-[0.85] tracking-[-0.06em] text-zinc-950"
        >
          remind
        </p>
      </aside>

      {/* Form strap */}
      <main className="flex min-h-[calc(100vh-1.5rem)] flex-col rounded-[28px] bg-white px-5 py-6 sm:px-10 lg:min-h-0 lg:rounded-r-none lg:px-14 xl:px-20">
        <div className="flex min-h-9 items-center justify-end">{topRight}</div>

        <div className="mx-auto my-auto w-full max-w-xl py-12">
          {children}
        </div>

        {footer && <div className="text-center font-mono text-[12px] text-zinc-400">{footer}</div>}
      </main>
    </div>
  );
}
