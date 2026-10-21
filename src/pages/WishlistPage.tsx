import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { ProductCard, ProductGrid } from "../components/ProductCard";
import { EmptyState } from "../components/States";
import { useWishlist } from "../stores/wishlist";

export function WishlistPage() {
  const { t } = useTranslation();
  const items = useWishlist((state) => state.items);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12">
      <h1 className="text-[clamp(1.9rem,4vw,2.75rem)] font-bold tracking-tight">{t("wishlist.title")}</h1>
      <div className="mt-8">
        {items.length === 0 ? (
          <EmptyState
            title={t("wishlist.empty")}
            text={t("wishlist.emptyText")}
            action={
              <Link to="/products" className="button-primary">
                {t("cart.continue")}
              </Link>
            }
          />
        ) : (
          <ProductGrid>
            {items.map((item) => (
              <li key={item.id}>
                <ProductCard product={item} />
              </li>
            ))}
          </ProductGrid>
        )}
      </div>
    </div>
  );
}
