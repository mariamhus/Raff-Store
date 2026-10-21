import type { TFunction } from "i18next";

export function errorText(t: TFunction, message: string | undefined): string | undefined {
  if (!message) return undefined;
  const [key, ...args] = message.split("|");
  if (key === "validation.min") return t(key, { count: Number(args[0]) });
  if (key === "validation.range") return t(key, { min: Number(args[0]), max: Number(args[1]) });
  return t(key);
}
