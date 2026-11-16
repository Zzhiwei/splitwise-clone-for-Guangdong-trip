"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "./db";
import { MEMBERS, BASE_CURRENCY, CURRENCIES, type Currency } from "./constants";
import { FX_KEY } from "./fx";
import { DISPLAY_CURRENCY_COOKIE } from "./display-currency";

interface SplitInput {
  member: string;
  amount: number;
}

// Shared by addExpense and updateExpense: validates the form and returns the expense fields.
function parseExpense(formData: FormData) {
  const title = formData.get("title") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const paidBy = formData.get("paidBy") as string;
  const date = formData.get("date") as string;
  const splitType = formData.get("splitType") as string;

  if (!MEMBERS.includes(paidBy as (typeof MEMBERS)[number])) {
    throw new Error("Invalid paidBy");
  }

  // amount and splits are in this currency, stored as entered.
  const currency = ((formData.get("currency") as string) || BASE_CURRENCY) as Currency;
  if (!CURRENCIES.includes(currency)) {
    throw new Error("Invalid currency");
  }
  if (!(amount > 0)) {
    throw new Error("Invalid amount");
  }

  const splitsRaw = formData.get("splits") as string;
  const splits: SplitInput[] = JSON.parse(splitsRaw);

  const splitSum = splits.reduce((s, sp) => s + sp.amount, 0);
  if (Math.abs(splitSum - amount) > 0.02) {
    throw new Error("Split amounts do not sum to total");
  }

  for (const sp of splits) {
    if (!MEMBERS.includes(sp.member as (typeof MEMBERS)[number])) {
      throw new Error("Invalid split member");
    }
  }

  return { title, amount, paidBy, date: new Date(date), splitType, currency, splits };
}

export async function addExpense(formData: FormData) {
  const { splits, ...expense } = parseExpense(formData);

  await prisma.expense.create({
    data: {
      ...expense,
      splits: {
        create: splits.map((sp) => ({ member: sp.member, amount: sp.amount })),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/expenses");
  redirect("/");
}

export async function updateExpense(id: string, formData: FormData) {
  const { splits, ...expense } = parseExpense(formData);

  // Splits are replaced; a member who keeps a split keeps their paidBack flag.
  await prisma.$transaction(async (tx) => {
    const existing = await tx.expense.findFirst({
      where: { id, deletedAt: null },
      include: { splits: true },
    });
    if (!existing) throw new Error("Expense not found");
    const paidBack = new Map(existing.splits.map((s) => [s.member, s.paidBack]));

    await tx.split.deleteMany({ where: { expenseId: id } });
    await tx.expense.update({
      where: { id },
      data: {
        ...expense,
        splits: {
          create: splits.map((sp) => ({
            member: sp.member,
            amount: sp.amount,
            paidBack: paidBack.get(sp.member) ?? false,
          })),
        },
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/expenses");
  revalidatePath("/resolved-expenses");
  redirect("/expenses");
}

export async function setFxRate(rate: number) {
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error("Invalid FX rate");
  }
  await prisma.setting.upsert({
    where: { key: FX_KEY },
    update: { value: String(rate) },
    create: { key: FX_KEY, value: String(rate) },
  });
  revalidatePath("/");
  revalidatePath("/add");
}

export async function setDisplayCurrency(currency: Currency) {
  if (!CURRENCIES.includes(currency)) {
    throw new Error("Invalid currency");
  }
  cookies().set(DISPLAY_CURRENCY_COOKIE, currency, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  revalidatePath("/", "layout");
}

export async function deleteExpense(id: string) {
  await prisma.expense.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/");
  revalidatePath("/expenses");
  revalidatePath("/resolved-expenses");
}

export async function resolveExpense(id: string) {
  // Resolving settles the expense, so every split counts as paid back.
  await prisma.$transaction([
    prisma.split.updateMany({ where: { expenseId: id }, data: { paidBack: true } }),
    prisma.expense.update({ where: { id }, data: { resolvedAt: new Date() } }),
  ]);
  revalidatePath("/");
  revalidatePath("/expenses");
  revalidatePath("/resolved-expenses");
}

export async function unresolveExpense(id: string) {
  await prisma.expense.update({ where: { id }, data: { resolvedAt: null } });
  revalidatePath("/");
  revalidatePath("/expenses");
  revalidatePath("/resolved-expenses");
}

export async function toggleSplitPaidBack(splitId: string, paidBack: boolean) {
  await prisma.split.update({ where: { id: splitId }, data: { paidBack } });
  revalidatePath("/");
  revalidatePath("/expenses");
}

export async function verifyPassword(password: string): Promise<{ error: string } | void> {
  if (password !== process.env.APP_PASSWORD) {
    return { error: "Wrong password" };
  }
  cookies().set("splitwize_auth", "ok", {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  redirect("/");
}
