'use client';

import { useEffect, useRef, useState, useMemo, type ChangeEvent, type DragEvent } from 'react';
import Image from 'next/image';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X, Plus, GripVertical, RefreshCw, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useCategories } from '@/hooks/useCategories';
import type { Product, ProductCreatePayload } from '@/types/product';

// ─── Constants ─────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ACCEPTED_ACCEPT = ACCEPTED_TYPES.join(',');
const MAX_IMAGES = 10;

// TODO: Product Images upload section (create mode) temporarily disabled —
// images are now managed per color variant instead (see "Color variants"
// below). Flip back to `true` to restore. (Typed as `boolean`, not a literal
// `false`, so TS doesn't treat the guarded JSX as unreachable.)
const SHOW_LEGACY_PRODUCT_IMAGES: boolean = false;

// TODO: Product Options ("Size"/"Material" style generic attributes)
// temporarily disabled — Color is now handled by the dedicated "Color
// variants" section instead. Flip back to `true` to restore.
const SHOW_PRODUCT_OPTIONS: boolean = false;

// ─── Helpers ───────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function validateImageFiles(files: File[]): File[] {
  const valid: File[] = [];
  for (const file of files) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error(`${file.name}: unsupported format. Use JPEG, PNG, WebP, or GIF.`);
      continue;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name}: exceeds the 10 MB limit.`);
      continue;
    }
    valid.push(file);
  }
  return valid;
}

const numericField = z.preprocess((v) => {
  const n = Number(typeof v === 'string' ? v.trim() : v);
  return Number.isNaN(n) ? undefined : n;
}, z.number().min(0, 'Must be 0 or more'));

const optionalNumericField = z.preprocess((v) => {
  const s = typeof v === 'string' ? v.trim() : v;
  if (s === '' || v === undefined) return undefined;
  const n = Number(s);
  return Number.isNaN(n) ? undefined : n;
}, z.number().min(0, 'Must be 0 or more').optional());

// ─── Schema ────────────────────────────────────────────────────────────────

const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters'),
  description: z.string().min(20, 'Product description must be at least 20 characters'),
  categoryId: z.string().min(1, 'Select a category'),
  brand: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  price: numericField,
  comparePrice: optionalNumericField,
  stock: numericField,
  lowStockThreshold: numericField,
  weight: optionalNumericField,
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  tags: z.string().optional(),
  variants: z
    .array(
      z.object({
        name: z.string().min(1, 'Variant name is required'),
        options: z.string().min(1, 'Enter at least one option'),
      })
    )
    .optional(),
  colorVariants: z
    .array(
      z.object({
        _id: z.string().optional(),
        color: z.string().min(1, 'Color name is required'),
        colorCode: z.string().optional(),
        sku: z.string().min(1, 'SKU is required'),
        stock: numericField,
        price: optionalNumericField,
      })
    )
    .min(1, 'Add at least one color variant'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

function toPayload(values: ProductFormValues): ProductCreatePayload {
  return {
    name: values.name,
    slug: values.slug,
    shortDescription: values.shortDescription,
    description: values.description,
    categoryId: values.categoryId,
    brand: values.brand,
    sku: values.sku,
    price: values.price as number,
    comparePrice: values.comparePrice,
    stock: values.stock as number,
    lowStockThreshold: values.lowStockThreshold as number,
    weight: values.weight,
    isFeatured: values.isFeatured,
    isActive: values.isActive,
    tags: values.tags
      ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [],
    variants: (values.variants ?? [])
      .filter((v) => v.name.trim())
      .map((v) => ({
        name: v.name.trim(),
        options: v.options.split(',').map((o) => o.trim()).filter(Boolean),
      })),
    colorVariants: values.colorVariants.map((v) => ({
      ...(v._id ? { _id: v._id } : {}),
      color: v.color.trim(),
      colorCode: v.colorCode?.trim() || undefined,
      sku: v.sku.trim(),
      stock: v.stock as number,
      price: v.price,
    })),
    metaTitle: values.metaTitle,
    metaDescription: values.metaDescription,
  };
}

// ─── Props ─────────────────────────────────────────────────────────────────

interface AdminProductFormProps {
  initialData?: Product;
  // variantImageFiles is ordered to match the submitted colorVariants array —
  // the caller zips it against the created/updated product's colorVariants
  // (same order) to upload each color's staged images.
  onSubmit: (
    payload: ProductCreatePayload,
    imageFiles: File[],
    variantImageFiles: File[][]
  ) => Promise<void>;
  submitLabel: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function AdminProductForm({
  initialData,
  onSubmit,
  submitLabel,
  isSubmitting = false,
  errorMessage,
}: AdminProductFormProps) {
  const { data: categories = [] } = useCategories();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [variantImageFiles, setVariantImageFiles] = useState<Record<string, File[]>>({});
  const [slugEdited, setSlugEdited] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragItemIndex, setDragItemIndex] = useState<number | null>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

  const isEditMode = !!initialData;

  const previews = useMemo(
    () => imageFiles.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [imageFiles]
  );

  useEffect(() => {
    return () => previews.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [previews]);

  const variantPreviews = useMemo(() => {
    const map: Record<string, { file: File; url: string }[]> = {};
    for (const [fieldId, files] of Object.entries(variantImageFiles)) {
      map[fieldId] = files.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    }
    return map;
  }, [variantImageFiles]);

  useEffect(() => {
    return () => {
      Object.values(variantPreviews).flat().forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, [variantPreviews]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: initialData?.name ?? '',
      slug: initialData?.slug ?? '',
      shortDescription: initialData?.shortDescription ?? '',
      description: initialData?.description ?? '',
      categoryId: initialData?.category._id ?? '',
      brand: initialData?.brand ?? '',
      sku: initialData?.sku ?? '',
      price: initialData?.price ?? 0,
      comparePrice: initialData?.comparePrice ?? undefined,
      stock: initialData?.stock ?? 0,
      lowStockThreshold: initialData?.lowStockThreshold ?? 0,
      weight: initialData?.weight ?? undefined,
      isFeatured: initialData?.isFeatured ?? false,
      isActive: initialData?.isActive ?? true,
      tags: initialData?.tags.join(', ') ?? '',
      variants:
        initialData?.variants.length
          ? initialData.variants.map((v) => ({ name: v.name, options: v.options.join(', ') }))
          // Product options UI is currently hidden (SHOW_PRODUCT_OPTIONS) —
          // default to an empty array, not a blank row, since a blank row
          // would fail validation with no way to fill it in.
          : [],
      colorVariants:
        initialData?.colorVariants?.length
          ? initialData.colorVariants.map((v) => ({
            _id: v._id,
            color: v.color,
            colorCode: v.colorCode ?? '',
            sku: v.sku,
            stock: v.stock,
            price: v.price,
          }))
          : [{ color: '', colorCode: '', sku: '', stock: 0, price: undefined }],
      metaTitle: initialData?.metaTitle ?? '',
      metaDescription: initialData?.metaDescription ?? '',
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'variants' });
  const {
    fields: colorVariantFields,
    append: appendColorVariant,
    remove: removeColorVariant,
  } = useFieldArray({ control, name: 'colorVariants' });

  useEffect(() => {
    if (!initialData) return;
    reset({
      name: initialData.name,
      slug: initialData.slug,
      shortDescription: initialData.shortDescription,
      description: initialData.description,
      categoryId: initialData.category._id,
      brand: initialData.brand ?? '',
      sku: initialData.sku,
      price: initialData.price,
      comparePrice: initialData.comparePrice ?? undefined,
      stock: initialData.stock,
      lowStockThreshold: initialData.lowStockThreshold,
      weight: initialData.weight ?? undefined,
      isFeatured: initialData.isFeatured,
      isActive: initialData.isActive,
      tags: initialData.tags.join(', '),
      variants:
        initialData.variants.length > 0
          ? initialData.variants.map((v) => ({ name: v.name, options: v.options.join(', ') }))
          : [],
      colorVariants:
        (initialData.colorVariants?.length ?? 0) > 0
          ? initialData.colorVariants.map((v) => ({
            _id: v._id,
            color: v.color,
            colorCode: v.colorCode ?? '',
            sku: v.sku,
            stock: v.stock,
            price: v.price,
          }))
          : [{ color: '', colorCode: '', sku: '', stock: 0, price: undefined }],
      metaTitle: initialData.metaTitle ?? '',
      metaDescription: initialData.metaDescription ?? '',
    });
    setSlugEdited(true);
  }, [initialData, reset]);

  // Auto-generate slug from name when creating
  const watchedName = watch('name');
  useEffect(() => {
    if (isEditMode || slugEdited) return;
    setValue('slug', slugify(watchedName), { shouldValidate: false });
  }, [watchedName, isEditMode, slugEdited, setValue]);

  // ── Image management ────────────────────────────────────────────────────

  const addImages = (files: File[]) => {
    const validated = validateImageFiles(files);
    if (validated.length === 0) return;
    setImageFiles((prev) => {
      const combined = [...prev, ...validated];
      if (combined.length > MAX_IMAGES) {
        toast.error(`Maximum ${MAX_IMAGES} images allowed. Extra files ignored.`);
        return combined.slice(0, MAX_IMAGES);
      }
      return combined;
    });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    addImages(Array.from(e.target.files));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReplaceChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || replaceIndex === null) return;
    const [newFile] = validateImageFiles(Array.from(e.target.files));
    if (!newFile) return;
    setImageFiles((prev) => {
      const next = [...prev];
      next[replaceIndex] = newFile;
      return next;
    });
    setReplaceIndex(null);
    if (replaceInputRef.current) replaceInputRef.current.value = '';
  };

  const triggerReplace = (index: number) => {
    setReplaceIndex(index);
    replaceInputRef.current?.click();
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Drop zone (file drop from OS) ───────────────────────────────────────

  const handleZoneDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) {
      e.dataTransfer.dropEffect = 'copy';
      setIsDragOver(true);
    }
  };

  const handleZoneDragLeave = (e: DragEvent<HTMLDivElement>) => {
    // Only clear when leaving the zone itself, not a child element
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleZoneDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    addImages(Array.from(e.dataTransfer.files));
  };

  // ── Card drag-to-reorder ────────────────────────────────────────────────

  const handleCardDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    setDragItemIndex(index);
  };

  const handleCardDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation(); // prevent zone drop handler
    if (dragItemIndex === null || dragItemIndex === index) return;
    setImageFiles((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragItemIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragItemIndex(index);
  };

  const handleCardDragEnd = () => setDragItemIndex(null);

  // ── Color variant image management (create mode only — edit mode manages
  // each variant's live gallery via AdminProductVariantImageManager) ───────

  const addVariantImages = (fieldId: string, files: File[]) => {
    const validated = validateImageFiles(files);
    if (validated.length === 0) return;
    setVariantImageFiles((prev) => {
      const combined = [...(prev[fieldId] ?? []), ...validated];
      if (combined.length > MAX_IMAGES) {
        toast.error(`Maximum ${MAX_IMAGES} images allowed per color. Extra files ignored.`);
        return { ...prev, [fieldId]: combined.slice(0, MAX_IMAGES) };
      }
      return { ...prev, [fieldId]: combined };
    });
  };

  const removeVariantImageFile = (fieldId: string, index: number) => {
    setVariantImageFiles((prev) => ({
      ...prev,
      [fieldId]: (prev[fieldId] ?? []).filter((_, i) => i !== index),
    }));
  };

  const handleRemoveColorVariant = (index: number) => {
    const fieldId = colorVariantFields[index]?.id;
    removeColorVariant(index);
    if (fieldId) {
      setVariantImageFiles((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const handleFormSubmit = async (values: ProductFormValues) => {
    const orderedVariantFiles = colorVariantFields.map((f) => variantImageFiles[f.id] ?? []);
    await onSubmit(toPayload(values), imageFiles, orderedVariantFiles);
  };

  const inputClass =
    'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white';

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8" noValidate>
      {errorMessage && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-600/40 dark:bg-rose-950/20 dark:text-rose-200">
          {errorMessage}
        </div>
      )}

      {SHOW_LEGACY_PRODUCT_IMAGES && !isEditMode && (
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Product images
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                First image becomes the thumbnail. Drag cards to reorder. Up to {MAX_IMAGES} images.
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors">
              <Upload className="h-4 w-4" />
              Add images
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_ACCEPT}
                multiple
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>

          {/* Hidden replace input */}
          <input
            ref={replaceInputRef}
            type="file"
            accept={ACCEPTED_ACCEPT}
            className="hidden"
            onChange={handleReplaceChange}
          />

          {/* Drop zone wrapper */}
          <div
            onDragOver={handleZoneDragOver}
            onDragLeave={handleZoneDragLeave}
            onDrop={handleZoneDrop}
            className={`relative rounded-2xl border-2 border-dashed transition-colors ${isDragOver
                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                : 'border-slate-300 dark:border-slate-600'
              }`}
          >
            {previews.length === 0 ? (
              <div className="flex h-28 flex-col items-center justify-center gap-2">
                <ImageIcon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  {isDragOver
                    ? 'Drop images here'
                    : 'Drag & drop images here, or click "Add images" above'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {previews.map(({ file, url }, i) => (
                  <div
                    key={`${file.name}-${i}`}
                    draggable
                    onDragStart={(e) => handleCardDragStart(e, i)}
                    onDragOver={(e) => handleCardDragOver(e, i)}
                    onDragEnd={handleCardDragEnd}
                    className={`group relative overflow-hidden rounded-2xl border bg-white transition-opacity dark:bg-slate-900 ${dragItemIndex === i
                        ? 'border-primary opacity-50'
                        : 'border-slate-200 dark:border-slate-700'
                      }`}
                  >
                    {/* Thumbnail / Gallery badge */}
                    <span
                      className={`absolute left-2 top-2 z-10 rounded-full px-2 py-0.5 text-xs font-semibold shadow ${i === 0
                          ? 'bg-primary text-white'
                          : 'bg-black/40 text-white'
                        }`}
                    >
                      {i === 0 ? 'Thumbnail' : 'Gallery'}
                    </span>

                    {/* Drag handle */}
                    <div className="absolute right-2 top-2 z-10 cursor-grab rounded-full bg-black/30 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <GripVertical className="h-3.5 w-3.5" />
                    </div>

                    <Image
                      src={url}
                      alt={file.name}
                      width={300}
                      height={200}
                      className="h-36 w-full object-cover"
                    />

                    <div className="flex items-center justify-between gap-1 border-t border-slate-200 px-2 py-2 dark:border-slate-700">
                      <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {file.name}
                      </span>
                      <div className="flex flex-shrink-0 items-center gap-0.5">
                        <button
                          type="button"
                          title="Replace image"
                          onClick={() => triggerReplace(i)}
                          className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 transition-colors dark:hover:bg-slate-800"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Remove image"
                          onClick={() => removeImage(i)}
                          className="rounded-full p-1.5 text-rose-600 hover:bg-rose-50 transition-colors dark:hover:bg-rose-950/30"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Drag-over overlay */}
            {isDragOver && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl">
                <span className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg">
                  Drop to add
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500">
            JPEG, PNG, WebP, GIF · Max 10 MB per file · Up to {MAX_IMAGES} images
          </p>
        </div>
      )}

      {/* ── Core fields ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Product name *
            </label>
            <input {...register('name')} className={inputClass} placeholder="Gold Plated Jhumka" />
            {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Slug *
              {!isEditMode && (
                <span className="ml-2 text-xs font-normal text-slate-400">
                  auto-generated from name
                </span>
              )}
            </label>
            <input
              {...register('slug')}
              className={inputClass}
              placeholder="gold-plated-jhumka"
              onChange={(e) => {
                setSlugEdited(true);
                register('slug').onChange(e);
              }}
            />
            {errors.slug && <p className="mt-1 text-xs text-rose-500">{errors.slug.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Short description *
            </label>
            <input
              {...register('shortDescription')}
              className={inputClass}
              placeholder="Traditional jhumka earrings"
            />
            {errors.shortDescription && (
              <p className="mt-1 text-xs text-rose-500">{errors.shortDescription.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Category *
            </label>
            <select {...register('categoryId')} className={inputClass}>
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-xs text-rose-500">{errors.categoryId.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Brand
            </label>
            <input {...register('brand')} className={inputClass} placeholder="YourBrand" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              SKU *
            </label>
            <input {...register('sku')} className={inputClass} placeholder="JWL-JHM-001" />
            {errors.sku && <p className="mt-1 text-xs text-rose-500">{errors.sku.message}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Price (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('price')}
              className={inputClass}
              placeholder="899"
            />
            {errors.price && <p className="mt-1 text-xs text-rose-500">{errors.price.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Compare price (₹)
              <span className="ml-2 text-xs font-normal text-slate-400">
                shown as original / strike-through
              </span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('comparePrice')}
              className={inputClass}
              placeholder="1299"
            />
            {errors.comparePrice && (
              <p className="mt-1 text-xs text-rose-500">{errors.comparePrice.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Stock *
              </label>
              <input
                type="number"
                min="0"
                {...register('stock')}
                className={inputClass}
                placeholder="50"
              />
              {errors.stock && (
                <p className="mt-1 text-xs text-rose-500">{errors.stock.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Low stock alert
              </label>
              <input
                type="number"
                min="0"
                {...register('lowStockThreshold')}
                className={inputClass}
                placeholder="10"
              />
              {errors.lowStockThreshold && (
                <p className="mt-1 text-xs text-rose-500">{errors.lowStockThreshold.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Weight (g)
              <span className="ml-2 text-xs font-normal text-slate-400">for shipping</span>
            </label>
            <input
              type="number"
              min="0"
              {...register('weight')}
              className={inputClass}
              placeholder="25"
            />
            {errors.weight && (
              <p className="mt-1 text-xs text-rose-500">{errors.weight.message}</p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="inline-flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900">
              <input
                type="checkbox"
                {...register('isFeatured')}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">Featured</p>
                <p className="text-xs text-slate-500">Show on homepage</p>
              </div>
            </label>
            <label className="inline-flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900">
              <input
                type="checkbox"
                {...register('isActive')}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-200">Active</p>
                <p className="text-xs text-slate-500">Visible on storefront</p>
              </div>
            </label>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Tags
              <span className="ml-2 text-xs font-normal text-slate-400">comma-separated</span>
            </label>
            <input
              {...register('tags')}
              className={inputClass}
              placeholder="earrings, traditional, gold"
            />
          </div>
        </div>
      </div>

      {/* ── Product description ── */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Product description *
        </label>
        <textarea
          {...register('description')}
          rows={6}
          className={`${inputClass} resize-none`}
          placeholder="Handcrafted gold plated jhumka earrings made for festive occasions..."
        />
        {errors.description && (
          <p className="mt-1 text-xs text-rose-500">{errors.description.message}</p>
        )}
      </div>

      {/* ── Color Variants ── */}
      <div className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Color variants *
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Each color has its own images, stock, SKU, and an optional price override
              (otherwise it inherits the base price above). At least one color is required.
            </p>
          </div>
          <button
            type="button"
            onClick={() => appendColorVariant({ color: '', colorCode: '', sku: '', stock: 0, price: undefined })}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add color variant
          </button>
        </div>

        {typeof errors.colorVariants?.message === 'string' && (
          <p className="text-xs text-rose-500">{errors.colorVariants.message}</p>
        )}

        <div className="space-y-4">
          {colorVariantFields.map((field, index) => {
            const files = variantPreviews[field.id] ?? [];
            const colorCodeValue = watch(`colorVariants.${index}.colorCode`);
            return (
              <div
                key={field.id}
                className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
              >
                <input type="hidden" {...register(`colorVariants.${index}._id` as const)} />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Color name *
                    </label>
                    <input
                      {...register(`colorVariants.${index}.color` as const)}
                      className={inputClass}
                      placeholder="Black"
                    />
                    {errors.colorVariants?.[index]?.color && (
                      <p className="mt-1 text-xs text-rose-500">
                        {errors.colorVariants[index]?.color?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Color code (hex)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={
                          /^#([0-9A-Fa-f]{6})$/.test(colorCodeValue ?? '')
                            ? (colorCodeValue as string)
                            : '#000000'
                        }
                        onChange={(e) =>
                          setValue(`colorVariants.${index}.colorCode`, e.target.value, {
                            shouldDirty: true,
                          })
                        }
                        aria-label="Pick color"
                        className="h-9 w-9 flex-shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-transparent p-0.5 dark:border-slate-700"
                      />
                      <input
                        {...register(`colorVariants.${index}.colorCode` as const)}
                        className={inputClass}
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      SKU *
                    </label>
                    <input
                      {...register(`colorVariants.${index}.sku` as const)}
                      className={inputClass}
                      placeholder="TS-BLK"
                    />
                    {errors.colorVariants?.[index]?.sku && (
                      <p className="mt-1 text-xs text-rose-500">
                        {errors.colorVariants[index]?.sku?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Stock *
                    </label>
                    <input
                      type="number"
                      min="0"
                      {...register(`colorVariants.${index}.stock` as const)}
                      className={inputClass}
                      placeholder="20"
                    />
                    {errors.colorVariants?.[index]?.stock && (
                      <p className="mt-1 text-xs text-rose-500">
                        {errors.colorVariants[index]?.stock?.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Price override
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register(`colorVariants.${index}.price` as const)}
                      className={inputClass}
                      placeholder="Inherits base price"
                    />
                  </div>
                </div>

                {!isEditMode && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Images for this color
                      </label>
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                        <Upload className="h-3.5 w-3.5" />
                        Add images
                        <input
                          type="file"
                          accept={ACCEPTED_ACCEPT}
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files) addVariantImages(field.id, Array.from(e.target.files));
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>

                    {files.length === 0 ? (
                      <div className="flex h-16 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-xs text-slate-400 dark:border-slate-600 dark:text-slate-500">
                        No images yet for this color
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {files.map(({ file, url }, i) => (
                          <div
                            key={`${file.name}-${i}`}
                            className="group relative h-16 w-16 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"
                          >
                            <Image src={url} alt={file.name} fill className="object-cover" />
                            <button
                              type="button"
                              title="Remove image"
                              onClick={() => removeVariantImageFile(field.id, i)}
                              className="absolute right-0.5 top-0.5 rounded-full bg-black/50 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveColorVariant(index)}
                    className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 transition-colors dark:border-rose-600/40 dark:bg-rose-950/20 dark:text-rose-200 dark:hover:bg-rose-900"
                  >
                    Remove color
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Variants ── */}
      {SHOW_PRODUCT_OPTIONS && (
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Product options
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Define options like Color, Size, or Material. Separate values with commas.
              </p>
            </div>
            <button
              type="button"
              onClick={() => append({ name: '', options: '' })}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add option
            </button>
          </div>

          {fields.length === 0 && (
            <p className="rounded-2xl border-2 border-dashed border-slate-300 py-6 text-center text-sm text-slate-400 dark:border-slate-600 dark:text-slate-500">
              No options yet — click "Add option" to define Color, Size, etc.
            </p>
          )}

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 lg:grid-cols-[auto_1fr_1fr_auto]"
              >
                <div className="hidden items-center justify-center lg:flex">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Option name
                  </label>
                  <input
                    {...register(`variants.${index}.name` as const)}
                    className={inputClass}
                    placeholder="Color"
                  />
                  {errors.variants?.[index]?.name && (
                    <p className="mt-1 text-xs text-rose-500">
                      {errors.variants[index]?.name?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Values
                    <span className="ml-1 font-normal text-slate-400">(comma-separated)</span>
                  </label>
                  <input
                    {...register(`variants.${index}.options` as const)}
                    className={inputClass}
                    placeholder="Gold, Rose Gold, Silver"
                  />
                  {errors.variants?.[index]?.options && (
                    <p className="mt-1 text-xs text-rose-500">
                      {errors.variants[index]?.options?.message}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="self-end rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 hover:bg-rose-100 transition-colors dark:border-rose-600/40 dark:bg-rose-950/20 dark:text-rose-200 dark:hover:bg-rose-900"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SEO ── */}
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">SEO metadata</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Optimize the product listing for search engines.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Meta title
            </label>
            <input
              {...register('metaTitle')}
              className={inputClass}
              placeholder="Gold Plated Jhumka Earrings | Zyncmart"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Meta description
            </label>
            <textarea
              {...register('metaDescription')}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Buy handcrafted gold plated jhumka earrings with free shipping."
            />
          </div>
        </div>
      </div>

      {/* ── Submit ── */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-2xl bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
