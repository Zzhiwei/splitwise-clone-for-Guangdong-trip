import { describe, it, expect } from "vitest";
import { convert, convertExpenses } from "./currency";

describe("convert", () => {
  it("returns the amount unchanged for the same currency", () => {
    expect(convert(123.45, "SGD", "SGD", 19500)).toBe(123.45);
  });

  it("converts SGD to VND and back", () => {
    expect(convert(10, "SGD", "VND", 19500)).toBe(195000);
    expect(convert(195000, "VND", "SGD", 19500)).toBe(10);
  });
});

describe("convertExpenses", () => {
  const expenses = [
    { amount: 100, currency: "SGD", splits: [{ amount: 60 }, { amount: 40 }] },
    { amount: 50000, currency: "VND", splits: [{ amount: 50000 }] },
  ];

  it("converts totals and splits to the target and keeps the source values", () => {
    const [sgd, vnd] = convertExpenses(expenses, "VND", 20000);
    expect(sgd).toMatchObject({
      amount: 2_000_000,
      currency: "VND",
      sourceCurrency: "SGD",
      sourceAmount: 100,
    });
    expect(sgd.splits.map((s) => s.amount)).toEqual([1_200_000, 800_000]);
    expect(vnd.amount).toBe(50000);
  });

  it("reflects a changed rate without touching the input", () => {
    const [a] = convertExpenses(expenses, "VND", 20000);
    const [b] = convertExpenses(expenses, "VND", 25000);
    expect(a.amount).toBe(2_000_000);
    expect(b.amount).toBe(2_500_000);
    expect(expenses[0].amount).toBe(100);
  });
});
