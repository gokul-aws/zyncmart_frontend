'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Upload, X } from 'lucide-react';
import type { Category } from '@/types/category';
import { useCreateCategory, useUpdateCategory } from '@/hooks/useAdminCategories';


const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().min(0, 'Sort order must be 0 or higher').optional(),
});

type FormData = z.infer<typeof categorySchema>;


interface AdminCategoryFormProps {
  initialData?: Category;
  categories?: Category[];
}

export default function AdminCategoryForm({ initialData, categories = [] }: AdminCategoryFormProps) {
  const router = useRouter();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image?.url ?? null
  );

  const isUpdating = !!initialData;
  const isLoading = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      parentId: initialData?.parent ?? null,
      sortOrder: initialData?.sortOrder ?? 1,
    },
  });

  useEffect(() => {
    return () => {
      if (imageFile && imagePreview && !initialData?.image?.url) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imageFile, imagePreview, initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imageFile && imagePreview && !initialData?.image?.url) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (imageFile && imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (isUpdating && initialData) {
        await updateMutation.mutateAsync({ id: initialData._id, payload: data, imageFile: imageFile ?? undefined });
      } else {
        await createMutation.mutateAsync({ payload: data, imageFile: imageFile ?? undefined });
      }
      router.push('/admin/categories');
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Category Image */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
          Category Image
        </label>
        {imagePreview ? (
          <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
            <Image
              src={imagePreview}
              alt="Category preview"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-40 h-40 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 cursor-pointer hover:border-primary transition-colors bg-slate-50 dark:bg-slate-800">
            <Upload className="h-6 w-6 text-slate-400 mb-2" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Upload image</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        )}
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          Recommended: 400×400px, max 2 MB
        </p>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
          Category Name *
        </label>
        <input
          {...register('name')}
          type="text"
          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-slate-800 dark:border-slate-600"
          placeholder="e.g., Jewellery"
        />
        {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-slate-800 dark:border-slate-600"
          placeholder="Enter category description"
        />
        {errors.description && <p className="mt-1 text-xs text-rose-500">{errors.description.message}</p>}
      </div>

      {/* Parent Category */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
          Parent Category
        </label>
        <select
          {...register('parentId')}
          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-slate-800 dark:border-slate-600"
        >
          <option value="">No parent (top-level category)</option>
          {categories
            .filter((cat) => cat._id !== initialData?._id)
            .map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
        </select>
      </div>

      {/* Sort Order */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
          Sort Order
        </label>
        <input
          {...register('sortOrder', { valueAsNumber: true })}
          type="number"
          min="0"
          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-slate-800 dark:border-slate-600"
          placeholder="1"
        />
        {errors.sortOrder && <p className="mt-1 text-xs text-rose-500">{errors.sortOrder.message}</p>}
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving…' : isUpdating ? 'Update Category' : 'Create Category'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 px-6 py-3 bg-slate-200 text-slate-900 font-semibold rounded-lg hover:bg-slate-300 transition-colors dark:bg-slate-700 dark:text-slate-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
