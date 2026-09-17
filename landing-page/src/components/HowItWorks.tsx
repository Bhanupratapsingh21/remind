"use client";

import React from "react";

export function HowItWorks() {
  return (
    <section className="w-full bg-white pt-12 pb-28 sm:pb-36 px-6">
      <div className="mx-auto max-w-5xl">
        {/* HOW IT WORKS HEADER */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-400 font-medium">
            SIMPLE 3-STEP FLOW
          </p>
          <h2 className="mt-4 text-4xl sm:text-5xl font-normal text-[#151515] tracking-tight leading-[1.12]">
            Set it once.
            <br />
            Remind handles the call.
          </h2>
        </div>

        {/* 3 STEPS */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12">
          {/* Step 1 */}
          <div>
            <span className="font-mono text-xs text-neutral-400">01</span>
            <h3 className="mt-4 text-base sm:text-lg font-medium text-[#151515]">
              Create your reminder.
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-neutral-500 leading-relaxed">
              Schedule your task and time directly on the web dashboard.
            </p>
          </div>

          {/* Step 2 */}
          <div>
            <span className="font-mono text-xs text-neutral-400">02</span>
            <h3 className="mt-4 text-base sm:text-lg font-medium text-[#151515]">
              Pick up the phone.
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-neutral-500 leading-relaxed">
              At the exact minute, Remind calls you and speaks your task out loud.
            </p>
          </div>

          {/* Step 3 */}
          <div>
            <span className="font-mono text-xs text-neutral-400">03</span>
            <h3 className="mt-4 text-base sm:text-lg font-medium text-[#151515]">
              Speak to update or snooze.
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-neutral-500 leading-relaxed">
              Tell the agent you did it, or ask it to call back in 30 minutes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
