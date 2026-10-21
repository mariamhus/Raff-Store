import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-6 py-14 text-center">
      <p className="text-lg font-semibold">{title}</p>
      {text && <p className="mx-auto mt-1 max-w-md text-muted">{text}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  const { t } = useTranslation();
  return (
    <div role="alert" className="rounded-2xl border border-line px-6 py-14 text-center">
      <p className="text-lg font-semibold">{t("common.error")}</p>
      <p className="mx-auto mt-1 max-w-md text-muted">{t("common.errorText")}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="button-secondary mt-6">
          <RotateCcw aria-hidden="true" className="size-4" />
          {t("common.retry")}
        </button>
      )}
    </div>
  );
}
