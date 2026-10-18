"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";

interface AgentMascotProps {
  /** Head diameter in px; the whole figure is ~1.5x this */
  size?: number;
  className?: string;
}

const AMBER_GLOW = "0 0 6px rgba(255,186,110,1), 0 0 16px rgba(255,150,60,.85), 0 0 28px rgba(255,140,40,.45)";

/**
 * The Remind AI agent: cream shell, glossy black visor, glowing amber eyes,
 * ear pods and "ringing" signal lines.
 * Floats, blinks and glances toward the cursor.
 */
export function AgentMascot({ size = 150, className = "" }: AgentMascotProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const id = useId().replace(/:/g, "");

  // Eyes drift toward the pointer (in SVG units, max ~3 of 100)
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, dist / 400) * 3;
      setLook({ x: (dx / dist) * k, y: (dy / dist) * k });
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Natural blinking every few seconds
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 130);
        schedule();
      }, 2500 + Math.random() * 3000);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  const s = size;

  return (
    <div
      ref={rootRef}
      className={`relative select-none ${className}`}
      style={{ width: s * 1.55, height: s * 1.45 }}
      aria-label="Remind AI agent"
      role="img"
    >
      {/* warm floor shadow, shrinks as the agent rises */}
      <motion.div
        className="absolute left-1/2 rounded-[50%]"
        style={{
          bottom: 0,
          width: s * 0.95,
          height: s * 0.13,
          marginLeft: -s * 0.4,
          background: "radial-gradient(ellipse, rgba(205,120,55,.5) 0%, rgba(205,120,55,0) 70%)",
          filter: "blur(5px)",
        }}
        animate={{ scaleX: [1, 0.82, 1], opacity: [0.9, 0.55, 0.9] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute inset-x-0 top-0"
        style={{ height: s * 1.25 }}
        animate={{ y: [0, -s * 0.07, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* soft warm halo behind the head */}
        <span
          className="absolute rounded-full"
          style={{
            left: s * 0.18,
            top: s * 0.04,
            width: s * 1.25,
            height: s * 1.25,
            background: "radial-gradient(circle, rgba(255,196,130,.4) 0%, rgba(255,210,160,.15) 45%, rgba(255,220,180,0) 70%)",
          }}
        />

        {/* signal lines radiating from the top-left: the agent is calling */}
        {[
          { left: s * 0.27, top: s * 0.0, w: s * 0.2, rot: 62 },
          { left: s * 0.03, top: s * 0.27, w: s * 0.17, rot: 22 },
        ].map((l, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{
              left: l.left,
              top: l.top,
              width: l.w,
              height: s * 0.05,
              rotate: l.rot,
              background: "linear-gradient(90deg, #fff6e8, #ffe1b5)",
              boxShadow: AMBER_GLOW,
            }}
            animate={{ opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}

        {/* tilted head */}
        <div
          className="absolute"
          style={{ left: s * 0.3, top: s * 0.17, width: s, height: s }}
        >
          {/* ear pods: left one high, right one low, tucked behind the shell */}
          {[
            { left: -s * 0.17, top: s * 0.24, h: s * 0.46, shade: "inset 8px -6px 12px rgba(200,140,85,.35)" },
            { left: s * 0.85, top: s * 0.3, h: s * 0.46, shade: "inset -8px -6px 12px rgba(200,140,85,.35)" },
          ].map((e, i) => (
            <span
              key={i}
              className="absolute rounded-[50%]"
              style={{
                left: e.left,
                top: e.top,
                width: s * 0.32,
                height: e.h,
                background: "radial-gradient(circle at 42% 30%, #fffdf9 0%, #f7ebdd 50%, #e3c7a6 100%)",
                boxShadow: `${e.shade}, 0 0 14px rgba(255,165,80,.35), 0 8px 18px rgba(170,100,45,.25)`,
              }}
            />
          ))}

          {/* shell with amber rim light */}
          <div
            className="absolute inset-0 rounded-[50%]"
            style={{
              background: "radial-gradient(circle at 34% 22%, #fffefb 0%, #faf0e5 45%, #ecd4b8 100%)",
              boxShadow: [
                "inset 0 7px 12px rgba(255,255,255,.95)",
                "inset -7px -10px 16px rgba(255,160,80,.45)",
                "0 0 30px rgba(255,170,90,.45)",
                "0 20px 40px -14px rgba(160,95,40,.4)",
              ].join(", "),
            }}
          />

          {/* glossy visor */}
          <div
            className="absolute overflow-hidden rounded-[50%]"
            style={{
              inset: s * 0.075,
              background: "radial-gradient(circle at 40% 30%, #2c2830 0%, #121015 45%, #050406 100%)",
              boxShadow: "0 0 0 1.5px rgba(255,210,160,.55), 0 0 10px rgba(255,170,90,.35), inset 0 0 22px rgba(0,0,0,.85)",
            }}
          >
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
              <defs>
                <filter id={`glow-${id}`} x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur stdDeviation="1.6" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id={`eye-${id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fffaf1" />
                  <stop offset="100%" stopColor="#ffe3b8" />
                </linearGradient>
                <linearGradient id={`gloss-${id}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fff" stopOpacity=".55" />
                  <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* soft specular highlight, top-left of the visor */}
              <ellipse
                cx="30"
                cy="24"
                rx="13"
                ry="5"
                fill={`url(#gloss-${id})`}
                transform="rotate(-38 30 24)"
                style={{ filter: "blur(1.5px)" }}
              />

              {/* eyes, shifted toward the cursor */}
              <g
                filter={`url(#glow-${id})`}
                style={{ transform: `translate(${look.x}px, ${look.y}px)`, transition: "transform .2s ease-out" }}
              >
                {[
                  { x: 31, y: 37 },
                  { x: 57, y: 37 },
                ].map((e, i) => (
                  <g key={i}>
                    <rect
                      x={e.x}
                      y={e.y}
                      width="12"
                      height="20"
                      rx="6"
                      fill={`url(#eye-${id})`}
                      style={{
                        transformBox: "fill-box",
                        transformOrigin: "center",
                        transform: blink ? "scaleY(0.1)" : "scaleY(1)",
                        transition: "transform .09s",
                      }}
                    />
                  </g>
                ))}
              </g>
            </svg>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
