"use client";

import React from "react";
import { TONES, findTone } from "@/lib/voices";

/** Call style picker with the opening line each style uses */
export function TonePicker({ value, onChange }: { value?: string | null; onChange: (id: string) => void }) {
  const tone = findTone(value);
  return (
    <div>
      <div role="radiogroup" aria-label="Call style" className="flex flex-wrap gap-1.5">
        {TONES.map((t) => {
          const active = t.id === tone.id;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(t.id)}
              className={`cursor-pointer rounded-xl border px-3 py-1.5 text-[13px] transition-colors ${
                active ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[12px] text-zinc-500">{tone.description}</p>
      <p className="mt-1 font-serif text-[13px] italic text-zinc-600">“{tone.example}”</p>
    </div>
  );
}
