import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useLocation } from "react-router";
import { useAuth } from "../stores/auth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const user = useAuth((state) => state.user);
  const location = useLocation();
  if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  return children;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const user = useAuth((state) => state.user);
  const location = useLocation();
  if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  if (user.role !== "admin") {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <Lock aria-hidden="true" className="mx-auto size-9 text-muted" strokeWidth={1.6} />
        <h1 className="mt-4 text-2xl font-bold">{t("admin.notAdmin")}</h1>
        <p className="mt-2 text-muted">{t("admin.notAdminText")}</p>
        <Link to="/" className="button-primary mt-6">
          {t("common.goHome")}
        </Link>
      </div>
    );
  }
  return children;
}
