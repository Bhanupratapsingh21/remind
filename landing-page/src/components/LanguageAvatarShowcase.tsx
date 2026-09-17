"use client";

import React, { useState } from "react";
import { Volume2 } from "lucide-react";

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
    <section className="w-full bg-[#f5f4ef] py-24 sm:py-32 px-6 border-t border-b border-[#e9e8e0]">
      <div className="mx-auto max-w-4xl text-center">
        {/* Eyebrow */}
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-neutral-500 font-medium">
          PERSONA & VOICE CUSTOMIZATION
        </p>

        {/* Headline */}
        <h2 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-normal text-[#151515] tracking-tight leading-[1.1]">
          A voice you trust.
          <br />
          A tone that fits your day.
        </h2>

        {/* Persona Selector Chips */}
        <div className="mt-14 sm:mt-18 flex flex-wrap justify-center items-center gap-2.5 sm:gap-3 max-w-2xl mx-auto">
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
                className={`px-4 py-2 rounded-full text-xs transition-all cursor-pointer select-none flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#151515] text-white shadow-sm font-medium"
                    : "border border-neutral-300/80 bg-white/80 text-neutral-600 hover:text-[#151515] hover:border-neutral-400 font-normal"
                }`}
              >
                <span>{persona.name}</span>
                <span className={`text-[10px] ${isSelected ? "text-neutral-300" : "text-neutral-400"}`}>
                  · {persona.role}
                </span>
              </button>
            );
          })}
        </div>

        {/* Spoken phrase preview with sound icon */}
        <div className="mt-10 min-h-[4.5rem] flex flex-col items-center justify-center max-w-2xl mx-auto px-4">
          <div
            onClick={() => handleSpeak(selectedStyle.phrase, selectedStyle.code)}
            className="group flex items-center justify-center gap-3 cursor-pointer"
          >
            <p className="text-xl sm:text-2xl font-normal text-[#151515] tracking-tight group-hover:text-neutral-600 transition-colors leading-relaxed">
              {selectedStyle.phrase}
            </p>
            <Volume2
              className={`h-4 w-4 shrink-0 transition-transform ${
                isSpeaking ? "text-amber-600 animate-pulse scale-110" : "text-neutral-400 group-hover:text-black"
              }`}
            />
          </div>
          <p className="text-xs text-neutral-500 mt-2 font-mono">
            {selectedStyle.description}
          </p>
        </div>

        {/* Style Selection Tabs */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-5 sm:gap-8 border-b border-neutral-300/60 pb-3 max-w-xl mx-auto">
          {VOICE_STYLES.map((style) => {
            const isActive = selectedStyle.name === style.name;
            return (
              <button
                key={style.name}
                type="button"
                onClick={() => handleStyleChange(style)}
                className={`text-xs sm:text-sm transition-all pb-2 cursor-pointer relative ${
                  isActive
                    ? "font-medium text-[#151515]"
                    : "font-normal text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {style.name}
                {isActive && (
                  <span className="absolute bottom-[-13px] left-0 right-0 h-[1.5px] bg-[#151515]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Stats metadata */}
        <p className="mt-10 text-xs sm:text-sm text-neutral-600 font-normal">
          Multiple global languages · 5 distinct voice personas · Ultra-low latency voice responses
        </p>

        {/* Fine print */}
        <p className="mt-2 text-xs text-neutral-400">
          All voice personalities are included with your account.
        </p>
      </div>
    </section>
  );
}
