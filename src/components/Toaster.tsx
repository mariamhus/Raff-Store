import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useToasts } from "../stores/toasts";

export function Toaster() {
  const { t } = useTranslation();
  const toast = useToasts((state) => state.toast);
  const dismiss = useToasts((state) => state.dismiss);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
      {toast && (
        <div key={toast.id} className="toast pointer-events-auto flex items-center gap-3 rounded-full bg-ink py-2 ps-5 pe-2 text-sm text-white shadow-xl">
          <span>{toast.message}</span>
          {toast.action && toast.actionLabel && (
            <button
              type="button"
              onClick={() => {
                toast.action?.();
                dismiss();
              }}
              className="rounded-full px-3 py-1.5 font-semibold hover:bg-white/15"
            >
              {toast.actionLabel}
            </button>
          )}
          {toast.link && (
            <Link to={toast.link.to} onClick={dismiss} className="rounded-full px-3 py-1.5 font-semibold hover:bg-white/15">
              {toast.link.label}
            </Link>
          )}
          <button type="button" onClick={dismiss} aria-label={t("common.dismiss")} className="grid size-8 place-items-center rounded-full hover:bg-white/15">
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
