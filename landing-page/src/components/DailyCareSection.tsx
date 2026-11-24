"use client";

import React from "react";
import {
  CalendarPlus,
  Check,
  Clock3,
  FileText,
  Globe2,
  Mic,
  Moon,
  PhoneCall,
  PhoneMissed,
  RotateCcw,
  Sun,
  Volume2,
  X,
} from "lucide-react";
import { Eyebrow } from "@/components/site/Eyebrow";
import { Reveal } from "@/components/site/Reveal";

/* ---------- shared card shell ---------- */

interface BentoCardProps {
  icon: React.ElementType;
  kicker: string;
  title: string;
  text: string;
  className?: string;
  /** illustrative UI snippet */
  children: React.ReactNode;
  /** put the snippet above the copy instead of below */
  visualFirst?: boolean;
  dark?: boolean;
  delay?: number;
}

function BentoCard({ icon: Icon, kicker, title, text, className = "", children, visualFirst, dark, delay = 0 }: BentoCardProps) {
  const copy = (
    <div>
      <div className="flex items-center gap-2">
        <span
          className={`grid h-8 w-8 place-items-center rounded-xl ${dark ? "bg-white/10 text-amber-300" : "bg-amber-50 text-amber-600"}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className={`font-mono text-[10px] uppercase tracking-[0.16em] ${dark ? "text-white/50" : "text-zinc-400"}`}>
          {kicker}
        </span>
      </div>
      <h3 className={`mt-4 font-display text-[22px] leading-tight tracking-[-0.02em] sm:text-2xl ${dark ? "text-white" : "text-zinc-950"}`}>
        {title}
      </h3>
      <p className={`mt-2 font-serif text-[15px] leading-relaxed ${dark ? "text-white/65" : "text-zinc-500"}`}>{text}</p>
    </div>
  );
  const visual = (
    <div className={visualFirst ? "mb-6 flex w-full flex-1 items-center justify-center" : "mt-6"}>{children}</div>
  );

  return (
    <Reveal
      delay={delay}
      className={`flex flex-col overflow-hidden rounded-[22px] p-6 sm:p-7 ${
        dark ? "bg-[linear-gradient(160deg,#121830_0%,#232648_55%,#4a3550_100%)] text-white" : "bg-white"
      } ${visualFirst ? "" : "justify-between"} ${className}`}
    >
      {visualFirst ? (
        <>
          {visual}
          <div className="mt-auto">{copy}</div>
        </>
      ) : (
        <>
          {copy}
          {visual}
        </>
      )}
    </Reveal>
  );
}

/* ---------- mini UI snippets ---------- */

function IncomingCall() {
  return (
    <div className="relative mx-auto w-full max-w-[300px] rounded-[30px] bg-black/35 p-5 ring-1 ring-white/10 backdrop-blur">
      <p className="text-center font-mono text-[10px] uppercase tracking-widest text-white/50">Incoming call</p>
      <div className="relative mx-auto mt-4 grid h-16 w-16 place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-amber-300/30 [animation-duration:2s]" />
        <span className="relative grid h-16 w-16 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffe2b8,#f6a76a)] text-zinc-950">
          <PhoneCall className="h-6 w-6" />
        </span>
      </div>
      <p className="mt-3 text-center text-lg font-medium text-white">remind</p>
      <p className="text-center text-[13px] text-white/60">Pay the electricity bill · 6:30 PM</p>
      <div className="mt-6 flex justify-around">
        <span aria-hidden className="grid h-12 w-12 place-items-center rounded-full bg-red-500">
          <PhoneCall className="h-5 w-5 rotate-[135deg]" />
        </span>
        <span aria-hidden className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500">
          <PhoneCall className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

function TalkBack() {
  return (
    <div className="space-y-2.5 rounded-2xl bg-zinc-50 p-4">
      <p className="max-w-[85%] rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-[13.5px] leading-snug text-zinc-800 shadow-sm">
        Did you send the invoice to Rahul?
      </p>
      <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-zinc-900 px-3.5 py-2.5 text-[13.5px] leading-snug text-white">
        Not yet. Call me in 30 minutes.
      </p>
      <div className="flex flex-wrap gap-1.5 pt-1">
        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-medium text-emerald-700">
          <Check className="h-3 w-3" /> Done
        </span>
        <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[12px] font-medium text-amber-800 ring-1 ring-amber-300">
          <Clock3 className="h-3 w-3" /> Snoozed to 4:30 PM
        </span>
        <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-[12px] font-medium text-zinc-600">
          <X className="h-3 w-3" /> Cancel
        </span>
      </div>
    </div>
  );
}

function RetryTimeline() {
  const tries = [
    { n: 1, label: "6:30", state: "missed" },
    { n: 2, label: "6:40", state: "missed" },
    { n: 3, label: "6:50", state: "answered" },
  ] as const;
  return (
    <div className="rounded-2xl bg-zinc-50 p-4">
      <ol className="flex items-start justify-between">
        {tries.map((t, i) => (
          <React.Fragment key={t.n}>
            <li className="flex flex-col items-center gap-1.5">
              <span
                className={`grid h-10 w-10 place-items-center rounded-full ${
                  t.state === "answered" ? "bg-emerald-500 text-white" : "bg-white text-zinc-400 ring-1 ring-zinc-200"
                }`}
              >
                {t.state === "answered" ? <PhoneCall className="h-4 w-4" /> : <PhoneMissed className="h-4 w-4" />}
              </span>
              <span className="text-[12px] font-medium text-zinc-800">Try {t.n}</span>
              <span className="font-mono text-[10px] text-zinc-400">{t.label} PM</span>
            </li>
            {i < tries.length - 1 && (
              <li aria-hidden className="mt-5 flex flex-1 flex-col items-center px-1">
                <span className="h-px w-full border-t border-dashed border-zinc-300" />
                <span className="mt-1 font-mono text-[10px] text-zinc-400">+10 min</span>
              </li>
            )}
          </React.Fragment>
        ))}
      </ol>
    </div>
  );
}

function CallingHours() {
  // 08:00 to 22:00 on a 24h track
  const start = (8 / 24) * 100;
  const end = (22 / 24) * 100;
  return (
    <div className="rounded-2xl bg-zinc-50 p-4">
      <div className="flex items-center justify-between font-mono text-[11px] text-zinc-500">
        <span className="flex items-center gap-1">
          <Sun className="h-3.5 w-3.5 text-amber-500" /> 8:00 AM
        </span>
        <span className="flex items-center gap-1">
          10:00 PM <Moon className="h-3.5 w-3.5 text-indigo-400" />
        </span>
      </div>
      <div className="relative mt-3 h-2.5 rounded-full bg-zinc-200">
        <span
          className="absolute inset-y-0 rounded-full bg-gradient-to-r from-amber-300 to-amber-500"
          style={{ left: `${start}%`, right: `${100 - end}%` }}
        />
        <span
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-500 bg-white shadow"
          style={{ left: `${start}%` }}
        />
        <span
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-500 bg-white shadow"
          style={{ left: `${end}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-zinc-400">
        <span>12a</span>
        <span>6a</span>
        <span>12p</span>
        <span>6p</span>
        <span>12a</span>
      </div>
    </div>
  );
}

function TimezoneClock() {
  // static 9:00, so server and client render the same markup
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-zinc-50 p-4">
      <div className="relative h-16 w-16 shrink-0 rounded-full bg-white shadow-sm ring-1 ring-zinc-200">
        <span className="absolute left-1/2 top-1.5 h-1 w-1 -translate-x-1/2 rounded-full bg-zinc-300" />
        <span className="absolute right-1.5 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-zinc-300" />
        <span className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-zinc-300" />
        <span className="absolute left-1.5 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-zinc-300" />
        {/* hour hand at 9 */}
        <span className="absolute left-1/2 top-1/2 h-[3px] w-[18px] -translate-y-1/2 origin-left rotate-180 rounded-full bg-zinc-900" />
        {/* minute hand at 12 */}
        <span className="absolute bottom-1/2 left-1/2 h-[24px] w-[2px] -translate-x-1/2 rounded-full bg-zinc-900" />
        <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500" />
      </div>
      <div className="min-w-0">
        <p className="text-[15px] font-medium text-zinc-950">9:00 AM, your time</p>
        <p className="truncate font-mono text-[11px] text-zinc-400">Asia/Kolkata · or any zone</p>
      </div>
    </div>
  );
}

