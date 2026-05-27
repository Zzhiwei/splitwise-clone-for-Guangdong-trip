export const MEMBERS = ["Zhiwei", "Lin Chen", "Bojun", "Haozhe"] as const;
export type Member = (typeof MEMBERS)[number];
