"use client";

import React from "react";
import { CalendarPlus, Check, Clock3, Mic, PhoneIncoming, UserPlus, X } from "lucide-react";
import { Eyebrow } from "@/components/site/Eyebrow";
import { Reveal } from "@/components/site/Reveal";

/* Small UI previews, one per step */

function SignUpPreview() {
  return (
    <div className="space-y-2">
      <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-zinc-200">
        <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">Phone number</p>
        <p className="font-mono text-[13px] text-zinc-900">+91 98765 43210</p>
      </div>
      <p className="flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
        <Check className="h-3 w-3" /> Saved
      </p>
    </div>
  );
}

function CreatePreview() {
  const rows = [
    ["Title", "Send invoice"],
    ["Time", "4:00 PM"],
    ["Voice", "Naina"],
    ["Style", "Friendly"],
  ];
  return (
    <dl className="divide-y divide-zinc-100 rounded-xl bg-white ring-1 ring-zinc-200">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-center justify-between px-3 py-1.5">
          <dt className="text-[12px] text-zinc-400">{k}</dt>
          <dd className="text-[13px] font-medium text-zinc-900">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function RingPreview() {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-zinc-950 px-3 py-3 text-white">
      <span className="relative grid h-10 w-10 shrink-0 place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/40 [animation-duration:1.8s]" />
        <span className="relative grid h-10 w-10 place-items-center rounded-full bg-emerald-500">
          <PhoneIncoming className="h-4 w-4" />
        </span>
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-medium">remind is calling…</p>
        <p className="truncate text-[11px] text-white/55">Send invoice · 4:00 PM</p>
      </div>
    </div>
  );
}

function TalkPreview() {
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-medium text-emerald-700">
        <Check className="h-3 w-3" /> &ldquo;Done&rdquo;
      </span>
      <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[12px] font-medium text-amber-800">
        <Clock3 className="h-3 w-3" /> &ldquo;In 30 minutes&rdquo;
      </span>
      <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-[12px] font-medium text-zinc-600">
        <X className="h-3 w-3" /> &ldquo;Cancel it&rdquo;
      </span>
    </div>
  );
}

const STEPS = [
  {
    icon: UserPlus,
    title: "Sign up and add your number.",
    text: "Create an account with your email, then add the phone number Remind should call.",
    preview: SignUpPreview,
  },
  {
    icon: CalendarPlus,
    title: "Create a reminder.",
    text: "Give it a title and a time, then pick the voice and call style.",
    preview: CreatePreview,
  },
  {
    icon: PhoneIncoming,
    title: "Your phone rings.",
    text: "Right on time, the agent calls and tells you what's due. Miss it and it tries again.",
    preview: RingPreview,
  },
  {
    icon: Mic,
    title: "Talk back.",
    text: "Say it's done, ask for a call back later, or cancel it. Your dashboard updates.",
    preview: TalkPreview,
  },
];

export function HowItWorks() {
  return (
    <section className="w-full px-4 pb-24 pt-12 sm:pb-32">
      <div className="mx-auto max-w-7xl">
        <Reveal className="text-center">
          <div className="flex justify-center">
            <Eyebrow>How it works</Eyebrow>
          </div>
          <h2 className="font-display text-4xl leading-[1.08] tracking-[-0.03em] text-zinc-950 sm:text-5xl">
            Set it once.
            <br />
            Remind handles the call.
          </h2>
          <p className="mx-auto mt-5 max-w-lg font-serif text-[17px] leading-relaxed text-zinc-500">
            Four steps from sign-up to a finished task. No app to install, it works on any phone.
          </p>
        </Reveal>

        <ol className="mt-12 grid grid-cols-1 gap-3 rounded-[28px] bg-tray p-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, text, preview: Preview }, i) => (
            <li key={title} className="flex">
              <Reveal delay={i * 0.08} className="flex w-full flex-col rounded-[22px] bg-white p-6">
                <div className="flex items-center justify-between">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-night font-mono text-[13px] text-amber-200">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Icon className="h-5 w-5 text-zinc-400" aria-hidden />
                </div>
                <h3 className="mt-6 text-lg font-medium leading-snug text-zinc-950">{title}</h3>
                <p className="mt-1.5 font-serif text-[15px] leading-relaxed text-zinc-500">{text}</p>
                <div className="mt-auto pt-6">
                  <div className="rounded-2xl bg-zinc-50 p-3">
                    <Preview />
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
