import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";
import { useFormat } from "../lib/format";

export function Pagination({ page, pages }: { page: number; pages: number }) {
  const { t } = useTranslation();
  const { number } = useFormat();
  const [params] = useSearchParams();
  if (pages <= 1) return null;

  const href = (target: number) => {
    const next = new URLSearchParams(params);
    if (target <= 1) next.delete("page");
    else next.set("page", String(target));
    const query = next.toString();
    return query ? `?${query}` : "?";
  };

  return (
    <nav aria-label={t("products.pagination")} className="mt-12 flex items-center justify-center gap-3">
      {page > 1 ? (
        <Link to={href(page - 1)} className="button-secondary h-10 px-4">
          <ChevronLeft aria-hidden="true" className="size-4 rtl:-scale-x-100" />
          {t("products.previous")}
        </Link>
      ) : (
        <span className="button-secondary h-10 px-4 opacity-40" aria-disabled="true">
          <ChevronLeft aria-hidden="true" className="size-4 rtl:-scale-x-100" />
          {t("products.previous")}
        </span>
      )}
      <p className="text-sm text-muted">{t("products.pageOf", { page: number(page), pages: number(pages) })}</p>
      {page < pages ? (
        <Link to={href(page + 1)} className="button-secondary h-10 px-4">
          {t("products.next")}
          <ChevronRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
        </Link>
      ) : (
        <span className="button-secondary h-10 px-4 opacity-40" aria-disabled="true">
          {t("products.next")}
          <ChevronRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
        </span>
      )}
    </nav>
  );
}
