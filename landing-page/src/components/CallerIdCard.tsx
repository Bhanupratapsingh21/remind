"use client";

import React, { useEffect, useState } from "react";
import { Check, Copy, PhoneIncoming, UserPlus } from "lucide-react";
import api from "@/lib/api";

/** "+918065354620" -> "+91 80653 54620" */
function pretty(e164: string): string {
  const m = e164.match(/^\+91(\d{5})(\d{5})$/);
  return m ? `+91 ${m[1]} ${m[2]}` : e164;
}

/** A contact card phones open straight into "Add contact" */
function downloadVCard(number: string, name: string) {
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:;${name};;;`,
    `FN:${name} (reminder calls)`,
    `ORG:${name}`,
    `TEL;TYPE=CELL,VOICE:${number}`,
    "URL:https://remind.bpss.in",
    "NOTE:Your AI reminder calls come from this number.",
    "END:VCARD",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([vcard], { type: "text/vcard;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "Remind.vcf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Shows the number reminder calls come from, so people save it and don't reject or report it as spam */
export function CallerIdCard() {
  const [number, setNumber] = useState<string | null>(null);
  const [name, setName] = useState("Remind");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/config")
      .then((res) => {
        if (cancelled) return;
        setNumber(res.data?.data?.callerNumber || null);
        if (res.data?.data?.callerName) setName(res.data.data.callerName);
      })
      .catch(() => {
        // Card stays hidden if the config can't be loaded
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!number) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked; the number is visible to copy by hand
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-2 sm:px-6">
      <div className="flex flex-col gap-3 rounded-[20px] border border-emerald-100 bg-emerald-50/70 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-emerald-700 shadow-xs">
            <PhoneIncoming className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm text-emerald-950">
              Your reminder calls come from{" "}
              <a href={`tel:${number}`} className="font-mono font-semibold tracking-tight underline-offset-2 hover:underline">
                {pretty(number)}
              </a>
            </p>
            <p className="mt-0.5 text-xs text-emerald-900/70">
              Save it as &ldquo;{name}&rdquo; so you always pick up, and please don&apos;t mark it as spam.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => downloadVCard(number, name)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-emerald-800"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Save contact
          </button>
          <button
            type="button"
            onClick={copy}
            aria-label="Copy the calling number"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-medium text-emerald-900 transition hover:bg-emerald-50"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
