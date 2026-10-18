"use client";

import { motion } from "framer-motion";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** seconds; stagger siblings with i * 0.08 */
  delay?: number;
  /** starting vertical offset in px */
  y?: number;
}

/** Fades and lifts its children into view the first time they scroll on screen */
export function Reveal({ children, className, delay = 0, y = 28 }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface MascotSpotProps {
  children: React.ReactNode;
  /** What the flying agent says while this section is on screen */
  say: string;
  /** Which corner of the section it hovers at */
  side?: "left" | "right";
  at?: "top" | "bottom";
  className?: string;
  id?: string;
}

/** Marks a section as a stop for the ScrollMascot */
export function MascotSpot({ children, say, side = "right", at = "top", className, id }: MascotSpotProps) {
  return (
    <div id={id} data-mascot-say={say} data-mascot-side={side} data-mascot-at={at} className={className}>
      {children}
    </div>
  );
}
