"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "./db";
import { MEMBERS } from "./constants";

interface SplitInput {
  member: string;
  amount: number;
}

export async function addExpense(formData: FormData) {
  const title = formData.get("title") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const paidBy = formData.get("paidBy") as string;
  const date = formData.get("date") as string;
  const splitType = formData.get("splitType") as string;

  if (!MEMBERS.includes(paidBy as (typeof MEMBERS)[number])) {
    throw new Error("Invalid paidBy");
  }

  const splitsRaw = formData.get("splits") as string;
  const splits: SplitInput[] = JSON.parse(splitsRaw);

  const splitSum = splits.reduce((s, sp) => s + sp.amount, 0);
  if (Math.abs(splitSum - amount) > 0.02) {
    throw new Error("Split amounts do not sum to total");
  }

  await prisma.expense.create({
    data: {
      title,
      amount,
      paidBy,
      date: new Date(date),
      splitType,
      splits: {
        create: splits.map((sp) => ({ member: sp.member, amount: sp.amount })),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/expenses");
  redirect("/");
}

export async function deleteExpense(id: string) {
  await prisma.expense.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/");
  revalidatePath("/expenses");
  revalidatePath("/resolved-expenses");
}

export async function resolveExpense(id: string) {
  await prisma.expense.update({ where: { id }, data: { resolvedAt: new Date() } });
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
    return { error: "密码错误" };
  }
  cookies().set("splitwize_auth", "ok", {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  redirect("/");
}
