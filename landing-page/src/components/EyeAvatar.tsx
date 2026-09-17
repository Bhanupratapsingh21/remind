"use client";

import * as React from "react";

export type EyeEmotion =
  | "neutral"
  | "happy"
  | "sleepy"
  | "focused"
  | "excited"
  | "caring"
  | "wink";

interface EyeAvatarProps {
  className?: string;
  size?: number;
  emotion?: EyeEmotion;
  blush?: boolean;
  interactive?: boolean;
}

export function EyeAvatar({
  className = "",
  size = 38,
  emotion = "neutral",
  blush = false,
  interactive = true,
}: EyeAvatarProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const leftPupilRef = React.useRef<HTMLSpanElement>(null);
  const rightPupilRef = React.useRef<HTMLSpanElement>(null);
  const [isBlinking, setIsBlinking] = React.useState(false);
  const [currentEmotion, setCurrentEmotion] = React.useState<EyeEmotion>(emotion);

  React.useEffect(() => {
    setCurrentEmotion(emotion);
  }, [emotion]);

  // Cute natural random blinking effect
  React.useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    let closeTimeout: NodeJS.Timeout;

    const triggerBlink = () => {
      // Happy eyes stay as cheerful arches
      if (currentEmotion === "happy") {
        blinkTimeout = setTimeout(triggerBlink, 3500);
        return;
      }

      setIsBlinking(true);
      closeTimeout = setTimeout(() => {
        setIsBlinking(false);
        const nextBlink = Math.random() * 3500 + 2200; // blink every 2.2s - 5.7s
        blinkTimeout = setTimeout(triggerBlink, nextBlink);
      }, 130);
    };

    blinkTimeout = setTimeout(triggerBlink, 2000);

    return () => {
      clearTimeout(blinkTimeout);
      clearTimeout(closeTimeout);
    };
  }, [currentEmotion]);

  // Smooth cursor tracking via requestAnimationFrame
  React.useEffect(() => {
    if (currentEmotion === "happy") return;

    let animationFrameId: number;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const handlePointerMove = (event: PointerEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;
      const distance = Math.hypot(dx, dy);

      if (distance === 0) {
        targetX = 0;
        targetY = 0;
        return;
      }

      // Proportional maximum travel distance
      const maxOffset = Math.max(2.4, (size / 38) * 3.4);
      const offset = Math.min(distance / 25, maxOffset);
      const angle = Math.atan2(dy, dx);

      targetX = Math.cos(angle) * offset;
      targetY = Math.sin(angle) * (offset * 0.85); // slightly softer vertical travel for cute pill eyes
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;

      const transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

      if (leftPupilRef.current) {
        leftPupilRef.current.style.transform = transform;
      }
      if (rightPupilRef.current) {
        rightPupilRef.current.style.transform = transform;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [size, currentEmotion]);

  // Elongated, cute vertical capsule eye dimensions
  const eyeWidth = Math.max(4.6, (size / 38) * 5.4);
  const eyeHeight = Math.max(9.5, (size / 38) * 11.8); // elongated vertical ratio (~2.2x height to width)
  const gapSize = Math.max(5.5, (size / 38) * 7.5);

  // Click interaction
  const handleClick = () => {
    if (!interactive) return;
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 180);
  };

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size }}
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center rounded-full bg-[#151515] ring-1 ring-black/15 shadow-md flex-shrink-0 select-none cursor-pointer transition-transform hover:scale-105 active:scale-95 ${className}`}
      aria-label={`Cute Remind AI avatar (${currentEmotion})`}
      role="img"
    >
      {/* Soft Rosy Cheeks */}
      {(blush || currentEmotion === "happy" || currentEmotion === "caring") && (
        <>
          <span
            style={{
              width: Math.max(4.5, size * 0.15),
              height: Math.max(2.8, size * 0.08),
              bottom: size * 0.22,
              left: size * 0.12,
            }}
            className="absolute rounded-full bg-rose-400/40 blur-[0.6px]"
          />
          <span
            style={{
              width: Math.max(4.5, size * 0.15),
              height: Math.max(2.8, size * 0.08),
              bottom: size * 0.22,
              right: size * 0.12,
            }}
            className="absolute rounded-full bg-rose-400/40 blur-[0.6px]"
          />
        </>
      )}

      {/* RENDER EYES BY EMOTION */}
      {currentEmotion === "happy" ? (
        /* Happy: Cute inverted smiling arches (⌒ ⌒) */
        <div
          style={{ gap: gapSize }}
          className="flex items-center justify-center pb-0.5"
        >
          <svg
            style={{ width: eyeWidth * 1.6, height: eyeHeight * 0.65 }}
            viewBox="0 0 16 10"
            fill="none"
            className="stroke-white"
          >
            <path
              d="M2 9C3.5 3 6.5 2 8 2C9.5 2 12.5 3 14 9"
              strokeWidth={Math.max(2, size * 0.055)}
              strokeLinecap="round"
            />
          </svg>
          <svg
            style={{ width: eyeWidth * 1.6, height: eyeHeight * 0.65 }}
            viewBox="0 0 16 10"
            fill="none"
            className="stroke-white"
          >
            <path
              d="M2 9C3.5 3 6.5 2 8 2C9.5 2 12.5 3 14 9"
              strokeWidth={Math.max(2, size * 0.055)}
              strokeLinecap="round"
            />
          </svg>
        </div>
      ) : currentEmotion === "sleepy" ? (
        /* Sleepy: Relaxed, shorter half-height capsules */
        <div
          style={{ gap: gapSize }}
          className={`flex items-center justify-center transition-transform duration-100 ease-in-out ${
            isBlinking ? "scale-y-[0.08] scale-x-[1.3]" : "scale-100"
          }`}
        >
          <div className="relative flex items-center justify-center">
            <span
              ref={leftPupilRef}
              style={{ width: eyeWidth * 1.1, height: eyeHeight * 0.55 }}
              className="rounded-full bg-white opacity-85 shadow-[0_0_2px_rgba(255,255,255,0.8)] will-change-transform"
            />
          </div>
          <div className="relative flex items-center justify-center">
            <span
              ref={rightPupilRef}
              style={{ width: eyeWidth * 1.1, height: eyeHeight * 0.55 }}
              className="rounded-full bg-white opacity-85 shadow-[0_0_2px_rgba(255,255,255,0.8)] will-change-transform"
            />
          </div>
        </div>
      ) : currentEmotion === "focused" ? (
        /* Focused: Slightly angled cute long capsule eyes */
        <div
          style={{ gap: gapSize }}
          className={`flex items-center justify-center transition-transform duration-100 ease-in-out ${
            isBlinking ? "scale-y-[0.08] scale-x-[1.3]" : "scale-100"
          }`}
        >
          <div className="relative flex items-center justify-center -rotate-6">
            <span
              ref={leftPupilRef}
              style={{ width: eyeWidth, height: eyeHeight * 0.95 }}
              className="rounded-full bg-white shadow-[0_0_2px_rgba(255,255,255,0.9)] will-change-transform"
            />
          </div>
          <div className="relative flex items-center justify-center rotate-6">
            <span
              ref={rightPupilRef}
              style={{ width: eyeWidth, height: eyeHeight * 0.95 }}
              className="rounded-full bg-white shadow-[0_0_2px_rgba(255,255,255,0.9)] will-change-transform"
            />
          </div>
        </div>
      ) : currentEmotion === "wink" ? (
        /* Wink: Left eye cute long capsule, Right eye smiling arch */
        <div style={{ gap: gapSize }} className="flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            <span
              ref={leftPupilRef}
              style={{ width: eyeWidth, height: eyeHeight }}
              className="rounded-full bg-white shadow-[0_0_2px_rgba(255,255,255,0.9)] will-change-transform"
            />
          </div>
          <svg
            style={{ width: eyeWidth * 1.6, height: eyeHeight * 0.65 }}
            viewBox="0 0 16 10"
            fill="none"
            className="stroke-white translate-y-0.5"
          >
            <path
              d="M2 9C3.5 3 6.5 2 8 2C9.5 2 12.5 3 14 9"
              strokeWidth={Math.max(2, size * 0.055)}
              strokeLinecap="round"
            />
          </svg>
        </div>
      ) : currentEmotion === "excited" ? (
        /* Excited: Extra tall cute long capsule with white reflection sparkle */
        <div
          style={{ gap: gapSize }}
          className={`flex items-center justify-center transition-transform duration-100 ease-in-out ${
            isBlinking ? "scale-y-[0.08] scale-x-[1.3]" : "scale-100"
          }`}
        >
          <div className="relative flex items-center justify-center">
            <span
              ref={leftPupilRef}
              style={{ width: eyeWidth * 1.15, height: eyeHeight * 1.1 }}
              className="relative rounded-full bg-white shadow-[0_0_3px_rgba(255,255,255,1)] will-change-transform flex items-start justify-end p-0.5"
            >
              <span className="w-1 h-1 rounded-full bg-neutral-900/30" />
            </span>
          </div>
          <div className="relative flex items-center justify-center">
            <span
              ref={rightPupilRef}
              style={{ width: eyeWidth * 1.15, height: eyeHeight * 1.1 }}
              className="relative rounded-full bg-white shadow-[0_0_3px_rgba(255,255,255,1)] will-change-transform flex items-start justify-end p-0.5"
            >
              <span className="w-1 h-1 rounded-full bg-neutral-900/30" />
            </span>
          </div>
        </div>
      ) : (
        /* Default / Neutral / Caring: Cute elongated vertical capsule eyes with smooth tracking & blink */
        <div
          style={{ gap: gapSize }}
          className={`flex items-center justify-center transition-transform duration-100 ease-in-out ${
            isBlinking ? "scale-y-[0.08] scale-x-[1.3]" : "scale-100"
          }`}
        >
          {/* Left Cute Long Eye */}
          <div className="relative flex items-center justify-center">
            <span
              ref={leftPupilRef}
              style={{ width: eyeWidth, height: eyeHeight }}
              className="rounded-full bg-white shadow-[0_0_2px_rgba(255,255,255,0.9)] will-change-transform"
            />
          </div>

          {/* Right Cute Long Eye */}
          <div className="relative flex items-center justify-center">
            <span
              ref={rightPupilRef}
              style={{ width: eyeWidth, height: eyeHeight }}
              className="rounded-full bg-white shadow-[0_0_2px_rgba(255,255,255,0.9)] will-change-transform"
            />
          </div>
        </div>
      )}
    </div>
  );
}
