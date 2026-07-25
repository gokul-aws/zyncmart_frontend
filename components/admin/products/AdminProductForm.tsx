'use client';

import { useEffect, useRef, useState, useMemo, type ChangeEvent, type DragEvent } from 'react';
import Image from 'next/image';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  X,
  Plus,
  GripVertical,
  ImageIcon,
  Package,
  Layers,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCategories } from '@/hooks/useCategories';
import type { Product, ProductCreatePayload, BackendProductVariant, ProductImage } from '@/types/product';

// ─── Constants ─────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ACCEPTED_ACCEPT = ACCEPTED_TYPES.join(',');
const MAX_IMAGES = 10;

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

const variableVariantSchema = z.object({
  _id: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  color: z.string().min(1, 'Colour name is required'),
  colorCode: z.string().optional(),
  size: z.string().min(1, 'Size is required'),
  price: numericField,
  originalPrice: optionalNumericField,
  stock: numericField,
});

const productSchema = z.object({
  productType: z.enum(['simple', 'variable']).optional(),
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters'),
  description: z.string().min(20, 'Product description must be at least 20 characters'),
  categoryId: z.string().min(1, 'Select a category'),
  brand: z.string().optional(),
  // Simple-only fields
  sku: z.string().optional(),
  price: optionalNumericField,
  originalPrice: optionalNumericField,
  stock: optionalNumericField,
  lowStockThreshold: numericField,
  weight: optionalNumericField,
  // Color variants (edit mode / legacy)
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
    .optional(),
  // Variable product variants (new create flow)
  variableVariants: z.array(variableVariantSchema).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  tags: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

function toPayload(values: ProductFormValues): ProductCreatePayload {
  const base = {
    name: values.name,
    slug: values.slug,
    shortDescription: values.shortDescription,
    description: values.description,
    categoryId: values.categoryId,
    brand: values.brand,
    isFeatured: values.isFeatured,
    isActive: values.isActive,
    tags: values.tags
      ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [],
    metaTitle: values.metaTitle,
    metaDescription: values.metaDescription,
  };

  const effectiveType = values.productType ?? 'simple';

  if (effectiveType === 'variable') {
    return {
      ...base,
      productType: 'variable',
      variableVariants: (values.variableVariants ?? []).map((v) => ({
        _id: v._id,
        sku: v.sku.trim(),
        color: { name: v.color.trim(), code: v.colorCode?.trim() || '' },
        size: v.size.trim(),
        price: v.price as number,
        originalPrice: v.originalPrice,
        stock: v.stock as number,
      })),
    };
  }

  return {
    ...base,
    productType: 'simple',
    sku: values.sku?.trim() ?? '',
    price: values.price as number,
    originalPrice: values.originalPrice,
    stock: values.stock as number,
    lowStockThreshold: values.lowStockThreshold as number,
    weight: values.weight,
  };
}

// ─── Props ─────────────────────────────────────────────────────────────────

interface AdminProductFormProps {
  initialData?: Product;
  onSubmit: (
    payload: ProductCreatePayload,
    imageFiles: File[],
    variantImageFiles: File[][]
  ) => Promise<void>;
  onRemoveImage?: (publicId: string) => Promise<void>;
  onSetPrimaryImage?: (publicId: string) => Promise<void>;
  onReorderImages?: (images: { publicId: string; isPrimary: boolean }[]) => Promise<void>;
  onRemoveVariantImage?: (variantId: string, publicId: string) => Promise<void>;
  submitLabel: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function AdminProductForm({
  initialData,
  onSubmit,
  onRemoveImage,
  onSetPrimaryImage,
  onReorderImages,
  onRemoveVariantImage,
  submitLabel,
  isSubmitting = false,
  errorMessage,
}: AdminProductFormProps) {
  const { data: categories = [] } = useCategories();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [slugEdited, setSlugEdited] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragItemIndex, setDragItemIndex] = useState<number | null>(null);

  // ── Product type state ──
  const [productType, setProductType] = useState<'simple' | 'variable'>(
    initialData?.productType ?? 'simple'
  );

  // ── Variable variant image files (fieldId → File[]) ──
  const [variableVariantImages, setVariableVariantImages] = useState<Record<string, File[]>>({});
  const isEditMode = !!initialData;

  // ── Edit mode: existing product images ──
  const [existingImages, setExistingImages] = useState<ProductImage[]>(
    initialData?.images ?? []
  );
  const [removedImagePublicIds, setRemovedImagePublicIds] = useState<string[]>([]);

  // ── Edit mode: existing variant images (fieldId → { url, publicId? }) ──
  const [existingVariantImages, setExistingVariantImages] = useState<Record<string, { url: string; publicId?: string }>>({});

  // ── Image previews (product-level) ──
  const previews = useMemo(
    () => imageFiles.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [imageFiles]
  );

  useEffect(() => {
    return () => previews.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [previews]);

  // ── Variable variant image previews ──
  const variablePreviews = useMemo(() => {
    const map: Record<string, { file: File; url: string }[]> = {};
    for (const [fieldId, files] of Object.entries(variableVariantImages)) {
      map[fieldId] = files.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    }
    return map;
  }, [variableVariantImages]);

  useEffect(() => {
    return () => {
      Object.values(variablePreviews).flat().forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, [variablePreviews]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      productType: initialData?.productType ?? undefined,
      name: initialData?.name ?? '',
      slug: initialData?.slug ?? '',
      shortDescription: initialData?.shortDescription ?? '',
      description: initialData?.description ?? '',
      categoryId: initialData?.category._id ?? '',
      brand: initialData?.brand ?? '',
      sku: initialData?.sku ?? '',
      price: initialData?.price ?? 0,
      originalPrice: initialData?.originalPrice ?? undefined,
      stock: initialData?.stock ?? 0,
      lowStockThreshold: initialData?.lowStockThreshold ?? 0,
      weight: initialData?.weight ?? undefined,
      isFeatured: initialData?.isFeatured ?? false,
      isActive: initialData?.isActive ?? true,
      tags: initialData?.tags.join(', ') ?? '',
      // Load variable variants from backend `variants` field
      variableVariants: (() => {
        if (!initialData) return [];
        const bv = initialData.variants;
        if (bv?.length) {
          return bv.map((v) => ({
            _id: v._id,
            sku: v.sku,
            color: v.color?.name ?? '',
            colorCode: v.color?.code ?? '',
            size: v.size ?? '',
            price: v.price,
            originalPrice: v.originalPrice,
            stock: v.stock,
          }));
        }
        return [];
      })(),
      metaTitle: initialData?.metaTitle ?? '',
      metaDescription: initialData?.metaDescription ?? '',
    },
  });

  const {
    fields: variableVariantFields,
    append: appendVariableVariant,
    remove: removeVariableVariant,
  } = useFieldArray({ control, name: 'variableVariants' });

  useEffect(() => {
    if (!initialData) return;
    setProductType(initialData.productType ?? 'simple');
    setExistingImages(initialData.images ?? []);
    setRemovedImagePublicIds([]);
    reset({
      productType: initialData.productType ?? undefined,
      name: initialData.name,
      slug: initialData.slug,
      shortDescription: initialData.shortDescription,
      description: initialData.description,
      categoryId: initialData.category._id,
      brand: initialData.brand ?? '',
      sku: initialData.sku,
      price: initialData.price,
      originalPrice: initialData.originalPrice ?? undefined,
      stock: initialData.stock,
      lowStockThreshold: initialData.lowStockThreshold,
      weight: initialData.weight ?? undefined,
      isFeatured: initialData.isFeatured,
      isActive: initialData.isActive,
      tags: initialData.tags.join(', '),
      // Load variable variants from backend `variants` field
      variableVariants: (() => {
        const bv = initialData.variants;
        if (bv?.length) {
          return bv.map((v) => ({
            _id: v._id,
            sku: v.sku,
            color: v.color?.name ?? '',
            colorCode: v.color?.code ?? '',
            size: v.size ?? '',
            price: v.price,
            originalPrice: v.originalPrice,
            stock: v.stock,
          }));
        }
        return [];
      })(),
      metaTitle: initialData.metaTitle ?? '',
      metaDescription: initialData.metaDescription ?? '',
    });
    setSlugEdited(true);
  }, [initialData, reset]);

  // ── Initialize existing variant images after variableVariantFields are populated ──
  useEffect(() => {
    if (!initialData?.variants?.length || !variableVariantFields.length) return;
    const map: Record<string, { url: string; publicId?: string }> = {};
    initialData.variants.forEach((bv, idx) => {
      if (bv.image && variableVariantFields[idx]) {
        map[variableVariantFields[idx].id] = { url: bv.image };
      }
    });
    setExistingVariantImages(map);
  }, [initialData, variableVariantFields]);

  // ── Auto-generate slug from name when creating ──
  const watchedName = watch('name');
  useEffect(() => {
    if (isEditMode || slugEdited) return;
    setValue('slug', slugify(watchedName), { shouldValidate: false });
  }, [watchedName, isEditMode, slugEdited, setValue]);

  // ── Image management (product-level, simple create) ──
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

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Drop zone ──
  const handleZoneDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) {
      e.dataTransfer.dropEffect = 'copy';
      setIsDragOver(true);
    }
  };

  const handleZoneDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleZoneDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    addImages(Array.from(e.dataTransfer.files));
  };

  // ── Card drag-to-reorder ──
  const handleCardDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    setDragItemIndex(index);
  };

  const handleCardDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
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

  // ── Edit mode: drag-to-reorder for existing images ──
  const [existingDragIndex, setExistingDragIndex] = useState<number | null>(null);
  const handleExistingDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    setExistingDragIndex(index);
  };
  const handleExistingDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (existingDragIndex === null || existingDragIndex === index) return;
    reorderExistingImages(existingDragIndex, index);
    setExistingDragIndex(index);
  };
  const handleExistingDragEnd = () => setExistingDragIndex(null);

  // ── Variable variant image management (create + edit) ──
  const addVariableVariantImage = (fieldId: string, files: File[]) => {
    const validated = validateImageFiles(files);
    if (validated.length === 0) return;
    setVariableVariantImages((prev) => ({
      ...prev,
      [fieldId]: validated.slice(0, 1), // single image per variant
    }));
  };

  const removeVariableVariantImage = (fieldId: string) => {
    setVariableVariantImages((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  };

  const handleRemoveVariableVariant = (index: number) => {
    const fieldId = variableVariantFields[index]?.id;
    removeVariableVariant(index);
    if (fieldId) {
      setVariableVariantImages((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
      setExistingVariantImages((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  // ── Edit mode: existing product image management ──
  const removeExistingImage = (publicId: string) => {
    setExistingImages((prev) => prev.filter((img) => img.publicId !== publicId));
    setRemovedImagePublicIds((prev) => [...prev, publicId]);
  };

  const setExistingPrimary = (publicId: string) => {
    setExistingImages((prev) =>
      prev.map((img) => ({ ...img, isPrimary: img.publicId === publicId }))
    );
  };

  const reorderExistingImages = (fromIndex: number, toIndex: number) => {
    setExistingImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  // ── Edit mode: existing variant image management ──
  const removeExistingVariantImage = (fieldId: string) => {
    setExistingVariantImages((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  };

  // ── Submit ──
  const handleFormSubmit = async (values: ProductFormValues) => {
    const effectiveType = isEditMode ? (values.productType ?? productType ?? 'simple') : values.productType;

    // Conditional validation
    if (effectiveType === 'simple') {
      if (!values.sku?.trim()) {
        toast.error('SKU is required for simple products.');
        return;
      }
      if (values.price === undefined || values.price === null) {
        toast.error('Selling price is required for simple products.');
        return;
      }
      if (values.stock === undefined || values.stock === null) {
        toast.error('Stock is required for simple products.');
        return;
      }
    } else if (effectiveType === 'variable') {
      if (!values.variableVariants?.length) {
        toast.error('Add at least one variant for variable products.');
        return;
      }
    }

    // Build variant image files — prefer newly uploaded file, otherwise pass empty
    if (effectiveType === 'variable') {
      const orderedVariantFiles = variableVariantFields.map(
        (f) => variableVariantImages[f.id] ?? []
      );
      await onSubmit(toPayload(values), [], orderedVariantFiles);
    } else {
      await onSubmit(toPayload(values), imageFiles, []);
    }

    // ── Edit mode: apply image operations after main submit ──
    if (isEditMode && initialData) {
      // 1. Remove deleted product images
      if (onRemoveImage) {
        for (const pid of removedImagePublicIds) {
          await onRemoveImage(pid);
        }
      }
      // 2. Reorder + set primary for product images
      if (onReorderImages && existingImages.length > 0) {
        await onReorderImages(
          existingImages.map((img) => ({
            publicId: img.publicId,
            isPrimary: img.isPrimary,
          }))
        );
      }
      // 3. Remove deleted variant images
      if (onRemoveVariantImage) {
        const bv = initialData.variants ?? [];
        for (const [fieldId, _entry] of Object.entries(existingVariantImages)) {
          // If a field was mapped to a backend variant image and is now cleared,
          // the entry will be missing from existingVariantImages.
          // We detect removals by comparing with the original.
        }
        // Track variant image removals: fields that had images but now don't
        for (let idx = 0; idx < variableVariantFields.length; idx++) {
          const fieldId = variableVariantFields[idx].id;
          const bv = initialData.variants?.[idx];
          const hasExisting = existingVariantImages[fieldId] !== undefined;
          const hasNew = !!variableVariantImages[fieldId]?.length;
          if (bv?.image && bv._id && !hasExisting && !hasNew) {
            // User removed the existing variant image
            const publicId = bv.image.split('/').pop()?.split('.')[0] ?? '';
            await onRemoveVariantImage(bv._id, publicId);
          }
        }
      }
    }
  };

  const inputClass =
    'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white';

  const sectionCard = 'space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900';

  // ─────────────────────────────────────────────────────────────────────────
  //  EDIT MODE — supports both simple and variable products
  // ─────────────────────────────────────────────────────────────────────────

  if (isEditMode) {
    return (
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8" noValidate>
        {errorMessage && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-600/40 dark:bg-rose-950/20 dark:text-rose-200">
            {errorMessage}
          </div>
        )}

        {/* ── Product Type Selector (edit mode, read-only) ── */}
        <div className={sectionCard}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Product Type
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Product type cannot be changed after creation
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div
              className={`flex items-start gap-4 rounded-2xl border-2 p-5 ${
                productType === 'simple'
                  ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                  : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 opacity-50'
              }`}
            >
              <div
                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                  productType === 'simple'
                    ? 'border-primary'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {productType === 'simple' && (
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Simple Product</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Single SKU with one price and stock level
                </p>
              </div>
            </div>

            <div
              className={`flex items-start gap-4 rounded-2xl border-2 p-5 ${
                productType === 'variable'
                  ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                  : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 opacity-50'
              }`}
            >
              <div
                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                  productType === 'variable'
                    ? 'border-primary'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {productType === 'variable' && (
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Variable Product</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Multiple variants with different sizes, colours, and pricing
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Basic info ── */}
        <div className={sectionCard}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Basic info</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Product name, category, and summary
              </p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-5">
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
            </div>

            <div className="space-y-5">
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
            </div>
          </div>
        </div>

        {/* ── Product Images (edit mode, simple only) ── */}
        {productType === 'simple' && (
        <div className={sectionCard}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Product images
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                First image is the thumbnail. Drag to reorder. Up to {MAX_IMAGES} images.
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

          {/* Merged grid: existing server images + newly added files */}
          {(existingImages.length > 0 || previews.length > 0) ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* Existing server images */}
              {existingImages.map((img, i) => (
                <div
                  key={`existing-${img.publicId}`}
                  draggable
                  onDragStart={(e) => handleExistingDragStart(e, i)}
                  onDragOver={(e) => handleExistingDragOver(e, i)}
                  onDragEnd={handleExistingDragEnd}
                  className={`group relative overflow-hidden rounded-2xl border bg-white transition-opacity dark:bg-slate-900 ${
                    existingDragIndex === i
                      ? 'border-primary opacity-50'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span
                    className={`absolute left-2 top-2 z-10 rounded-full px-2 py-0.5 text-xs font-semibold shadow ${
                      img.isPrimary
                        ? 'bg-primary text-white'
                        : 'bg-black/40 text-white'
                    }`}
                  >
                    {img.isPrimary ? 'Thumbnail' : 'Gallery'}
                  </span>

                  <div className="absolute right-2 top-2 z-10 cursor-grab rounded-full bg-black/30 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <GripVertical className="h-3.5 w-3.5" />
                  </div>

                  <Image
                    src={img.url}
                    alt={img.publicId}
                    width={300}
                    height={200}
                    className="h-36 w-full object-cover"
                  />

                  <div className="flex items-center justify-between gap-1 border-t border-slate-200 px-2 py-2 dark:border-slate-700">
                    <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {img.publicId.split('/').pop()}
                    </span>
                    <div className="flex flex-shrink-0 items-center gap-0.5">
                      {!img.isPrimary && (
                        <button
                          type="button"
                          title="Set as thumbnail"
                          onClick={() => setExistingPrimary(img.publicId)}
                          className="rounded-full p-1.5 text-amber-600 hover:bg-amber-50 transition-colors dark:hover:bg-amber-950/30"
                        >
                          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      )}
                      <button
                        type="button"
                        title="Remove image"
                        onClick={() => removeExistingImage(img.publicId)}
                        className="rounded-full p-1.5 text-rose-600 hover:bg-rose-50 transition-colors dark:hover:bg-rose-950/30"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Newly added files */}
              {previews.map(({ file, url }, i) => (
                <div
                  key={`new-${file.name}-${i}`}
                  draggable
                  onDragStart={(e) => handleCardDragStart(e, i)}
                  onDragOver={(e) => handleCardDragOver(e, i)}
                  onDragEnd={handleCardDragEnd}
                  className={`group relative overflow-hidden rounded-2xl border bg-white transition-opacity dark:bg-slate-900 ${
                    dragItemIndex === i
                      ? 'border-primary opacity-50'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="absolute left-2 top-2 z-10 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white shadow">
                    New
                  </span>

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
          ) : (
            <div
              onDragOver={handleZoneDragOver}
              onDragLeave={handleZoneDragLeave}
              onDrop={handleZoneDrop}
              className={`relative rounded-2xl border-2 border-dashed transition-colors ${
                isDragOver
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-slate-300 dark:border-slate-600'
              }`}
            >
              <div className="flex h-28 flex-col items-center justify-center gap-2">
                <ImageIcon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  {isDragOver
                    ? 'Drop images here'
                    : 'Drag & drop images here, or click "Add images" above'}
                </p>
              </div>
              {isDragOver && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl">
                  <span className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg">
                    Drop to add
                  </span>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-slate-400 dark:text-slate-500">
            JPEG, PNG, WebP, GIF · Max 10 MB per file · Up to {MAX_IMAGES} images
          </p>
        </div>
        )}

        {/* ── Simple: Pricing & Stock ── */}
        <AnimatePresence mode="wait">
          {productType === 'simple' && (
            <motion.div
              key="simple-pricing"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className={sectionCard}
            >
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Pricing &amp; stock
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Set the SKU, pricing, and inventory for this product
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      SKU *
                    </label>
                    <input
                      {...register('sku')}
                      className={inputClass}
                      placeholder="JWL-JHM-001"
                    />
                    {errors.sku && (
                      <p className="mt-1 text-xs text-rose-500">{errors.sku.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('price')}
                      className={inputClass}
                      placeholder="899"
                    />
                    {errors.price && (
                      <p className="mt-1 text-xs text-rose-500">{errors.price.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Original Price (₹)
                      <span className="ml-2 text-xs font-normal text-slate-400">
                        shown as strike-through
                      </span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('originalPrice')}
                      className={inputClass}
                      placeholder="1299"
                    />
                  </div>
                </div>

                <div className="space-y-5">
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
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Variable: Variants ── */}
        <AnimatePresence mode="wait">
          {productType === 'variable' && (
            <motion.div
              key="variable-variants"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className={sectionCard}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Variants</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Add variants with unique SKU, colour, size, price, and stock
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    appendVariableVariant({
                      sku: '',
                      color: '',
                      colorCode: '',
                      size: '',
                      price: 0,
                      originalPrice: undefined,
                      stock: 0,
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Variant
                </button>
              </div>

              {typeof errors.variableVariants?.message === 'string' && (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700 dark:border-rose-600/40 dark:bg-rose-950/20 dark:text-rose-200">
                  {errors.variableVariants.message}
                </p>
              )}

              {variableVariantFields.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 py-12 text-center dark:border-slate-600">
                  <Layers className="mb-3 h-8 w-8 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    No variants yet
                  </p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Click &ldquo;Add Variant&rdquo; to create your first variant
                  </p>
                </div>
              )}

              <div className="space-y-5">
                {variableVariantFields.map((field, index) => {
                  const vFiles = variablePreviews[field.id] ?? [];
                  const vColorCode = watch(`variableVariants.${index}.colorCode`);
                  return (
                    <motion.div
                      key={field.id}
                      layout
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariableVariant(index)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors dark:border-rose-600/40 dark:bg-rose-950/20 dark:text-rose-200 dark:hover:bg-rose-900"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Colour Picker */}
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                            Colour Picker
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={
                                /^#([0-9A-Fa-f]{6})$/.test(vColorCode ?? '')
                                  ? (vColorCode as string)
                                  : '#000000'
                              }
                              onChange={(e) =>
                                setValue(`variableVariants.${index}.colorCode`, e.target.value, {
                                  shouldDirty: true,
                                })
                              }
                              aria-label="Pick colour"
                              className="h-10 w-10 flex-shrink-0 cursor-pointer rounded-xl border border-slate-200 bg-transparent p-0.5 dark:border-slate-700"
                            />
                            <input
                              type="text"
                              value={vColorCode ?? ''}
                              onChange={(e) =>
                                setValue(`variableVariants.${index}.colorCode`, e.target.value, {
                                  shouldDirty: true,
                                })
                              }
                              className={inputClass}
                              placeholder="#000000"
                            />
                          </div>
                        </div>

                        {/* Colour Name */}
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                            Colour Name *
                          </label>
                          <input
                            {...register(`variableVariants.${index}.color` as const)}
                            className={inputClass}
                            placeholder="Gold"
                          />
                          {errors.variableVariants?.[index]?.color && (
                            <p className="mt-1 text-xs text-rose-500">
                              {errors.variableVariants[index]?.color?.message}
                            </p>
                          )}
                        </div>

                        {/* Size */}
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                            Size *
                          </label>
                          <input
                            {...register(`variableVariants.${index}.size` as const)}
                            className={inputClass}
                            placeholder="M"
                          />
                          {errors.variableVariants?.[index]?.size && (
                            <p className="mt-1 text-xs text-rose-500">
                              {errors.variableVariants[index]?.size?.message}
                            </p>
                          )}
                        </div>

                        {/* SKU */}
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                            SKU *
                          </label>
                          <input
                            {...register(`variableVariants.${index}.sku` as const)}
                            className={inputClass}
                            placeholder="JWL-GLD-M"
                          />
                          {errors.variableVariants?.[index]?.sku && (
                            <p className="mt-1 text-xs text-rose-500">
                              {errors.variableVariants[index]?.sku?.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        {/* Selling Price */}
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                            Selling Price (₹) *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            {...register(`variableVariants.${index}.price` as const)}
                            className={inputClass}
                            placeholder="899"
                          />
                          {errors.variableVariants?.[index]?.price && (
                            <p className="mt-1 text-xs text-rose-500">
                              {errors.variableVariants[index]?.price?.message}
                            </p>
                          )}
                        </div>

                        {/* Original Price */}
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                            Original Price (₹)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            {...register(`variableVariants.${index}.originalPrice` as const)}
                            className={inputClass}
                            placeholder="1299"
                          />
                        </div>

                        {/* Stock */}
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                            Stock *
                          </label>
                          <input
                            type="number"
                            min="0"
                            {...register(`variableVariants.${index}.stock` as const)}
                            className={inputClass}
                            placeholder="20"
                          />
                          {errors.variableVariants?.[index]?.stock && (
                            <p className="mt-1 text-xs text-rose-500">
                              {errors.variableVariants[index]?.stock?.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Variant Image */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Image
                        </label>
                        <div className="flex items-start gap-4">
                          {vFiles.length > 0 ? (
                            <div className="group relative h-24 w-24 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                              <Image
                                src={vFiles[0].url}
                                alt={vFiles[0].file.name}
                                fill
                                className="object-cover"
                              />
                              <button
                                type="button"
                                title="Remove image"
                                onClick={() => removeVariableVariantImage(field.id)}
                                className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : existingVariantImages[field.id] ? (
                            <div className="group relative h-24 w-24 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                              <Image
                                src={existingVariantImages[field.id].url}
                                alt="Variant image"
                                fill
                                className="object-cover"
                              />
                              <button
                                type="button"
                                title="Remove image"
                                onClick={() => removeExistingVariantImage(field.id)}
                                className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-center transition-colors hover:border-primary hover:bg-primary/5 dark:border-slate-600 dark:hover:border-primary">
                              <Upload className="mb-1 h-5 w-5 text-slate-400" />
                              <span className="text-[10px] leading-tight text-slate-400">
                                Upload
                              </span>
                              <input
                                type="file"
                                accept={ACCEPTED_ACCEPT}
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files)
                                    addVariableVariantImage(field.id, Array.from(e.target.files));
                                  e.target.value = '';
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Status & Tags ── */}
        <div className={sectionCard}>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Status &amp; tags
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Control visibility and discoverability
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

            <div className="sm:col-span-2 lg:col-span-1">
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

        {/* ── SEO ── */}
        <div className={sectionCard}>
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

  // ─────────────────────────────────────────────────────────────────────────
  //  CREATE MODE — two-flow layout with product type selector
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" noValidate>
      {errorMessage && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-600/40 dark:bg-rose-950/20 dark:text-rose-200">
          {errorMessage}
        </div>
      )}

      {/* ═══ Product Type Selector ═══ */}
      <div className={sectionCard}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Product Type
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Choose how this product is structured
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => { setProductType('simple'); setValue('productType', 'simple', { shouldDirty: true }); }}
            className={`flex items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all ${
              productType === 'simple'
                ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
            }`}
          >
            <div
              className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                productType === 'simple'
                  ? 'border-primary'
                  : 'border-slate-300 dark:border-slate-600'
              }`}
            >
              {productType === 'simple' && (
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              )}
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Simple Product</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Single SKU with one price and stock level
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => { setProductType('variable'); setValue('productType', 'variable', { shouldDirty: true }); }}
            className={`flex items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all ${
              productType === 'variable'
                ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
            }`}
          >
            <div
              className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                productType === 'variable'
                  ? 'border-primary'
                  : 'border-slate-300 dark:border-slate-600'
              }`}
            >
              {productType === 'variable' && (
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
              )}
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Variable Product</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Multiple variants with different sizes, colours, and pricing
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ═══ Product Images (simple only) ═══ */}
      <AnimatePresence mode="wait">
        {productType === 'simple' && (
          <motion.div
            key="product-images"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className={sectionCard}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Product images
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  First image becomes the thumbnail. Drag to reorder. Up to {MAX_IMAGES} images.
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

            <div
              onDragOver={handleZoneDragOver}
              onDragLeave={handleZoneDragLeave}
              onDrop={handleZoneDrop}
              className={`relative rounded-2xl border-2 border-dashed transition-colors ${
                isDragOver
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
                      className={`group relative overflow-hidden rounded-2xl border bg-white transition-opacity dark:bg-slate-900 ${
                        dragItemIndex === i
                          ? 'border-primary opacity-50'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span
                        className={`absolute left-2 top-2 z-10 rounded-full px-2 py-0.5 text-xs font-semibold shadow ${
                          i === 0
                            ? 'bg-primary text-white'
                            : 'bg-black/40 text-white'
                        }`}
                      >
                        {i === 0 ? 'Thumbnail' : 'Gallery'}
                      </span>

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
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Basic Info ═══ */}
      <div className={sectionCard}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Basic info</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Product name, category, and summary
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Product name *
              </label>
              <input
                {...register('name')}
                className={inputClass}
                placeholder="Gold Plated Jhumka"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Slug *
                <span className="ml-2 text-xs font-normal text-slate-400">
                  auto-generated from name
                </span>
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
              {errors.slug && (
                <p className="mt-1 text-xs text-rose-500">{errors.slug.message}</p>
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
          </div>

          <div className="space-y-5">
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
                Brand
              </label>
              <input {...register('brand')} className={inputClass} placeholder="YourBrand" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Product description *
              </label>
              <textarea
                {...register('description')}
                rows={5}
                className={`${inputClass} resize-none`}
                placeholder="Handcrafted gold plated jhumka earrings made for festive occasions..."
              />
              {errors.description && (
                <p className="mt-1 text-xs text-rose-500">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Simple: Pricing & Stock ═══ */}
      <AnimatePresence mode="wait">
        {productType === 'simple' && (
          <motion.div
            key="simple-pricing"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className={sectionCard}
          >
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Pricing &amp; stock
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Set the SKU, pricing, and inventory for this product
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    SKU *
                  </label>
                  <input
                    {...register('sku')}
                    className={inputClass}
                    placeholder="JWL-JHM-001"
                  />
                  {errors.sku && (
                    <p className="mt-1 text-xs text-rose-500">{errors.sku.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('price')}
                    className={inputClass}
                    placeholder="899"
                  />
                  {errors.price && (
                    <p className="mt-1 text-xs text-rose-500">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Original Price (₹)
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      shown as strike-through
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('originalPrice')}
                    className={inputClass}
                    placeholder="1299"
                  />
                </div>
              </div>

              <div className="space-y-5">
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
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Variable: Variants ═══ */}
      <AnimatePresence mode="wait">
        {productType === 'variable' && (
          <motion.div
            key="variable-variants"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className={sectionCard}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Variants</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Add variants with unique SKU, colour, size, price, and stock
                </p>
              </div>
              <button
                type="button"
                  onClick={() =>
                    appendVariableVariant({
                      sku: '',
                      color: '',
                      colorCode: '',
                      size: '',
                      price: 0,
                      originalPrice: undefined,
                      stock: 0,
                    })
                  }
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Variant
              </button>
            </div>

            {typeof errors.variableVariants?.message === 'string' && (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700 dark:border-rose-600/40 dark:bg-rose-950/20 dark:text-rose-200">
                {errors.variableVariants.message}
              </p>
            )}

            {variableVariantFields.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 py-12 text-center dark:border-slate-600">
                <Layers className="mb-3 h-8 w-8 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  No variants yet
                </p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  Click &ldquo;Add Variant&rdquo; to create your first variant
                </p>
              </div>
            )}

            <div className="space-y-5">
              {variableVariantFields.map((field, index) => {
                const vFiles = variablePreviews[field.id] ?? [];
                const vColorCode = watch(`variableVariants.${index}.colorCode`);
                return (
                  <motion.div
                    key={field.id}
                    layout
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariableVariant(index)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors dark:border-rose-600/40 dark:bg-rose-950/20 dark:text-rose-200 dark:hover:bg-rose-900"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {/* Colour Picker */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                          Colour Picker
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={
                              /^#([0-9A-Fa-f]{6})$/.test(vColorCode ?? '')
                                ? (vColorCode as string)
                                : '#000000'
                            }
                            onChange={(e) =>
                              setValue(`variableVariants.${index}.colorCode`, e.target.value, {
                                shouldDirty: true,
                              })
                            }
                            aria-label="Pick colour"
                            className="h-10 w-10 flex-shrink-0 cursor-pointer rounded-xl border border-slate-200 bg-transparent p-0.5 dark:border-slate-700"
                          />
                          <input
                            type="text"
                            value={vColorCode ?? ''}
                            onChange={(e) =>
                              setValue(`variableVariants.${index}.colorCode`, e.target.value, {
                                shouldDirty: true,
                              })
                            }
                            className={inputClass}
                            placeholder="#000000"
                          />
                        </div>
                      </div>

                      {/* Colour Name */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                          Colour Name *
                        </label>
                        <input
                          {...register(`variableVariants.${index}.color` as const)}
                          className={inputClass}
                          placeholder="Gold"
                        />
                        {errors.variableVariants?.[index]?.color && (
                          <p className="mt-1 text-xs text-rose-500">
                            {errors.variableVariants[index]?.color?.message}
                          </p>
                        )}
                      </div>

                      {/* Size */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                          Size *
                        </label>
                        <input
                          {...register(`variableVariants.${index}.size` as const)}
                          className={inputClass}
                          placeholder="M"
                        />
                        {errors.variableVariants?.[index]?.size && (
                          <p className="mt-1 text-xs text-rose-500">
                            {errors.variableVariants[index]?.size?.message}
                          </p>
                        )}
                      </div>

                      {/* SKU */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                          SKU *
                        </label>
                        <input
                          {...register(`variableVariants.${index}.sku` as const)}
                          className={inputClass}
                          placeholder="JWL-GLD-M"
                        />
                        {errors.variableVariants?.[index]?.sku && (
                          <p className="mt-1 text-xs text-rose-500">
                            {errors.variableVariants[index]?.sku?.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      {/* Selling Price */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                          Selling Price (₹) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          {...register(`variableVariants.${index}.price` as const)}
                          className={inputClass}
                          placeholder="899"
                        />
                        {errors.variableVariants?.[index]?.price && (
                          <p className="mt-1 text-xs text-rose-500">
                            {errors.variableVariants[index]?.price?.message}
                          </p>
                        )}
                      </div>

                        {/* Original Price */}
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                            Original Price (₹)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            {...register(`variableVariants.${index}.originalPrice` as const)}
                            className={inputClass}
                            placeholder="1299"
                          />
                        </div>

                      {/* Stock */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                          Stock *
                        </label>
                        <input
                          type="number"
                          min="0"
                          {...register(`variableVariants.${index}.stock` as const)}
                          className={inputClass}
                          placeholder="20"
                        />
                        {errors.variableVariants?.[index]?.stock && (
                          <p className="mt-1 text-xs text-rose-500">
                            {errors.variableVariants[index]?.stock?.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Variant Image */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Image
                      </label>
                      <div className="flex items-start gap-4">
                        {vFiles.length > 0 ? (
                          <div className="group relative h-24 w-24 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                            <Image
                              src={vFiles[0].url}
                              alt={vFiles[0].file.name}
                              fill
                              className="object-cover"
                            />
                            <button
                              type="button"
                              title="Remove image"
                              onClick={() => removeVariableVariantImage(field.id)}
                              className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-center transition-colors hover:border-primary hover:bg-primary/5 dark:border-slate-600 dark:hover:border-primary">
                            <Upload className="mb-1 h-5 w-5 text-slate-400" />
                            <span className="text-[10px] leading-tight text-slate-400">
                              Upload
                            </span>
                            <input
                              type="file"
                              accept={ACCEPTED_ACCEPT}
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files)
                                  addVariableVariantImage(field.id, Array.from(e.target.files));
                                e.target.value = '';
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Status & Tags ═══ */}
      <div className={sectionCard}>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Status &amp; tags
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Control visibility and discoverability
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

          <div className="sm:col-span-2 lg:col-span-1">
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

      {/* ═══ SEO ═══ */}
      <div className={sectionCard}>
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

      {/* ═══ Submit ═══ */}
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
