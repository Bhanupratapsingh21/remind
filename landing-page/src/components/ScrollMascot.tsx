"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AgentMascot } from "@/components/AgentMascot";

const MASCOT_SIZE = 84;
const BOX_W = MASCOT_SIZE * 1.55;
const BOX_H = MASCOT_SIZE * 1.45;

interface Target {
  x: number;
  y: number;
  say: string;
  side: "left" | "right";
}

/**
 * The agent leaves the hero and flies from section to section as you scroll,
 * parking at the corner each MascotSpot asks for and saying a line about it.
 * Desktop only; hidden while the hero or footer is on screen.
 */
export function ScrollMascot() {
  const [target, setTarget] = useState<Target | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      if (vw < 1024) {
        setVisible(false);
        return;
      }

      const heroBottom = document.getElementById("hero")?.getBoundingClientRect().bottom ?? 0;
      const footerTop = document.getElementById("site-footer")?.getBoundingClientRect().top ?? Infinity;
      if (heroBottom > vh * 0.45 || footerTop < vh * 0.55) {
        setVisible(false);
        return;
      }

      // nearest marked section to the middle of the viewport
      let best: HTMLElement | null = null;
      let bestDistance = Infinity;
      document.querySelectorAll<HTMLElement>("[data-mascot-say]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - vh / 2);
        if (d < bestDistance) {
          bestDistance = d;
          best = el;
        }
      });
      if (!best) {
        setVisible(false);
        return;
      }

      const el = best as HTMLElement;
      // park beside the section's inner content box, not the full-width wrapper
      const anchor = el.querySelector<HTMLElement>("section > div") ?? el;
      const r = anchor.getBoundingClientRect();
      const side = (el.dataset.mascotSide as "left" | "right") || "right";
      const at = el.dataset.mascotAt || "top";

      // vertical position comes from the section box, so the agent sits in its padding, clear of text
      const sr = (el.querySelector<HTMLElement>("section") ?? el).getBoundingClientRect();

      const rawX = side === "left" ? r.left - BOX_W + 40 : r.right - 40;
      const x = Math.min(Math.max(rawX, 8), vw - BOX_W - 8);
      const rawY = at === "bottom" ? sr.bottom - BOX_H - 8 : sr.top + 8;
      const y = Math.min(Math.max(rawY, 84), vh - BOX_H - 24);

      setTarget({ x, y, say: el.dataset.mascotSay || "", side });
      setVisible(true);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  if (!target) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-40 hidden lg:block"
      initial={false}
      animate={{ x: target.x, y: target.y, opacity: visible ? 1 : 0, rotate: target.side === "left" ? 6 : -6 }}
      transition={{ type: "spring", stiffness: 46, damping: 13, mass: 1.1, opacity: { duration: 0.35 } }}
    >
      <AgentMascot size={MASCOT_SIZE} />
      <AnimatePresence mode="wait">
        {target.say && visible && (
          <motion.span
            key={target.say}
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className={`absolute top-1 block w-max max-w-[200px] rounded-2xl bg-zinc-950 px-3.5 py-2 text-[13px] leading-snug text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,.5)] ${
              target.side === "left" ? "left-full ml-1" : "right-full mr-1 text-right"
            }`}
          >
            {target.say}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
