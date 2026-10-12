/** 双语字符串：中文 / English */
export type Bi = { zh: string; en: string };

export const bi = (zh: string, en: string): Bi => ({ zh, en });

export type Locale = "zh" | "en";

export const pick = (v: Bi | string, locale: Locale): string =>
  typeof v === "string" ? v : v[locale];
