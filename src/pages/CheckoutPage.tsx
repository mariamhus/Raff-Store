import { useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CircleCheck, LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { z } from "zod";
import { OrderSummary } from "./CartPage";
import { Field } from "../components/Field";
import { EmptyState } from "../components/States";
import { locale } from "../i18n";
import { createServerCart } from "../lib/api";
import { useFormat } from "../lib/format";
import { cartTotals, FREE_SHIPPING_FROM, round, SHIPPING_FEE } from "../lib/pricing";
import { errorText } from "../lib/validation";
import { useAuth } from "../stores/auth";
import { useCart } from "../stores/cart";
import { useOrders, type Order } from "../stores/orders";

const COUNTRY_CODES = ["EG", "SA", "AE", "JO", "KW", "QA", "GB", "DE", "US"] as const;

const checkoutSchema = z.object({
  fullName: z.string().trim().min(3, "validation.min|3"),
  email: z.email("validation.email"),
  phone: z.string().trim().regex(/^\+?[0-9][0-9\s-]{6,16}$/, "validation.phone"),
  address: z.string().trim().min(5, "validation.min|5"),
  city: z.string().trim().min(2, "validation.min|2"),
  country: z.enum(COUNTRY_CODES, "validation.required"),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

function countryCode(name: string | undefined): CheckoutForm["country"] {
  const names = new Intl.DisplayNames(["en"], { type: "region" });
  return COUNTRY_CODES.find((code) => names.of(code) === name) ?? "EG";
}

export function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const format = useFormat();
  const items = useCart((state) => state.items);
  const clear = useCart((state) => state.clear);
  const user = useAuth((state) => state.user);
  const addOrder = useOrders((state) => state.add);
  const [placed, setPlaced] = useState<Order | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const totals = cartTotals(items);
  const regionNames = useMemo(() => new Intl.DisplayNames([locale(i18n.language)], { type: "region" }), [i18n.language]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user ? `${user.firstName} ${user.lastName}` : "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      address: user?.address?.address ?? "",
      city: user?.address?.city ?? "",
      country: countryCode(user?.address?.country),
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: CheckoutForm) => {
      const cart = await createServerCart(
        user?.id ?? 1,
        items.map((item) => ({ id: item.id, quantity: item.quantity })),
      );
      const subtotal = round(cart.discountedTotal);
      const shipping = subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
      const order: Order = {
        id: `R-${Date.now().toString(36).toUpperCase()}`,
        userId: user?.id ?? null,
        customer: values.fullName,
        email: values.email,
        createdAt: new Date().toISOString(),
        lines: cart.products.map((line) => ({
          id: line.id,
          title: line.title,
          thumbnail: items.find((item) => item.id === line.id)?.thumbnail ?? "",
          quantity: line.quantity,
          unitPrice: round(line.discountedTotal / line.quantity),
        })),
        subtotal,
        shipping,
        total: round(subtotal + shipping),
        address: `${values.address}, ${values.city}, ${regionNames.of(values.country)}`,
      };
      return order;
    },
    onSuccess: (order) => {
      addOrder(order);
      clear();
      setPlaced(order);
      window.scrollTo({ top: 0 });
    },
  });

  useEffect(() => {
    if (mutation.isError) errorRef.current?.focus();
  }, [mutation.isError]);

  if (placed) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-12 sm:px-6">
        <CircleCheck aria-hidden="true" className="size-11 text-success" strokeWidth={1.6} />
        <h1 className="mt-4 text-[clamp(1.9rem,4vw,2.75rem)] font-bold tracking-tight">{t("checkout.successTitle")}</h1>
        <p className="mt-3 text-lg text-muted">
          {placed.userId ? t("checkout.successText", { id: placed.id }) : t("checkout.successGuest", { id: placed.id })}
        </p>
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {placed.lines.map((line) => (
            <li key={line.id} className="flex items-center gap-4 py-3">
              <img src={line.thumbnail} alt="" width={56} height={56} className="size-14 rounded-lg bg-tile object-contain p-1" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{line.title}</span>
                <span className="text-sm text-muted">
                  {format.number(line.quantity)} × {format.price(line.unitPrice)}
                </span>
              </span>
              <span className="tabular-nums">{format.price(line.unitPrice * line.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-end text-lg font-semibold">{t("checkout.serverTotal", { total: format.price(placed.total) })}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          {placed.userId && (
            <Link to="/account" className="button-primary">
              {t("checkout.viewOrders")}
            </Link>
          )}
          <Link to="/products" className="button-secondary">
            {t("checkout.keepShopping")}
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-12 sm:px-6">
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
    );
  }

  const error = (field: keyof CheckoutForm) => errorText(t, errors[field]?.message);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <form noValidate onSubmit={handleSubmit((values) => mutation.mutate(values))} className="max-w-2xl">
          <h1 className="text-[clamp(1.9rem,4vw,2.75rem)] font-bold tracking-tight">{t("checkout.title")}</h1>
          {!user && (
            <p className="mt-3 text-muted">
              {t("checkout.signInPrompt")}{" "}
              <Link to="/login?redirect=/checkout" className="text-link">
                {t("checkout.signInLink")}
              </Link>
            </p>
          )}
          <p className="mt-5 rounded-xl bg-tile px-4 py-3 text-sm">{t("checkout.demoNote")}</p>
          {mutation.isError && (
            <p ref={errorRef} tabIndex={-1} role="alert" className="mt-5 rounded-xl border border-danger/40 bg-danger/5 px-4 py-3 text-danger">
              {t("checkout.failed")}
            </p>
          )}

          <fieldset className="mt-8 grid gap-5 sm:grid-cols-2">
            <legend className="mb-4 text-lg font-semibold">{t("checkout.contact")}</legend>
            <Field id="fullName" label={t("checkout.fullName")} error={error("fullName")} className="sm:col-span-2">
              {(props) => <input {...props} {...register("fullName")} autoComplete="name" className="field mt-1 w-full" />}
            </Field>
            <Field id="email" label={t("checkout.email")} error={error("email")}>
              {(props) => <input {...props} {...register("email")} type="email" autoComplete="email" dir="ltr" className="field mt-1 w-full" />}
            </Field>
            <Field id="phone" label={t("checkout.phone")} error={error("phone")}>
              {(props) => <input {...props} {...register("phone")} type="tel" autoComplete="tel" dir="ltr" className="field mt-1 w-full" />}
            </Field>
          </fieldset>

          <fieldset className="mt-8 grid gap-5 sm:grid-cols-2">
            <legend className="mb-4 text-lg font-semibold">{t("checkout.delivery")}</legend>
            <Field id="address" label={t("checkout.address")} error={error("address")} className="sm:col-span-2">
              {(props) => <input {...props} {...register("address")} autoComplete="street-address" className="field mt-1 w-full" />}
            </Field>
            <Field id="city" label={t("checkout.city")} error={error("city")}>
              {(props) => <input {...props} {...register("city")} autoComplete="address-level2" className="field mt-1 w-full" />}
            </Field>
            <Field id="country" label={t("checkout.country")} error={error("country")}>
              {(props) => (
                <select {...props} {...register("country")} autoComplete="country" className="field mt-1 w-full">
                  {COUNTRY_CODES.map((code) => (
                    <option key={code} value={code}>
                      {regionNames.of(code)}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </fieldset>

          <fieldset className="mt-8">
            <legend className="mb-3 text-lg font-semibold">{t("checkout.payment")}</legend>
            <label className="flex items-center gap-3 rounded-xl border-2 border-ink px-4 py-3">
              <input type="radio" name="payment" defaultChecked className="size-4 accent-ink" />
              <span className="font-medium">{t("checkout.cod")}</span>
            </label>
          </fieldset>

          <button type="submit" disabled={mutation.isPending} className="button-primary mt-8 h-12 w-full sm:w-auto sm:px-10">
            {mutation.isPending && <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" />}
            {mutation.isPending ? t("checkout.placing") : t("checkout.placeOrder", { total: format.price(totals.total) })}
          </button>
        </form>
        <div className="lg:sticky lg:top-36 lg:self-start">
          <OrderSummary>
            <ul className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span className="min-w-0 truncate">{item.title}</span>
                  <span className="shrink-0 text-muted tabular-nums">× {format.number(item.quantity)}</span>
                </li>
              ))}
            </ul>
          </OrderSummary>
        </div>
      </div>
    </div>
  );
}
