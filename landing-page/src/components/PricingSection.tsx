import Link from "next/link";
import { Check } from "lucide-react";
import { Eyebrow } from "@/components/site/Eyebrow";
import { Reveal } from "@/components/site/Reveal";

// TODO: replace the Pro price with the real one before launch
const PLANS = [
  {
    name: "Basic",
    price: "Free",
    note: "forever",
    cta: "Start free",
    dark: false,
    items: ["Phone rings at the reminder time", "Short spoken reminder", "2 active reminders", "1 retry if missed"],
  },
  {
    name: "Pro",
    price: "₹199",
    note: "per month",
    cta: "Upgrade to Pro",
    dark: true,
    items: [
      "AI voice call that listens",
      "Complete or snooze by voice",
      "Unlimited reminders",
      "Up to 3 smart retries",
      "All voice personas",
    ],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-24 text-center sm:pb-32">
      <Reveal>
      <div className="flex justify-center">
        <Eyebrow>Pricing</Eyebrow>
      </div>
      <h2 className="font-display text-4xl tracking-[-0.03em] text-zinc-950 sm:text-5xl">Start with a ring</h2>
      <p className="mx-auto mt-4 max-w-md font-serif text-[17px] text-zinc-500">
        Upgrade when you want a voice that listens back.
      </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-12 grid gap-3 rounded-[28px] bg-tray p-3 text-left md:grid-cols-2">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`flex flex-col rounded-[22px] p-7 ${p.dark ? "bg-zinc-950 text-white" : "bg-white text-zinc-950"}`}
          >
            <p className={`text-[14px] ${p.dark ? "text-amber-200" : "text-zinc-500"}`}>{p.name}</p>
            <p className="mt-2 font-display text-5xl tracking-tight">
              {p.price}
              <span className={`ml-2 text-[14px] tracking-normal ${p.dark ? "text-zinc-400" : "text-zinc-500"}`}>
                {p.note}
              </span>
            </p>
            <ul className="mt-6 space-y-3">
              {p.items.map((it) => (
                <li key={it} className="flex items-center gap-2.5 text-[14px]">
                  <Check className={`h-4 w-4 ${p.dark ? "text-amber-300" : "text-amber-600"}`} />
                  {it}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className={`mt-8 rounded-2xl px-4 py-3 text-center text-[14px] font-medium ${
                p.dark ? "bg-white text-zinc-950 hover:bg-zinc-100" : "border border-zinc-200 hover:bg-zinc-50"
              }`}
            >
              {p.cta}
            </Link>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
