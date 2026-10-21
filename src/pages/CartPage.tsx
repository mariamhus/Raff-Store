import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { QuantityStepper } from "../components/QuantityStepper";
import { EmptyState } from "../components/States";
import { useFormat } from "../lib/format";
import { cartTotals, finalPrice, FREE_SHIPPING_FROM, maxQuantity } from "../lib/pricing";
import { useCart } from "../stores/cart";
import { useToasts } from "../stores/toasts";

export function OrderSummary({ children }: { children?: React.ReactNode }) {
  const { t } = useTranslation();
  const format = useFormat();
  const items = useCart((state) => state.items);
  const totals = cartTotals(items);
  const remaining = FREE_SHIPPING_FROM - totals.subtotal;

  return (
    <section aria-labelledby="summary-title" className="rounded-2xl bg-tile p-6">
      <h2 id="summary-title" className="text-lg font-semibold">
        {t("cart.summary")}
      </h2>
      <dl className="mt-4 space-y-2">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">{t("cart.subtotal")}</dt>
          <dd className="tabular-nums">{format.price(totals.subtotal)}</dd>
        </div>
        {totals.savings > 0 && (
          <div className="flex justify-between gap-4 text-success">
            <dt>{t("cart.savings")}</dt>
            <dd className="tabular-nums">{format.price(totals.savings)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt className="text-muted">{t("cart.shipping")}</dt>
          <dd className="tabular-nums">{totals.shipping === 0 ? t("cart.free") : format.price(totals.shipping)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-line pt-3 text-lg font-semibold">
          <dt>{t("cart.total")}</dt>
          <dd className="tabular-nums">{format.price(totals.total)}</dd>
        </div>
      </dl>
      {totals.subtotal > 0 && remaining > 0 && (
        <p className="mt-3 text-sm text-muted">{t("cart.freeShippingHint", { amount: format.price(remaining) })}</p>
      )}
      {children}
    </section>
  );
}

export function CartPage() {
  const { t } = useTranslation();
  const format = useFormat();
  const items = useCart((state) => state.items);
  const setQuantity = useCart((state) => state.setQuantity);
  const remove = useCart((state) => state.remove);
  const restore = useCart((state) => state.restore);
  const show = useToasts((state) => state.show);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
      <h1 className="text-[clamp(1.9rem,4vw,2.75rem)] font-bold tracking-tight">{t("cart.title")}</h1>
      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={t("cart.empty")}
            text={t("cart.emptyText")}
            action={
              <Link to="/products" className="button-primary">
                {t("cart.continue")}
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <ul className="divide-y divide-line border-y border-line">
            {items.map((item, index) => {
              const unit = finalPrice(item.price, item.discountPercentage);
              return (
                <li key={item.id} className="flex gap-4 py-5">
                  <Link to={`/products/${item.id}`} className="shrink-0" tabIndex={-1} aria-hidden="true">
                    <img src={item.thumbnail} alt="" width={96} height={96} className="size-24 rounded-xl bg-tile object-contain p-2" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                      <div className="min-w-0">
                        <h2 className="font-medium">
                          <Link to={`/products/${item.id}`} className="hover:underline">
                            {item.title}
                          </Link>
                        </h2>
                        <p className="text-sm text-muted">{t("cart.each", { price: format.price(unit) })}</p>
                      </div>
                      <p className="font-semibold tabular-nums">{format.price(unit * item.quantity)}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-4 pt-3">
                      <QuantityStepper
                        size="sm"
                        value={item.quantity}
                        max={maxQuantity(item.stock)}
                        onChange={(value) => setQuantity(item.id, value)}
                        label={`${t("product.quantity")}: ${item.title}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const removed = remove(item.id);
                          if (removed) {
                            show({ message: t("cart.removed", { title: removed.title }), actionLabel: t("cart.undo"), action: () => restore(removed, index) });
                          }
                        }}
                        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-danger"
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                        {t("cart.remove")}
                        <span className="sr-only">: {item.title}</span>
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="lg:sticky lg:top-36 lg:self-start">
            <OrderSummary>
              <Link to="/checkout" className="button-primary mt-6 w-full">
                {t("cart.checkout")}
              </Link>
              <Link to="/products" className="mt-3 block text-center text-sm text-muted hover:text-ink">
                {t("cart.continue")}
              </Link>
            </OrderSummary>
          </div>
        </div>
      )}
    </div>
  );
}
