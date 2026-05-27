import { describe, it, expect } from "vitest";
import { calculateNetBalances, simplifyDebts } from "./balance";

// Minimal shape that satisfies the function signatures (no Prisma import needed)
function expense(
  id: string,
  paidBy: string,
  amount: number,
  splits: { member: string; amount: number }[]
) {
  return {
    id,
    title: id,
    amount,
    paidBy,
    date: new Date(),
    createdAt: new Date(),
    splitType: "equal",
    splits: splits.map((s, i) => ({ id: String(i), expenseId: id, ...s })),
  };
}

// ─── calculateNetBalances ─────────────────────────────────────────────────────

describe("calculateNetBalances", () => {
  it("no expenses → everyone at zero", () => {
    const net = calculateNetBalances([]);
    expect(net).toEqual({ Zhiwei: 0, "Lin Chen": 0, Bojun: 0, Haozhe: 0 });
  });

  it("one expense split equally among all four", () => {
    /*
     * Zhiwei pays ¥400, split equally (¥100 each)
     * Zhiwei: paid 400 − owes 100 = +300
     * Others: paid 0   − owes 100 = −100
     */
    const net = calculateNetBalances([
      expense("e1", "Zhiwei", 400, [
        { member: "Zhiwei", amount: 100 },
        { member: "Lin Chen", amount: 100 },
        { member: "Bojun", amount: 100 },
        { member: "Haozhe", amount: 100 },
      ]),
    ]);
    expect(net).toEqual({ Zhiwei: 300, "Lin Chen": -100, Bojun: -100, Haozhe: -100 });
  });

  it("two expenses, different payers", () => {
    /*
     * Expense A: Zhiwei pays ¥400, split equally (¥100 each)
     * Expense B: Lin Chen pays ¥600, split equally (¥150 each)
     *
     * Zhiwei:   +400 − 100 − 150 = +150
     * Lin Chen: +600 − 100 − 150 = +350
     * Bojun:    +0   − 100 − 150 = −250
     * Haozhe:   +0   − 100 − 150 = −250
     */
    const net = calculateNetBalances([
      expense("e1", "Zhiwei", 400, [
        { member: "Zhiwei", amount: 100 },
        { member: "Lin Chen", amount: 100 },
        { member: "Bojun", amount: 100 },
        { member: "Haozhe", amount: 100 },
      ]),
      expense("e2", "Lin Chen", 600, [
        { member: "Zhiwei", amount: 150 },
        { member: "Lin Chen", amount: 150 },
        { member: "Bojun", amount: 150 },
        { member: "Haozhe", amount: 150 },
      ]),
    ]);
    expect(net).toEqual({ Zhiwei: 150, "Lin Chen": 350, Bojun: -250, Haozhe: -250 });
  });

  it("expense only involves two members (not all four)", () => {
    /*
     * Bojun pays ¥200, split between Bojun and Haozhe (¥100 each)
     * Bojun:    +200 − 100 = +100
     * Haozhe:   +0   − 100 = −100
     * Others unaffected
     */
    const net = calculateNetBalances([
      expense("e1", "Bojun", 200, [
        { member: "Bojun", amount: 100 },
        { member: "Haozhe", amount: 100 },
      ]),
    ]);
    expect(net).toEqual({ Zhiwei: 0, "Lin Chen": 0, Bojun: 100, Haozhe: -100 });
  });

  it("payer is not in the split (pays on behalf, owes nothing)", () => {
    /*
     * Zhiwei pays ¥300 for Lin Chen, Bojun, Haozhe only (Zhiwei not in split)
     * Zhiwei:   +300 − 0   = +300
     * Lin Chen: +0   − 100 = −100
     * Bojun:    +0   − 100 = −100
     * Haozhe:   +0   − 100 = −100
     */
    const net = calculateNetBalances([
      expense("e1", "Zhiwei", 300, [
        { member: "Lin Chen", amount: 100 },
        { member: "Bojun", amount: 100 },
        { member: "Haozhe", amount: 100 },
      ]),
    ]);
    expect(net).toEqual({ Zhiwei: 300, "Lin Chen": -100, Bojun: -100, Haozhe: -100 });
  });

  it("floating point: ¥100 split 3 ways", () => {
    /*
     * ¥100 / 3 = 33.33 each; last person gets 33.34 to cover remainder
     * Zhiwei: +100 − 33.33 = +66.67
     * Lin Chen: −33.33
     * Bojun: −33.34
     */
    const net = calculateNetBalances([
      expense("e1", "Zhiwei", 100, [
        { member: "Zhiwei", amount: 33.33 },
        { member: "Lin Chen", amount: 33.33 },
        { member: "Bojun", amount: 33.34 },
      ]),
    ]);
    expect(net).toEqual({ Zhiwei: 66.67, "Lin Chen": -33.33, Bojun: -33.34, Haozhe: 0 });
  });
});

// ─── simplifyDebts ────────────────────────────────────────────────────────────

