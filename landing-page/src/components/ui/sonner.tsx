"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon, XIcon } from "lucide-react";

/**
 * Toasts in the site's night-card style: navy gradient, white text, amber accent,
 * big rounded corners. Fully unstyled so sonner's defaults don't fight the design.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-right"
      offset={20}
      gap={10}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
        close: <XIcon className="size-3.5" />,
      }}
      toastOptions={{
        unstyled: true,
        duration: 4000,
        classNames: {
          toast:
            "group/toast flex w-[356px] items-start gap-3 rounded-[20px] bg-[linear-gradient(160deg,#121830_0%,#232648_60%,#3b2f4a_100%)] p-4 pr-10 text-white shadow-[0_20px_50px_-20px_rgba(18,24,48,.7),0_0_0_1px_rgba(255,255,255,.06)_inset]",
          icon:
            "mt-0.5 grid size-7 shrink-0 place-items-center rounded-xl bg-white/10 text-amber-300 [.toast-error_&]:text-rose-300 [.toast-warning_&]:text-amber-300 [.toast-success_&]:text-emerald-300 [.toast-info_&]:text-sky-200",
          content: "min-w-0 flex-1",
          title: "text-[14px] font-medium leading-snug text-white",
          description: "mt-0.5 font-serif text-[13px] leading-snug text-white/65",
          closeButton:
            "!absolute !left-auto !right-3 !top-3 !h-6 !w-6 !translate-x-0 !translate-y-0 !rounded-full !border-0 !bg-white/10 !text-white/70 hover:!bg-white/20 hover:!text-white",
          actionButton: "ml-2 shrink-0 rounded-xl bg-white px-3 py-1.5 text-[12px] font-medium text-zinc-950",
          cancelButton: "ml-2 shrink-0 rounded-xl bg-white/10 px-3 py-1.5 text-[12px] text-white/80",
          success: "toast-success",
          error: "toast-error",
          warning: "toast-warning",
          info: "toast-info",
          loading: "toast-loading",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
