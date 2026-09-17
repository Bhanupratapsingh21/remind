"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout } from "@/store/slices/authSlice";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  PhoneCall,
  Plus,
  Clock,
  CheckCircle2,
  RotateCcw,
  LogOut,
  Volume2,
  Sparkles,
  Lock,
  ArrowUpRight,
} from "lucide-react";

interface ReminderItem {
  id: string;
  task: string;
  time: string;
  date: string;
  persona: string;
  status: "pending" | "completed" | "rescheduled";
  rescheduledTo?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth
  );

  const [reminders, setReminders] = useState<ReminderItem[]>([
    {
      id: "rem_1",
      task: "Morning standup with engineering lead",
      time: "09:00 AM",
      date: "Today",
      persona: user?.preferredVoice || "Elena",
      status: "pending",
    },
  ]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [newTime, setNewTime] = useState("10:00 AM");
  const [newPersona, setNewPersona] = useState(user?.preferredVoice || "Elena");

  // Redirect unauthenticated or not-onboarded users
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (user && !user.isOnboarded) {
        router.push("/onboarding");
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  // Calculate remaining trial days/hours
  const getTrialStatus = () => {
    if (!user?.trialEndsAt) {
      return { daysLeft: 3, isExpired: false, label: "3 days left" };
    }
    const end = new Date(user.trialEndsAt).getTime();
    const now = Date.now();
    const diffHours = Math.max(0, Math.round((end - now) / (1000 * 60 * 60)));
    const diffDays = Math.ceil(diffHours / 24);

    if (now >= end) {
      return { daysLeft: 0, isExpired: true, label: "Trial expired" };
    }
    if (diffHours < 24) {
      return { daysLeft: 1, isExpired: false, label: `${diffHours}h left` };
    }
    return { daysLeft: diffDays, isExpired: false, label: `${diffDays} days left` };
  };

  const trialInfo = getTrialStatus();
  const maxAllowedReminders = user?.maxReminders || 2;
  const isAtQuota = reminders.length >= maxAllowedReminders;

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Continue even if backend call fails
    }
    dispatch(logout());
    toast.success("Signed out successfully.");
    router.push("/login");
  };

  const handleOpenCreateModal = () => {
    if (isAtQuota || trialInfo.isExpired) {
      setShowUpgradeModal(true);
      return;
    }
    setShowCreateModal(true);
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) {
      toast.error("Please enter a task description.");
      return;
    }

    if (reminders.length >= maxAllowedReminders) {
      setShowCreateModal(false);
      setShowUpgradeModal(true);
      return;
    }

    const created: ReminderItem = {
      id: "rem_" + Date.now(),
      task: newTask,
      time: newTime,
      date: "Today",
      persona: newPersona,
      status: "pending",
    };

    setReminders([created, ...reminders]);
    setNewTask("");
    setShowCreateModal(false);
    toast.success(`Voice call scheduled for ${newTime}. Persona: ${newPersona}`);
  };

  const handleTriggerTestCall = (reminder: ReminderItem) => {
    toast.info(`Calling ${user?.phone || "your number"} right now for "${reminder.task}"...`);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        `Hello ${user?.name || "there"}! Remind calling for your task: ${reminder.task}. Have you done it, or would you like to reschedule?`
      );
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleMarkDone = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "completed" } : r))
    );
    toast.success("Task marked as completed!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f5]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 rounded-full border-2 border-neutral-900 border-t-transparent animate-spin" />
          <p className="text-xs font-mono text-neutral-400">Loading Remind Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.isOnboarded) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#151515] font-sans antialiased">
      {/* TOP DASHBOARD NAVIGATION */}
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/95 backdrop-blur-xs">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-10">
          {/* Left Brand */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tighter text-[#151515] hover:opacity-80 transition-opacity"
            >
              remind
            </Link>
            <span className="h-4 w-[1px] bg-neutral-300 hidden sm:block" />
            <span className="text-xs font-mono text-neutral-500 hidden sm:inline-block">
              Dashboard
            </span>
          </div>

          {/* Right User Bar */}
          <div className="flex items-center gap-4">
            {/* Active Phone Tag */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-mono text-neutral-600">
              <PhoneCall className="h-3.5 w-3.5 text-emerald-600" />
              <span>{user?.phone || "No phone linked"}</span>
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-medium text-[#151515] block">
                  {user?.name || "User"}
                </span>
                {user?.username && (
                  <span className="text-[11px] font-mono text-neutral-400 block">
                    @{user.username}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                className="flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-600 hover:text-black hover:border-neutral-400 transition cursor-pointer shadow-xs"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 3-DAY FREE TRIAL BANNER */}
      <div className="bg-[#18181b] text-white py-3 px-6 sm:px-10 border-b border-neutral-800">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold tracking-wide">3-Day Free Trial:</span>
            <span className="text-neutral-300 font-mono">
              {trialInfo.label} • {reminders.length}/{maxAllowedReminders} Reminders Used
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowUpgradeModal(true)}
            className="text-[11px] font-medium text-amber-300 hover:text-amber-200 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
          >
            <span>Upgrade to Unlimited Pro</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* MAIN DASHBOARD CONTENT */}
      <main className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-neutral-200/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-normal text-[#151515] tracking-tight">
              Good day, {user?.name || "there"}.
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-neutral-500">
              The AI voice caller will dial your phone at each scheduled reminder time.
            </p>
          </div>

          {/* Create Reminder CTA */}
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#18181b] px-5 py-2.5 text-xs sm:text-sm font-medium text-white hover:bg-black transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Plus className="h-4 w-4" />
            New Voice Reminder
          </button>
        </div>

        {/* Stats Row */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
            <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
              Free Trial Quota
            </span>
            <p className="mt-2 text-xl sm:text-2xl font-normal text-[#151515]">
              {reminders.length} / {maxAllowedReminders}
            </p>
            <p className="mt-1 text-xs text-neutral-500">Reminders active</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
            <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
              Trial Time Remaining
            </span>
            <p className="mt-2 text-xl sm:text-2xl font-normal text-amber-600">
              {trialInfo.label}
            </p>
            <p className="mt-1 text-xs text-neutral-500">Free access</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
            <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
              Voice Persona
            </span>
            <p className="mt-2 text-xl sm:text-2xl font-normal text-[#151515]">
              {user?.preferredVoice || "Elena"}
            </p>
            <p className="mt-1 text-xs text-neutral-500">Active caller</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
            <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
              Carrier Line
            </span>
            <p className="mt-2 text-xl sm:text-2xl font-normal text-emerald-600 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </p>
            <p className="mt-1 text-xs text-neutral-500">HD Voice Ready</p>
          </div>
        </div>

        {/* Reminders List Section */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-normal text-[#151515] tracking-tight">
              Scheduled Reminders ({reminders.length})
            </h2>
            <span className="text-xs text-neutral-400 font-mono">
              Voice Engine: Low-latency Realtime
            </span>
          </div>

          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="group bg-white p-5 rounded-2xl border border-neutral-200/80 hover:border-neutral-300 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left Task Info */}
                <div className="flex items-start gap-4">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      reminder.status === "completed"
                        ? "bg-emerald-50 text-emerald-600"
                        : reminder.status === "rescheduled"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-neutral-100 text-[#151515]"
                    }`}
                  >
                    {reminder.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : reminder.status === "rescheduled" ? (
                      <RotateCcw className="h-5 w-5" />
                    ) : (
                      <PhoneCall className="h-5 w-5" />
                    )}
                  </div>

                  <div>
                    <h3
                      className={`text-sm sm:text-base font-normal tracking-tight text-[#151515] ${
                        reminder.status === "completed" ? "line-through text-neutral-400" : ""
                      }`}
                    >
                      {reminder.task}
                    </h3>

                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3" />
                        {reminder.status === "rescheduled" ? (
                          <>
                            <span className="line-through text-neutral-400">{reminder.time}</span>
                            <span className="text-amber-700 font-semibold ml-1">
                              Rescheduled: {reminder.rescheduledTo}
                            </span>
                          </>
                        ) : (
                          <span>{reminder.time}</span>
                        )}
                      </span>
                      <span>•</span>
                      <span>{reminder.date}</span>
                      <span>•</span>
                      <span className="text-neutral-400 font-mono text-[11px]">
                        Voice: {reminder.persona}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action Controls */}
                <div className="flex items-center gap-2 pt-2 sm:pt-0 self-end sm:self-center">
                  {reminder.status !== "completed" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleTriggerTestCall(reminder)}
                        title="Simulate call right now"
                        className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700 hover:text-black hover:border-neutral-400 transition cursor-pointer flex items-center gap-1 bg-white shadow-xs"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                        <span>Test Call</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMarkDone(reminder.id)}
                        className="rounded-full bg-neutral-100 hover:bg-emerald-50 hover:text-emerald-700 text-neutral-700 px-3 py-1.5 text-xs transition cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Done</span>
                      </button>
                    </>
                  )}

                  {reminder.status === "completed" && (
                    <span className="text-xs font-mono text-emerald-600 px-3 py-1 bg-emerald-50 rounded-full">
                      ✓ Done
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* CREATE REMINDER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-neutral-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <h3 className="text-lg font-normal text-[#151515] tracking-tight">
                New Voice Reminder
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-black transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                  What should Remind tell you?
                </label>
                <textarea
                  rows={3}
                  required
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="e.g., Call the accountant before 5 PM to finalize tax docs..."
                  className="w-full rounded-xl border border-neutral-300 p-3 text-sm text-[#151515] placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                    Target Time
                  </label>
                  <input
                    type="text"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="09:30 AM"
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm text-[#151515] focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                    Voice Persona
                  </label>
                  <select
                    value={newPersona}
                    onChange={(e) => setNewPersona(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm text-[#151515] focus:outline-none focus:border-neutral-900 bg-white"
                  >
                    <option value="Elena">Elena (Friendly & Warm)</option>
                    <option value="Marcus">Marcus (Direct & Assertive)</option>
                    <option value="Sofia">Sofia (Calm & Mindful)</option>
                    <option value="James">James (Professional)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-full px-5 py-2 text-xs font-medium text-neutral-600 hover:text-black transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#18181b] px-6 py-2 text-xs sm:text-sm font-medium text-white hover:bg-black transition shadow-sm cursor-pointer"
                >
                  Schedule Call
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPGRADE MODAL (Free Trial Limit Reached) */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-neutral-200 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
              <Sparkles className="h-6 w-6" />
            </div>

            <h3 className="text-xl font-medium text-[#151515] tracking-tight">
              3-Day Free Trial Limit Reached
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-neutral-500 leading-relaxed">
              You have used your <strong>2 free reminders</strong> included in the 3-day free plan.
              Upgrade to a subscription to unlock unlimited voice phone calls, custom personalities, and automated retries.
            </p>

            <div className="mt-6 p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-neutral-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Unlimited automated AI phone calls</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Conversational voice rescheduling</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Custom personalities & morning routines</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowUpgradeModal(false);
                  toast.info("Subscription checkout integration will open here!");
                }}
                className="w-full rounded-full bg-[#18181b] px-4 py-2.5 text-sm font-medium text-white hover:bg-black transition shadow-sm cursor-pointer"
              >
                Upgrade to Pro
              </button>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="w-full rounded-full px-4 py-2 text-xs text-neutral-500 hover:text-black transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
