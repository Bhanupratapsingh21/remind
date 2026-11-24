"use client";

import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, ChevronRight } from "lucide-react";
import { TONES, VOICES, playSample } from "@/lib/voices";

/** Hero mini-player: cycles through the real voices, each paired with a call-style line */
const TRACKS = VOICES.map((voice, i) => ({ voice, tone: TONES[i % TONES.length] }));

export function AudioPlayerBar() {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);
  const track = TRACKS[index];

  useEffect(() => () => stopRef.current?.(), []);

  const stop = () => {
    stopRef.current?.();
    stopRef.current = null;
    setIsPlaying(false);
  };

  const handlePlayToggle = () => {
    if (isPlaying) return stop();
    setIsPlaying(true);
    stopRef.current = playSample(track.voice.sample, () => setIsPlaying(false));
  };

  const handleNext = () => {
    stop();
    setIndex((prev) => (prev + 1) % TRACKS.length);
  };

  return (
    <div className="inline-flex items-center gap-3 sm:gap-6 px-4 py-2 text-xs sm:text-sm text-[#151515] transition-all select-none">
      <button
        type="button"
        onClick={handlePlayToggle}
        aria-label={isPlaying ? `Stop ${track.voice.name}'s voice` : `Play ${track.voice.name}'s voice`}
        className="flex h-6 w-6 items-center justify-center rounded-full text-[#151515] hover:text-black transition-transform active:scale-90 cursor-pointer"
      >
        {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
      </button>

      <span className="font-mono text-[11px] sm:text-xs text-neutral-400">
        {String(index + 1).padStart(2, "0")} / {String(TRACKS.length).padStart(2, "0")}
      </span>

      <span className="font-normal text-[#151515] tracking-tight text-xs sm:text-sm max-w-[220px] sm:max-w-md truncate">
        “{track.tone.example}”
      </span>

      <span className="text-[11px] sm:text-xs text-neutral-400 font-mono hidden sm:inline">{track.voice.name}</span>

      <button
        type="button"
        onClick={handleNext}
        aria-label="Next voice"
        className="text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer p-0.5"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
