"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  BellRing,
  CalendarClock,
  Check,
  ChevronDown,
  Clock,
  Languages,
  MessageCircle,
  Mic,
  Moon,
  PhoneCall,
  PhoneIncoming,
  Repeat,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";


/* Small "● LABEL" eyebrow used above every section heading */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">
      <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
      {children}
    </p>
  );
}

function Nav() {
  const links = [
    { label: "Product", menu: true },
    { label: "How it works" },
    { label: "Voices" },
    { label: "Testimonials" },
    { label: "Help", menu: true },
    { label: "Blog" },
    { label: "Pricing" },
  ];
  return (
    <header className="sticky top-0 z-50 bg-[#fbfbfb]/85 backdrop-blur-md">
      <nav className="mx-auto flex h-[68px] max-w-[1880px] items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-10">
          {/* Same wordmark as the current home page */}
          <Link
            href="/demoui"
            className="text-2xl font-bold tracking-tighter text-[#151515] transition-opacity hover:opacity-80"
          >
            remind
          </Link>
          <ul className="hidden items-center gap-6 text-[15px] font-medium text-zinc-800 lg:flex">
            {links.map((l) => (
              <li key={l.label} className="flex cursor-pointer items-center gap-1 hover:text-zinc-500">
                {l.label}
                {l.menu && <ChevronDown className="h-4 w-4 text-zinc-500" />}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="rounded-xl border border-zinc-900 px-4 py-2 text-[15px] font-medium text-zinc-900 hover:bg-zinc-100"
          >
            Login
          </Link>
          <Link href="/signup" className="rounded-xl bg-zinc-950 px-4 py-2 text-[15px] font-medium text-white hover:bg-zinc-800">
            Sign Up
          </Link>
        </div>
      </nav>
    </header>
  );
}

/* One fluffy cloud built from overlapping shaded puffs (lit from the top, blue-grey underside) */
const PUFFS = [
  { l: 0, t: 38, s: 34 },
  { l: 18, t: 18, s: 44 },
  { l: 40, t: 0, s: 50 },
  { l: 64, t: 22, s: 38 },
  { l: 78, t: 40, s: 26 },
  { l: 28, t: 40, s: 36 },
  { l: 52, t: 38, s: 34 },
];

function Cloud({
  className = "",
  width = 320,
  drift = 18,
  delay = 0,
}: {
  className?: string;
  width?: number;
  drift?: number;
  delay?: number;
}) {
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute ${className}`}
      style={{ width, height: width * 0.48 }}
      animate={{ x: [0, drift, 0] }}
      transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <div className="relative h-full w-full" style={{ filter: "blur(3px)" }}>
        {PUFFS.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${p.l}%`,
              top: `${p.t}%`,
              width: `${p.s}%`,
              aspectRatio: "1",
              background:
                "radial-gradient(circle at 45% 28%, rgba(255,255,255,.98) 0%, rgba(246,249,253,.95) 40%, rgba(222,232,244,.9) 72%, rgba(205,219,236,.6) 100%)",
            }}
          />
        ))}
        {/* flat soft base */}
        <span
          className="absolute rounded-full"
          style={{
            left: "4%",
            right: "6%",
            top: "62%",
            height: "30%",
            background: "radial-gradient(ellipse at 50% 30%, rgba(236,242,249,.95) 0%, rgba(206,220,237,.75) 60%, transparent 100%)",
            filter: "blur(8px)",
          }}
        />
      </div>
    </motion.div>
  );
}

