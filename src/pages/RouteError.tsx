import { useTranslation } from "react-i18next";

export function RouteError() {
  const { t } = useTranslation();
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-bold">{t("common.error")}</h1>
      <p className="mt-2 text-muted">{t("common.errorText")}</p>
      <a href="/" className="button-primary mt-6">
        {t("common.goHome")}
      </a>
    </main>
  );
}
