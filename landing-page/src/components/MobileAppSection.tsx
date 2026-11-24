"use client";

import { Bell, History, Timer } from "lucide-react";
import { Eyebrow } from "@/components/site/Eyebrow";
import { Reveal } from "@/components/site/Reveal";
import { PhoneCallMock } from "@/components/PhoneCallMock";
import { AppStoreBadge, GooglePlayBadge } from "@/components/landing/StoreBadges";

const PERKS = [
  { icon: Bell, title: "Push + call", text: "A silent heads-up before the phone rings." },
  { icon: Timer, title: "One-tap snooze", text: "Push the call back 10, 30 or 60 minutes." },
  { icon: History, title: "Call history", text: "Transcripts and outcomes for every reminder." },
];

export function MobileAppSection() {
  return (
    <section id="app" className="scroll-mt-20 px-4 pb-24 sm:pb-32">
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 overflow-hidden rounded-[28px] bg-[linear-gradient(160deg,#121830_0%,#232648_45%,#4a3550_100%)] px-6 py-16 text-white sm:px-12 md:grid-cols-2 lg:px-20">
        <div className="pointer-events-none absolute -top-24 right-[30%] h-72 w-96 rounded-full bg-[radial-gradient(circle,rgba(246,167,106,.55),transparent_70%)] blur-3xl" />

        <Reveal className="relative">
          <Eyebrow light>Mobile app</Eyebrow>
          <h2 className="font-display text-4xl leading-[1.08] tracking-[-0.03em] text-white sm:text-5xl">
            Your agent,
            <br />
            in your pocket.
          </h2>
          <p className="mt-5 max-w-md font-serif text-[17px] leading-relaxed text-white/70">
            Calls already work on any phone with no app at all. The Remind app adds the little things around the call.
          </p>

          <ul className="mt-8 space-y-4">
            {PERKS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-amber-300">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[15px] font-medium text-white">{title}</p>
                  <p className="text-[14px] text-white/60">{text}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-9">
            <p className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em] text-amber-200/90">
              <span className="whitespace-nowrap rounded-full bg-amber-300/15 px-2.5 py-1 ring-1 ring-amber-300/30">
                Coming soon
              </span>
              <span className="whitespace-nowrap text-white/50">iOS &amp; Android</span>
            </p>
            <div className="flex flex-wrap gap-3">
              <AppStoreBadge />
              <GooglePlayBadge />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15} y={40} className="relative">
          <PhoneCallMock />
        </Reveal>
      </div>
    </section>
  );
}