/* Sky backdrop: blue gradient, warm sun glow and drifting clouds */
function SkyBackdrop({ dense = true }: { dense?: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#b9d3ef_0%,#cddff3_35%,#e3ebf5_70%,#eef1f6_100%)]" />
      <div className="absolute -top-40 right-[18%] h-[420px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(255,214,170,.75)_0%,rgba(255,225,190,.35)_40%,transparent_70%)] blur-2xl" />
      <Cloud className="left-[5%] top-[10%] opacity-75" width={260} />
      <Cloud className="left-[10%] top-[30%] opacity-90" width={230} drift={-14} delay={3} />
      <Cloud className="right-[3%] top-[22%] opacity-90" width={340} drift={-20} delay={1} />
      {dense && (
        <>
          <Cloud className="left-[-5%] top-[50%] opacity-80" width={380} drift={16} delay={5} />
          <Cloud className="right-[-4%] top-[46%] opacity-85" width={420} drift={-16} delay={2} />
          <Cloud className="left-[36%] top-[3%] opacity-40" width={150} drift={10} delay={7} />
        </>
      )}
    </div>
  );
}

const MODES = [
  {
    icon: BellRing,
    label: "Ring Mode",
    text: "Your phone rings at the exact time and a short voice reads your reminder. Free forever, no app needed.",
  },
  {
    icon: PhoneCall,
    label: "AI Call Mode",
    text: "One app for every reminder that matters. Start free with a ring and move to Remind Pro when you want an AI voice that listens, snoozes and checks things off.",
  },
  {
    icon: Moon,
    label: "Quiet Hours",
    text: "Remind never calls while you sleep. Anything due at night waits politely for your morning window.",
  },
];

function AnimatedHeadline() {
  const words = ["Remind.", "Ring.", "Done."];
  return (
    <h1 className="flex flex-wrap justify-center gap-x-[0.28em] font-display text-[clamp(3rem,7.4vw,5.6rem)] font-normal leading-[1.05] tracking-[-0.035em] text-zinc-950">
      {words.map((w, i) => (
        <motion.span
          key={w}
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: 0.15 + i * 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {w}
        </motion.span>
      ))}
    </h1>
  );
}

