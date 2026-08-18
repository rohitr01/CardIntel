/**
 * CardIntel — Currency-Safe Money Utilities
 *
 * CRITICAL: Never use JavaScript `float` for financial calculations.
 * All monetary values are stored as Decimal in PostgreSQL via Prisma.
 * This module provides safe arithmetic, formatting, and comparison.
 */

import { Decimal } from "@prisma/client/runtime/library";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const DEFAULT_CURRENCY = "INR" as const;
export const INR_SYMBOL = "₹";

/**
 * Money representation: amount as string (or Decimal) + currency.
 * String representation avoids floating-point precision issues.
 */
export interface Money {
  /** Amount as a string to avoid floating-point issues. Use Decimal for arithmetic. */
  amount: string;
  currency: string;
}

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------

export function money(amount: number | string | Decimal, currency = DEFAULT_CURRENCY): Money {
  const decimal = new Decimal(amount);
  return {
    amount: decimal.toFixed(2),
    currency,
  };
}

export function moneyFromMinor(amountMinor: bigint | number, currency = DEFAULT_CURRENCY): Money {
  const decimal = new Decimal(amountMinor.toString()).dividedBy(100);
  return {
    amount: decimal.toFixed(2),
    currency,
  };
}

export function zeroMoney(currency = DEFAULT_CURRENCY): Money {
  return { amount: "0.00", currency };
}

// ---------------------------------------------------------------------------
// Arithmetic (all operations return new Money, never mutate)
// ---------------------------------------------------------------------------

export function addMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  const result = toDecimal(a).plus(toDecimal(b));
  return { amount: result.toFixed(2), currency: a.currency };
}

export function subtractMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  const result = toDecimal(a).minus(toDecimal(b));
  return { amount: result.toFixed(2), currency: a.currency };
}

export function multiplyMoney(m: Money, factor: number | string | Decimal): Money {
  const result = toDecimal(m).times(new Decimal(factor));
  return { amount: result.toFixed(2), currency: m.currency };
}

export function divideMoney(m: Money, divisor: number | string | Decimal): Money {
  const d = new Decimal(divisor);
  if (d.isZero()) throw new Error("Cannot divide money by zero");
  const result = toDecimal(m).dividedBy(d);
  return { amount: result.toFixed(2), currency: m.currency };
}

// ---------------------------------------------------------------------------
// Comparison
// ---------------------------------------------------------------------------

export function isGreaterThan(a: Money, b: Money): boolean {
  assertSameCurrency(a, b);
  return toDecimal(a).greaterThan(toDecimal(b));
}

export function isLessThan(a: Money, b: Money): boolean {
  assertSameCurrency(a, b);
  return toDecimal(a).lessThan(toDecimal(b));
}

export function isEqual(a: Money, b: Money): boolean {
  assertSameCurrency(a, b);
  return toDecimal(a).equals(toDecimal(b));
}

export function isZero(m: Money): boolean {
  return toDecimal(m).isZero();
}

export function isNegative(m: Money): boolean {
  return toDecimal(m).isNegative();
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

/**
 * Format money for display. Uses Indian numbering system (lakhs/crores).
 *
 * Examples:
 *   formatMoney(money(999))       → "₹999"
 *   formatMoney(money(1499))      → "₹1,499"
 *   formatMoney(money(150000))    → "₹1,50,000"
 *   formatMoney(money(999.50))    → "₹999.50"
 */
export function formatMoney(m: Money, options?: { showDecimals?: boolean }): string {
  const decimal = toDecimal(m);
  const isNeg = decimal.isNegative();
  const abs = decimal.abs();

  const intPart = abs.truncated().toString();
  const fracPart = abs.minus(abs.truncated()).toFixed(2).slice(2); // ".XX" → "XX"
  const hasDecimals = fracPart !== "00";
  const showDecimals = options?.showDecimals ?? hasDecimals;

  // Indian numbering: last 3 digits, then groups of 2
  const formatted = formatIndianNumber(intPart);
  const symbol = getCurrencySymbol(m.currency);
  const sign = isNeg ? "-" : "";

  if (showDecimals) {
    return `${sign}${symbol}${formatted}.${fracPart}`;
  }
  return `${sign}${symbol}${formatted}`;
}

/**
 * Format a number string using Indian numbering system.
 * "150000" → "1,50,000"
 * "1499" → "1,499"
 */
function formatIndianNumber(numStr: string): string {
  if (numStr.length <= 3) return numStr;

  const last3 = numStr.slice(-3);
  const rest = numStr.slice(0, -3);

  // Group remaining digits in pairs from right
  const pairs: string[] = [];
  for (let i = rest.length; i > 0; i -= 2) {
    const start = Math.max(0, i - 2);
    pairs.unshift(rest.slice(start, i));
  }

  return pairs.join(",") + "," + last3;
}

function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case "INR":
      return "₹";
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    default:
      return currency + " ";
  }
}