const VOICES = ["Naina", "Sagar", "Clara", "Kai", "Emma"];
const STYLES = ["Friendly", "Professional", "Disciplined", "Gentle", "Hinglish"];
const VOICE_TINTS = ["#f6a76a", "#9cc0e6", "#e8b4c8", "#a7d7c5", "#f3d27a"];

function VoicesAndStyles() {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {VOICES.map((v, i) => (
          <span
            key={v}
            className="flex items-center gap-1.5 rounded-full bg-white/10 py-1 pl-1 pr-3 text-[13px] text-white ring-1 ring-white/10"
          >
            <span
              className="grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold text-zinc-950"
              style={{ background: VOICE_TINTS[i] }}
            >
              {v[0]}
            </span>
            {v}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {STYLES.map((s, i) => (
          <span
            key={s}
            className={`rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider ${
              i === 0 ? "bg-amber-300 text-zinc-950" : "bg-white/5 text-white/70 ring-1 ring-white/15"
            }`}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

function NewByVoice() {
  return (
    <div className="space-y-2.5 rounded-2xl bg-zinc-50 p-4">
      <p className="ml-auto max-w-[92%] rounded-2xl rounded-br-md bg-zinc-900 px-3.5 py-2.5 text-[13.5px] leading-snug text-white">
        Also remind me to call Mom tomorrow at 9.
      </p>
      <p className="flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-medium text-emerald-700">
        <CalendarPlus className="h-3.5 w-3.5" /> Reminder created · Tomorrow 9:00 AM
      </p>
    </div>
  );
}

function TranscriptLog() {
  const rows = [
    { title: "Send invoice to Rahul", time: "4:30 PM", status: "Completed", quote: "Done, sent it just now.", tone: "bg-emerald-50 text-emerald-700" },
    { title: "Gym session", time: "7:00 AM", status: "Snoozed", quote: "Call me tomorrow at 9.", tone: "bg-amber-50 text-amber-800" },
    { title: "Book dentist", time: "11:00 AM", status: "Cancelled", quote: "Drop this one, already booked.", tone: "bg-zinc-100 text-zinc-600" },
  ];
  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-zinc-100">
      <div className="flex items-center gap-1.5 border-b border-zinc-100 bg-zinc-50 px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
        <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
        <span className="h-2 w-2 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-[11px] text-zinc-400">Dashboard · Call history</span>
      </div>
      <ul className="divide-y divide-zinc-100 bg-white">
        {rows.map((r) => (
          <li key={r.title} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="min-w-0 sm:w-44 sm:shrink-0">
              <p className="truncate text-[14px] font-medium text-zinc-900">{r.title}</p>
              <p className="font-mono text-[11px] text-zinc-400">{r.time}</p>
            </div>
            <p className="min-w-0 flex-1 truncate font-serif text-[14px] italic text-zinc-500">&ldquo;{r.quote}&rdquo;</p>
            <span className={`w-fit shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${r.tone}`}>{r.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- section ---------- */

export function DailyCareSection() {
  return (
    <section id="features" className="w-full scroll-mt-24 px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal className="flex flex-col justify-between gap-8 pb-12 md:flex-row md:items-end">
          <div>
            <Eyebrow>Real-time accountability</Eyebrow>
            <h2 className="font-display text-4xl leading-[1.08] tracking-[-0.03em] text-zinc-950 sm:text-5xl">
              For the commitments
              <br />
              you can&apos;t afford to drop.
            </h2>
          </div>

          <div className="space-y-1 font-serif text-[16px] leading-relaxed text-zinc-500">
            <p>Push alerts get swiped away.</p>
            <p>Alarms get snoozed into oblivion.</p>
            <p className="text-zinc-900">A phone call gets things done.</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-3 rounded-[28px] bg-tray p-3 md:grid-cols-2 lg:grid-cols-6">
          <BentoCard
            dark
            visualFirst
            icon={PhoneCall}
            kicker="Real calls"
            title="Your phone actually rings."
            text="At the minute you set, an AI agent calls your number and tells you what's due. Any phone works, no app needed."
            className="md:col-span-2 lg:col-span-3 lg:row-span-2"
          >
            <div className="w-full py-4 sm:py-8">
              <IncomingCall />
            </div>
          </BentoCard>

          <BentoCard
            icon={Mic}
            kicker="Talk back"
            title="Answer like it's a person."
            text="Say you're done, ask for a call back in 30 minutes or tomorrow at 9, or cancel it. It updates instantly."
            className="lg:col-span-3"
            delay={0.05}
          >
            <TalkBack />
          </BentoCard>

          <BentoCard
            icon={RotateCcw}
            kicker="Retries"
            title="Missed it? It calls again."
            text="Choose how many tries (up to 10) and the gap between them. It stops as soon as you pick up."
            className="lg:col-span-3"
            delay={0.1}
          >
            <RetryTimeline />
          </BentoCard>

          <BentoCard
            icon={Moon}
            kicker="Calling hours"
            title="Never a call at 3 AM."
            text="Set your calling hours. Anything due outside them waits until your window opens."
            className="lg:col-span-2"
          >
            <CallingHours />
          </BentoCard>

          <BentoCard
            icon={Globe2}
            kicker="Timezone aware"
            title="Runs on your clock."
            text="Reminders follow your timezone, so 9 AM means your 9 AM, wherever you are."
            className="lg:col-span-2"
            delay={0.05}
          >
            <TimezoneClock />
          </BentoCard>

          <BentoCard
            dark
            icon={Volume2}
            kicker="Voices & styles"
            title="5 voices. 5 call styles."
            text="Pick who calls and how they talk, from a friendly nudge to a disciplined push, or Hinglish."
            className="md:col-span-2 lg:col-span-2"
            delay={0.1}
          >
            <VoicesAndStyles />
          </BentoCard>

          <BentoCard
            icon={FileText}
            kicker="Transcripts"
            title="Every call, written down."
            text="See what was said and how each reminder ended, right in your dashboard."
            className="md:col-span-2 lg:col-span-4"
          >
            <TranscriptLog />
          </BentoCard>

          <BentoCard
            icon={CalendarPlus}
            kicker="New by voice"
            title="Add one mid-call."
            text="Remembered something else? Just say it and a new reminder is set."
            className="md:col-span-2 lg:col-span-2"
            delay={0.05}
          >
            <NewByVoice />
          </BentoCard>
        </div>
      </div>
    </section>
  );
}
