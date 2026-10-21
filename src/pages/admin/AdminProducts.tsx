import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { PLACEHOLDER_IMAGE, ProductDialog, type ProductFormValues } from "./ProductDialog";
import { useAdminCatalog } from "./useAdminCatalog";
import { ErrorState } from "../../components/States";
import { addProduct, deleteProduct, updateProduct } from "../../lib/api";
import { useFormat } from "../../lib/format";
import { useCatalogEdits, type CatalogProduct } from "../../stores/catalogEdits";
import { useToasts } from "../../stores/toasts";

const ROWS = 10;
const API_MAX_ID = 194;

export function AdminProducts() {
  const { t } = useTranslation();
  const format = useFormat();
  const { products, isError, refetch } = useAdminCatalog();
  const save = useCatalogEdits((state) => state.save);
  const remove = useCatalogEdits((state) => state.remove);
  const show = useToasts((state) => state.show);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<CatalogProduct | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const categories = useMemo(() => [...new Set((products ?? []).map((product) => product.category))].sort(), [products]);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (products ?? []).filter(
      (product) =>
        (!category || product.category === category) &&
        (!term || product.title.toLowerCase().includes(term) || (product.brand ?? "").toLowerCase().includes(term)),
    );
  }, [products, query, category]);
  const pages = Math.max(1, Math.ceil(filtered.length / ROWS));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * ROWS, current * ROWS);

  const saveMutation = useMutation({
    mutationFn: async ({ thumbnail, ...values }: ProductFormValues) => {
      const input = { ...values, brand: values.brand || undefined };
      const image = thumbnail || PLACEHOLDER_IMAGE;
      if (!editing) {
        await addProduct(input);
        const nextId = Math.max(API_MAX_ID, ...(products ?? []).map((product) => product.id)) + 1;
        return { product: { ...input, id: nextId, rating: 0, thumbnail: image }, isNew: true };
      }
      if (editing.id <= API_MAX_ID) await updateProduct(editing.id, input);
      return { product: { ...editing, ...input, thumbnail: image }, isNew: false };
    },
    onSuccess: ({ product, isNew }) => {
      save(product, isNew);
      setDialogOpen(false);
      show({ message: isNew ? t("admin.added") : t("admin.saved") });
    },
    onError: () => show({ message: t("admin.failed") }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (product: CatalogProduct) => {
      if (product.id <= API_MAX_ID) await deleteProduct(product.id);
      return product;
    },
    onSuccess: (product) => {
      remove(product.id);
      show({ message: t("admin.deleted", { title: product.title }) });
    },
    onError: () => show({ message: t("admin.failed") }),
  });

  if (isError) return <div className="mt-8"><ErrorState onRetry={() => void refetch()} /></div>;

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-0 flex-[1_1_16rem] sm:max-w-sm">
          <label htmlFor="admin-search" className="sr-only">
            {t("admin.search")}
          </label>
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted" />
          <input
            id="admin-search"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder={t("admin.search")}
            className="field h-10 w-full ps-9"
          />
        </div>
        <label htmlFor="admin-category" className="sr-only">
          {t("admin.category")}
        </label>
        <select
          id="admin-category"
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            setPage(1);
          }}
          className="field h-10 pe-8"
        >
          <option value="">{t("products.allCategories")}</option>
          {categories.map((slug) => (
            <option key={slug} value={slug}>
              {format.category(slug)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          className="button-primary ms-auto h-10"
        >
          <Plus aria-hidden="true" className="size-4" />
          {t("admin.add")}
        </button>
      </div>
      <p className="mt-3 text-sm text-muted">{t("admin.simulatedNote")}</p>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[46rem] text-sm">
          <thead className="bg-tile text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 text-start font-medium">{t("admin.product")}</th>
              <th scope="col" className="px-4 py-3 text-start font-medium">{t("admin.category")}</th>
              <th scope="col" className="px-4 py-3 text-end font-medium">{t("admin.price")}</th>
              <th scope="col" className="px-4 py-3 text-end font-medium">{t("admin.stock")}</th>
              <th scope="col" className="px-4 py-3 text-end font-medium">{t("admin.rating")}</th>
              <th scope="col" className="px-4 py-3 text-end font-medium">{t("admin.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {!products
              ? Array.from({ length: ROWS }, (_, index) => (
                  <tr key={index} aria-hidden="true" className="border-t border-line">
                    <td colSpan={6} className="px-4 py-3">
                      <div className="h-8 rounded bg-tile motion-safe:animate-pulse" />
                    </td>
                  </tr>
                ))
              : rows.map((product) => (
                  <tr key={product.id} className="border-t border-line">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <img src={product.thumbnail} alt="" width={40} height={40} loading="lazy" className="size-10 shrink-0 rounded-lg bg-tile object-contain p-0.5" />
                        <div className="min-w-0">
                          {product.id <= API_MAX_ID ? (
                            <Link to={`/products/${product.id}`} className="font-medium hover:underline">
                              {product.title}
                            </Link>
                          ) : (
                            <span className="font-medium">{product.title}</span>
                          )}
                          {product.brand && <p className="text-xs text-muted">{product.brand}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-muted">{format.category(product.category)}</td>
                    <td className="px-4 py-2.5 text-end tabular-nums">{format.price(product.price)}</td>
                    <td className="px-4 py-2.5 text-end tabular-nums">
                      {product.stock < 10 && <span className="me-2 rounded-full bg-sale-soft px-2 py-0.5 text-xs font-semibold text-sale-ink">{t("admin.lowStockBadge")}</span>}
                      {format.number(product.stock)}
                    </td>
                    <td className="px-4 py-2.5 text-end tabular-nums">{product.rating ? format.number(product.rating) : "–"}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(product);
                            setDialogOpen(true);
                          }}
                          aria-label={`${t("admin.edit")}: ${product.title}`}
                          className="grid size-9 place-items-center rounded-full hover:bg-tile"
                        >
                          <Pencil aria-hidden="true" className="size-4" />
                        </button>
                        <button
                          type="button"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (window.confirm(t("admin.confirmDelete", { title: product.title }))) deleteMutation.mutate(product);
                          }}
                          aria-label={`${t("admin.delete")}: ${product.title}`}
                          className="grid size-9 place-items-center rounded-full text-danger hover:bg-danger/10"
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {products && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-muted">
            {t("admin.showing", {
              from: format.number(filtered.length === 0 ? 0 : (current - 1) * ROWS + 1),
              to: format.number(Math.min(current * ROWS, filtered.length)),
              total: format.number(filtered.length),
            })}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPage(current - 1)} disabled={current <= 1} className="button-secondary h-9 px-3 disabled:opacity-40">
              <ChevronLeft aria-hidden="true" className="size-4 rtl:-scale-x-100" />
              {t("products.previous")}
            </button>
            <button type="button" onClick={() => setPage(current + 1)} disabled={current >= pages} className="button-secondary h-9 px-3 disabled:opacity-40">
              {t("products.next")}
              <ChevronRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
            </button>
          </div>
        </div>
      )}

      <ProductDialog
        open={dialogOpen}
        product={editing}
        categories={categories}
        saving={saveMutation.isPending}
        onClose={() => setDialogOpen(false)}
        onSave={(values) => saveMutation.mutate(values)}
      />
    </div>
  );
}
