import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";
import { Pagination } from "../components/Pagination";
import { ProductCard, ProductCardSkeleton, ProductGrid } from "../components/ProductCard";
import { EmptyState, ErrorState } from "../components/States";
import { useCategories, useProducts } from "../hooks/queries";
import { isSortId, PAGE_SIZE } from "../lib/api";
import { useFormat } from "../lib/format";
import type { SortId } from "../lib/types";

const SORT_IDS: SortId[] = ["featured", "price-asc", "price-desc", "rating", "discount", "title"];

export function ProductsPage() {
  const { t } = useTranslation();
  const format = useFormat();
  const [params, setParams] = useSearchParams();
  const q = params.get("q")?.trim() || undefined;
  const category = params.get("category") || undefined;
  const sortParam = params.get("sort");
  const sort: SortId = isSortId(sortParam) ? sortParam : "featured";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const query = useProducts({ q, category, sort, page });
  const categories = useCategories();
  const pages = query.data ? Math.ceil(query.data.total / PAGE_SIZE) : 1;
  const heading = q ? t("products.resultsFor", { q }) : category ? format.category(category) : t("products.title");

  useEffect(() => {
    document.title = `${heading} | ${t("brand")}`;
  }, [heading, t]);

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.delete("page");
    setParams(next);
  }

  const categoryHref = (slug: string | null) => {
    const next = new URLSearchParams(params);
    if (slug) next.set("category", slug);
    else next.delete("category");
    next.delete("page");
    const queryString = next.toString();
    return queryString ? `/products?${queryString}` : "/products";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12">
      <h1 className="text-[clamp(1.9rem,4vw,2.75rem)] leading-tight font-bold tracking-tight">{heading}</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <aside aria-labelledby="categories-heading" className="hidden lg:block">
          <h2 id="categories-heading" className="text-sm font-semibold text-muted">
            {t("products.categories")}
          </h2>
          <ul className="mt-3 space-y-0.5">
            <li>
              <Link to={categoryHref(null)} aria-current={!category ? "page" : undefined} className="side-link">
                {t("products.allCategories")}
              </Link>
            </li>
            {(categories.data ?? []).map((item) => (
              <li key={item.slug}>
                <Link to={categoryHref(item.slug)} aria-current={category === item.slug ? "page" : undefined} className="side-link">
                  {format.category(item.slug, item.name)}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
            <p aria-live="polite" className="text-sm text-muted">
              {query.data ? t("products.count", { count: query.data.total }) : " "}
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="lg:hidden">
                <label htmlFor="category-select" className="field-label">
                  {t("products.categories")}
                </label>
                <select
                  id="category-select"
                  value={category ?? ""}
                  onChange={(event) => update({ category: event.target.value || null })}
                  className="field mt-1 h-10 pe-8"
                >
                  <option value="">{t("products.allCategories")}</option>
                  {(categories.data ?? []).map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {format.category(item.slug, item.name)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="sort-select" className="field-label">
                  {t("products.sortLabel")}
                </label>
                <select
                  id="sort-select"
                  value={sort}
                  onChange={(event) => update({ sort: event.target.value === "featured" ? null : event.target.value })}
                  className="field mt-1 h-10 pe-8"
                >
                  {SORT_IDS.map((id) => (
                    <option key={id} value={id}>
                      {t(`products.sort.${id}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className={`mt-8 transition-opacity ${query.isPlaceholderData ? "opacity-60" : ""}`}>
            {query.isError ? (
              <ErrorState onRetry={() => void query.refetch()} />
            ) : query.data && query.data.products.length === 0 ? (
              <EmptyState
                title={t("products.noResults")}
                text={t("products.noResultsText")}
                action={
                  <Link to="/products" className="button-secondary">
                    {t("products.clearFilters")}
                  </Link>
                }
              />
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
          {query.data && <Pagination page={Math.min(page, pages)} pages={pages} />}
        </div>
      </div>
    </div>
  );
}
