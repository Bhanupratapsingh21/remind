"use client";

import { AgentMascot } from "@/components/AgentMascot";
import { CloudShader } from "@/components/ui/cloud-shader";
import { Wordmark } from "./SiteNav";

interface AuthShellProps {
  /** Shown top-right of the form column (e.g. a "back" action) */
  topRight?: React.ReactNode;
  /** Line under the form card (e.g. "Don't have an account?") */
  footer?: React.ReactNode;
  /** Big line on the sky panel */
  tagline?: string;
  children: React.ReactNode;
}

/**
 * Split layout for login / signup / onboarding: cloud-sky panel with the agent on the
 * left (hidden on small screens), rounded form card on the right.
 */
export function AuthShell({ topRight, footer, tagline = "Your reminders, now with a voice.", children }: AuthShellProps) {
  return (
    <div className="grid min-h-screen bg-canvas p-3 text-ink antialiased selection:bg-amber-100 sm:p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-4">
      {/* Sky panel */}
      <aside className="relative hidden overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#3f5f99,#f4d4b8)] lg:block">
        <div className="absolute inset-0">
          <CloudShader skyTopColor="#3f5f99" skyBottomColor="#f4d4b8" cloudColor="#fff1e4" speed={0.6} count={5} />
        </div>
        <div className="relative flex h-full flex-col justify-between p-10">
          <span className="w-fit rounded-2xl bg-white/70 px-3 py-1.5 backdrop-blur">
            <Wordmark small />
          </span>
          <div className="flex flex-col items-center text-center">
            <AgentMascot size={150} />
            <p className="mt-6 max-w-sm font-display text-4xl leading-[1.1] tracking-[-0.03em] text-zinc-950">{tagline}</p>
            <p className="mt-3 max-w-xs font-serif text-[16px] text-zinc-700">
              It calls, it listens, and it checks things off for you.
            </p>
          </div>
          <p className="text-[12px] text-zinc-700/80">Calls only inside your calling hours. Never while you sleep.</p>
        </div>
      </aside>

      {/* Form column */}
      <main className="flex min-h-[calc(100vh-1.5rem)] flex-col rounded-[28px] bg-white px-5 py-6 sm:px-10 lg:min-h-0">
        <div className="flex items-center justify-between">
          <span className="lg:invisible">
            <Wordmark />
          </span>
          {topRight}
        </div>

        <div className="mx-auto my-auto w-full max-w-xl py-12">
          {/* the agent greets you on small screens, where the sky panel is hidden */}
          <AgentMascot size={64} className="-ml-3 mb-2 lg:hidden" />
          {children}
        </div>

        {footer && <div className="text-center font-mono text-[12px] text-zinc-400">{footer}</div>}
      </main>
    </div>
  );
}
