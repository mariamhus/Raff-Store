import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { ar } from "./ar";
import { en } from "./en";

export type Language = "en" | "ar";

const STORAGE_KEY = "raff:lang";

function storedLanguage(): Language {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "ar" ? "ar" : "en";
  } catch {
    return "en";
  }
}

function applyDocumentLanguage(language: Language) {
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
}

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ar: { translation: ar } },
  lng: storedLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnNull: false,
});

i18n.services.formatter?.addCached("number", (language, options) => {
  const formatter = new Intl.NumberFormat(locale(language ?? "en"), options);
  return (value: number) => formatter.format(value);
});

applyDocumentLanguage(i18n.language as Language);

i18n.on("languageChanged", (language) => {
  applyDocumentLanguage(language as Language);
  try {
    window.localStorage.setItem(STORAGE_KEY, language);
  } catch {
    return;
  }
});

export function locale(language: string): string {
  return language === "ar" ? "ar-EG" : "en-US";
}

export default i18n;