// ---------------------------------------------------------------------------
// Fee Display Helpers (Req #63)
// ---------------------------------------------------------------------------

/**
 * Format a fee for display, including tax indication.
 *
 * Examples:
 *   formatFee(money(999), true)  → "₹999 + applicable taxes"
 *   formatFee(money(0), false)   → "₹0"
 *   formatFee(money(999), false) → "₹999"
 */
export function formatFee(amount: Money, gstApplicable: boolean): string {
  const formatted = formatMoney(amount);
  if (gstApplicable && !isZero(amount)) {
    return `${formatted} + applicable taxes`;
  }
  return formatted;
}

/**
 * Calculate fee inclusive of GST.
 */
export function feeWithGST(amount: Money, gstRate: number | string | Decimal): Money {
  const rate = new Decimal(gstRate);
  const gst = toDecimal(amount).times(rate).dividedBy(100);
  return addMoney(amount, { amount: gst.toFixed(2), currency: amount.currency });
}

/**
 * Format annual fee with waiver info.
 *
 * Examples:
 *   "₹999 — waived on ₹2,00,000 annual spend"
 *   "Lifetime Free"
 *   "₹499 + applicable taxes"
 */
export function formatAnnualFeeWithWaiver(
  annualFee: Money,
  gstApplicable: boolean,
  waiverSpend?: Money | null,
  isLifetimeFree?: boolean,
): string {
  if (isLifetimeFree) return "Lifetime Free";
  if (isZero(annualFee)) return "₹0";

  const feeStr = formatFee(annualFee, gstApplicable);
  if (waiverSpend && !isZero(waiverSpend)) {
    return `${feeStr} — waived on ${formatMoney(waiverSpend)} annual spend`;
  }
  return feeStr;
}

// ---------------------------------------------------------------------------
// Reward Value Display (Addendum #21)
// ---------------------------------------------------------------------------

export interface RewardValuation {
  rewardPoints: number;
  valuationMethod: string;
  valuePerPoint: Money;
  totalValue: Money;
}

/**
 * Calculate reward value with explicit valuation method.
 */
export function calculateRewardValue(
  points: number,
  valuePerPoint: string | number,
  currency = DEFAULT_CURRENCY,
): RewardValuation {
  const vpp = new Decimal(valuePerPoint);
  const total = vpp.times(points);
  return {
    rewardPoints: points,
    valuationMethod: `1 point = ${formatMoney(money(vpp, currency))}`,
    valuePerPoint: money(vpp, currency),
    totalValue: money(total, currency),
  };
}

// ---------------------------------------------------------------------------
// Range Display (Addendum #20)
// ---------------------------------------------------------------------------

export function formatMoneyRange(min: Money, max: Money): string {
  assertSameCurrency(min, max);
  if (isEqual(min, max)) return formatMoney(min);
  return `${formatMoney(min)}–${formatMoney(max)}`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toDecimal(m: Money): Decimal {
  return new Decimal(m.amount);
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  }
}

/**
 * Convert a Prisma Decimal field to our Money type.
 */
export function fromPrismaDecimal(
  value: Decimal | null | undefined,
  currency = DEFAULT_CURRENCY,
): Money | null {
  if (value == null) return null;
  return money(value, currency);
}
