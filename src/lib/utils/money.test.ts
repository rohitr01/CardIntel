import { describe, it, expect } from "vitest";
import {
  money,
  addMoney,
  subtractMoney,
  multiplyMoney,
  divideMoney,
  formatMoney,
  formatAnnualFeeWithWaiver,
  feeWithGST,
  calculateRewardValue,
} from "./money";

describe("Money Utilities", () => {
  it("formats Indian numbers accurately with commas", () => {
    expect(formatMoney(money(999))).toBe("₹999");
    expect(formatMoney(money(1499))).toBe("₹1,499");
    expect(formatMoney(money(150000))).toBe("₹1,50,000");
    expect(formatMoney(money(10000000))).toBe("₹1,00,00,000");
  });

  it("performs currency-safe arithmetic without floating point drift", () => {
    const a = money("0.10");
    const b = money("0.20");
    const sum = addMoney(a, b);
    expect(sum.amount).toBe("0.30");

    const diff = subtractMoney(money("1000.00"), money("499.50"));
    expect(diff.amount).toBe("500.50");

    const product = multiplyMoney(money("150.00"), 5);
    expect(product.amount).toBe("750.00");

    const div = divideMoney(money("1000.00"), 4);
    expect(div.amount).toBe("250.00");
  });

  it("calculates GST accurately at 18%", () => {
    const fee = money("1000.00");
    const total = feeWithGST(fee, 18);
    expect(total.amount).toBe("1180.00");
    expect(formatMoney(total)).toBe("₹1,180");
  });

  it("formats annual fee waiver conditions correctly", () => {
    const fee = money("1000.00");
    const waiverSpend = money("100000.00");
    const formatted = formatAnnualFeeWithWaiver(fee, true, waiverSpend, false);
    expect(formatted).toBe("₹1,000 + applicable taxes — waived on ₹1,00,000 annual spend");

    const ltf = formatAnnualFeeWithWaiver(fee, true, waiverSpend, true);
    expect(ltf).toBe("Lifetime Free");
  });

  it("calculates deterministic reward valuation", () => {
    const val = calculateRewardValue(10000, "0.25");
    expect(val.totalValue.amount).toBe("2500.00");
    expect(formatMoney(val.totalValue)).toBe("₹2,500");
  });
});
