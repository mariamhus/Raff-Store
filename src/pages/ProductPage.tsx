import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router";
import { z } from "zod";
import { Field } from "../components/Field";
import { Price } from "../components/Price";
import { ProductCard, ProductGrid } from "../components/ProductCard";
import { QuantityStepper } from "../components/QuantityStepper";
import { Rating } from "../components/Rating";
import { EmptyState, ErrorState } from "../components/States";
import { WishlistButton } from "../components/WishlistButton";
import { useProduct, useRelated } from "../hooks/queries";
import { ApiError } from "../lib/api";
import { useFormat } from "../lib/format";
import { maxQuantity, stockLevel } from "../lib/pricing";
import type { Product, Review } from "../lib/types";
import { errorText } from "../lib/validation";
import { useAuth } from "../stores/auth";
import { useCart } from "../stores/cart";
import { useReviews } from "../stores/reviews";
import { useToasts } from "../stores/toasts";

const reviewSchema = z.object({
  rating: z.number({ error: "validation.rating" }).int().min(1, "validation.rating").max(5, "validation.rating"),
  comment: z.string().trim().min(10, "validation.min|10"),
});

type ReviewForm = z.infer<typeof reviewSchema>;

function ReviewFormCard({ productId }: { productId: number }) {
  const { t } = useTranslation();
  const user = useAuth((state) => state.user);
  const add = useReviews((state) => state.add);
  const show = useToasts((state) => state.show);
  const [hover, setHover] = useState(0);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewForm>({ resolver: zodResolver(reviewSchema), defaultValues: { rating: 0, comment: "" } });
  const rating = watch("rating");

  if (!user) {
    return (
      <p className="rounded-xl bg-tile px-4 py-3 text-sm">
        <Link to={`/login?redirect=/products/${productId}`} className="text-link">
          {t("product.signInToReview")}
        </Link>
      </p>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => {
        add(productId, {
          rating: values.rating,
          comment: values.comment,
          date: new Date().toISOString(),
          reviewerName: `${user.firstName} ${user.lastName}`,
        });
        reset({ rating: 0, comment: "" });
        show({ message: t("product.reviewPosted") });
      })}
      className="rounded-2xl border border-line p-5"
    >
      <h3 className="font-semibold">{t("product.writeReview")}</h3>
      <fieldset className="mt-4">
        <legend className="field-label">{t("product.yourRating")}</legend>
        <div className="mt-1 flex" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="cursor-pointer p-0.5" onMouseEnter={() => setHover(value)}>
              <input
                type="radio"
                name="rating"
                value={value}
                checked={rating === value}
                onChange={() => setValue("rating", value, { shouldValidate: true })}
                className="peer sr-only"
                aria-describedby={errors.rating ? "rating-error" : undefined}
              />
              <Star
                aria-hidden="true"
                className={`size-7 rounded peer-focus-visible:outline-2 peer-focus-visible:outline-ink ${(hover || rating) >= value ? "fill-star text-star" : "text-line"}`}
              />
              <span className="sr-only">{t("product.stars", { count: value })}</span>
            </label>
          ))}
        </div>
        {errors.rating && (
          <p id="rating-error" className="mt-1 text-sm text-danger">
            {errorText(t, errors.rating.message)}
          </p>
        )}
      </fieldset>
      <Field id="review-comment" label={t("product.comment")} error={errorText(t, errors.comment?.message)} className="mt-4">
        {(props) => <textarea {...props} {...register("comment")} rows={3} placeholder={t("product.commentPlaceholder")} className="field mt-1 w-full py-2.5" />}
      </Field>
      <button type="submit" className="button-primary mt-4">
        {t("product.submitReview")}
      </button>
    </form>
  );
}

function Reviews({ product }: { product: Product }) {
  const { t } = useTranslation();
  const format = useFormat();
  const local = useReviews((state) => state.byProduct[product.id]);
  const reviews: (Review & { own?: boolean })[] = useMemo(
    () => [...(local ?? []).map((review) => ({ ...review, own: true })), ...(product.reviews ?? [])],
    [local, product.reviews],
  );
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : product.rating;

  return (
    <section aria-labelledby="reviews-title" className="pt-16">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 id="reviews-title" className="section-title">
          {t("product.reviews")}
        </h2>
        <Rating value={Math.round(average * 10) / 10} count={reviews.length} size="md" />
      </div>
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {reviews.length === 0 ? (
          <p className="text-muted">{t("product.noReviews")}</p>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {reviews.map((review, index) => (
              <li key={`${review.date}-${index}`} className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">
                    {review.reviewerName}
                    {review.own && <span className="ms-2 rounded-full bg-tile px-2 py-0.5 text-xs text-muted">{t("product.yourReview")}</span>}
                  </p>
                  <p className="text-sm text-muted">{format.date(review.date)}</p>
                </div>
                <div className="mt-1">
                  <Rating value={review.rating} />
                </div>
                <p dir="auto" className="mt-2">{review.comment}</p>
              </li>
            ))}
          </ul>
        )}
        <div className="lg:sticky lg:top-36 lg:self-start">
          <ReviewFormCard productId={product.id} />
        </div>
      </div>
    </section>
  );
}

