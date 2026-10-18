"use client";

import { motion } from "framer-motion";
import { BellOff, MessageSquare, PhoneCall } from "lucide-react";
import { AgentMascot } from "@/components/AgentMascot";

interface PhoneCallMockProps {
  title?: string;
  time?: string;
  className?: string;
}

/** A phone showing an incoming reminder call from the agent */
export function PhoneCallMock({ title = "Send invoice to Rahul", time = "4:00", className = "" }: PhoneCallMockProps) {
  return (
    <div
      className={`relative mx-auto w-[270px] rounded-[44px] bg-zinc-950 p-[10px] shadow-[0_30px_80px_-30px_rgba(40,30,20,.6)] ${className}`}
    >
      {/* side buttons */}
      <span className="absolute -left-[3px] top-[120px] h-14 w-[3px] rounded-l bg-zinc-800" />
      <span className="absolute -right-[3px] top-[150px] h-20 w-[3px] rounded-r bg-zinc-800" />

      <div className="relative overflow-hidden rounded-[36px] bg-[linear-gradient(180deg,#1b2340_0%,#2a2650_45%,#5a3a4a_100%)] px-5 pb-7 pt-3 text-white">
        {/* warm glow behind the agent */}
        <div className="pointer-events-none absolute left-1/2 top-24 h-56 w-56 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,180,110,.45),transparent_65%)] blur-2xl" />

        {/* status bar + dynamic island */}
        <div className="relative flex items-center justify-between text-[12px] font-medium">
          <span>{time}</span>
          <span className="absolute left-1/2 top-0 h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-black" />
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-4 rounded-sm border border-white/80" />
          </span>
        </div>

        {/* caller */}
        <div className="relative mt-12 flex flex-col items-center text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">Incoming call</p>
          <div className="mt-2">
            <AgentMascot size={68} />
          </div>
          <p className="font-sans text-[26px] font-bold tracking-tighter">remind</p>
          <p className="mt-1 text-[13px] text-white/70">Reminder · {title}</p>
        </div>

        {/* secondary actions */}
        <div className="relative mt-14 flex justify-between px-2 text-[11px] text-white/70">
          <span className="flex flex-col items-center gap-1.5">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15">
              <BellOff className="h-4 w-4" />
            </span>
            Remind me
          </span>
          <span className="flex flex-col items-center gap-1.5">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15">
              <MessageSquare className="h-4 w-4" />
            </span>
            Message
          </span>
        </div>

        {/* decline / accept */}
        <div className="relative mt-6 flex items-center justify-between px-2">
          <span className="flex flex-col items-center gap-1.5 text-[11px] text-white/80">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-[#ff3b30]">
              <PhoneCall className="h-6 w-6 rotate-[135deg]" />
            </span>
            Decline
          </span>
          <span className="flex flex-col items-center gap-1.5 text-[11px] text-white/80">
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              className="grid h-16 w-16 place-items-center rounded-full bg-[#34c759] shadow-[0_0_0_10px_rgba(52,199,89,.18)]"
            >
              <PhoneCall className="h-6 w-6" />
            </motion.span>
            Accept
          </span>
        </div>

        <span className="mx-auto mt-5 block h-1 w-28 rounded-full bg-white/50" />
      </div>
    </div>
  );
}
