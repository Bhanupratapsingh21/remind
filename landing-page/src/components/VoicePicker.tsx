"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, Pause, Play } from "lucide-react";
import { VOICES, findVoice, playSample } from "@/lib/voices";

/**
 * Pick a voice and hear its real sample. `value` may be a legacy name (Elena…); it is shown as its new voice.
 */
export function VoicePicker({ value, onChange }: { value?: string | null; onChange: (id: string) => void }) {
  const selected = findVoice(value).id;
  const [playing, setPlaying] = useState<string | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => () => stopRef.current?.(), []);

  const preview = (id: string, sample: string) => {
    if (playing === id) {
      stopRef.current?.();
      return;
    }
    setPlaying(id);
    stopRef.current = playSample(sample, () => setPlaying((cur) => (cur === id ? null : cur)));
  };

  return (
    <div role="radiogroup" aria-label="Voice" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {VOICES.map((v) => {
        const isSelected = selected === v.id;
        const isPlaying = playing === v.id;
        return (
          <div
            key={v.id}
            className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-colors ${
              isSelected ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-white hover:border-zinc-300"
            }`}
          >
            <button
              type="button"
              onClick={() => preview(v.id, v.sample)}
              aria-label={`${isPlaying ? "Stop" : "Play"} ${v.name}'s voice`}
              className={`grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full transition-colors ${
                isSelected ? "bg-white/15 text-amber-200 hover:bg-white/25" : "bg-amber-50 text-amber-600 hover:bg-amber-100"
              }`}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />}
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(v.id)}
              className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 text-left"
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium">{v.name}</span>
                <span className={`block truncate text-[11px] ${isSelected ? "text-zinc-300" : "text-zinc-500"}`}>
                  {v.accent} · {v.vibe}
                </span>
              </span>
              {isSelected && <Check className="h-4 w-4 shrink-0 text-amber-300" />}
            </button>
          </div>
        );
      })}
    </div>
  );
}