function ProductView({ product }: { product: Product }) {
  const { t } = useTranslation();
  const format = useFormat();
  const add = useCart((state) => state.add);
  const show = useToasts((state) => state.show);
  const [image, setImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const related = useRelated(product.category);
  const level = stockLevel(product.stock);
  const limit = maxQuantity(product.stock);
  const images = product.images.length ? product.images : [product.thumbnail];

  useEffect(() => {
    document.title = `${product.title} | ${t("brand")}`;
  }, [product.title, t]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link to="/products" className="hover:text-ink">
              {t("nav.shop")}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to={`/products?category=${product.category}`} className="hover:text-ink">
              {format.category(product.category)}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">
            {product.title}
          </li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl bg-tile">
            <img src={images[image]} alt={product.title} width={600} height={600} className="size-full object-contain p-6" />
          </div>
          {images.length > 1 && (
            <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((src, index) => (
                <li key={src}>
                  <button
                    type="button"
                    onClick={() => setImage(index)}
                    aria-pressed={image === index}
                    aria-label={t("product.image", { index: format.number(index + 1), total: format.number(images.length) })}
                    className="block size-20 overflow-hidden rounded-xl border-2 border-transparent bg-tile aria-pressed:border-ink"
                  >
                    <img src={src} alt="" width={80} height={80} loading="lazy" className="size-full object-contain p-1.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          {product.brand && <p className="text-sm font-medium text-muted">{t("product.by", { brand: product.brand })}</p>}
          <h1 className="mt-1 text-[clamp(1.8rem,3.5vw,2.6rem)] leading-tight font-bold tracking-tight">{product.title}</h1>
          <div className="mt-3">
            <a href="#reviews-title" className="hover:underline">
              <Rating value={product.rating} count={product.reviews?.length ?? 0} size="md" />
            </a>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Price price={product.price} discount={product.discountPercentage} size="lg" />
            {product.discountPercentage >= 1 && (
              <span className="rounded-full bg-sale-soft px-2.5 py-1 text-sm font-semibold text-sale-ink">
                {t("product.off", { value: format.number(Math.round(product.discountPercentage)) })}
              </span>
            )}
          </div>
          <p className={`mt-3 text-sm font-semibold ${level === "out" ? "text-danger" : level === "low" ? "text-sale-ink" : "text-success"}`}>
            {level === "out" ? t("product.outOfStock") : level === "low" ? t("product.lowStock", { count: product.stock }) : t("product.inStock")}
          </p>
          <p dir="auto" className="mt-5 leading-relaxed text-ink/85">{product.description}</p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {limit > 0 && <QuantityStepper value={quantity} max={limit} onChange={setQuantity} label={t("product.quantity")} />}
            <button
              type="button"
              disabled={limit === 0}
              onClick={() => {
                add(product, quantity);
                show({ message: t("product.addedToCart"), link: { label: t("product.viewCart"), to: "/cart" } });
              }}
              className="button-primary h-12 flex-1 sm:flex-none sm:px-10"
            >
              {limit === 0 ? t("product.outOfStock") : t("product.addToCart")}
            </button>
            <WishlistButton product={product} variant="full" />
          </div>

          <dl className="mt-8 divide-y divide-line border-y border-line">
            {[
              { icon: Truck, label: t("product.shipping"), value: product.shippingInformation },
              { icon: ShieldCheck, label: t("product.warranty"), value: product.warrantyInformation },
              { icon: RotateCcw, label: t("product.returns"), value: product.returnPolicy },
            ]
              .filter((item) => item.value)
              .map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 py-3">
                  <Icon aria-hidden="true" className="size-5 shrink-0 text-muted" strokeWidth={1.8} />
                  <dt className="w-24 shrink-0 text-sm text-muted">{label}</dt>
                  <dd dir="auto" className="text-sm font-medium">{value}</dd>
                </div>
              ))}
          </dl>
        </div>
      </div>

      <Reviews product={product} />

      {related.data && related.data.products.filter((item) => item.id !== product.id).length > 0 && (
        <section aria-labelledby="related-title" className="pt-16">
          <h2 id="related-title" className="section-title">
            {t("product.related")}
          </h2>
          <div className="mt-6">
            <ProductGrid>
              {related.data.products
                .filter((item) => item.id !== product.id)
                .slice(0, 4)
                .map((item) => (
                  <li key={item.id}>
                    <ProductCard product={item} />
                  </li>
                ))}
            </ProductGrid>
          </div>
        </section>
      )}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div role="status" className="mx-auto grid max-w-7xl gap-10 px-4 pt-14 sm:px-6 lg:grid-cols-2">
      <span className="sr-only">Loading</span>
      <div aria-hidden="true" className="aspect-square rounded-2xl bg-tile motion-safe:animate-pulse" />
      <div aria-hidden="true" className="space-y-4">
        <div className="h-4 w-24 rounded bg-tile" />
        <div className="h-10 w-3/4 rounded bg-tile" />
        <div className="h-8 w-40 rounded bg-tile" />
        <div className="h-24 rounded bg-tile" />
      </div>
    </div>
  );
}

export function ProductPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const productId = Number(id);
  const query = useProduct(productId);

  if (!Number.isInteger(productId) || productId <= 0 || (query.error instanceof ApiError && query.error.status === 404)) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-14 sm:px-6">
        <EmptyState
          title={t("product.notFound")}
          text={t("product.notFoundText")}
          action={
            <Link to="/products" className="button-primary">
              {t("nav.shop")}
            </Link>
          }
        />
      </div>
    );
  }
  if (query.isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-14 sm:px-6">
        <ErrorState onRetry={() => void query.refetch()} />
      </div>
    );
  }
  if (!query.data) return <ProductSkeleton />;
  return <ProductView key={query.data.id} product={query.data} />;
}
