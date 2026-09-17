"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, ChevronRight } from "lucide-react";

export interface ReminderTrack {
  id: string;
  number: string;
  phrase: string;
  context: string;
  persona: string;
  langCode: string;
}

export const REMINDER_TRACKS: ReminderTrack[] = [
  {
    id: "1",
    number: "01 / 06",
    phrase: "“Hey Alex, time to review the quarterly roadmap.”",
    context: "Executive Assistant",
    persona: "Eleanor",
    langCode: "en-US",
  },
  {
    id: "2",
    number: "02 / 06",
    phrase: "“Good morning! Did you take your prescription pills yet?”",
    context: "Health & Habit",
    persona: "Marcus",
    langCode: "en-US",
  },
  {
    id: "3",
    number: "03 / 06",
    phrase: "“Your team standup starts in 10 minutes. Shall I snooze?”",
    context: "Work Meeting",
    persona: "Sarah",
    langCode: "en-US",
  },
  {
    id: "4",
    number: "04 / 06",
    phrase: "“Workout time! Put down your laptop and get to the gym.”",
    context: "Fitness Nudge",
    persona: "David",
    langCode: "en-US",
  },
  {
    id: "5",
    number: "05 / 06",
    phrase: "“याद है ना, शाम 5 बजे डॉक्टर की अपॉइंटमेंट है?”",
    context: "Personal / Hindi",
    persona: "Priya",
    langCode: "hi-IN",
  },
  {
    id: "6",
    number: "06 / 06",
    phrase: "“Follow up with the landlord before the weekend begins.”",
    context: "Critical Task",
    persona: "Maya",
    langCode: "en-US",
  },
];

export function AudioPlayerBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const track = REMINDER_TRACKS[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % REMINDER_TRACKS.length);
    setIsPlaying(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handlePlayToggle = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsPlaying(!isPlaying);
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      window.speechSynthesis.cancel();
      // Clean speech text
      const cleanText = track.phrase.replace(/[“”"]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.lang = track.langCode;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="inline-flex items-center gap-3 sm:gap-6 px-4 py-2 text-xs sm:text-sm text-[#151515] transition-all select-none">
      {/* Play / Pause button */}
      <button
        type="button"
        onClick={handlePlayToggle}
        aria-label={isPlaying ? "Pause voice demo" : "Play sample reminder call"}
        className="flex h-6 w-6 items-center justify-center rounded-full text-[#151515] hover:text-black transition-transform active:scale-90 cursor-pointer"
      >
        {isPlaying ? (
          <Pause className="h-3.5 w-3.5 fill-current" />
        ) : (
          <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
        )}
      </button>

      {/* Track index */}
      <span className="font-mono text-[11px] sm:text-xs text-neutral-400">
        {track.number}
      </span>

      {/* Phrase */}
      <span className="font-normal text-[#151515] tracking-tight text-xs sm:text-sm max-w-[220px] sm:max-w-md truncate">
        {track.phrase}
      </span>

      {/* Persona Tag */}
      <span className="text-[11px] sm:text-xs text-neutral-400 font-mono hidden sm:inline">
        {track.persona}
      </span>

      {/* Next arrow */}
      <button
        type="button"
        onClick={handleNext}
        aria-label="Next sample call"
        className="text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer p-0.5"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
