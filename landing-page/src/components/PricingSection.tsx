import Link from "next/link";
import { Check, PhoneCall } from "lucide-react";
import { Eyebrow } from "@/components/site/Eyebrow";
import { Reveal } from "@/components/site/Reveal";
import { FREE_TEST_NOTE, PLANS } from "@/lib/plans";

export function PricingSection() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-24 text-center sm:pb-32">
      <Reveal>
        <div className="flex justify-center">
          <Eyebrow>Pricing</Eyebrow>
        </div>
        <h2 className="font-display text-4xl tracking-[-0.03em] text-zinc-950 sm:text-5xl">Simple monthly plans</h2>
        <p className="mx-auto mt-4 max-w-md font-serif text-[17px] text-zinc-500">
          Pick how many things you want called about. Cancel anytime.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mx-auto mt-12 grid max-w-4xl gap-3 rounded-[28px] bg-tray p-3 text-left md:grid-cols-2">
        {PLANS.map((p) => (
          <div
            key={p.id}
            className={`relative flex flex-col rounded-[22px] p-7 ${
              p.highlight
                ? "bg-[linear-gradient(160deg,#121830_0%,#262a4d_55%,#4a3550_100%)] text-white"
                : "bg-white text-zinc-950"
            }`}
          >
            {p.highlight && (
              <span className="absolute right-5 top-5 rounded-full bg-amber-300/15 px-2.5 py-1 text-[11px] font-medium text-amber-200">
                Most popular
              </span>
            )}
            <p className={`text-[14px] ${p.highlight ? "text-amber-200" : "text-zinc-500"}`}>{p.name}</p>
            <p className="mt-2 font-display text-5xl tracking-tight">
              {p.price}
              <span className={`ml-2 text-[14px] tracking-normal ${p.highlight ? "text-zinc-400" : "text-zinc-500"}`}>
                {p.period}
              </span>
            </p>
            <p className={`mt-3 text-[14px] ${p.highlight ? "text-zinc-300" : "text-zinc-500"}`}>{p.tagline}</p>
            <ul className="mt-6 space-y-3">
              {p.features.map((it) => (
                <li key={it} className="flex items-start gap-2.5 text-[14px]">
                  <Check className={`mt-0.5 h-4 w-4 shrink-0 ${p.highlight ? "text-amber-300" : "text-amber-600"}`} />
                  {it}
                </li>
              ))}
            </ul>
            <Link
              href={`/signup?plan=${p.id.toLowerCase()}`}
              className={`mt-8 rounded-2xl px-4 py-3 text-center text-[14px] font-medium transition-colors ${
                p.highlight ? "bg-white text-zinc-950 hover:bg-zinc-100" : "bg-zinc-950 text-white hover:bg-zinc-800"
              }`}
            >
              Get {p.name}
            </Link>
          </div>
        ))}
      </Reveal>

      <Reveal delay={0.15}>
        <p className="mx-auto mt-6 flex max-w-md items-center justify-center gap-2 text-[13px] text-zinc-500">
          <PhoneCall className="h-3.5 w-3.5 text-amber-600" />
          {FREE_TEST_NOTE}
        </p>
        <p className="mt-1 text-[12px] text-zinc-400">Prices in INR, billed monthly. Secure checkout by Dodo Payments.</p>
      </Reveal>
    </section>
  );
}
