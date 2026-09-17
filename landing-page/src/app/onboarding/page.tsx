"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { updateUser, setOnboarded } from "@/store/slices/authSlice";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Phone,
  Clock,
  Sparkles,
  ArrowRight,
  Loader2,
  Check,
  Volume2,
  ShieldCheck,
} from "lucide-react";

const REFERRAL_OPTIONS = [
  { id: "X", label: "X / Twitter", badge: "Popular" },
  { id: "Instagram", label: "Instagram" },
  { id: "Friends & Family", label: "Friends & Family" },
  { id: "Reddit", label: "Reddit" },
  { id: "Google", label: "Google Search" },
  { id: "ChatGPT / AI", label: "ChatGPT or AI Tools" },
  { id: "Other", label: "Other / Word of Mouth" },
];

const VOICE_PERSONAS = [
  {
    id: "Elena",
    name: "Elena",
    tone: "Friendly & Warm",
    desc: "Gentle encouragement that keeps you motivated throughout the day.",
  },
  {
    id: "Marcus",
    name: "Marcus",
    tone: "Direct & Assertive",
    desc: "No excuses. Clear, no-nonsense accountability when tasks must get done.",
  },
  {
    id: "Sofia",
    name: "Sofia",
    tone: "Calm & Mindful",
    desc: "Soothing tone tailored for meditation, water breaks, and focused flow.",
  },
  {
    id: "James",
    name: "James",
    tone: "Professional Executive",
    desc: "Brief, crisp, and structured for meetings and work deadlines.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // If already onboarded, send to dashboard
  useEffect(() => {
    if (isAuthenticated && user?.isOnboarded) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [referralSource, setReferralSource] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [preferredVoice, setPreferredVoice] = useState("Elena");
  const [timezone, setTimezone] = useState("UTC");
  const [submitting, setSubmitting] = useState(false);

  // Auto-detect timezone
  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) setTimezone(detected);
    } catch {
      setTimezone("UTC");
    }
  }, []);

  const handleFinishOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullPhone = `${countryCode} ${phoneNumber.trim()}`;

    if (!phoneNumber || phoneNumber.trim().length < 7) {
      toast.error("Please enter a valid phone number for voice calls.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post("/auth/onboard", {
        referralSource: referralSource || "Other",
        phone: fullPhone,
        timezone,
        preferredVoice,
      });

      const updated = res.data.data.user;
      dispatch(updateUser(updated));
      dispatch(setOnboarded(true));

      toast.success("Welcome aboard! Your 3-day trial is ready.");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save onboarding preferences.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#faf9f5]">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <Link
          href="/"
          className="inline-block text-3xl font-bold tracking-tighter text-[#151515] hover:opacity-80 transition-opacity"
        >
          remind
        </Link>
        <h2 className="mt-4 text-2xl sm:text-3xl font-normal text-[#151515] tracking-tight">
          Let's personalize your setup
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-neutral-500">
          Step {onboardingStep} of 3 • Setting up your personal AI voice caller
        </p>

        {/* Step dots */}
        <div className="flex justify-center items-center gap-2 mt-4">
          <span
            className={`h-1.5 rounded-full transition-all ${
              onboardingStep === 1 ? "w-8 bg-[#151515]" : "w-2 bg-neutral-300"
            }`}
          />
          <span
            className={`h-1.5 rounded-full transition-all ${
              onboardingStep === 2 ? "w-8 bg-[#151515]" : "w-2 bg-neutral-300"
            }`}
          />
          <span
            className={`h-1.5 rounded-full transition-all ${
              onboardingStep === 3 ? "w-8 bg-[#151515]" : "w-2 bg-neutral-300"
            }`}
          />
        </div>
      </div>

      {/* Main Questionnaire Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-neutral-200/80 rounded-2xl sm:px-10">
          {/* ================= QUESTION 1: REFERRAL ================= */}
          {onboardingStep === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base sm:text-lg font-medium text-neutral-900">
                  How did you discover Remind?
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Helps us know where our early members are coming from.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {REFERRAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setReferralSource(opt.id)}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between text-xs sm:text-sm transition-all cursor-pointer ${
                      referralSource === opt.id
                        ? "border-[#151515] bg-neutral-50 font-medium text-neutral-900 shadow-xs"
                        : "border-neutral-200 hover:border-neutral-300 text-neutral-700 bg-white"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {referralSource === opt.id && (
                      <Check className="h-4 w-4 text-[#151515] shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  disabled={!referralSource}
                  onClick={() => setOnboardingStep(2)}
                  className="inline-flex justify-center items-center gap-2 rounded-full bg-[#18181b] px-6 py-2.5 text-sm font-medium text-white hover:bg-black active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= QUESTION 2: PHONE NUMBER ================= */}
          {onboardingStep === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base sm:text-lg font-medium text-neutral-900">
                  Where should Remind call you?
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Our AI agent dials this number at your exact scheduled reminder times.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                  Mobile Phone Number
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="rounded-xl border border-neutral-300 px-3 py-2.5 text-sm bg-white text-[#151515] focus:outline-none focus:border-neutral-900"
                  >
                    <option value="+1">🇺🇸 +1 (US/CA)</option>
                    <option value="+91">🇮🇳 +91 (IN)</option>
                    <option value="+44">🇬🇧 +44 (UK)</option>
                    <option value="+61">🇦🇺 +61 (AU)</option>
                    <option value="+49">🇩🇪 +49 (DE)</option>
                    <option value="+33">🇫🇷 +33 (FR)</option>
                    <option value="+81">🇯🇵 +81 (JP)</option>
                  </select>
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      autoFocus
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="(555) 000-0000"
                      className="w-full rounded-xl border border-neutral-300 pl-10 pr-3.5 py-2.5 text-sm text-[#151515] placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Privacy Guarantee */}
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/70 flex items-start gap-2.5 text-xs text-neutral-600">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  We treat your phone number with the highest privacy. It is exclusively used for
                  triggering automated AI voice reminders.
                </p>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setOnboardingStep(1)}
                  className="px-4 py-2 text-xs text-neutral-500 hover:text-black transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!phoneNumber.trim() || phoneNumber.trim().length < 6}
                  onClick={() => setOnboardingStep(3)}
                  className="inline-flex justify-center items-center gap-2 rounded-full bg-[#18181b] px-6 py-2.5 text-sm font-medium text-white hover:bg-black active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= QUESTION 3: VOICE & TIMEZONE ================= */}
          {onboardingStep === 3 && (
            <form onSubmit={handleFinishOnboarding} className="space-y-5">
              <div>
                <h3 className="text-base sm:text-lg font-medium text-neutral-900">
                  Pick your AI caller persona
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  You can change this voice anytime in your dashboard settings.
                </p>
              </div>

              <div className="space-y-2">
                {VOICE_PERSONAS.map((voice) => (
                  <button
                    key={voice.id}
                    type="button"
                    onClick={() => setPreferredVoice(voice.id)}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-start justify-between text-xs sm:text-sm transition-all cursor-pointer ${
                      preferredVoice === voice.id
                        ? "border-[#151515] bg-neutral-50 font-medium text-neutral-900 shadow-xs"
                        : "border-neutral-200 hover:border-neutral-300 text-neutral-700 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-3.5 w-3.5 text-neutral-500" />
                        <span className="font-semibold text-neutral-900">{voice.name}</span>
                        <span className="text-[11px] font-mono text-neutral-500 bg-neutral-200/60 px-1.5 py-0.5 rounded">
                          {voice.tone}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1 font-normal">{voice.desc}</p>
                    </div>
                    {preferredVoice === voice.id && (
                      <Check className="h-4 w-4 text-[#151515] shrink-0 mt-1" />
                    )}
                  </button>
                ))}
              </div>

              {/* Timezone display */}
              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 text-xs">
                <div className="flex items-center gap-2 text-neutral-700">
                  <Clock className="h-4 w-4 text-neutral-500" />
                  <span>Detected Timezone:</span>
                </div>
                <span className="font-mono text-neutral-900 font-medium">{timezone}</span>
              </div>

              {/* 3-Day Free Plan confirmation */}
              <div className="p-3.5 bg-neutral-900 text-white rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Your 3-Day Free Trial</span>
                </div>
                <p className="text-neutral-300 text-[11px]">
                  Includes 2 AI voice call reminders. After 2 reminders, you can easily upgrade to
                  Pro.
                </p>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setOnboardingStep(2)}
                  className="px-4 py-2 text-xs text-neutral-500 hover:text-black transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex justify-center items-center gap-2 rounded-full bg-[#18181b] px-6 py-2.5 text-sm font-medium text-white hover:bg-black active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Setting Up...
                    </>
                  ) : (
                    <>
                      Enter Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
