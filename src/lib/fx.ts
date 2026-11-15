import { prisma } from "./db";
import { DEFAULT_SGD_TO_VND } from "./constants";

export const FX_KEY = "sgdToVnd";

export async function getFxRate(): Promise<number> {
  const row = await prisma.setting.findUnique({ where: { key: FX_KEY } });
  const n = row ? parseFloat(row.value) : NaN;
  return n > 0 ? n : DEFAULT_SGD_TO_VND;
}
