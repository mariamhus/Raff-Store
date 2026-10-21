import { useTranslation } from "react-i18next";
import { useFormat } from "../lib/format";
import { finalPrice } from "../lib/pricing";

export function Price({ price, discount, size = "sm" }: { price: number; discount: number; size?: "sm" | "lg" }) {
  const { t } = useTranslation();
  const format = useFormat();
  const final = finalPrice(price, discount);
  const showDiscount = discount >= 1;
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2">
      <span className={`font-semibold tabular-nums ${size === "lg" ? "text-3xl tracking-tight" : "text-base"}`}>{format.price(final)}</span>
      {showDiscount && (
        <span className={`text-muted line-through tabular-nums ${size === "lg" ? "text-base" : "text-sm"}`}>
          <span className="sr-only">{t("product.was", { price: format.price(price) })}</span>
          <span aria-hidden="true">{format.price(price)}</span>
        </span>
      )}
    </span>
  );
}
