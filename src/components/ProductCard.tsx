import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Price } from "./Price";
import { Rating } from "./Rating";
import { WishlistButton } from "./WishlistButton";
import { useFormat } from "../lib/format";
import type { Product } from "../lib/types";
import { useCart } from "../stores/cart";
import { useToasts } from "../stores/toasts";

type CardProduct = Pick<Product, "id" | "title" | "thumbnail" | "price" | "discountPercentage" | "rating" | "stock" | "category">;

export function ProductCard({ product, eager = false }: { product: CardProduct; eager?: boolean }) {
  const { t } = useTranslation();
  const format = useFormat();
  const add = useCart((state) => state.add);
  const show = useToasts((state) => state.show);
  const discount = Math.round(product.discountPercentage);

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-tile">
        <img
          src={product.thumbnail}
          alt=""
          width={300}
          height={300}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="size-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.04]"
        />
        {discount >= 5 && (
          <span className="absolute top-3 start-3 rounded-full bg-sale-soft px-2 py-0.5 text-xs font-semibold text-sale-ink">
            {t("product.off", { value: format.number(discount) })}
          </span>
        )}
        <div className="absolute top-2.5 end-2.5 z-10">
          <WishlistButton product={product} />
        </div>
      </div>
      <div className="mt-3 flex flex-1 flex-col">
        <p className="text-xs text-muted">{format.category(product.category)}</p>
        <h3 className="mt-0.5 line-clamp-2 font-medium leading-snug">
          <Link to={`/products/${product.id}`} className="after:absolute after:inset-0">
            {product.title}
          </Link>
        </h3>
        <div className="mt-1.5">
          <Rating value={product.rating} />
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <Price price={product.price} discount={product.discountPercentage} />
          <button
            type="button"
            disabled={product.stock <= 0}
            onClick={() => {
              add(product);
              show({ message: t("product.addedToCart"), link: { label: t("product.viewCart"), to: "/cart" } });
            }}
            aria-label={`${t("product.addToCart")}: ${product.title}`}
            className="relative z-10 grid size-9 shrink-0 place-items-center rounded-full bg-ink text-white transition-opacity hover:opacity-85 disabled:opacity-30"
          >
            <Plus aria-hidden="true" className="size-4.5" />
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="aspect-square rounded-xl bg-tile motion-safe:animate-pulse" />
      <div className="mt-3 h-3 w-1/3 rounded bg-tile" />
      <div className="mt-2 h-4 w-4/5 rounded bg-tile" />
      <div className="mt-3 h-4 w-1/4 rounded bg-tile" />
    </div>
  );
}

export function ProductGrid({ children }: { children: React.ReactNode }) {
  return <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">{children}</ul>;
}
