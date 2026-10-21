import { ArrowRight, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { ProductCard, ProductCardSkeleton, ProductGrid } from "../components/ProductCard";
import { ErrorState } from "../components/States";
import { useCategories, useHighlights } from "../hooks/queries";
import { useFormat } from "../lib/format";
import { FREE_SHIPPING_FROM } from "../lib/pricing";

function Highlights({ title, sortBy, link }: { title: string; sortBy: "rating" | "discountPercentage"; link: string }) {
  const { t } = useTranslation();
  const query = useHighlights(sortBy);
  const id = `section-${sortBy}`;
  return (
    <section aria-labelledby={id} className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
      <div className="flex items-end justify-between gap-4">
        <h2 id={id} className="section-title">
          {title}
        </h2>
        <Link to={link} className="text-link">
          {t("home.seeAll")}
          <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
        </Link>
      </div>
      <div className="mt-6">
        {query.isError ? (
          <ErrorState onRetry={() => void query.refetch()} />
        ) : (
          <ProductGrid>
            {query.data
              ? query.data.products.map((product, index) => (
                  <li key={product.id}>
                    <ProductCard product={product} eager={index < 4} />
                  </li>
                ))
              : Array.from({ length: 8 }, (_, index) => (
                  <li key={index}>
                    <ProductCardSkeleton />
                  </li>
                ))}
          </ProductGrid>
        )}
      </div>
    </section>
  );
}

export function HomePage() {
  const { t } = useTranslation();
  const format = useFormat();
  const categories = useCategories();

  return (
    <>
      <section className="hero">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <h1 className="max-w-3xl text-[clamp(2.3rem,5.5vw,4.25rem)] leading-[1.05] font-bold tracking-tight text-white">{t("home.heroTitle")}</h1>
          <p className="mt-5 max-w-xl text-lg text-white/80">{t("home.heroText")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/products" className="button-accent">
              {t("home.heroCta")}
              <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
            </Link>
            <Link to="/products?sort=discount" className="button-ghost-light">
              {t("home.heroDeals")}
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="categories-title" className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
        <h2 id="categories-title" className="section-title">
          {t("home.categories")}
        </h2>
        <ul className="mt-5 flex flex-wrap gap-2">
          {(categories.data ?? []).map((category) => (
            <li key={category.slug}>
              <Link to={`/products?category=${category.slug}`} className="chip">
                {format.category(category.slug, category.name)}
              </Link>
            </li>
          ))}
          {categories.isPending &&
            Array.from({ length: 12 }, (_, index) => <li key={index} aria-hidden="true" className="h-10 w-28 rounded-full bg-tile" />)}
        </ul>
      </section>

      <Highlights title={t("home.deals")} sortBy="discountPercentage" link="/products?sort=discount" />
      <Highlights title={t("home.topRated")} sortBy="rating" link="/products?sort=rating" />

      <section aria-label={t("home.perkSecure")} className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
        <ul className="grid gap-6 rounded-2xl bg-tile p-6 sm:grid-cols-3 sm:p-8">
          {[
            { icon: Truck, title: t("home.perkShipping", { amount: format.price(FREE_SHIPPING_FROM) }), text: t("home.perkShippingText") },
            { icon: RotateCcw, title: t("home.perkReturns"), text: t("home.perkReturnsText") },
            { icon: ShieldCheck, title: t("home.perkSecure"), text: t("home.perkSecureText") },
          ].map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3">
              <Icon aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-accent-ink" strokeWidth={1.8} />
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