function Hero() {
  const [mode, setMode] = useState(1);
  const [clicked, setClicked] = useState(false);

  return (
    <section className="px-3 sm:px-4">
      <div className="relative mx-auto max-w-[1888px] overflow-hidden rounded-[28px]">
        <SkyBackdrop />
        <div className="relative px-4 pt-14 text-center">
          <motion.a
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-zinc-950 py-1.5 pl-1.5 pr-3.5 text-[13px] text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,.45)]"
          >
            <span className="rounded-full bg-sky-200 px-2 py-0.5 text-[10px] font-semibold text-sky-900">NEW</span>
            <span className="font-medium">Snooze by voice is here</span>
            <span className="hidden text-zinc-400 sm:inline">See what&apos;s new</span>
            <ArrowRight className="h-3.5 w-3.5 text-zinc-300" />
          </motion.a>

          {/* Mode switcher with "Click me" hint */}
          <div className="relative mx-auto mt-9 w-fit">
            <div className="flex flex-wrap justify-center gap-0.5 rounded-2xl bg-white/55 p-1 backdrop-blur-md">
              {MODES.map(({ icon: Icon, label }, i) => (
                <button
                  key={label}
                  onClick={() => {
                    setMode(i);
                    setClicked(true);
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] transition-colors ${
                    mode === i ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-11">
            <AnimatedHeadline />
          </div>

          <div className="mx-auto mt-6 min-h-[96px] max-w-[600px]">
            <AnimatePresence mode="wait">
              <motion.p
                key={mode}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="font-serif text-[18px] leading-[1.6] text-zinc-500 sm:text-[20px]"
              >
                {MODES[mode].text}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="flex items-center gap-2.5 rounded-xl border border-sky-300 bg-gradient-to-b from-[#eef6ff] to-[#dcebfb] px-6 py-3.5 text-[16px] font-medium text-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_8px_24px_-10px_rgba(14,116,233,.5)] hover:to-[#d2e5fa]"
            >
              <PhoneIncoming className="h-[18px] w-[18px]" />
              Get your first call free
            </Link>
            <a className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-white px-6 py-3.5 text-[16px] text-zinc-900 hover:bg-zinc-50">
              See how Remind works
              <span className="grid h-6 w-6 place-items-center rounded-full bg-zinc-100">
                <ArrowDown className="h-3.5 w-3.5" />
              </span>
            </a>
          </div>

          <p className="mt-7 flex flex-wrap items-center justify-center gap-1.5 text-[14px] text-zinc-500">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            Ignoring notifications?
            <span className="cursor-pointer text-zinc-800 underline underline-offset-2">Try a call instead</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </p>
          <p className="mt-4 flex items-center justify-center gap-3 text-[14px] text-zinc-500">
            Works on any phone
            <Smartphone className="h-4 w-4 text-zinc-400" />
            <PhoneCall className="h-4 w-4 text-zinc-400" />
          </p>

          <DeviceMock />
        </div>
      </div>
    </section>
  );
}

/* Product shot: dark-bezel screen showing the dashboard with an incoming AI call */
function DeviceMock() {
  const lines = [
    { who: "ai", text: "Hey Bhanu, this is your reminder to send the invoice to Rahul. Taking care of it now?" },
    { who: "you", text: "Not yet, call me back in 30 minutes." },
    { who: "ai", text: "Sure, I'll call you again at 4:30 PM." },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto mt-16 max-w-[1120px] rounded-t-[30px] bg-[#1c1c1e] px-3 pt-3 shadow-[0_-10px_60px_-20px_rgba(30,60,110,.35)] sm:px-[18px] sm:pt-[18px]"
    >
      <div className="relative overflow-hidden rounded-t-[16px] bg-[linear-gradient(180deg,#7fb2e5_0%,#a9cbee_40%,#f3d1ad_85%,#f0b98c_100%)] text-left">
        {/* menu bar */}
        <div className="relative flex h-7 items-center justify-between bg-white/25 px-4 text-[11px] text-white backdrop-blur">
          <span className="font-semibold">Remind</span>
          <span>Mon 4:00 PM</span>
        </div>

        <div className="relative grid gap-4 p-4 sm:p-8 md:grid-cols-[1fr_300px]">
          {/* app window */}
          <div className="overflow-hidden rounded-2xl bg-white/95 shadow-2xl shadow-sky-950/20">
            <div className="flex items-center gap-1.5 border-b border-zinc-100 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-3 text-[12px] text-zinc-400">remind.app/dashboard</span>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-[15px] font-medium text-zinc-900">Live call</p>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-700">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> On call · 0:14
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {lines.map((l, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 + i * 0.6 }}
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-snug ${
                      l.who === "ai" ? "bg-zinc-100 text-zinc-800" : "ml-auto bg-sky-500 text-white"
                    }`}
                  >
                    {l.text}
                  </motion.div>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[13px] text-amber-800">
                <Clock className="h-4 w-4" /> Snoozed until 4:30 PM, attempt 2 of 3 queued
              </div>
            </div>
          </div>

          {/* incoming call card */}
          <div className="hidden flex-col rounded-[28px] bg-zinc-950/90 p-6 text-white shadow-2xl backdrop-blur md:flex">
            <p className="text-center font-mono text-[10px] uppercase tracking-widest text-zinc-500">Incoming call</p>
            <div className="mx-auto mt-6 grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-sky-300 to-indigo-400">
              <Mic className="h-8 w-8" />
            </div>
            <p className="mt-4 text-center text-xl font-medium">Remind</p>
            <p className="text-center text-xs text-zinc-400">Send invoice to Rahul · 4:00 PM</p>
            <div className="mt-auto flex justify-around pt-10">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-red-500">
                <PhoneCall className="h-5 w-5 rotate-[135deg]" />
              </span>
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
                className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500"
              >
                <PhoneCall className="h-5 w-5" />
              </motion.span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ChatBubble() {
  return (
    <button
      aria-label="Chat with us"
      className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-zinc-950 text-white shadow-xl hover:bg-zinc-800"
    >
      <MessageCircle className="h-6 w-6 fill-white" />
    </button>
  );
}

function ModesSection() {
  const modes = [
    {
      icon: BellRing,
      title: "Ring",
      plan: "Free",
      desc: "Your phone rings at the right time and a short voice reads the reminder.",
      steps: ["Add a task and a time.", "Your phone rings when it's due.", "Mark it done from the dashboard."],
      best: "Medicines, water breaks, quick nudges",
    },
    {
      icon: PhoneCall,
      title: "AI Call",
      plan: "Pro",
      desc: "A natural voice that talks with you, then completes or snoozes the task.",
      steps: ["Answer the call.", "Say “done” or “call me in an hour”.", "Remind updates the task for you."],
      best: "Deadlines, habits, accountability",
    },
    {
      icon: Repeat,
      title: "Smart Retry",
      plan: "Pro",
      desc: "Missed it? Remind tries again on your schedule and respects quiet hours.",
      steps: ["Call goes unanswered.", "Retry in 10 minutes, up to 3 times.", "Never during your sleep hours."],
      best: "Things you really can't miss",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 text-center">
      <div className="flex justify-center">
        <Eyebrow>Remind has 3 modes</Eyebrow>
      </div>
      <h2 className="font-display text-4xl tracking-[-0.03em] text-zinc-950 sm:text-5xl">
        One reminder, every way to reach you
      </h2>
      <p className="mx-auto mt-4 max-w-lg font-serif text-[17px] text-zinc-500">
        Start with a simple ring. Upgrade when you want a voice that listens back.
      </p>

      <div className="mt-12 grid gap-3 rounded-[28px] bg-zinc-200/50 p-3 text-left md:grid-cols-3">
        {modes.map(({ icon: Icon, title, plan, desc, steps, best }) => (
          <div key={title} className="flex flex-col rounded-[20px] bg-white p-6">
            <div className="flex items-center justify-between">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-600">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                  plan === "Free" ? "bg-zinc-100 text-zinc-600" : "bg-violet-50 text-violet-600"
                }`}
              >
                {plan}
              </span>
            </div>
            <h3 className="mt-5 text-lg font-medium text-zinc-950">{title}</h3>
            <p className="mt-1.5 font-serif text-[15px] leading-relaxed text-zinc-500">{desc}</p>
            <ol className="mt-5 space-y-2.5">
              {steps.map((s, i) => (
                <li key={s} className="flex gap-3 text-[14px] text-zinc-700">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-sky-50 text-[11px] font-medium text-sky-600">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
            <div className="mt-auto pt-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Best for</p>
              <p className="mt-1 text-[14px] text-zinc-700">{best}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureSplit() {
  const features = [
    { icon: Mic, title: "Natural voices", desc: "Pick Elena, Marcus, Sofia or James" },
    { icon: Languages, title: "Speaks your time", desc: "Understands “tomorrow 9 AM” in your timezone" },
    { icon: Moon, title: "Quiet hours", desc: "No calls while you sleep" },
    { icon: CalendarClock, title: "Snooze by voice", desc: "Reschedules itself mid-call" },
    { icon: Repeat, title: "Auto retry", desc: "Retries busy, missed or voicemail" },
    { icon: ShieldCheck, title: "Private by default", desc: "Your number is only used to call you" },
  ];

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-24 md:grid-cols-2">
      <div>
        <Eyebrow>AI Call mode</Eyebrow>
        <h2 className="font-display text-4xl leading-[1.08] tracking-[-0.03em] text-zinc-950 sm:text-5xl">
          A reminder you can
          <br />
          talk back to
        </h2>
        <p className="mt-5 max-w-md font-serif text-[17px] leading-relaxed text-zinc-500">
          Answer, say what happened, and hang up. Remind marks it done, moves it to later, or drops it, all from one
          short call.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-500">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[14px] font-medium text-zinc-900">{title}</p>
                <p className="text-[13px] text-zinc-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-sky-100 via-indigo-100 to-violet-200 p-6 sm:p-8">
        <div className="rounded-2xl bg-white p-5 shadow-xl shadow-indigo-900/10">
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Today</p>
          {[
            { t: "Morning walk", time: "7:00 AM", s: "Done", c: "bg-emerald-50 text-emerald-700" },
            { t: "Send invoice to Rahul", time: "4:30 PM", s: "Snoozed", c: "bg-amber-50 text-amber-700" },
            { t: "Take vitamin D", time: "9:00 PM", s: "Scheduled", c: "bg-sky-50 text-sky-700" },
          ].map((r) => (
            <div key={r.t} className="mt-3 flex items-center justify-between rounded-xl border border-zinc-100 px-3.5 py-3">
              <div>
                <p className="text-[14px] text-zinc-900">{r.t}</p>
                <p className="text-[12px] text-zinc-500">{r.time}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${r.c}`}>{r.s}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Basic",
      price: "Free",
      note: "forever",
      cta: "Start free",
      dark: false,
      items: ["Phone rings at the reminder time", "Short spoken reminder", "2 active reminders", "1 retry if missed"],
    },
    {
      name: "Pro",
      price: "₹199",
      note: "per month",
      cta: "Upgrade to Pro",
      dark: true,
      items: ["AI voice call that listens", "Complete or snooze by voice", "Unlimited reminders", "Up to 3 smart retries", "All 4 voices"],
    },
  ];

  return (
    <section className="mx-auto max-w-4xl px-4 pb-24 text-center">
      <div className="flex justify-center">
        <Eyebrow>Pricing</Eyebrow>
      </div>
      <h2 className="font-display text-4xl tracking-[-0.03em] text-zinc-950 sm:text-5xl">
        Start with a ring
      </h2>
      <div className="mt-12 grid gap-3 rounded-[28px] bg-zinc-200/50 p-3 text-left md:grid-cols-2">
        {plans.map((p) => (
          <div key={p.name} className={`flex flex-col rounded-[20px] p-7 ${p.dark ? "bg-zinc-950 text-white" : "bg-white"}`}>
            <p className={`text-[14px] ${p.dark ? "text-zinc-400" : "text-zinc-500"}`}>{p.name}</p>
            <p className="mt-2 font-display text-5xl tracking-tight">
              {p.price}
              <span className={`ml-2 text-[14px] tracking-normal ${p.dark ? "text-zinc-400" : "text-zinc-500"}`}>{p.note}</span>
            </p>
            <ul className="mt-6 space-y-3">
              {p.items.map((it) => (
                <li key={it} className="flex items-center gap-2.5 text-[14px]">
                  <Check className={`h-4 w-4 ${p.dark ? "text-sky-300" : "text-sky-600"}`} />
                  {it}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className={`mt-8 rounded-xl px-4 py-3 text-center text-[14px] font-medium ${
                p.dark ? "bg-white text-zinc-950 hover:bg-zinc-100" : "border border-zinc-200 text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              {p.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-3 pb-6 sm:px-4">
      <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[28px] px-4 py-20 text-center">
        <SkyBackdrop dense={false} />
        <div className="relative">
          <h2 className="font-display text-4xl tracking-[-0.03em] text-zinc-950 sm:text-5xl">
            Stop ignoring notifications.
            <br />
            Pick up the call.
          </h2>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-[15px] font-medium text-white hover:bg-zinc-800"
          >
            Get started free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <footer className="mx-auto mt-6 flex max-w-6xl flex-col items-center justify-between gap-3 px-2 pb-4 text-[13px] text-zinc-500 sm:flex-row">
        <span>© 2026 Remind</span>
        <span className="flex gap-5">
          <a>Privacy</a>
          <a>Terms</a>
          <a>Contact</a>
        </span>
      </footer>
    </section>
  );
}

export default function DemoUiPage() {
  return (
    <div className={`min-h-screen bg-[#fbfbfb] text-zinc-950 antialiased`}>
      <ChatBubble />
      <Nav />
      <Hero />
      <ModesSection />
      <FeatureSplit />
      <Pricing />
      <FinalCta />
    </div>
  );
}
