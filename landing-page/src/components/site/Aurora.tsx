/**
 * Night-sky band that melts into the peach surface below it: deep navy through
 * violet and amber. Put it at the top of a `bg-peach` card; children render over it.
 */
export function Aurora({ className = "", children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div
      className={`relative overflow-hidden bg-[linear-gradient(180deg,#121830_0%,#2a2744_38%,#8d5c5a_66%,#f0c7a9_86%,#fbe9dc_100%)] ${className}`}
    >
      <span aria-hidden className="absolute left-[18%] top-[30%] h-56 w-[36rem] rounded-full bg-[#7aaad9]/50 blur-3xl" />
      <span aria-hidden className="absolute left-[46%] top-[42%] h-48 w-[30rem] rounded-full bg-[#f6a76a]/70 blur-3xl" />
      <span aria-hidden className="absolute right-[6%] top-[22%] h-56 w-[32rem] rounded-full bg-[#5b6fb8]/40 blur-3xl" />
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,transparent,#fbe9dc)]" />
      {children && <div className="relative">{children}</div>}
    </div>
  );
}
