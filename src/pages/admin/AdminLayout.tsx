import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet } from "react-router";
import { RequireAdmin } from "../../components/Guards";

export function AdminLayout() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `${t("admin.title")} | ${t("brand")}`;
  }, [t]);

  return (
    <RequireAdmin>
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-[clamp(1.9rem,4vw,2.5rem)] font-bold tracking-tight">{t("admin.title")}</h1>
          <nav aria-label={t("admin.title")} className="flex gap-1 rounded-full bg-tile p-1">
            <NavLink to="/admin" end className={({ isActive }) => `tab ${isActive ? "tab-active" : ""}`}>
              {t("admin.overview")}
            </NavLink>
            <NavLink to="/admin/products" className={({ isActive }) => `tab ${isActive ? "tab-active" : ""}`}>
              {t("admin.products")}
            </NavLink>
          </nav>
        </div>
        <Outlet />
      </div>
    </RequireAdmin>
  );
}
