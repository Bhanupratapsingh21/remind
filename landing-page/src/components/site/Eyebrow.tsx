/** Small "● LABEL" kicker shown above section headings */
export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={`mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500 ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,.8)]" />
      {children}
    </p>
  );
}
