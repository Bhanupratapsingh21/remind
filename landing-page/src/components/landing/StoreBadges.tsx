/**
 * App Store / Google Play badges in the familiar black store style. The apps are not published
 * yet, so these are inert (no link) and announced as "coming soon".
 */

function AppleLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M16.37 12.73c-.03-2.67 2.18-3.96 2.28-4.02-1.24-1.82-3.18-2.07-3.87-2.1-1.64-.17-3.21.97-4.05.97-.84 0-2.12-.95-3.49-.92-1.79.03-3.45 1.05-4.37 2.65-1.87 3.24-.48 8.03 1.34 10.66.89 1.29 1.95 2.73 3.34 2.68 1.34-.05 1.85-.87 3.47-.87 1.62 0 2.07.87 3.49.84 1.44-.02 2.35-1.31 3.23-2.6 1.02-1.49 1.44-2.94 1.46-3.02-.03-.01-2.8-1.08-2.83-4.27Z" />
      <path d="M13.71 4.9c.74-.9 1.24-2.14 1.1-3.38-1.06.04-2.35.71-3.11 1.6-.68.79-1.28 2.05-1.12 3.27 1.18.09 2.39-.6 3.13-1.49Z" />
    </svg>
  );
}

function PlayLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      {/* left */}
      <path fill="#00C3FF" d="M3.6 1.8 13.8 12 3.6 22.2c-.37-.2-.6-.6-.6-1.1V2.9c0-.5.23-.9.6-1.1Z" />
      {/* top */}
      <path fill="#00E676" d="M3.6 1.8 13.8 12l3.1-3.1L5.1 2.04c-.52-.3-1.07-.37-1.5-.24Z" />
      {/* bottom */}
      <path fill="#FF3A44" d="M3.6 22.2 13.8 12l3.1 3.1-11.8 6.86c-.52.3-1.07.37-1.5.24Z" />
      {/* right */}
      <path fill="#FFD400" d="m16.9 8.9-3.1 3.1 3.1 3.1 3.53-2.05c.76-.44.76-1.66 0-2.1L16.9 8.9Z" />
    </svg>
  );
}

function Badge({ label, small, big, logo }: { label: string; small: string; big: string; logo: React.ReactNode }) {
  return (
    <span
      role="img"
      aria-label={label}
      title="Coming soon"
      className="inline-flex h-[52px] min-w-[164px] cursor-default select-none items-center gap-2.5 rounded-[11px] border border-white/25 bg-black px-3.5 text-white shadow-[0_6px_20px_-8px_rgba(0,0,0,.6)]"
    >
      {logo}
      <span className="flex flex-col leading-none" aria-hidden>
        <span className="text-[10px] font-medium tracking-[0.02em]">{small}</span>
        <span className="mt-[3px] text-[21px] font-semibold tracking-[-0.02em]">{big}</span>
      </span>
    </span>
  );
}

export function AppStoreBadge() {
  return (
    <Badge
      label="Download on the App Store, coming soon"
      small="Download on the"
      big="App Store"
      logo={<AppleLogo className="h-7 w-7 -translate-y-px" />}
    />
  );
}

export function GooglePlayBadge() {
  return (
    <Badge
      label="Get it on Google Play, coming soon"
      small="GET IT ON"
      big="Google Play"
      logo={<PlayLogo className="h-7 w-7" />}
    />
  );
}
