"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout } from "@/store/slices/authSlice";
import api from "@/lib/api";
import { toast } from "sonner";
import { AgentMascot } from "@/components/AgentMascot";
import { SiteNav } from "@/components/site/SiteNav";
import {
  PhoneCall,
  Plus,
  Clock,
  CheckCircle2,
  RotateCcw,
  LogOut,
  Volume2,
  ArrowUpRight,
  History,
  Trash2,
  Calendar,
  AlertCircle,
  PhoneForwarded,
} from "lucide-react";

interface ReminderAttempt {
  id: string;
  attemptNumber: number;
  channel: string;
  status: string;
  vapiCallId?: string;
  startedAt?: string;
  answeredAt?: string;
  endedAt?: string;
  duration?: number;
  transcript?: string;
  failureReason?: string;
  userResponse?: string;
  createdAt: string;
}

interface ReminderItem {
  id: string;
  title: string;
  task?: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status:
    | "SCHEDULED"
    | "CALLING"
    | "ACKNOWLEDGED"
    | "COMPLETED"
    | "SNOOZED"
    | "MISSED"
    | "CANCELLED"
    | "FAILED";
  scheduledAt: string;
  timezone: string;
  notificationChannel: string;
  maxAttempts: number;
  retryIntervalMinutes: number;
  voicePersona?: string;
  completedAt?: string;
  attempts?: ReminderAttempt[];
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loadingReminders, setLoadingReminders] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedReminderForHistory, setSelectedReminderForHistory] = useState<ReminderItem | null>(null);

  // Create Reminder Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newTime, setNewTime] = useState("10:00");
  const [newPriority, setNewPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("HIGH");
  const [newPersona, setNewPersona] = useState(user?.preferredVoice || "Elena");
  const [newMaxAttempts, setNewMaxAttempts] = useState(3);
  const [newRetryInterval, setNewRetryInterval] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Fetch reminders from backend
  const fetchReminders = useCallback(async () => {
    try {
      setLoadingReminders(true);
      const res = await api.get("/reminders");
      if (res.data?.success) {
        setReminders(res.data.data || []);
      }
    } catch (err: any) {
      console.error("Failed to load reminders:", err);
      toast.error("Could not load reminders from server.");
    } finally {
      setLoadingReminders(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.isOnboarded) {
      fetchReminders();
    }
  }, [isAuthenticated, user?.isOnboarded, fetchReminders]);

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
  const activeReminders = reminders.filter((r) =>
    ["SCHEDULED", "CALLING", "SNOOZED"].includes(r.status)
  );
  const isAtQuota = user?.plan === "TRIAL" && activeReminders.length >= maxAllowedReminders;

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

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Please enter a task title.");
      return;
    }

    try {
      setIsSubmitting(true);
      const scheduledDateTime = new Date(`${newDate}T${newTime}:00`);

      const payload = {
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        scheduledAt: scheduledDateTime.toISOString(),
        timezone: user?.timezone || "Asia/Kolkata",
        priority: newPriority,
        voicePersona: newPersona,
        retryPolicy: {
          maxAttempts: Number(newMaxAttempts),
          retryIntervalMinutes: Number(newRetryInterval),
        },
      };

      const res = await api.post("/reminders", payload);
      if (res.data?.success) {
        toast.success(`Voice call scheduled for ${scheduledDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}!`);
        setShowCreateModal(false);
        setNewTitle("");
        setNewDescription("");
        await fetchReminders();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to create reminder";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTriggerTestCall = async (reminder: ReminderItem) => {
    try {
      toast.info(`Triggering immediate AI outbound call for "${reminder.title}"...`);
      const res = await api.post(`/reminders/${reminder.id}/retry`);
      if (res.data?.success) {
        toast.success("Call dispatched! Check terminal / telephony provider.");
        await fetchReminders();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to trigger call");
    }
  };

  const handleMarkDone = async (id: string) => {
    try {
      const res = await api.post(`/reminders/${id}/complete`);
      if (res.data?.success) {
        toast.success("Reminder marked as COMPLETED!");
        await fetchReminders();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to complete reminder");
    }
  };

  const handleSnooze = async (id: string, minutes: number = 30) => {
    try {
      const res = await api.post(`/reminders/${id}/snooze`, { minutes });
      if (res.data?.success) {
        toast.success(`Snoozed for ${minutes} minutes!`);
        await fetchReminders();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to snooze reminder");
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this reminder?")) return;
    try {
      const res = await api.post(`/reminders/${id}/cancel`);
      if (res.data?.success) {
        toast.success("Reminder cancelled.");
        await fetchReminders();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to cancel reminder");
    }
  };

  const handleOpenHistory = async (reminder: ReminderItem) => {
    try {
      const res = await api.get(`/reminders/${reminder.id}/attempts`);
      if (res.data?.success) {
        setSelectedReminderForHistory({
          ...reminder,
          attempts: res.data.data,
        });
        setShowHistoryModal(true);
      }
    } catch {
      setSelectedReminderForHistory(reminder);
      setShowHistoryModal(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-3">
          <AgentMascot size={80} />
          <p className="text-xs font-mono text-neutral-400">Waking up your agent...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.isOnboarded) {
    return null;
  }

  return (
    <div className="min-h-screen bg-canvas text-ink antialiased">
      {/* TOP DASHBOARD NAVIGATION */}
      <SiteNav
        showLinks={false}
        right={
          <div className="flex items-center gap-3">
            {/* Active Phone Tag */}
            <div className="hidden md:flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-mono text-xs text-zinc-600 shadow-xs">
              <PhoneCall className="h-3.5 w-3.5 text-emerald-600" />
              <span>{user?.phone || "No phone linked"}</span>
            </div>

            {/* User Profile & Logout */}
            <div className="text-right hidden sm:block">
              <span className="text-xs font-medium text-ink block">{user?.name || "User"}</span>
              {user?.username && (
                <span className="text-[11px] font-mono text-neutral-400 block">@{user.username}</span>
              )}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              className="flex items-center gap-1.5 rounded-xl border border-zinc-900 px-3 py-2 text-xs font-medium text-zinc-900 hover:bg-zinc-100 transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        }
      />

      {/* 3-DAY FREE TRIAL BANNER */}
      <div className="mx-auto max-w-6xl px-4 pt-2 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-[20px] bg-zinc-950 px-5 py-3.5 text-white">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold tracking-wide">
              {user?.plan === "PRO" ? "Pro Subscription:" : "3-Day Free Trial:"}
            </span>
            <span className="text-neutral-300 font-mono">
              {user?.plan === "PRO" ? "Unlimited Reminders" : `${trialInfo.label} • ${activeReminders.length}/${maxAllowedReminders} Active`}
            </span>
          </div>

          {user?.plan !== "PRO" && (
            <button
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              className="text-[11px] font-medium text-amber-300 hover:text-amber-200 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
            >
              <span>Upgrade to Unlimited Pro</span>
              <ArrowUpRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* MAIN DASHBOARD CONTENT */}
      <main className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        {/* Welcome Header */}
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#a9c8ea_0%,#d8e3ef_50%,#f3dcc6_100%)] p-6 sm:p-8">
          <div className="pointer-events-none absolute -top-20 right-[25%] h-56 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,206,150,.65),transparent_70%)] blur-2xl" />
          <div className="relative flex items-center gap-4">
            <AgentMascot size={72} className="hidden sm:block" />
            <div>
              <h1 className="font-display text-3xl sm:text-4xl tracking-[-0.03em] text-zinc-950">
                Good day, {user?.name || "there"}.
              </h1>
              <p className="mt-1 font-serif text-[15px] text-zinc-700">
                Your AI agent will call you the moment each reminder is due.
              </p>
            </div>
          </div>

          {/* Create Reminder CTA */}
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="relative inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800 transition-all cursor-pointer shadow-lg shadow-zinc-950/20 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            New Voice Reminder
          </button>
        </div>

        {/* Stats Row */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-[28px] bg-tray p-3">
          <div className="bg-white p-5 rounded-[22px]">
            <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
              Active Reminders
            </span>
            <p className="mt-2 font-display text-2xl sm:text-3xl tracking-tight font-normal text-[#151515]">
              {activeReminders.length}
            </p>
            <p className="mt-1 text-xs text-neutral-500">Scheduled calls</p>
          </div>

          <div className="bg-white p-5 rounded-[22px]">
            <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
              Account Timezone
            </span>
            <p className="mt-2 font-display text-2xl sm:text-3xl tracking-tight font-normal text-neutral-800 truncate">
              {user?.timezone || "Asia/Kolkata"}
            </p>
            <p className="mt-1 text-xs text-neutral-500">Calling hours applied</p>
          </div>

          <div className="bg-white p-5 rounded-[22px]">
            <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
              Voice Persona
            </span>
            <p className="mt-2 font-display text-2xl sm:text-3xl tracking-tight font-normal text-[#151515]">
              {user?.preferredVoice || "Elena"}
            </p>
            <p className="mt-1 text-xs text-neutral-500">Your agent's voice</p>
          </div>

          <div className="bg-white p-5 rounded-[22px]">
            <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
              Telephony Line
            </span>
            <p className="mt-2 font-display text-2xl sm:text-3xl tracking-tight font-normal text-emerald-600 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </p>
            <p className="mt-1 text-xs text-neutral-500">Calls reach your phone</p>
          </div>
        </div>

        {/* Reminders List Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="font-display text-2xl text-ink tracking-[-0.02em]">
              Reminders ({reminders.length})
            </h2>
            <button
              onClick={fetchReminders}
              className="rounded-xl px-3 py-1.5 text-xs text-neutral-500 hover:bg-white hover:text-black font-mono cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Refresh
            </button>
          </div>

          {loadingReminders ? (
            <div className="bg-white p-8 rounded-[28px] text-center text-xs text-neutral-400">
              Loading reminders...
            </div>
          ) : reminders.length === 0 ? (
            <div className="flex flex-col items-center bg-white p-12 rounded-[28px] text-center">
              <AgentMascot size={70} className="mb-2" />
              <p className="text-sm font-medium text-neutral-800">No voice reminders scheduled</p>
              <p className="text-xs text-neutral-500 mt-1">Click "New Voice Reminder" above to get started.</p>
            </div>
          ) : (
            <div className="space-y-2.5 rounded-[28px] bg-tray p-3">
              {reminders.map((reminder) => {
                const dateObj = new Date(reminder.scheduledAt);
                const timeFormatted = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                const dateFormatted = dateObj.toLocaleDateString([], { month: "short", day: "numeric" });

                return (
                  <div
                    key={reminder.id}
                    className="group bg-white p-5 rounded-[22px] hover:shadow-[0_12px_32px_-18px_rgba(120,80,30,.35)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    {/* Left Task Info */}
                    <div className="flex items-start gap-4">
                      <div
                        className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                          reminder.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-600"
                            : reminder.status === "SNOOZED"
                            ? "bg-amber-50 text-amber-600"
                            : reminder.status === "MISSED" || reminder.status === "FAILED"
                            ? "bg-red-50 text-red-600"
                            : reminder.status === "CALLING"
                            ? "bg-blue-50 text-blue-600 animate-pulse"
                            : "bg-neutral-100 text-[#151515]"
                        }`}
                      >
                        {reminder.status === "COMPLETED" ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : reminder.status === "SNOOZED" ? (
                          <RotateCcw className="h-5 w-5" />
                        ) : reminder.status === "MISSED" || reminder.status === "FAILED" ? (
                          <AlertCircle className="h-5 w-5" />
                        ) : reminder.status === "CALLING" ? (
                          <PhoneForwarded className="h-5 w-5" />
                        ) : (
                          <PhoneCall className="h-5 w-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3
                            className={`text-sm sm:text-base font-medium tracking-tight text-[#151515] ${
                              reminder.status === "COMPLETED" ? "line-through text-neutral-400" : ""
                            }`}
                          >
                            {reminder.title}
                          </h3>
                          <span
                            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                              reminder.priority === "CRITICAL"
                                ? "bg-red-100 text-red-700"
                                : reminder.priority === "HIGH"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            {reminder.priority}
                          </span>
                          <span
                            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                              reminder.status === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-800"
                                : reminder.status === "SNOOZED"
                                ? "bg-amber-100 text-amber-800"
                                : reminder.status === "MISSED"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {reminder.status}
                          </span>
                        </div>

                        {reminder.description && (
                          <p className="mt-1 text-xs text-neutral-500 line-clamp-1">{reminder.description}</p>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="h-3 w-3" />
                            <span>{timeFormatted}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="h-3 w-3" />
                            <span>{dateFormatted}</span>
                          </span>
                          <span>•</span>
                          <span className="text-neutral-400 font-mono text-[11px]">
                            Voice: {reminder.voicePersona || "Elena"}
                          </span>
                          <span>•</span>
                          <span className="text-neutral-400 font-mono text-[11px]">
                            Retries: {reminder.maxAttempts}x ({reminder.retryIntervalMinutes}m)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Action Controls */}
                    <div className="flex items-center gap-2 pt-2 sm:pt-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleOpenHistory(reminder)}
                        title="View Call Attempts & Transcripts"
                        className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:text-black hover:border-neutral-400 transition cursor-pointer flex items-center gap-1 bg-white shadow-xs"
                      >
                        <History className="h-3.5 w-3.5" />
                        <span>History</span>
                      </button>

                      {reminder.status !== "COMPLETED" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleTriggerTestCall(reminder)}
                            title="Call right now via Vapi"
                            className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700 hover:text-black hover:border-neutral-400 transition cursor-pointer flex items-center gap-1 bg-white shadow-xs"
                          >
                            <Volume2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Call Now</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSnooze(reminder.id, 30)}
                            title="Snooze 30 mins"
                            className="rounded-full bg-neutral-100 hover:bg-amber-50 hover:text-amber-800 text-neutral-700 px-3 py-1.5 text-xs transition cursor-pointer flex items-center gap-1"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>+30m</span>
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

                      <button
                        type="button"
                        onClick={() => handleCancel(reminder.id)}
                        title="Cancel reminder"
                        className="rounded-full p-1.5 text-neutral-400 hover:text-rose-600 transition cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* CREATE REMINDER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-[28px] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <h3 className="text-lg font-medium text-[#151515] tracking-tight">
                New Voice Reminder
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-neutral-400 hover:bg-zinc-100 hover:text-black transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Review investor deck with Rahul"
                  className="w-full rounded-2xl border border-zinc-200 p-3 text-sm text-[#151515] placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                  Context / Description for Voice Agent (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="e.g., Ask if the Q3 projections were updated and offer to reschedule if not finished."
                  className="w-full rounded-2xl border border-zinc-200 p-3 text-sm text-[#151515] placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                    Target Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 px-3.5 py-2 text-sm text-[#151515] focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                    Target Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 px-3.5 py-2 text-sm text-[#151515] focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full rounded-2xl border border-zinc-200 px-3.5 py-2 text-sm text-[#151515] focus:outline-none focus:border-neutral-900 bg-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                    Voice Persona
                  </label>
                  <select
                    value={newPersona}
                    onChange={(e) => setNewPersona(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 px-3.5 py-2 text-sm text-[#151515] focus:outline-none focus:border-neutral-900 bg-white"
                  >
                    <option value="Elena">Elena (Friendly & Warm)</option>
                    <option value="Marcus">Marcus (Direct & Assertive)</option>
                    <option value="Sofia">Sofia (Calm & Mindful)</option>
                    <option value="James">James (Professional)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                    Max Retries if Unanswered
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={newMaxAttempts}
                    onChange={(e) => setNewMaxAttempts(Number(e.target.value))}
                    className="w-full rounded-2xl border border-zinc-200 px-3.5 py-2 text-sm text-[#151515] focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                    Retry Interval (Minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={60}
                    value={newRetryInterval}
                    onChange={(e) => setNewRetryInterval(Number(e.target.value))}
                    className="w-full rounded-2xl border border-zinc-200 px-3.5 py-2 text-sm text-[#151515] focus:outline-none focus:border-neutral-900"
                  />
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
                  disabled={isSubmitting}
                  className="rounded-2xl bg-zinc-950 px-6 py-2 text-xs sm:text-sm font-medium text-white hover:bg-black transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Scheduling..." : "Schedule Call"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CALL ATTEMPTS / HISTORY MODAL */}
      {showHistoryModal && selectedReminderForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-white rounded-[28px] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div>
                <h3 className="text-lg font-medium text-[#151515]">
                  Call History: {selectedReminderForHistory.title}
                </h3>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  Priority: {selectedReminderForHistory.priority} • Retries: {selectedReminderForHistory.maxAttempts}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-neutral-400 hover:bg-zinc-100 hover:text-black transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-3 max-h-96 overflow-y-auto pr-1">
              {!selectedReminderForHistory.attempts || selectedReminderForHistory.attempts.length === 0 ? (
                <p className="text-xs text-neutral-500 py-6 text-center">No call attempts recorded yet.</p>
              ) : (
                selectedReminderForHistory.attempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="p-4 bg-zinc-50 rounded-[20px] text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-900">
                        📞 Attempt #{attempt.attemptNumber}
                      </span>
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${
                          attempt.status === "COMPLETED" || attempt.status === "ANSWERED"
                            ? "bg-emerald-100 text-emerald-800"
                            : attempt.status === "NO_ANSWER" || attempt.status === "BUSY"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-neutral-200 text-neutral-700"
                        }`}
                      >
                        {attempt.status}
                      </span>
                    </div>

                    <div className="text-neutral-500 font-mono text-[11px] flex items-center justify-between pt-1">
                      <span>Time: {new Date(attempt.createdAt).toLocaleTimeString()}</span>
                      {attempt.duration !== undefined && attempt.duration !== null && (
                        <span>Duration: {attempt.duration}s</span>
                      )}
                    </div>

                    {attempt.transcript && (
                      <div className="mt-2 p-3 bg-white rounded-2xl border border-zinc-100 text-neutral-700 text-[11px]">
                        <span className="font-semibold text-neutral-900 block mb-1">Transcript:</span>
                        <p className="italic">{attempt.transcript}</p>
                      </div>
                    )}

                    {attempt.failureReason && (
                      <p className="text-rose-600 text-[11px]">Reason: {attempt.failureReason}</p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="rounded-full bg-neutral-100 hover:bg-neutral-200 px-5 py-2 text-xs font-medium text-neutral-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPGRADE MODAL */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-[28px] p-6 sm:p-8 shadow-2xl text-center">
            <div className="flex justify-center">
              <AgentMascot size={72} />
            </div>

            <h3 className="text-xl font-medium text-[#151515] tracking-tight">
              3-Day Free Trial Limit Reached
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-neutral-500 leading-relaxed">
              You have used your <strong>{maxAllowedReminders} free active reminders</strong>.
              Upgrade to a Pro subscription for unlimited phone calling, custom voice personas, and smart retry schedules.
            </p>

            <div className="mt-6 p-4 bg-amber-50/60 rounded-[20px] text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-neutral-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Unlimited automated voice phone calls</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Conversational voice rescheduling & snoozing</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Custom retry intervals & calling hours control</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowUpgradeModal(false);
                  toast.info("Subscription checkout integration will open here!");
                }}
                className="w-full rounded-2xl bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-black transition shadow-sm cursor-pointer"
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
