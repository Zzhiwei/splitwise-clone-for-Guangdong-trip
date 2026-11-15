// VND has no minor unit: show whole đồng with thousands separators.
export function formatVnd(n: number): string {
  const r = Math.round(Math.abs(n));
  return `${n < 0 && r > 0 ? "-" : ""}₫${r.toLocaleString("en-US")}`;
}
