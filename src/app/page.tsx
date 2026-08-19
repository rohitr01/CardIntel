import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  CreditCard,
  Fuel,
  Landmark,
  Plane,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CardCard } from "@/components/cards/card-card";
import { demoCards } from "@/data/demo/cards";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const featuredCards = demoCards.slice(0, 4);

  const tools = [
    {
      number: "01",
      title: "Card finder",
      text: "Start from income, CIBIL, fees, UPI, lounge and cashback filters.",
      href: "/cards",
      cta: "Browse cards",
      icon: Search,
    },
    {
      number: "02",
      title: "Rewards calculator",
      text: "Enter monthly spends and rank cards by estimated rupee value.",
      href: "/calculator",
      cta: "Calculate value",
      icon: Calculator,
    },
    {
      number: "03",
      title: "Side-by-side compare",
      text: "Compare fees, reward caps, eligibility and field-level claim states.",
      href: "/compare",
      cta: "Compare cards",
      icon: CreditCard,
    },
    {
      number: "04",
      title: "Source methodology",
      text: "See how claims map back to official issuer documents and evidence.",
      href: "/methodology",
      cta: "View protocol",
      icon: ShieldCheck,
    },
  ];

  const categories = [
    { name: "Cashback", href: "/cards?categories=cashback", icon: TrendingUp, count: "12 cards" },
    { name: "RuPay UPI", href: "/cards?hasUPI=true", icon: Zap, count: "8 cards" },
    { name: "No annual fee", href: "/cards?isLifetimeFree=true", icon: Sparkles, count: "14 cards" },
    { name: "Lounge access", href: "/cards?hasLounge=true", icon: Plane, count: "22 cards" },
    { name: "Fuel waiver", href: "/cards?hasFuelBenefit=true", icon: Fuel, count: "18 cards" },
    { name: "Shopping", href: "/cards?categories=shopping", icon: ShoppingBag, count: "16 cards" },
  ];

  const banks = [
    "HDFC Bank",
    "SBI Card",
    "ICICI Bank",
    "Axis Bank",
    "Kotak Mahindra",
    "IDFC FIRST",
    "IndusInd",
    "Federal Bank",
    "AU Small Finance",
    "American Express",
    "RBL Bank",
    "Standard Chartered",
  ];

  return (
    <div className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_65%)] py-10 dark:border-slate-800 dark:bg-none sm:py-14">
        <div className="consumer-shell grid items-center gap-10 lg:grid-cols-[1.04fr_0.96fr]">
          <div>
            <Badge className="mb-5 rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-800 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
              MITC-backed Indian credit card research
            </Badge>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
              Compare Indian credit cards without opening every bank site.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Search fees, rewards, eligibility, caps, UPI support and lounge rules with official-source provenance built into every public workflow.
            </p>

            <form action="/cards" className="mt-7 flex max-w-2xl flex-col gap-3 rounded-lg border border-slate-200 bg-white p-2 shadow-lg shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:flex-row">
              <label className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  name="q"
                  type="search"
                  placeholder="Search HDFC, SBI Cashback, lounge, UPI..."
                  className="h-11 w-full rounded-md border-0 bg-slate-50 pl-9 pr-3 text-sm outline-none ring-0 placeholder:text-slate-400 focus:bg-white dark:bg-slate-950 dark:focus:bg-slate-950"
                />
              </label>
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-md bg-emerald-600 px-5 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
              >
                Find cards
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-2">
              {categories.slice(0, 4).map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="surface-card overflow-hidden p-5">
              <div className="rounded-lg bg-slate-950 p-5 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                    CardIntel score
                  </span>
                  <ShieldCheck className="h-5 w-5 text-emerald-300" />
                </div>
                <div className="mt-10">
                  <p className="text-sm text-slate-300">Example card analysis</p>
                  <h2 className="mt-1 text-2xl font-bold">Swiggy HDFC Bank</h2>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-md bg-white/10 p-3">
                    <span className="block text-slate-400">Rewards</span>
                    <strong>1-10%</strong>
                  </div>
                  <div className="rounded-md bg-white/10 p-3">
                    <span className="block text-slate-400">Annual fee</span>
                    <strong>₹500</strong>
                  </div>
                  <div className="rounded-md bg-white/10 p-3">
                    <span className="block text-slate-400">Status</span>
                    <strong>Verified</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-sm">
                {["Reward cap checked", "Fee waiver mapped", "MITC source linked"].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium text-slate-700 dark:text-slate-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="consumer-shell">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.title} href={tool.href} className="surface-card group p-5 transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">{tool.number}</span>
                    <Icon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">{tool.title}</h2>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600 dark:text-slate-300">{tool.text}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    {tool.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="soft-band border-y border-slate-200 py-12 dark:border-slate-800">
        <div className="consumer-shell">
          <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
                Browse by need
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Shortlist by the benefit you actually use.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Start broad, then narrow by income, CIBIL, fee, network, issuer and verification status in the full card catalogue.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Link key={category.name} href={category.href} className="surface-card group flex items-center gap-3 p-4 transition-colors hover:border-emerald-300">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block font-bold text-slate-950 dark:text-white">{category.name}</span>
                      <span className="text-xs text-slate-500">{category.count}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="consumer-shell">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
                Popular cards
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Featured verified cards</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                A compact sample of the public card experience and comparison workflow.
              </p>
            </div>
            <Link href="/cards" className={cn(buttonVariants({ variant: "outline" }), "self-start font-bold sm:self-auto")}>
              View all cards <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {featuredCards.map((card) => (
              <CardCard key={card.id} card={card} />
            ))}
          </div>
        </div>
      </section>

      <section className="soft-band border-t border-slate-200 py-12 dark:border-slate-800">
        <div className="consumer-shell">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                <Landmark className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight">Major Indian issuers in one place.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                CardIntel keeps issuer, brand, co-brand partner and network relationships separate so comparisons do not collapse legal issuer data into marketing labels.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {banks.map((bank) => (
                <Link key={bank} href={`/cards?q=${encodeURIComponent(bank)}`} className="surface-card flex h-16 items-center justify-center px-3 text-center text-sm font-bold text-slate-700 transition-colors hover:border-emerald-300 hover:text-emerald-700 dark:text-slate-200">
                  {bank}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="consumer-shell grid gap-4 md:grid-cols-3">
          {[
            ["Source first", "Every financial claim is designed to connect back to official issuer evidence."],
            ["Calculator ready", "Reward caps, fee waivers, GST and lounge value are evaluated by deterministic code."],
            ["Comparison honest", "Unknown, not disclosed, conditional and conflicting fields stay visible in the UI."],
          ].map(([title, text]) => (
            <div key={title} className="surface-card p-5">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h3 className="mt-3 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
