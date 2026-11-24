"use client";

import React, { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { Eyebrow } from "@/components/site/Eyebrow";
import { Aurora } from "@/components/site/Aurora";
import { Reveal } from "@/components/site/Reveal";
import { TONES, VOICES, playSample, type ToneOption, type VoiceOption } from "@/lib/voices";

export function LanguageAvatarShowcase() {
  const [voice, setVoice] = useState<VoiceOption>(VOICES[0]);
  const [tone, setTone] = useState<ToneOption>(TONES[0]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => () => stopRef.current?.(), []);

  const toggle = (v: VoiceOption) => {
    if (playingId === v.id) {
      stopRef.current?.();
      return;
    }
    setPlayingId(v.id);
    stopRef.current = playSample(v.sample, () => setPlayingId((cur) => (cur === v.id ? null : cur)));
  };

  const pickVoice = (v: VoiceOption) => {
    setVoice(v);
    toggle(v);
  };

  const isPlaying = playingId === voice.id;

  return (
    <section id="voices" className="w-full scroll-mt-20 px-4">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-peach text-center">
        <Aurora className="h-36 sm:h-44" />
        <Reveal className="mx-auto max-w-4xl px-4 pb-20 pt-4 sm:pb-28">
          <div className="flex justify-center">
            <Eyebrow>Voices & call style</Eyebrow>
          </div>
          <h2 className="font-display text-4xl leading-[1.08] tracking-[-0.03em] text-zinc-950 sm:text-5xl md:text-6xl">
            A voice you trust.
            <br />
            A tone that fits your day.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-zinc-600">
            Tap a voice to hear it. These are real recordings of the exact voices that call you.
          </p>

          {/* Voices */}
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-5">
            {VOICES.map((v) => {
              const selected = voice.id === v.id;
              const playing = playingId === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => pickVoice(v)}
                  aria-pressed={selected}
                  aria-label={`${playing ? "Stop" : "Play"} ${v.name}'s voice`}
                  className={`group flex cursor-pointer flex-col items-start gap-1 rounded-2xl px-4 py-3 text-left transition-all ${
                    selected
                      ? "bg-zinc-950 text-white shadow-[0_12px_28px_-12px_rgba(0,0,0,.55)]"
                      : "bg-white/60 text-zinc-700 hover:bg-white"
                  }`}
                >
                  <span className="flex w-full items-center justify-between">
                    <span className="text-[15px] font-medium">{v.name}</span>
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full ${
                        selected ? "bg-white/15 text-amber-200" : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {playing ? <Pause className="h-3 w-3 fill-current" /> : <Play className="ml-0.5 h-3 w-3 fill-current" />}
                    </span>
                  </span>
                  <span className={`text-[11px] ${selected ? "text-zinc-300" : "text-zinc-500"}`}>
                    {v.accent} · {v.gender}
                  </span>
                </button>
              );
            })}
          </div>

          {/* What a call sounds like in the chosen style */}
          <button
            type="button"
            onClick={() => toggle(voice)}
            className="group mx-auto mt-8 flex w-full max-w-2xl items-center gap-4 rounded-[24px] bg-white p-5 text-left shadow-[0_20px_50px_-30px_rgba(120,70,20,.45)] sm:p-6"
            aria-label={`${isPlaying ? "Stop" : "Play"} ${voice.name}'s voice sample`}
          >
            <span
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition-colors ${
                isPlaying ? "bg-amber-400 text-white" : "bg-amber-50 text-amber-600 group-hover:bg-amber-100"
              }`}
            >
              {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
            </span>
            <span className="min-w-0">
              <span className="block font-serif text-lg leading-snug text-zinc-900 sm:text-xl">“{tone.example}”</span>
              <span className="mt-1.5 block font-mono text-[11px] text-zinc-400">
                {voice.name} · {voice.vibe} · {tone.label} style
              </span>
            </span>
          </button>

          {/* Call styles */}
          <div
            role="tablist"
            aria-label="Call style"
            className="mx-auto mt-8 flex w-fit max-w-full flex-wrap justify-center gap-1 rounded-2xl bg-white/60 p-1"
          >
            {TONES.map((t) => {
              const active = tone.id === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTone(t)}
                  className={`cursor-pointer rounded-xl px-3.5 py-2 text-[13px] transition-all ${
                    active ? "bg-white font-medium text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[13px] text-zinc-500">{tone.description}</p>

          <p className="mt-10 text-[14px] text-zinc-600">5 voices · 5 call styles · English, Hindi or a mix</p>
          <p className="mt-1 text-[12px] text-zinc-400">Every voice and style is included on every plan. Change them anytime in Settings.</p>
        </Reveal>
      </div>
    </section>
  );
}
