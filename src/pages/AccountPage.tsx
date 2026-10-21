import { useEffect } from "react";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import { useFormat } from "../lib/format";
import { useAuth } from "../stores/auth";
import { useOrders } from "../stores/orders";
import { useToasts } from "../stores/toasts";

export function AccountPage() {
  const { t } = useTranslation();
  const format = useFormat();
  const navigate = useNavigate();
  const user = useAuth((state) => state.user)!;
  const logout = useAuth((state) => state.logout);
  const show = useToasts((state) => state.show);
  const orders = useOrders((state) => state.orders).filter((order) => order.userId === user.id);

  useEffect(() => {
    document.title = `${t("account.title")} | ${t("brand")}`;
  }, [t]);

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 sm:pt-12">
      <h1 className="text-[clamp(1.9rem,4vw,2.75rem)] font-bold tracking-tight">{t("account.greeting", { name: user.firstName })}</h1>
      <div className="mt-8 grid gap-10 md:grid-cols-[18rem_minmax(0,1fr)]">
        <section aria-labelledby="profile-title" className="self-start rounded-2xl bg-tile p-6">
          <h2 id="profile-title" className="sr-only">
            {t("account.profile")}
          </h2>
          <img src={user.image} alt="" width={72} height={72} className="size-18 rounded-full bg-white" />
          <p className="mt-3 text-lg font-semibold">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-sm text-muted">{t("account.role", { role: user.role })}</p>
          <dl className="mt-5 space-y-3 text-sm">
            <div>
              <dt className="text-muted">{t("account.email")}</dt>
              <dd dir="ltr" className="text-start break-all">
                {user.email}
              </dd>
            </div>
            {user.phone && (
              <div>
                <dt className="text-muted">{t("account.phone")}</dt>
                <dd dir="ltr" className="text-start">
                  {user.phone}
                </dd>
              </div>
            )}
            {user.address && (
              <div>
                <dt className="text-muted">{t("account.address")}</dt>
                <dd>
                  {user.address.address}, {user.address.city}, {user.address.country}
                </dd>
              </div>
            )}
          </dl>
          <div className="mt-6 flex flex-col gap-2">
            {user.role === "admin" && (
              <Link to="/admin" className="button-primary h-10">
                <LayoutDashboard aria-hidden="true" className="size-4" />
                {t("account.goToAdmin")}
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                logout();
                show({ message: t("auth.signedOut") });
                navigate("/");
              }}
              className="button-secondary h-10"
            >
              <LogOut aria-hidden="true" className="size-4 rtl:-scale-x-100" />
              {t("nav.signOut")}
            </button>
          </div>
        </section>

        <section aria-labelledby="orders-title">
          <h2 id="orders-title" className="section-title">
            {t("account.orders")}
          </h2>
          {orders.length === 0 ? (
            <p className="mt-4 text-muted">{t("account.noOrders")}</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {orders.map((order) => (
                <li key={order.id} className="rounded-2xl border border-line p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-semibold">{t("account.order", { id: order.id })}</h3>
                    <span className="rounded-full bg-sale-soft px-2.5 py-0.5 text-xs font-semibold text-sale-ink">{t("account.processing")}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {t("account.placedOn", { date: format.date(order.createdAt) })},{" "}
                    {t("account.items", { count: order.lines.reduce((sum, line) => sum + line.quantity, 0) })}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                    <ul className="flex -space-x-2 rtl:space-x-reverse">
                      {order.lines.slice(0, 5).map((line) => (
                        <li key={line.id}>
                          <img src={line.thumbnail} alt={line.title} width={44} height={44} className="size-11 rounded-full border-2 border-white bg-tile object-contain p-0.5" />
                        </li>
                      ))}
                    </ul>
                    <p className="font-semibold tabular-nums">{format.price(order.total)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
