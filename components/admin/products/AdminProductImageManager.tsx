'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import Image from 'next/image';
import { Upload, Trash2, ImageIcon, X, Star } from 'lucide-react';
import { toast } from 'sonner';
import type { ProductImage } from '@/types/product';
import { useUploadAdminProductImages, useDeleteAdminProductImage } from '@/hooks/useAdminProducts';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ACCEPTED_ACCEPT = ACCEPTED_TYPES.join(',');

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

interface AdminProductImageManagerProps {
  productId: string;
  productSlug: string;
  images: ProductImage[];
}

export default function AdminProductImageManager({
  productId,
  productSlug,
  images,
}: AdminProductImageManagerProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const emptyInputRef = useRef<HTMLInputElement | null>(null);

  const uploadMutation = useUploadAdminProductImages(productSlug);
  const deleteMutation = useDeleteAdminProductImage(productSlug);

  const previews = useMemo(
    () => selectedFiles.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    [selectedFiles]
  );

  useEffect(() => {
    return () => previews.forEach(({ preview }) => URL.revokeObjectURL(preview));
  }, [previews]);

  const addFiles = (files: File[]) => {
    const valid = validateImageFiles(files);
    if (valid.length > 0) setSelectedFiles((prev) => [...prev, ...valid]);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    addFiles(Array.from(event.target.files));
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (emptyInputRef.current) emptyInputRef.current.value = '';
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) {
      e.dataTransfer.dropEffect = 'copy';
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploadProgress(0);
    try {
      await uploadMutation.mutateAsync({
        productId,
        files: selectedFiles,
        onProgress: (p) => setUploadProgress(p),
      });
      setSelectedFiles([]);
    } finally {
      setUploadProgress(null);
    }
  };

  const isUploading = uploadMutation.isPending;
  const hasContent = images.length > 0 || previews.length > 0;

  return (
    <div
      className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Product Images</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {images.length} image{images.length !== 1 ? 's' : ''} live
          </p>
        </div>

        <label
          className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors
            ${isDragOver
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
        >
          <Upload className="h-3.5 w-3.5" />
          Add images
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_ACCEPT}
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      <div className="p-5 space-y-5">
        {/* ── Drag-over overlay ──────────────────────────────────── */}
        {isDragOver && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary bg-primary/5 py-10 dark:bg-primary/10">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
              <ImageIcon className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-semibold text-primary">Drop images here</p>
            <p className="text-xs text-primary/70">JPEG, PNG, WebP, GIF · max 10 MB</p>
          </div>
        )}

        {/* ── Staged files ───────────────────────────────────────── */}
        {previews.length > 0 && !isDragOver && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Staged · {previews.length}
              </span>
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Upload className="h-3 w-3" />
                {isUploading ? 'Uploading…' : 'Upload all'}
              </button>
            </div>

            {uploadProgress !== null && (
              <div className="mb-3 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Uploading…</span>
                  <span className="tabular-nums">{uploadProgress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-2">
              {previews.map(({ file, preview }, i) => (
                <div
                  key={`${file.name}-${i}`}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="relative aspect-square w-full">
                    <Image src={preview} alt={file.name} fill className="object-cover" sizes="200px" />
                    <button
                      type="button"
                      title="Remove"
                      onClick={() => removeSelectedFile(i)}
                      className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 text-slate-600 shadow opacity-0 transition-opacity group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-900/90 dark:text-slate-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="border-t border-slate-200 px-2 py-1.5 dark:border-slate-700">
                    <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{file.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Live gallery ───────────────────────────────────────── */}
        {images.length > 0 && !isDragOver && (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Live gallery · {images.length}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-2">
              {images.map((image) => (
                <div
                  key={image.publicId}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="relative aspect-square w-full">
                    <Image
                      src={image.url}
                      alt={image.publicId}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="200px"
                    />
                    {image.isPrimary && (
                      <div className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 shadow">
                        <Star className="h-2.5 w-2.5 fill-white text-white" />
                        <span className="text-[10px] font-bold text-white leading-none">Primary</span>
                      </div>
                    )}
                    <button
                      type="button"
                      title="Delete image"
                      onClick={() => deleteMutation.mutate({ productId, publicId: image.publicId })}
                      disabled={deleteMutation.isPending}
                      className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 text-slate-600 shadow opacity-0 transition-opacity group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-900/90 dark:text-slate-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="border-t border-slate-200 px-2 py-1.5 dark:border-slate-700">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {image.isPrimary ? 'Thumbnail' : 'Gallery'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Empty state ────────────────────────────────────────── */}
        {!hasContent && !isDragOver && (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 py-10 transition-colors hover:border-primary hover:bg-primary/5 dark:border-slate-700 dark:hover:border-primary dark:hover:bg-primary/10">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <ImageIcon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No images yet</p>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                Click to upload or drag &amp; drop
              </p>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              JPEG, PNG, WebP, GIF · max 10 MB
            </p>
            <input
              ref={emptyInputRef}
              type="file"
              accept={ACCEPTED_ACCEPT}
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
}
