"use client";

import { Bell, History, Smartphone, Timer } from "lucide-react";
import { Eyebrow } from "@/components/site/Eyebrow";
import { Reveal } from "@/components/site/Reveal";
import { PhoneCallMock } from "@/components/PhoneCallMock";

const PERKS = [
  { icon: Bell, title: "Push + call", text: "A silent heads-up before the phone rings." },
  { icon: Timer, title: "One-tap snooze", text: "Push the call back 10, 30 or 60 minutes." },
  { icon: History, title: "Call history", text: "Transcripts and outcomes for every reminder." },
];

/* Store badges, dark pills with "Coming soon" since the apps are not published yet */
function StoreBadge({ store, note }: { store: string; note: string }) {
  return (
    <span className="flex items-center gap-3 rounded-2xl bg-zinc-950 px-4 py-2.5 text-white">
      <Smartphone className="h-6 w-6 text-zinc-300" />
      <span className="leading-tight">
        <span className="block text-[10px] uppercase tracking-wider text-zinc-400">{note}</span>
        <span className="block text-[15px] font-medium">{store}</span>
      </span>
    </span>
  );
}

export function MobileAppSection() {
  return (
    <section id="app" className="scroll-mt-20 px-3 pb-24 sm:px-4 sm:pb-32">
      <div className="relative mx-auto grid max-w-[1888px] items-center gap-10 overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#a9c8ea_0%,#d8e3ef_45%,#f3dcc6_100%)] px-6 py-16 sm:px-12 md:grid-cols-2 lg:px-20">
        <div className="pointer-events-none absolute -top-24 right-[30%] h-72 w-96 rounded-full bg-[radial-gradient(circle,rgba(255,206,150,.7),transparent_70%)] blur-2xl" />

        <Reveal className="relative">
          <Eyebrow>Mobile app</Eyebrow>
          <h2 className="font-display text-4xl leading-[1.08] tracking-[-0.03em] text-zinc-950 sm:text-5xl">
            Your agent,
            <br />
            in your pocket.
          </h2>
          <p className="mt-5 max-w-md font-serif text-[17px] leading-relaxed text-zinc-700">
            Calls already work on any phone with no app at all. The Remind app adds the little things around the call.
          </p>

          <ul className="mt-8 space-y-4">
            {PERKS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/80 text-amber-600">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[15px] font-medium text-zinc-950">{title}</p>
                  <p className="text-[14px] text-zinc-600">{text}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <StoreBadge store="App Store" note="Coming soon" />
            <StoreBadge store="Google Play" note="Coming soon" />
          </div>
        </Reveal>

        <Reveal delay={0.15} y={40} className="relative">
          <PhoneCallMock />
        </Reveal>
      </div>
    </section>
  );
}
