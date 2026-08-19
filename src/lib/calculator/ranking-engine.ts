/**
 * CardIntel — Ranking Engine
 *
 * Deterministically ranks credit cards by True Net Monetary Benefit.
 */

import type { CardCalculationResult, ValuationConfig } from "./types";

export function rankCalculatedCards(
  results: CardCalculationResult[],
  config: ValuationConfig,
): CardCalculationResult[] {
  return [...results].sort((a, b) => {
    const valA = config.includeOptionalBenefitsInTotal
      ? Number(a.estimatedTotalAnnualValue)
      : Number(a.cashEquivalentNetAnnualValue);

    const valB = config.includeOptionalBenefitsInTotal
      ? Number(b.estimatedTotalAnnualValue)
      : Number(b.cashEquivalentNetAnnualValue);

    return valB - valA;
  });
}
