"use client";

import React, { useState } from "react";
import { Volume2 } from "lucide-react";
import { Eyebrow } from "@/components/site/Eyebrow";

interface VoiceStyleOption {
  name: string;
  code: string;
  phrase: string;
  description: string;
}

const VOICE_STYLES: VoiceStyleOption[] = [
  {
    name: "Professional",
    code: "en-US",
    phrase: "“Good morning Alex, your strategy review is scheduled for right now.”",
    description: "Crisp, concise, and focused on business priorities",
  },
  {
    name: "Friendly",
    code: "en-US",
    phrase: "“Hey there! Quick reminder to send that update before your afternoon meeting.”",
    description: "Warm, encouraging, and supportive companion",
  },
  {
    name: "Disciplined",
    code: "en-US",
    phrase: "“Workout time. No postponements today — let's get it done.”",
    description: "Direct, motivating, and accountability-driven",
  },
  {
    name: "Gentle",
    code: "en-US",
    phrase: "“Take a deep breath and take that 10-minute walk we planned.”",
    description: "Calm, patient, and mindful check-in",
  },
  {
    name: "Hindi / Hinglish",
    code: "hi-IN",
    phrase: "“नमस्ते! याद दिलाना था कि शाम 5 बजे डॉक्टर की अपॉइंटमेंट है।”",
    description: "Natural regional phrasing and multilingual fluency",
  },
];

interface PersonaOption {
  id: number;
  name: string;
  role: string;
  tone: string;
}

const PERSONAS: PersonaOption[] = [
  { id: 1, name: "Elena", role: "Executive Assistant", tone: "Crisp & direct" },
  { id: 2, name: "Vikram", role: "Accountability Coach", tone: "Disciplined" },
  { id: 3, name: "Maya", role: "Mindful Companion", tone: "Calm & gentle" },
  { id: 4, name: "Liam", role: "Daily Partner", tone: "Friendly" },
  { id: 5, name: "Ananya", role: "Multilingual Voice", tone: "Natural Hinglish" },
];

export function LanguageAvatarShowcase() {
  const [selectedStyle, setSelectedStyle] = useState<VoiceStyleOption>(VOICE_STYLES[0]);
  const [selectedPersona, setSelectedPersona] = useState<number>(1);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = (text: string, langCode: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[“”"]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = langCode;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStyleChange = (style: VoiceStyleOption) => {
    setSelectedStyle(style);
    handleSpeak(style.phrase, style.code);
  };

  return (
    <section id="voices" className="w-full scroll-mt-20 px-3 sm:px-4">
      <div className="mx-auto max-w-[1888px] rounded-[28px] bg-[linear-gradient(180deg,#f7efe4_0%,#f3e7d8_100%)] px-4 py-20 text-center sm:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="flex justify-center">
            <Eyebrow>Persona & voice</Eyebrow>
          </div>
          <h2 className="font-display text-4xl leading-[1.08] tracking-[-0.03em] text-zinc-950 sm:text-5xl md:text-6xl">
            A voice you trust.
            <br />
            A tone that fits your day.
          </h2>

          {/* Persona chips */}
          <div className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-2">
            {PERSONAS.map((persona) => {
              const isSelected = selectedPersona === persona.id;
              return (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => {
                    setSelectedPersona(persona.id);
                    handleSpeak(selectedStyle.phrase, selectedStyle.code);
                  }}
                  className={`flex cursor-pointer select-none items-center gap-1.5 rounded-full px-4 py-2 text-[13px] transition-all ${
                    isSelected
                      ? "bg-zinc-950 font-medium text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,.5)]"
                      : "bg-white/70 text-zinc-600 hover:bg-white hover:text-zinc-950"
                  }`}
                >
                  <span>{persona.name}</span>
                  <span className={`text-[11px] ${isSelected ? "text-amber-200" : "text-zinc-400"}`}>· {persona.role}</span>
                </button>
              );
            })}
          </div>

          {/* Spoken phrase card */}
          <button
            type="button"
            onClick={() => handleSpeak(selectedStyle.phrase, selectedStyle.code)}
            className="group mx-auto mt-8 flex w-full max-w-2xl items-center gap-4 rounded-[24px] bg-white p-5 text-left shadow-[0_20px_50px_-30px_rgba(120,70,20,.45)] sm:p-6"
          >
            <span
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition-colors ${
                isSpeaking ? "bg-amber-400 text-white" : "bg-amber-50 text-amber-600 group-hover:bg-amber-100"
              }`}
            >
              <Volume2 className={`h-5 w-5 ${isSpeaking ? "animate-pulse" : ""}`} />
            </span>
            <span>
              <span className="block font-serif text-lg leading-snug text-zinc-900 sm:text-xl">{selectedStyle.phrase}</span>
              <span className="mt-1 block font-mono text-[11px] text-zinc-400">{selectedStyle.description}</span>
            </span>
          </button>

          {/* Style tabs */}
          <div className="mx-auto mt-8 flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-2xl bg-white/60 p-1">
            {VOICE_STYLES.map((style) => {
              const isActive = selectedStyle.name === style.name;
              return (
                <button
                  key={style.name}
                  type="button"
                  onClick={() => handleStyleChange(style)}
                  className={`cursor-pointer rounded-xl px-3.5 py-2 text-[13px] transition-all ${
                    isActive ? "bg-white font-medium text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {style.name}
                </button>
              );
            })}
          </div>

          <p className="mt-10 text-[14px] text-zinc-600">
            Multiple languages · 5 voice personas · Ultra-low latency responses
          </p>
          <p className="mt-1 text-[12px] text-zinc-400">All voice personalities are included with your account.</p>
        </div>
      </div>
    </section>
  );
}
