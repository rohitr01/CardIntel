"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Calculator,
  CreditCard,
  Landmark,
  Layers,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCompare } from "@/lib/context/compare-context";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { selectedCardSlugs } = useCompare();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    router.push(`/cards?q=${encodeURIComponent(query)}`);
    setSearchQuery("");
    setMobileMenuOpen(false);
  };

  const compareHref =
    selectedCardSlugs.length >= 2
      ? `/compare?cards=${selectedCardSlugs.join(",")}`
      : "/compare";

  const navLinks = [
    { name: "Credit Cards", href: "/cards", icon: CreditCard },
    { name: "Best Cards", href: "/cards?sort=relevance", icon: Sparkles },
    { name: "Calculator", href: "/calculator", icon: Calculator },
    { name: "Banks", href: "/issuers", icon: Landmark },
    { name: "Methodology", href: "/methodology", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="consumer-shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
            <CreditCard className="h-5 w-5" />
          </span>
          <span className="leading-none">
            <span className="block text-lg font-bold tracking-tight text-slate-950 dark:text-white">
              CardIntel
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 sm:block">
              MITC verified
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <form onSubmit={handleSearch} className="relative w-72">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search card, bank, cashback..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-9 rounded-lg border-slate-200 bg-slate-50 pl-9 text-xs focus-visible:bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          </form>

          <Link
            href={compareHref}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-9 border-slate-300 text-xs font-bold dark:border-slate-700",
            )}
          >
            <Layers className="mr-1.5 h-3.5 w-3.5" />
            Compare{selectedCardSlugs.length > 0 ? ` (${selectedCardSlugs.length})` : ""}
          </Link>

          <Link
            href="/cards"
            className={cn(
              buttonVariants({ size: "sm" }),
              "h-9 bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700",
            )}
          >
            Find my card
          </Link>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 md:hidden">
          <form onSubmit={handleSearch} className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search cards, banks, benefits..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-10 rounded-lg pl-9 text-sm"
            />
          </form>
          <div className="grid gap-1">
            {[...navLinks, { name: "Compare", href: compareHref, icon: Layers }].map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-slate-500" />
                    {link.name}
                  </span>
                  {link.name === "Compare" && selectedCardSlugs.length > 0 && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {selectedCardSlugs.length}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
