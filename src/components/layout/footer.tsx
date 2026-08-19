import Link from "next/link";
import { CreditCard, ShieldCheck, FileText, CheckCircle2, Lock, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
      {/* Transparency & Provenance Pledge Strip */}
      <div className="border-b border-slate-200/80 bg-slate-100/50 py-5 dark:border-slate-800 dark:bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  Source Provenance
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Every financial figure is traceable to official bank MITC documents.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  Zero Financial Fabrication
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Strict distinction between known, conditional, and undisclosed bank terms.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  Deterministic Math
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fee waivers and cashback calculations computed via currency-safe math.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  Independent Research
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unbiased rankings. Commercial relationships never influence eligibility math.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950">
                <CreditCard className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                Card<span className="text-emerald-600 dark:text-emerald-400">Intel</span>
              </span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-slate-500 max-w-sm">
              India's comprehensive, source-verified credit card intelligence platform. Covering 50+ banks, PSU issuers, small finance banks, fintech cards, and co-branded products.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700">
                Data Environment: Verified + Demo Sandbox
              </Badge>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Popular Categories
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/cards?categories=cashback" className="hover:text-slate-900 dark:hover:text-white">
                  Cashback Credit Cards
                </Link>
              </li>
              <li>
                <Link href="/cards?hasUPI=true" className="hover:text-slate-900 dark:hover:text-white">
                  RuPay UPI Credit Cards
                </Link>
              </li>
              <li>
                <Link href="/cards?isLifetimeFree=true" className="hover:text-slate-900 dark:hover:text-white">
                  Lifetime Free (LTF) Cards
                </Link>
              </li>
              <li>
                <Link href="/cards?hasLounge=true" className="hover:text-slate-900 dark:hover:text-white">
                  Airport Lounge Access
                </Link>
              </li>
              <li>
                <Link href="/cards?isZeroForex=true" className="hover:text-slate-900 dark:hover:text-white">
                  0% Zero Forex Markup
                </Link>
              </li>
              <li>
                <Link href="/cards?isFDBacked=true" className="hover:text-slate-900 dark:hover:text-white">
                  FD-Backed Secured Cards
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Banks */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Top Issuers
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/cards?issuers=hdfc-bank" className="hover:text-slate-900 dark:hover:text-white">
                  HDFC Bank Cards
                </Link>
              </li>
              <li>
                <Link href="/cards?issuers=sbi-card" className="hover:text-slate-900 dark:hover:text-white">
                  SBI Cards
                </Link>
              </li>
              <li>
                <Link href="/cards?issuers=icici-bank" className="hover:text-slate-900 dark:hover:text-white">
                  ICICI Bank Cards
                </Link>
              </li>
              <li>
                <Link href="/cards?issuers=axis-bank" className="hover:text-slate-900 dark:hover:text-white">
                  Axis Bank Cards
                </Link>
              </li>
              <li>
                <Link href="/cards?issuers=idfc-first-bank" className="hover:text-slate-900 dark:hover:text-white">
                  IDFC FIRST Bank
                </Link>
              </li>
              <li>
                <Link href="/issuers" className="text-emerald-600 font-medium hover:underline dark:text-emerald-400">
                  View All 50+ Banks →
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Platform & Tools
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/calculator" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                  Spend & Reward Calculator
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-slate-900 dark:hover:text-white">
                  Comparison Matrix
                </Link>
              </li>
              <li>
                <Link href="/methodology" className="hover:text-slate-900 dark:hover:text-white">
                  Research Methodology
                </Link>
              </li>
              <li>
                <Link href="/issuers" className="hover:text-slate-900 dark:hover:text-white">
                  RBI Regulated Issuers
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory Disclaimers & Copyright */}
        <div className="mt-10 border-t border-slate-200 pt-6 text-[11px] leading-relaxed text-slate-500 dark:border-slate-800">
          <p className="mb-2">
            <strong>Disclaimer:</strong> CardIntel is an independent credit card research and intelligence platform. We are not a bank, NBFC, or direct credit card issuer. All financial figures, fee structures, reward programs, interest rates, and eligibility criteria are sourced from publicly available official bank documents (MITC, Schedule of Charges, and Product Guides). Financial terms change frequently; please verify current terms directly on the issuing institution's official portal prior to applying.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
            <p>© {new Date().getFullYear()} CardIntel. Built for Indian credit card consumers & researchers.</p>
            <p className="text-slate-400">All trademarks and bank logos belong to their respective registered owners.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
