"use client";

import React, { useState } from "react";
import { Check, Moon } from "lucide-react";
import { Eyebrow } from "@/components/site/Eyebrow";

const FEATURES = [
  "Calls hold silently until your morning start time.",
  "Custom snooze pacing (10 min, 30 min, or 1 hour).",
  "Configurable retry limits to guarantee zero spam.",
  "Live call transcripts and task status logged in dashboard.",
];

export function QuietHoursSection() {
  const [enabled, setEnabled] = useState(true);

  return (
    <section className="w-full px-4 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
        <div>
          <Eyebrow>Call preferences & control</Eyebrow>
          <h2 className="font-display text-4xl leading-[1.08] tracking-[-0.03em] text-zinc-950 sm:text-5xl">
            Total peace when you sleep.
            <br />
            Focus when you work.
          </h2>
          <p className="mt-6 max-w-md font-serif text-[17px] leading-relaxed text-zinc-500">
            Configure quiet windows, customize snooze intervals, and set retry limits so Remind respects your calendar and
            personal space.
          </p>
        </div>

        <div className="rounded-[28px] bg-[linear-gradient(160deg,#1d2140_0%,#2b2f55_55%,#4a3f5c_100%)] p-3">
          <div className="rounded-[22px] bg-white p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-50 text-indigo-500">
                  <Moon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[15px] font-medium text-zinc-950">Do Not Disturb window</p>
                  <p className="font-mono text-[12px] text-zinc-400">10:00 PM — 8:00 AM (your local time)</p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => setEnabled(!enabled)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  enabled ? "bg-zinc-950" : "bg-zinc-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-sm transition duration-200 ${
                    enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <ul className="mt-6 space-y-3 border-t border-zinc-100 pt-6">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-[14px] text-zinc-600">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-600">
                    <Check className="h-3 w-3" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
