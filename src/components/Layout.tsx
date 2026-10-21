import { useEffect, useState, type FormEvent } from "react";
import { Heart, Languages, LayoutDashboard, Search, ShoppingCart, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet, ScrollRestoration, useLocation, useNavigate, useSearchParams } from "react-router";
import { Toaster } from "./Toaster";
import { useFormat } from "../lib/format";
import { useAuth } from "../stores/auth";
import { useCart } from "../stores/cart";
import { useWishlist } from "../stores/wishlist";

function SearchForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const current = location.pathname === "/products" ? (params.get("q") ?? "") : "";
  const [value, setValue] = useState(current);

  useEffect(() => setValue(current), [current]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const query = value.trim();
    navigate(query ? `/products?q=${encodeURIComponent(query)}` : "/products");
  }

  return (
    <form role="search" onSubmit={submit} className="relative w-full">
      <label htmlFor="site-search" className="sr-only">
        {t("nav.search")}
      </label>
      <input
        id="site-search"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={t("nav.search")}
        className="field h-11 w-full rounded-full ps-11 pe-4"
      />
      <button type="submit" aria-label={t("nav.searchSubmit")} className="absolute inset-y-0 start-0 grid w-11 place-items-center text-muted hover:text-ink">
        <Search aria-hidden="true" className="size-4.5" />
      </button>
    </form>
  );
}

function CountBadge({ count }: { count: number }) {
  const { number } = useFormat();
  if (count === 0) return null;
  return (
    <span aria-hidden="true" className="absolute -top-1 -end-1 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] leading-5 font-bold text-white tabular-nums">
      {number(count)}
    </span>
  );
}

function Header() {
  const { t, i18n } = useTranslation();
  const cartCount = useCart((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const wishlistCount = useWishlist((state) => state.items.length);
  const user = useAuth((state) => state.user);
  const nextLanguage = i18n.language === "ar" ? "en" : "ar";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6 lg:grid-cols-[auto_minmax(0,36rem)_1fr]">
        <Link to="/" className="flex items-baseline gap-2 text-2xl font-bold tracking-tight">
          <span>{t("brand")}</span>
          <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
        </Link>
        <div className="col-span-3 row-start-2 lg:col-span-1 lg:row-start-1">
          <SearchForm />
        </div>
        <nav aria-label={t("nav.account")} className="col-start-3 row-start-1 flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => void i18n.changeLanguage(nextLanguage)}
            aria-label={t("nav.switchLanguageLabel")}
            lang={nextLanguage}
            className="header-button px-3 text-sm font-medium"
          >
            <Languages aria-hidden="true" className="size-5" />
            <span className="hidden sm:inline">{t("nav.switchLanguage")}</span>
          </button>
          {user?.role === "admin" && (
            <Link to="/admin" className="header-button hidden px-3 text-sm font-medium md:inline-flex">
              <LayoutDashboard aria-hidden="true" className="size-5" />
              {t("nav.admin")}
            </Link>
          )}
          <Link to="/wishlist" className="header-button relative" aria-label={`${t("nav.wishlist")}, ${t("nav.wishlistCount", { count: wishlistCount })}`}>
            <Heart aria-hidden="true" className="size-5" />
            <CountBadge count={wishlistCount} />
          </Link>
          <Link to="/cart" className="header-button relative" aria-label={`${t("nav.cart")}, ${t("nav.cartCount", { count: cartCount })}`}>
            <ShoppingCart aria-hidden="true" className="size-5" />
            <CountBadge count={cartCount} />
          </Link>
          {user ? (
            <Link to="/account" className="header-button gap-2 ps-1.5 pe-3" aria-label={t("nav.account")}>
              <img src={user.image} alt="" width={28} height={28} className="size-7 rounded-full bg-tile" />
              <span className="hidden text-sm font-medium sm:inline">{user.firstName}</span>
            </Link>
          ) : (
            <Link to="/login" className="header-button gap-2 px-3 text-sm font-medium">
              <User aria-hidden="true" className="size-5" />
              <span className="hidden sm:inline">{t("nav.signIn")}</span>
            </Link>
          )}
        </nav>
      </div>
      <div className="border-t border-line/70">
        <nav aria-label={t("nav.shop")} className="scrollbar-none mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-1.5 text-sm sm:px-6">
          <NavLink to="/products" end className={({ isActive }) => `subnav-link ${isActive ? "subnav-active" : ""}`}>
            {t("nav.shop")}
          </NavLink>
          <Link to="/products?sort=discount" className="subnav-link">
            {t("nav.deals")}
          </Link>
          {["smartphones", "laptops", "fragrances", "skin-care", "home-decoration", "furniture", "womens-dresses", "mens-shirts"].map((slug) => (
            <CategoryLink key={slug} slug={slug} />
          ))}
        </nav>
      </div>
    </header>
  );
}

function CategoryLink({ slug }: { slug: string }) {
  const format = useFormat();
  return (
    <Link to={`/products?category=${slug}`} className="subnav-link">
      {format.category(slug)}
    </Link>
  );
}

function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="mt-24 border-t border-line bg-tile">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-6 px-4 py-10 sm:px-6">
        <div>
          <p className="text-xl font-bold">{t("brand")}</p>
          <p className="mt-1 text-muted">{t("footer.tagline")}</p>
        </div>
        <p className="max-w-sm text-sm text-muted">{t("footer.data")}</p>
      </div>
    </footer>
  );
}

export function Layout() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="skip-link">
        {t("nav.skip")}
      </a>
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
      <ScrollRestoration />
    </div>
  );
}
