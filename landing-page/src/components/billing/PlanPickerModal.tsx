"use client";

import React, { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { PLANS, type PlanId, planLabel } from "@/lib/plans";
import { useAppDispatch, useAppSelector } from "@/store";
import { updateUser } from "@/store/slices/authSlice";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Why the picker opened, e.g. the limit message from the server */
  reason?: string | null;
}

export function PlanPickerModal({ open, onClose, reason }: Props) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [busy, setBusy] = useState<PlanId | "cancel" | null>(null);

  if (!open) return null;

  const current = user?.plan;
  const hasSubscription = current === "BASIC" || current === "PRO";

  const choose = async (plan: PlanId) => {
    setBusy(plan);
    try {
      const res = await api.post("/billing/checkout", { plan });
      const data = res.data?.data || {};
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }
      if (data.changed) {
        toast.success(`Switching you to ${planLabel(plan)}. This can take a few seconds to show.`);
        onClose();
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Could not start checkout. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const cancel = async () => {
    if (!window.confirm("Cancel your plan? It stays active until the end of this billing period.")) return;
    setBusy("cancel");
    try {
      const res = await api.post("/billing/cancel");
      dispatch(updateUser({ cancelAtPeriodEnd: true }));
      toast.success(res.data?.message || "Your plan will end at the close of this billing period.");
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || "Could not cancel. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="plan-picker-title"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-[28px] bg-canvas p-5 shadow-2xl sm:rounded-[28px] sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="plan-picker-title" className="font-display text-2xl tracking-tight text-zinc-950 sm:text-3xl">
              {hasSubscription ? "Your plan" : "Choose a plan"}
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              {reason || (hasSubscription ? `You're on ${planLabel(current)}.` : "Keep your reminders calling. Cancel anytime.")}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="cursor-pointer rounded-full p-2 text-zinc-500 hover:bg-zinc-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {PLANS.map((p) => {
            const isCurrent = current === p.id;
            return (
              <div
                key={p.id}
                className={`flex flex-col rounded-[22px] p-6 ${
                  p.highlight ? "bg-[linear-gradient(160deg,#121830_0%,#262a4d_55%,#4a3550_100%)] text-white" : "bg-white text-zinc-950"
                }`}
              >
                <p className={`text-[13px] ${p.highlight ? "text-amber-200" : "text-zinc-500"}`}>{p.name}</p>
                <p className="mt-1 font-display text-4xl tracking-tight">
                  {p.price}
                  <span className={`ml-2 text-[13px] tracking-normal ${p.highlight ? "text-zinc-400" : "text-zinc-500"}`}>{p.period}</span>
                </p>
                <ul className="mt-4 space-y-2">
                  {p.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px]">
                      <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${p.highlight ? "text-amber-300" : "text-amber-600"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={isCurrent || busy !== null}
                  onClick={() => choose(p.id)}
                  className={`mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    p.highlight ? "bg-white text-zinc-950 hover:bg-zinc-100" : "bg-zinc-950 text-white hover:bg-zinc-800"
                  }`}
                >
                  {busy === p.id && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isCurrent ? "Current plan" : hasSubscription ? `Switch to ${p.name}` : `Get ${p.name}`}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col items-center gap-2 text-center text-[12px] text-zinc-500">
          {hasSubscription && user?.currentPeriodEnd && (
            <p>
              {user.cancelAtPeriodEnd ? "Ends" : "Renews"} on{" "}
              {new Date(user.currentPeriodEnd).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
            </p>
          )}
          {hasSubscription && !user?.cancelAtPeriodEnd && (
            <button type="button" onClick={cancel} disabled={busy !== null} className="cursor-pointer underline underline-offset-2 hover:text-zinc-800">
              {busy === "cancel" ? "Cancelling…" : "Cancel plan"}
            </button>
          )}
          <p>Prices in INR, billed monthly. Secure checkout by Dodo Payments.</p>
        </div>
      </div>
    </div>
  );
}
