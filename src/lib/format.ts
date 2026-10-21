import { useTranslation } from "react-i18next";
import { locale } from "../i18n";

export function useFormat() {
  const { i18n, t } = useTranslation();
  const tag = locale(i18n.language);
  const currency = new Intl.NumberFormat(tag, { style: "currency", currency: "USD" });
  const number = new Intl.NumberFormat(tag, { maximumFractionDigits: 1 });
  const date = new Intl.DateTimeFormat(tag, { day: "numeric", month: "long", year: "numeric" });
  return {
    price: (value: number) => currency.format(value),
    number: (value: number) => number.format(value),
    date: (value: string) => date.format(new Date(value)),
    category: (slug: string, fallback?: string) => {
      const key = `categories.${slug}`;
      const translated = t(key, { defaultValue: "" });
      return translated || fallback || slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
    },
  };
}
