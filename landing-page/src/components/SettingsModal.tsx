"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAppDispatch } from "@/store";
import { updateUser } from "@/store/slices/authSlice";

const VOICES = [
  { id: "Elena", label: "Elena · Friendly & warm" },
  { id: "Marcus", label: "Marcus · Direct & assertive" },
  { id: "Sofia", label: "Sofia · Calm & mindful" },
  { id: "James", label: "James · Professional" },
];

const labelCls = "block text-xs font-mono uppercase tracking-wider text-neutral-500 mb-1.5";
const inputCls =
  "w-full rounded-2xl border border-zinc-200 px-3.5 py-2 text-sm text-[#151515] bg-white focus:outline-none focus:border-neutral-900";

interface SettingsForm {
  phone: string;
  timezone: string;
  callingStartTime: string;
  callingEndTime: string;
  preferredVoice: string;
  defaultMaxAttempts: number;
  defaultRetryInterval: number;
}

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<SettingsForm | null>(null);
  const [initialPhone, setInitialPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const timezones = useMemo(() => {
    try {
      return typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : undefined;
    } catch {
      return undefined;
    }
  }, []);

  useEffect(() => {
    api
      .get("/users/settings")
      .then((res) => {
        const u = res.data?.data?.user || {};
        setInitialPhone(u.phone || "");
        setForm({
          phone: u.phone || "",
          timezone: u.timezone || "Asia/Kolkata",
          callingStartTime: u.callingStartTime || "08:00",
          callingEndTime: u.callingEndTime || "22:00",
          preferredVoice: u.preferredVoice || "Elena",
          defaultMaxAttempts: u.defaultMaxAttempts || 3,
          defaultRetryInterval: u.defaultRetryInterval || 10,
        });
      })
      .catch(() => setLoadFailed(true));
  }, []);

  const set = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    if (form.callingStartTime === form.callingEndTime) {
      toast.error("Calling hours need different start and end times.");
      return;
    }

    setSaving(true);
    try {
      const phone = form.phone.replace(/[^\d+]/g, "");
      await api.patch("/users/settings", {
        timezone: form.timezone,
        callingStartTime: form.callingStartTime,
        callingEndTime: form.callingEndTime,
        preferredVoice: form.preferredVoice,
        defaultMaxAttempts: Number(form.defaultMaxAttempts),
        defaultRetryInterval: Number(form.defaultRetryInterval),
        ...(phone && phone !== initialPhone ? { phone } : {}),
      });

      // Re-read so the stored, normalised phone number is what the dashboard shows
      const res = await api.get("/users/settings");
      const u = res.data?.data?.user || {};
      dispatch(updateUser({ phone: u.phone, timezone: u.timezone, preferredVoice: u.preferredVoice }));
      toast.success("Settings saved.");
      onClose();
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error(message || "Could not save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-[28px] p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <h3 className="text-lg font-medium text-[#151515] tracking-tight">Settings</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="grid h-8 w-8 place-items-center rounded-full text-neutral-400 hover:bg-zinc-100 hover:text-black transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {!form ? (
          <p className="py-10 text-center text-xs font-mono text-neutral-400">
            {loadFailed ? "Could not load your settings. Close and try again." : "Loading your settings..."}
          </p>
        ) : (
          <form onSubmit={handleSave} className="mt-6 space-y-4">
            <div>
              <label className={labelCls} htmlFor="settings-phone">
                Phone number (with country code)
              </label>
              <input
                id="settings-phone"
                type="tel"
                required
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+91 98765 43210"
                className={inputCls}
              />
              <p className="mt-1 text-[11px] text-neutral-400">Your agent calls this number.</p>
            </div>

            <div>
              <label className={labelCls} htmlFor="settings-timezone">
                Timezone
              </label>
              <input
                id="settings-timezone"
                list="settings-timezones"
                required
                value={form.timezone}
                onChange={(e) => set("timezone", e.target.value)}
                className={inputCls}
              />
              {timezones && (
                <datalist id="settings-timezones">
                  {timezones.map((tz) => (
                    <option key={tz} value={tz} />
                  ))}
                </datalist>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls} htmlFor="settings-start">
                  Calls from
                </label>
                <input
                  id="settings-start"
                  type="time"
                  required
                  value={form.callingStartTime}
                  onChange={(e) => set("callingStartTime", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="settings-end">
                  Calls until
                </label>
                <input
                  id="settings-end"
                  type="time"
                  required
                  value={form.callingEndTime}
                  onChange={(e) => set("callingEndTime", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
            <p className="-mt-2 text-[11px] text-neutral-400">
              Reminders due outside these hours ring at the next allowed time.
            </p>

            <div>
              <label className={labelCls} htmlFor="settings-voice">
                Voice
              </label>
              <select
                id="settings-voice"
                value={form.preferredVoice}
                onChange={(e) => set("preferredVoice", e.target.value)}
                className={inputCls}
              >
                {VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls} htmlFor="settings-attempts">
                  Call attempts
                </label>
                <input
                  id="settings-attempts"
                  type="number"
                  min={1}
                  max={10}
                  value={form.defaultMaxAttempts}
                  onChange={(e) => set("defaultMaxAttempts", Number(e.target.value))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="settings-interval">
                  Minutes between tries
                </label>
                <input
                  id="settings-interval"
                  type="number"
                  min={1}
                  max={120}
                  value={form.defaultRetryInterval}
                  onChange={(e) => set("defaultRetryInterval", Number(e.target.value))}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-4 py-2 text-xs text-neutral-500 hover:text-black transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-black transition shadow-sm cursor-pointer disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save settings"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
