import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useFormat } from "../lib/format";

export function Rating({ value, count, size = "sm" }: { value: number; count?: number; size?: "sm" | "md" }) {
  const { t } = useTranslation();
  const { number } = useFormat();
  const icon = size === "md" ? "size-4.5" : "size-3.5";
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span className="inline-flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((step) => (
          <Star
            key={step}
            className={`${icon} ${value >= step - 0.25 ? "fill-star text-star" : value >= step - 0.75 ? "fill-star/45 text-star" : "fill-line text-line"}`}
          />
        ))}
      </span>
      <span className="sr-only">{t("product.rated", { value: number(value) })}</span>
      <span aria-hidden="true" className="font-medium tabular-nums">
        {number(value)}
      </span>
      {count !== undefined && <span className="text-muted">({t("product.reviewsCount", { count })})</span>}
    </span>
  );
}
