import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useWishlist, type WishlistItem } from "../stores/wishlist";

export function WishlistButton({ product, variant = "icon" }: { product: WishlistItem; variant?: "icon" | "full" }) {
  const { t } = useTranslation();
  const saved = useWishlist((state) => state.items.some((item) => item.id === product.id));
  const toggle = useWishlist((state) => state.toggle);

  if (variant === "full") {
    return (
      <button type="button" aria-pressed={saved} onClick={() => toggle(product)} className="button-secondary">
        <Heart aria-hidden="true" className={`size-5 ${saved ? "fill-sale text-sale" : ""}`} />
        {saved ? t("product.saved") : t("product.save")}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={`${saved ? t("product.unsave") : t("product.save")}: ${product.title}`}
      onClick={() => toggle(product)}
      className="grid size-9 place-items-center rounded-full bg-white/90 shadow-sm transition-colors hover:bg-white"
    >
      <Heart aria-hidden="true" className={`size-[18px] ${saved ? "fill-sale text-sale" : "text-ink"}`} />
    </button>
  );
}
