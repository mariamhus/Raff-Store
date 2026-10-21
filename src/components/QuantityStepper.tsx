import { Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useFormat } from "../lib/format";

interface QuantityStepperProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
  size?: "sm" | "md";
}

export function QuantityStepper({ value, max, onChange, label, size = "md" }: QuantityStepperProps) {
  const { t } = useTranslation();
  const { number } = useFormat();
  const button = size === "sm" ? "size-9" : "size-11";
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-full border border-line">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label={t("product.decrease")}
        className={`grid ${button} place-items-center rounded-full disabled:opacity-30`}
      >
        <Minus aria-hidden="true" className="size-4" />
      </button>
      <span aria-live="polite" className="w-7 text-center text-sm font-semibold tabular-nums">
        {number(value)}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={t("product.increase")}
        className={`grid ${button} place-items-center rounded-full disabled:opacity-30`}
      >
        <Plus aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
