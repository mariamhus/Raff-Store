import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, LoaderCircle, Trash2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Field } from "../../components/Field";
import { useFormat } from "../../lib/format";
import { errorText } from "../../lib/validation";
import type { CatalogProduct } from "../../stores/catalogEdits";

const productSchema = z.object({
  title: z.string().trim().min(3, "validation.min|3"),
  description: z.string().trim().min(10, "validation.min|10"),
  category: z.string().min(1, "validation.required"),
  brand: z.string().trim().optional(),
  price: z.number({ error: "validation.number" }).positive("validation.positive").max(100000, "validation.range|1|100000"),
  discountPercentage: z.number({ error: "validation.number" }).min(0, "validation.range|0|90").max(90, "validation.range|0|90"),
  stock: z.number({ error: "validation.number" }).int("validation.integer").min(0, "validation.range|0|10000").max(10000, "validation.range|0|10000"),
  thumbnail: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#f3f4f6"/><path d="M24 54l12-14 9 10 6-7 8 11z" fill="#c9ccd2"/><circle cx="50" cy="30" r="5" fill="#c9ccd2"/></svg>');

const MAX_IMAGE_SIZE = 480;

// Images are kept in localStorage with the catalog edits, so shrink them first.
async function readImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_SIZE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/webp", 0.85);
}

interface ProductDialogProps {
  open: boolean;
  product: CatalogProduct | null;
  categories: string[];
  saving: boolean;
  onClose: () => void;
  onSave: (values: ProductFormValues) => void;
}

export function ProductDialog({ open, product, categories, saving, onClose, onSave }: ProductDialogProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState<string>();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({ resolver: zodResolver(productSchema) });
  const thumbnail = watch("thumbnail");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      reset({
        title: product?.title ?? "",
        description: product?.description ?? "",
        category: product?.category ?? categories[0] ?? "",
        brand: product?.brand ?? "",
        price: product?.price ?? (undefined as unknown as number),
        discountPercentage: product?.discountPercentage ?? 0,
        stock: product?.stock ?? (undefined as unknown as number),
        thumbnail: product?.thumbnail === PLACEHOLDER_IMAGE ? "" : (product?.thumbnail ?? ""),
      });
      setImageError(undefined);
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, product, categories, reset]);

  const error = (field: keyof ProductFormValues) => errorText(t, errors[field]?.message);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      aria-labelledby="product-dialog-title"
      className="dialog"
    >
      <form noValidate onSubmit={handleSubmit(onSave)} className="flex max-h-[inherit] flex-col">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 id="product-dialog-title" className="text-lg font-semibold">
            {product ? t("admin.editProduct") : t("admin.newProduct")}
          </h2>
          <button type="button" onClick={onClose} aria-label={t("common.close")} className="grid size-9 place-items-center rounded-full hover:bg-tile">
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <div className="grid gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p id="p-image-label" className="field-label">
              {t("admin.fieldImage")}
            </p>
            <div className="mt-1 flex items-center gap-4">
              <img
                src={thumbnail || PLACEHOLDER_IMAGE}
                alt=""
                width={80}
                height={80}
                className="size-20 shrink-0 rounded-xl border border-line bg-tile object-contain p-1"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => fileRef.current?.click()} aria-describedby="p-image-label" className="button-secondary h-9 px-3">
                    <ImagePlus aria-hidden="true" className="size-4" />
                    {thumbnail ? t("admin.changeImage") : t("admin.insertImage")}
                  </button>
                  {thumbnail && (
                    <button
                      type="button"
                      onClick={() => setValue("thumbnail", "", { shouldDirty: true })}
                      className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm text-danger hover:bg-danger/10"
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                      {t("admin.removeImage")}
                    </button>
                  )}
                </div>
                <p className={`mt-1.5 text-sm ${imageError ? "text-danger" : "text-muted"}`} role={imageError ? "alert" : undefined}>
                  {imageError ?? t("admin.imageHint")}
                </p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  try {
                    setValue("thumbnail", await readImage(file), { shouldDirty: true });
                    setImageError(undefined);
                  } catch {
                    setImageError(t("admin.imageInvalid"));
                  }
                }}
              />
            </div>
          </div>
          <Field id="p-title" label={t("admin.fieldTitle")} error={error("title")} className="sm:col-span-2">
            {(props) => <input {...props} {...register("title")} className="field mt-1 w-full" />}
          </Field>
          <Field id="p-description" label={t("admin.fieldDescription")} error={error("description")} className="sm:col-span-2">
            {(props) => <textarea {...props} {...register("description")} rows={3} className="field mt-1 w-full py-2.5" />}
          </Field>
          <Field id="p-category" label={t("admin.fieldCategory")} error={error("category")}>
            {(props) => (
              <select {...props} {...register("category")} className="field mt-1 w-full">
                {categories.map((slug) => (
                  <option key={slug} value={slug}>
                    {format.category(slug)}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field id="p-brand" label={t("admin.fieldBrand")} error={error("brand")}>
            {(props) => <input {...props} {...register("brand")} className="field mt-1 w-full" />}
          </Field>
          <Field id="p-price" label={t("admin.fieldPrice")} error={error("price")}>
            {(props) => <input {...props} {...register("price", { valueAsNumber: true })} type="number" step="0.01" min="0" dir="ltr" className="field mt-1 w-full" />}
          </Field>
          <Field id="p-discount" label={t("admin.fieldDiscount")} error={error("discountPercentage")}>
            {(props) => (
              <input {...props} {...register("discountPercentage", { valueAsNumber: true })} type="number" step="0.1" min="0" max="90" dir="ltr" className="field mt-1 w-full" />
            )}
          </Field>
          <Field id="p-stock" label={t("admin.fieldStock")} error={error("stock")}>
            {(props) => <input {...props} {...register("stock", { valueAsNumber: true })} type="number" step="1" min="0" dir="ltr" className="field mt-1 w-full" />}
          </Field>
        </div>
        <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
          <button type="button" onClick={onClose} className="button-secondary h-10">
            {t("admin.cancel")}
          </button>
          <button type="submit" disabled={saving} className="button-primary h-10">
            {saving && <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" />}
            {saving ? t("admin.saving") : t("admin.save")}
          </button>
        </div>
      </form>
    </dialog>
  );
}
