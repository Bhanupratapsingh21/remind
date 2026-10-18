"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  BellRing,
  Clock,
  Moon,
  PhoneCall,
  PhoneIncoming,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { CloudShader } from "@/components/ui/cloud-shader";
import { AgentMascot } from "@/components/AgentMascot";
import { SiteNav } from "@/components/site/SiteNav";


/* Warm sky that matches the agent's amber glow */
const SKY = {
  skyTopColor: "#7aaad9",
  skyBottomColor: "#f1d9c3",
  cloudColor: "#fff8ef",
};

const MODES = [
  {
    icon: BellRing,
    label: "Ring Mode",
    text: "Your phone rings at the exact time and a short voice reads your reminder. Free forever, no app needed.",
  },
  {
    icon: PhoneCall,
    label: "AI Call Mode",
    text: "A reminder you can't simply swipe away. Your AI agent calls, listens, and marks it done or calls back later, all by voice.",
  },
  {
    icon: Moon,
    label: "Quiet Hours",
    text: "Your agent never calls while you sleep. Anything due at night waits politely for your morning window.",
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

/* Product shot: dark-bezel screen showing a live call with the agent */
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
      className="mx-auto mt-14 max-w-[1120px] rounded-t-[30px] bg-[#1c1c1e] px-3 pt-3 shadow-[0_-10px_60px_-20px_rgba(120,70,30,.35)] sm:px-[18px] sm:pt-[18px]"
    >
      <div className="relative overflow-hidden rounded-t-[16px] bg-[linear-gradient(180deg,#8fb6df_0%,#c9d8ea_40%,#f3d6b8_85%,#efbd92_100%)] text-left">
        <div className="relative flex h-7 items-center justify-between bg-white/25 px-4 text-[11px] text-white backdrop-blur">
          <span className="font-semibold">remind</span>
          <span>Mon 4:00 PM</span>
        </div>

        <div className="relative grid gap-4 p-4 sm:p-8 md:grid-cols-[1fr_300px]">
          <div className="overflow-hidden rounded-2xl bg-white/95 shadow-2xl shadow-orange-950/15">
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
                      l.who === "ai" ? "bg-zinc-100 text-zinc-800" : "ml-auto bg-zinc-900 text-white"
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

          {/* incoming call card with the agent */}
          <div className="hidden flex-col items-center rounded-[28px] bg-zinc-950/90 p-6 text-white shadow-2xl backdrop-blur md:flex">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Incoming call</p>
            <AgentMascot size={70} className="mt-3" />
            <p className="mt-1 text-xl font-medium">remind</p>
            <p className="text-xs text-zinc-400">Send invoice to Rahul · 4:00 PM</p>
            <div className="mt-auto flex w-full justify-around pt-8">
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

export function HomeHero() {
  const [mode, setMode] = useState(1);

  return (
    <div>
      <SiteNav />
      <section className="px-3 sm:px-4">
        <div className="relative mx-auto max-w-[1888px] overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#7aaad9,#f1d9c3)]">
          {/* WebGL sky; the gradient above shows if WebGL is unavailable */}
          <div className="absolute inset-0">
            <CloudShader {...SKY} speed={0.8} count={6} />
          </div>

          <div className="relative px-4 pt-12 text-center">
            <motion.a
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-zinc-950 py-1.5 pl-1.5 pr-3.5 text-[13px] text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,.45)]"
            >
              <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-900">NEW</span>
              <span className="font-medium">Snooze by voice is here</span>
              <span className="hidden text-zinc-400 sm:inline">See what&apos;s new</span>
              <ArrowRight className="h-3.5 w-3.5 text-zinc-300" />
            </motion.a>

            {/* the agent */}
            <div className="mt-6 flex justify-center">
              <AgentMascot size={130} />
            </div>

            {/* mode switcher */}
            <div className="relative mx-auto mt-4 w-fit">
              <div className="flex flex-wrap justify-center gap-0.5 rounded-2xl bg-white/55 p-1 backdrop-blur-md">
                {MODES.map(({ icon: Icon, label }, i) => (
                  <button
                    key={label}
                    onClick={() => setMode(i)}
                    className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] transition-colors ${
                      mode === i ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <AnimatedHeadline />
            </div>

            <div className="mx-auto mt-5 min-h-[96px] max-w-[600px]">
              <AnimatePresence mode="wait">
                <motion.p
                  key={mode}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="font-serif text-[18px] leading-[1.6] text-zinc-700 sm:text-[20px]"
                >
                  {MODES[mode].text}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="flex items-center gap-2.5 rounded-xl border border-amber-300 bg-gradient-to-b from-[#fff8ee] to-[#fde6c8] px-6 py-3.5 text-[16px] font-medium text-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_8px_24px_-10px_rgba(234,140,40,.6)] hover:to-[#fbdcb4]"
              >
                <PhoneIncoming className="h-[18px] w-[18px]" />
                Get your first call free
              </Link>
              <a
                href="#how-it-works"
                className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-6 py-3.5 text-[16px] text-zinc-900 hover:bg-zinc-50"
              >
                See how Remind works
                <span className="grid h-6 w-6 place-items-center rounded-full bg-zinc-100">
                  <ArrowDown className="h-3.5 w-3.5" />
                </span>
              </a>
            </div>

            <p className="mt-7 flex flex-wrap items-center justify-center gap-1.5 text-[14px] text-zinc-700">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Ignoring notifications?
              <Link href="/signup" className="text-zinc-950 underline underline-offset-2">
                Try a call instead
              </Link>
              <ArrowRight className="h-3.5 w-3.5" />
            </p>
            <p className="mt-3 flex items-center justify-center gap-3 text-[14px] text-zinc-600">
              Works on any phone
              <Smartphone className="h-4 w-4" />
              <PhoneCall className="h-4 w-4" />
            </p>

            <DeviceMock />
          </div>
        </div>
      </section>
    </div>
  );
}
