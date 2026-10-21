import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./i18n";
import { Layout } from "./components/Layout";
import { RequireAuth } from "./components/Guards";
import { ApiError } from "./lib/api";
import { AccountPage } from "./pages/AccountPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProductPage } from "./pages/ProductPage";
import { ProductsPage } from "./pages/ProductsPage";
import { RouteError } from "./pages/RouteError";
import { WishlistPage } from "./pages/WishlistPage";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: (count, error) => count < 2 && !(error instanceof ApiError && error.status >= 400 && error.status < 500),
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    ErrorBoundary: RouteError,
    children: [
      { index: true, Component: HomePage },
      { path: "products", Component: ProductsPage },
      { path: "products/:id", Component: ProductPage },
      { path: "cart", Component: CartPage },
      { path: "checkout", Component: CheckoutPage },
      { path: "wishlist", Component: WishlistPage },
      { path: "login", Component: LoginPage },
      {
        path: "account",
        element: (
          <RequireAuth>
            <AccountPage />
          </RequireAuth>
        ),
      },
      {
        path: "admin",
        lazy: async () => ({ Component: (await import("./pages/admin/AdminLayout")).AdminLayout }),
        children: [
          { index: true, lazy: async () => ({ Component: (await import("./pages/admin/AdminOverview")).AdminOverview }) },
          { path: "products", lazy: async () => ({ Component: (await import("./pages/admin/AdminProducts")).AdminProducts }) },
        ],
      },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
