import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { EmptyState } from "../components/States";

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-3xl px-4 pt-14 sm:px-6">
      <EmptyState
        title={t("common.notFound")}
        text={t("common.notFoundText")}
        action={
          <Link to="/" className="button-primary">
            {t("common.goHome")}
          </Link>
        }
      />
    </div>
  );
}