describe("simplifyDebts", () => {
  it("all zero → no transactions", () => {
    expect(
      simplifyDebts({ Zhiwei: 0, "Lin Chen": 0, Bojun: 0, Haozhe: 0 })
    ).toEqual([]);
  });

  it("one creditor, three debtors — each debtor pays the creditor directly", () => {
    /*
     * Net: Zhiwei +300, Lin Chen −100, Bojun −100, Haozhe −100
     * Expected: 3 transactions all pointing to Zhiwei
     *   Lin Chen → Zhiwei ¥100
     *   Bojun    → Zhiwei ¥100
     *   Haozhe   → Zhiwei ¥100
     */
    const txns = simplifyDebts({ Zhiwei: 300, "Lin Chen": -100, Bojun: -100, Haozhe: -100 });
    expect(txns).toHaveLength(3);
    expect(txns).toContainEqual({ from: "Lin Chen", to: "Zhiwei", amount: 100 });
    expect(txns).toContainEqual({ from: "Bojun", to: "Zhiwei", amount: 100 });
    expect(txns).toContainEqual({ from: "Haozhe", to: "Zhiwei", amount: 100 });
  });

  it("two creditors, two debtors — minimises transaction count", () => {
    /*
     * Net: Zhiwei +150, Lin Chen +350, Bojun −250, Haozhe −250
     * Total owed = 500, total credit = 500 ✓
     *
     * Greedy (sort largest first):
     *   creditors: Lin Chen 350, Zhiwei 150
     *   debtors:   Bojun 250, Haozhe 250
     *
     *   Step 1: Bojun → Lin Chen ¥250  (Lin Chen left: 100, Bojun settled)
     *   Step 2: Haozhe → Lin Chen ¥100 (Lin Chen settled, Haozhe left: 150)
     *   Step 3: Haozhe → Zhiwei ¥150   (both settled)
     *
     * Result: 3 transactions (optimal for 4 people)
     */
    const txns = simplifyDebts({ Zhiwei: 150, "Lin Chen": 350, Bojun: -250, Haozhe: -250 });
    expect(txns).toHaveLength(3);
    expect(txns).toContainEqual({ from: "Bojun", to: "Lin Chen", amount: 250 });
    expect(txns).toContainEqual({ from: "Haozhe", to: "Lin Chen", amount: 100 });
    expect(txns).toContainEqual({ from: "Haozhe", to: "Zhiwei", amount: 150 });
  });

  it("one debtor owes one creditor exactly", () => {
    /*
     * Bojun pays ¥200 for himself and Haozhe equally
     * Net: Bojun +100, Haozhe −100
     * Expected: Haozhe → Bojun ¥100
     */
    const txns = simplifyDebts({ Zhiwei: 0, "Lin Chen": 0, Bojun: 100, Haozhe: -100 });
    expect(txns).toEqual([{ from: "Haozhe", to: "Bojun", amount: 100 }]);
  });

  it("settlement amounts sum correctly to net balances", () => {
    /*
     * Verify invariant: for every member,
     *   sum(txns where from == member) − sum(txns where to == member) == −net[member]
     * (i.e. settlements fully cancel the net)
     */
    const net = { Zhiwei: 150, "Lin Chen": 350, Bojun: -250, Haozhe: -250 };
    const txns = simplifyDebts(net);

    for (const member of ["Zhiwei", "Lin Chen", "Bojun", "Haozhe"]) {
      const paid = txns.filter((t) => t.from === member).reduce((s, t) => s + t.amount, 0);
      const received = txns.filter((t) => t.to === member).reduce((s, t) => s + t.amount, 0);
      expect(Math.round((paid - received) * 100) / 100).toBeCloseTo(-net[member], 2);
    }
  });

  it("all four paid something — complex multi-way settlement", () => {
    /*
     * Expenses:
     *   Zhiwei pays ¥120, split 4 ways (¥30 each)
     *   Lin Chen pays ¥80, split 4 ways (¥20 each)
     *   Bojun pays ¥60, split 4 ways (¥15 each)
     *   Haozhe pays ¥40, split 4 ways (¥10 each)
     *
     * Net:
     *   Zhiwei:   +120 − 30 − 20 − 15 − 10 = +45
     *   Lin Chen: +80  − 30 − 20 − 15 − 10 = +5
     *   Bojun:    +60  − 30 − 20 − 15 − 10 = −15
     *   Haozhe:   +40  − 30 − 20 − 15 − 10 = −35
     *
     * Total credit = 50, total debt = 50 ✓
     *
     * Greedy:
     *   creditors: Zhiwei 45, Lin Chen 5
     *   debtors:   Haozhe 35, Bojun 15
     *
     *   Step 1: Haozhe → Zhiwei ¥35  (Zhiwei left: 10, Haozhe settled)
     *   Step 2: Bojun → Zhiwei ¥10   (Zhiwei settled, Bojun left: 5)
     *   Step 3: Bojun → Lin Chen ¥5  (both settled)
     */
    const net = calculateNetBalances([
      expense("e1", "Zhiwei", 120, [
        { member: "Zhiwei", amount: 30 },
        { member: "Lin Chen", amount: 30 },
        { member: "Bojun", amount: 30 },
        { member: "Haozhe", amount: 30 },
      ]),
      expense("e2", "Lin Chen", 80, [
        { member: "Zhiwei", amount: 20 },
        { member: "Lin Chen", amount: 20 },
        { member: "Bojun", amount: 20 },
        { member: "Haozhe", amount: 20 },
      ]),
      expense("e3", "Bojun", 60, [
        { member: "Zhiwei", amount: 15 },
        { member: "Lin Chen", amount: 15 },
        { member: "Bojun", amount: 15 },
        { member: "Haozhe", amount: 15 },
      ]),
      expense("e4", "Haozhe", 40, [
        { member: "Zhiwei", amount: 10 },
        { member: "Lin Chen", amount: 10 },
        { member: "Bojun", amount: 10 },
        { member: "Haozhe", amount: 10 },
      ]),
    ]);

    expect(net).toEqual({ Zhiwei: 45, "Lin Chen": 5, Bojun: -15, Haozhe: -35 });

    const txns = simplifyDebts(net);
    expect(txns).toHaveLength(3);
    expect(txns).toContainEqual({ from: "Haozhe", to: "Zhiwei", amount: 35 });
    expect(txns).toContainEqual({ from: "Bojun", to: "Zhiwei", amount: 10 });
    expect(txns).toContainEqual({ from: "Bojun", to: "Lin Chen", amount: 5 });
  });
});
