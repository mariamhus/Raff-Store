import { useMemo, useState, useId } from "react";
import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ErrorState } from "../../components/States";
import { useFormat } from "../../lib/format";
import { useOrders } from "../../stores/orders";
import { useAdminCatalog } from "./useAdminCatalog";

interface Datum {
  slug: string;
  label: string;
  value: number;
}

function ChartCard({ title, data, max, format: formatValue }: { title: string; data: Datum[]; max?: number; format: (value: number) => string }) {
  const { t, i18n } = useTranslation();
  const [table, setTable] = useState(false);
  const rtl = i18n.dir() === "rtl";
  const id = useId();

  return (
    <section aria-labelledby={id} className="rounded-2xl border border-line p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id={id} className="font-semibold">
          {title}
        </h2>
        <button type="button" onClick={() => setTable((value) => !value)} className="text-sm text-muted underline underline-offset-4 hover:text-ink">
          {table ? t("admin.showChart") : t("admin.showTable")}
        </button>
      </div>
      {table ? (
        <div className="mt-4 max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <tbody>
              {data.map((datum) => (
                <tr key={datum.slug} className="border-b border-line last:border-0">
                  <th scope="row" className="py-1.5 text-start font-normal">
                    {datum.label}
                  </th>
                  <td className="py-1.5 text-end tabular-nums">{formatValue(datum.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-4" style={{ height: data.length * 26 + 30 }} role="img" aria-label={`${title}. ${t("admin.showTable")}.`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 8 }} barCategoryGap={4}>
              <CartesianGrid horizontal={false} stroke="var(--color-line)" />
              <XAxis
                type="number"
                domain={[0, max ?? "auto"]}
                reversed={rtl}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--color-muted)" }}
                tickFormatter={formatValue}
              />
              <YAxis
                type="category"
                dataKey="label"
                orientation={rtl ? "right" : "left"}
                width={132}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "var(--color-ink)" }}
                interval={0}
              />
              <Tooltip
                cursor={{ fill: "var(--color-tile)" }}
                formatter={(value) => [formatValue(Number(value)), title]}
                contentStyle={{ borderRadius: 10, border: "1px solid var(--color-line)", fontSize: 13 }}
              />
              <Bar dataKey="value" fill="var(--color-chart)" radius={rtl ? [4, 0, 0, 4] : [0, 4, 4, 0]} maxBarSize={18} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export function AdminOverview() {
  const { t } = useTranslation();
  const format = useFormat();
  const { products, isError, refetch } = useAdminCatalog();
  const orders = useOrders((state) => state.orders);

  const stats = useMemo(() => {
    if (!products) return null;
    const groups = new Map<string, { count: number; rating: number }>();
    for (const product of products) {
      const group = groups.get(product.category) ?? { count: 0, rating: 0 };
      group.count += 1;
      group.rating += product.rating;
      groups.set(product.category, group);
    }
    const entries = [...groups.entries()];
    return {
      total: products.length,
      categories: groups.size,
      inventory: products.reduce((sum, product) => sum + product.price * product.stock, 0),
      lowStock: products.filter((product) => product.stock < 10).length,
      byCount: entries
        .map(([slug, group]) => ({ slug, label: format.category(slug), value: group.count }))
        .sort((a, b) => b.value - a.value),
      byRating: entries
        .map(([slug, group]) => ({ slug, label: format.category(slug), value: Math.round((group.rating / group.count) * 100) / 100 }))
        .sort((a, b) => b.value - a.value),
    };
  }, [products, format]);

  if (isError) return <div className="mt-8"><ErrorState onRetry={() => void refetch()} /></div>;

  return (
    <div className="mt-8 space-y-8">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
        {[
          { label: t("admin.kpiProducts"), value: stats ? format.number(stats.total) : "–" },
          { label: t("admin.kpiCategories"), value: stats ? format.number(stats.categories) : "–" },
          { label: t("admin.kpiInventory"), value: stats ? format.price(Math.round(stats.inventory)) : "–" },
          { label: t("admin.kpiLowStock"), value: stats ? format.number(stats.lowStock) : "–", hint: t("admin.kpiLowStockHint") },
        ].map((item) => (
          <div key={item.label} className="bg-white p-5">
            <dt className="text-sm text-muted">{item.label}</dt>
            <dd className="mt-1 text-2xl font-bold tracking-tight tabular-nums">{item.value}</dd>
            {item.hint && <dd className="text-xs text-muted">{item.hint}</dd>}
          </div>
        ))}
      </dl>

      {stats ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title={t("admin.productsByCategory")} data={stats.byCount} format={(value) => format.number(value)} />
          <ChartCard title={t("admin.ratingByCategory")} data={stats.byRating} max={5} format={(value) => format.number(value)} />
        </div>
      ) : (
        <div aria-hidden="true" className="grid gap-6 lg:grid-cols-2">
          <div className="h-96 rounded-2xl bg-tile motion-safe:animate-pulse" />
          <div className="h-96 rounded-2xl bg-tile motion-safe:animate-pulse" />
        </div>
      )}

      <section aria-labelledby="orders-title" className="rounded-2xl border border-line p-5">
        <h2 id="orders-title" className="font-semibold">
          {t("admin.recentOrders")}
        </h2>
        <p className="text-sm text-muted">{t("admin.recentOrdersHint")}</p>
        {orders.length === 0 ? (
          <p className="mt-4 text-muted">{t("admin.noOrders")}</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-sm">
              <thead className="text-muted">
                <tr className="border-b border-line">
                  <th scope="col" className="py-2 text-start font-medium">#</th>
                  <th scope="col" className="py-2 text-start font-medium">{t("admin.customer")}</th>
                  <th scope="col" className="py-2 text-start font-medium">{t("admin.date")}</th>
                  <th scope="col" className="py-2 text-end font-medium">{t("admin.total")}</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map((order) => (
                  <tr key={order.id} className="border-b border-line last:border-0">
                    <td className="py-2.5 font-medium" dir="ltr">{order.id}</td>
                    <td className="py-2.5">{order.customer || t("admin.guest")}</td>
                    <td className="py-2.5 text-muted">{format.date(order.createdAt)}</td>
                    <td className="py-2.5 text-end tabular-nums">{format.price(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
