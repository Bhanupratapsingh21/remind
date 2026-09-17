"use client";

import React, { useState } from "react";

export function QuietHoursSection() {
  const [enabled, setEnabled] = useState(true);

  return (
    <section className="w-full bg-white py-24 sm:py-32 px-6">
      <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 items-start">
        {/* Left Column */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-400 font-medium">
            CALL PREFERENCES & CONTROL
          </p>

          <h2 className="mt-4 text-4xl sm:text-5xl font-normal text-[#151515] tracking-tight leading-[1.12]">
            Total peace when
            <br />
            you sleep. Focus
            <br />
            when you work.
          </h2>

          <p className="mt-6 max-w-md text-sm sm:text-base text-neutral-500 leading-relaxed font-normal">
            Configure quiet windows, customize snooze intervals, and set retry limits so Remind respects your calendar and personal space.
          </p>
        </div>

        {/* Right Column: Quiet Hours Card */}
        <div className="md:pt-4">
          <div className="max-w-md">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#151515]">
                Do Not Disturb window
              </span>

              {/* Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => setEnabled(!enabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enabled ? "bg-neutral-900" : "bg-neutral-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <p className="mt-1 font-mono text-xs text-neutral-400">
              10:00 PM — 8:00 AM (Your Local Time)
            </p>

            {/* Hairline divider */}
            <div className="mt-6 border-b border-neutral-200" />

            {/* Features list */}
            <div className="mt-6 space-y-4 text-xs sm:text-sm text-neutral-600">
              <p className="text-neutral-500">
                Calls hold silently until your morning start time.
              </p>
              <p className="text-neutral-500">
                Custom snooze pacing (10 min, 30 min, or 1 hour).
              </p>
              <p className="text-neutral-500">
                Configurable retry limits to guarantee zero spam.
              </p>
              <p className="text-neutral-500">
                Live call transcripts and task status logged in dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
