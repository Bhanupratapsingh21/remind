"use client";

import React, { useState } from "react";
import { Check, Globe2, Minus, Moon, Plus, RotateCcw, Sun } from "lucide-react";
import { Eyebrow } from "@/components/site/Eyebrow";
import { Reveal } from "@/components/site/Reveal";

const FEATURES = [
  "Calls due outside your calling hours wait until your window opens.",
  "Pick 1 to 10 call attempts and a 1 to 120 minute gap between them.",
  "Snooze by voice: “in 30 minutes” or “tomorrow at 9”.",
  "Every call's transcript and outcome is saved in your dashboard.",
];

function Stepper({ label, value, unit, onChange, min, max, step = 1 }: {
  label: string;
  value: number;
  unit: string;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-zinc-50 px-4 py-3">
      <span className="text-[14px] text-zinc-600">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Decrease ${label.toLowerCase()}`}
          onClick={() => onChange(Math.max(min, value - step))}
          disabled={value <= min}
          className="grid h-7 w-7 place-items-center rounded-lg bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-100 disabled:opacity-40"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span aria-live="polite" className="w-16 text-center font-mono text-[13px] text-zinc-950">
          {value} {unit}
        </span>
        <button
          type="button"
          aria-label={`Increase ${label.toLowerCase()}`}
          onClick={() => onChange(Math.min(max, value + step))}
          disabled={value >= max}
          className="grid h-7 w-7 place-items-center rounded-lg bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-100 disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function QuietHoursSection() {
  const [attempts, setAttempts] = useState(3);
  const [gap, setGap] = useState(10);

  return (
    <section className="w-full px-4 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
        <Reveal>
          <Eyebrow>Call preferences & control</Eyebrow>
          <h2 className="font-display text-4xl leading-[1.08] tracking-[-0.03em] text-zinc-950 sm:text-5xl">
            Peace when you sleep.
            <br />
            Focus when you work.
          </h2>
          <p className="mt-6 max-w-md font-serif text-[17px] leading-relaxed text-zinc-500">
            Set your calling hours, timezone and how persistent Remind should be. It follows your rules on every call.
          </p>
          <ul className="mt-8 space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3 text-[15px] text-zinc-600">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-600">
                  <Check className="h-3 w-3" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.12} className="rounded-[28px] bg-[linear-gradient(160deg,#9cc0e6_0%,#d9e4f0_50%,#f3dcc6_100%)] p-3">
          <div className="rounded-[22px] bg-white p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-medium text-zinc-950">Call settings</p>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">Preview</span>
            </div>

            {/* calling hours */}
            <div className="mt-5 rounded-2xl bg-zinc-50 p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-600">
                  <Moon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[14px] font-medium text-zinc-950">Calling hours</p>
                  <p className="font-mono text-[12px] text-zinc-500">8:00 AM to 10:00 PM, your local time</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-zinc-200">
                  <Sun className="h-4 w-4 text-amber-500" />
                  <span className="text-[12px] text-zinc-500">From</span>
                  <span className="ml-auto font-mono text-[13px] text-zinc-950">08:00</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-zinc-200">
                  <Moon className="h-4 w-4 text-indigo-400" />
                  <span className="text-[12px] text-zinc-500">To</span>
                  <span className="ml-auto font-mono text-[13px] text-zinc-950">22:00</span>
                </div>
              </div>
            </div>

            {/* timezone */}
            <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-zinc-50 px-4 py-3">
              <span className="flex items-center gap-2 text-[14px] text-zinc-600">
                <Globe2 className="h-4 w-4 text-zinc-400" /> Timezone
              </span>
              <span className="truncate font-mono text-[13px] text-zinc-950">Asia/Kolkata</span>
            </div>

            {/* retries, interactive */}
            <div className="mt-3 space-y-2">
              <Stepper label="Call attempts" value={attempts} unit={attempts === 1 ? "try" : "tries"} onChange={setAttempts} min={1} max={10} />
              <Stepper label="Gap between tries" value={gap} unit="min" onChange={setGap} min={5} max={120} step={5} />
            </div>

            <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[13px] leading-snug text-amber-900">
              <RotateCcw className="mt-0.5 h-4 w-4 shrink-0" />
              {attempts === 1
                ? "One call only. If you miss it, Remind won't call again."
                : `If you miss the call, Remind tries up to ${attempts - 1} more ${attempts - 1 === 1 ? "time" : "times"}, ${gap} minutes apart.`}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
